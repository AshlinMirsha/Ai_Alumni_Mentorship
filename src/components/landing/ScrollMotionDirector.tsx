"use client";

import { useEffect } from "react";

/**
 * ScrollMotionDirector
 *
 * Implements the scroll motion engine inspired by https://varaxisgroup.com/:
 * 1. Scroll-scrubbed station track progress line (--line-p) and step markers (ahead / head / past).
 * 2. Viewport intersection observer that triggers kinetic word settling (.vx-word) and rule drawing.
 * 3. Subtle multi-axis parallax depth drift on hero graphics during scroll.
 * 4. Animated numerical telemetry counters when impact metrics enter view.
 * 5. Full support for prefers-reduced-motion.
 */
export function ScrollMotionDirector() {
  useEffect(() => {
    // Respect user motion preferences
    if (typeof window === "undefined") return;
    const isReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.dataset.motion === "reduced";

    if (isReduced) {
      // Mark all elements as settled immediately
      document.querySelectorAll("[data-vx-observe]").forEach((el) => {
        el.setAttribute("data-vx-inview", "true");
      });
      document.querySelectorAll(".vx-word").forEach((el) => {
        el.setAttribute("data-settled", "true");
      });
      return;
    }

    // ─── 1. Intersection Observer for Kinetic Word Settling & Rules ──────
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-vx-inview", "true");
            // Set word settlement on children
            entry.target.querySelectorAll(".vx-word").forEach((w) => {
              w.setAttribute("data-settled", "true");
            });
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    const observedElements = document.querySelectorAll("[data-vx-observe]");
    observedElements.forEach((el) => observer.observe(el));

    // ─── 2. Scroll Scrub Controller (RAF Loop) ──────────────────────────
    let rafId: number | null = null;
    let isScheduled = false;

    const onScrollOrResize = () => {
      if (isScheduled) return;
      isScheduled = true;

      rafId = requestAnimationFrame(() => {
        isScheduled = false;
        const scrollY = window.scrollY;
        const vh = window.innerHeight;

        // A. Hero Parallax Drift
        const heroAsset = document.querySelector<HTMLElement>("[data-parallax='hero']");
        if (heroAsset && scrollY < vh * 1.5) {
          const shiftY = Math.round(scrollY * 0.1);
          const shiftX = Math.round(-scrollY * 0.04);
          const tiltX = Math.min(8, Number((scrollY * 0.012).toFixed(2)));
          const tiltY = Math.max(-6, Number((-scrollY * 0.015).toFixed(2)));
          heroAsset.style.setProperty("--shift-y", `${shiftY}`);
          heroAsset.style.setProperty("--shift-x", `${shiftX}`);
          heroAsset.style.setProperty("--tilt-x", `${tiltX}`);
          heroAsset.style.setProperty("--tilt-y", `${tiltY}`);
        }

        // B. Varaxis-Style Principles Track Progress Scrubbing
        const track = document.querySelector<HTMLElement>("[data-line-track='true']");
        if (track) {
          const rect = track.getBoundingClientRect();
          const fill = track.querySelector<HTMLElement>("[data-line-fill='true']");
          const nodes = Array.from(
            document.querySelectorAll<HTMLElement>("[data-station-node]")
          );
          const cards = Array.from(
            document.querySelectorAll<HTMLElement>("[data-station-card]")
          );

          const trackHeight = rect.height;
          // Calculate how far down the track the scroll focal point has reached
          // Starts when top of track hits 70% viewport height, ends when bottom hits 35%
          const focalY = vh * 0.65;
          const currentProgressPx = Math.min(
            trackHeight,
            Math.max(0, focalY - rect.top)
          );
          const progressRatio = trackHeight > 0 ? currentProgressPx / trackHeight : 0;

          if (fill) {
            fill.style.height = `${(progressRatio * 100).toFixed(1)}%`;
            fill.style.setProperty("--line-p", progressRatio.toFixed(3));
          }

          // Evaluate each station's state (ahead / head / past)
          nodes.forEach((node, idx) => {
            const nodeRect = node.getBoundingClientRect();
            const nodeRelativeY = nodeRect.top + nodeRect.height / 2 - rect.top;
            const threshold = 18; // tolerance px

            let state: "ahead" | "head" | "past" = "ahead";
            if (currentProgressPx < nodeRelativeY - threshold) {
              state = "ahead";
            } else if (Math.abs(currentProgressPx - nodeRelativeY) <= threshold + 24) {
              state = "head";
            } else {
              state = "past";
            }

            if (node.dataset.step !== state) {
              node.dataset.step = state;
            }

            if (cards[idx] && cards[idx].dataset.step !== state) {
              cards[idx].dataset.step = state;
            }
          });
        }
      });
    };

    // Attach listeners
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    // Trigger initial frame
    onScrollOrResize();

    // ─── 3. Telemetry Metric Counters ────────────────────────────────────
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          if (el.dataset.animated === "true") return;
          el.dataset.animated = "true";

          const target = parseFloat(el.dataset.target || "0");
          const prefix = el.dataset.prefix || "";
          const suffix = el.dataset.suffix || "";
          const isDecimal = el.dataset.target?.includes(".");
          const duration = 1400; // ms
          const startTime = performance.now();

          const updateCounter = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            // Ease out expo curve
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = easeOut * target;

            el.textContent = `${prefix}${
              isDecimal ? currentVal.toFixed(1) : Math.round(currentVal)
            }${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          };

          requestAnimationFrame(updateCounter);
        });
      },
      { threshold: 0.25 }
    );

    document.querySelectorAll("[data-counter='true']").forEach((el) => {
      counterObserver.observe(el);
    });

    // Cleanup
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return null;
}
