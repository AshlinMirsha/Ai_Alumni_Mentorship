"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  Check,
  ChevronRight,
  ShieldCheck,
  Send,
  GraduationCap,
  Sparkles,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ScrollMotionDirector } from "@/components/landing/ScrollMotionDirector";

// ─── Pure Monochrome Wordmark ──────────────────────────────────────────────────
function Wordmark() {
  return (
    <span className="text-base font-bold tracking-tight text-[#090909] select-none">
      Alumni<span className="text-[#454545]">Path</span>
    </span>
  );
}

// ─── Floating Monochrome Capsule Header ─────────────────────────────────────────
function FloatingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="sticky top-4 z-50 max-w-5xl mx-auto px-4 sm:px-6">
      <header className="bg-white/95 backdrop-blur-md rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between border border-[#E7E7E7] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] transition-all duration-200">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-7 w-7 rounded-lg bg-[#090909] text-white flex items-center justify-center shrink-0 font-bold text-xs tracking-tight shadow-xs transition-transform duration-200 group-hover:scale-105">
            <span>A</span>
          </div>
          <Wordmark />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="#how-it-operates"
            className="text-xs font-medium text-[#737373] hover:text-[#090909] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#metrics"
            className="text-xs font-medium text-[#737373] hover:text-[#090909] transition-colors"
          >
            Impact
          </a>
        </nav>

        {/* Auth CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-medium text-[#737373] hover:text-[#090909] px-2 py-1 transition-colors"
          >
            Sign In
          </Link>
          <Button variant="primary" size="sm" asChild className="rounded-full">
            <Link href="/signup" className="text-xs px-4">
              Join Network
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-1.5 text-[#090909]"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden mt-2 bg-white rounded-2xl p-4 border border-[#E7E7E7] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12)] flex flex-col gap-2.5 animate-in fade-in duration-150">
          <a
            href="#how-it-operates"
            className="text-xs font-medium py-2 text-[#090909] border-b border-[#E7E7E7]"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#metrics"
            className="text-xs font-medium py-2 text-[#090909] border-b border-[#E7E7E7]"
            onClick={() => setMobileOpen(false)}
          >
            Impact
          </a>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="sm" fullWidth asChild className="rounded-full">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button variant="primary" size="sm" fullWidth asChild className="rounded-full">
              <Link href="/signup">Join Network</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Trajectory Hub Mock Nodes ──────────────────────────────────────────────────
interface TrajectoryNode {
  id: string;
  name: string;
  role: string;
  company: string;
  former: string;
  graduationYear: number;
  degree: string;
  hub: "Cloud & Infra" | "Frontend Systems" | "Product Strategy" | "AI & ML";
  responseRate: string;
  skills: string[];
  mentorshipQuote: string;
}

const TRAJECTORY_NODES: TrajectoryNode[] = [
  {
    id: "node-1",
    name: "Marcus Vance",
    role: "Senior Infrastructure Engineer",
    company: "Datadog",
    former: "Ex-Google",
    graduationYear: 2020,
    degree: "B.S. in Computer Science",
    hub: "Cloud & Infra",
    responseRate: "96.4%",
    skills: ["Distributed Systems", "Go", "Kubernetes", "PostgreSQL"],
    mentorshipQuote:
      "I bridged the gap between academic theory and high-concurrency production systems. Happy to inspect your architecture.",
  },
  {
    id: "node-2",
    name: "Elena Rostova",
    role: "Staff Software Engineer",
    company: "Airbnb",
    former: "Ex-Microsoft",
    graduationYear: 2019,
    degree: "B.S. in Computer Science",
    hub: "Cloud & Infra",
    responseRate: "94.2%",
    skills: ["System Design", "Java", "Microservices", "Scalability"],
    mentorshipQuote:
      "Campus recruiting can feel opaque. Let's do mock whiteboard loops and talk about what team leads actually evaluate.",
  },
  {
    id: "node-3",
    name: "Sarah Chen",
    role: "Senior Frontend Architect",
    company: "Vercel",
    former: "Ex-Dropbox",
    graduationYear: 2020,
    degree: "B.S. in Computer Science",
    hub: "Frontend Systems",
    responseRate: "98.1%",
    skills: ["Next.js", "React 19", "Design Systems", "Web Performance"],
    mentorshipQuote:
      "Crafting pixel-perfect, accessible user interfaces is an engineering discipline. I can help refine your portfolio code.",
  },
  {
    id: "node-4",
    name: "Arjun Mehta",
    role: "Senior Product Manager",
    company: "Stripe",
    former: "Ex-Google",
    graduationYear: 2018,
    degree: "B.S. in Computer Science",
    hub: "Product Strategy",
    responseRate: "92.0%",
    skills: ["FinTech", "Product Strategy", "Pricing", "APIs"],
    mentorshipQuote:
      "Transitioning from technical coursework into product leadership requires commercial clarity and crisp communication.",
  },
  {
    id: "node-5",
    name: "Dr. Aisha Al-Mansoor",
    role: "Senior AI Engineer",
    company: "Cohere",
    former: "Ex-Meta AI",
    graduationYear: 2018,
    degree: "Ph.D. in Computer Science",
    hub: "AI & ML",
    responseRate: "95.0%",
    skills: ["PyTorch", "LLM Inference", "Transformers", "Model Evals"],
    mentorshipQuote:
      "From university research lab to foundation model training. Let's discuss research paper implementation and AI roles.",
  },
];

export default function LandingPage() {
  const [selectedNode, setSelectedNode] = useState<TrajectoryNode>(TRAJECTORY_NODES[0]);
  const [activeHubFilter, setActiveHubFilter] = useState<string>("All");
  const [pingSent, setPingSent] = useState(false);
  const [activeStoryStage, setActiveStoryStage] = useState<number>(0);
  const [conversionRole, setConversionRole] = useState<"student" | "alumni">("student");

  const handlePing = () => {
    setPingSent(true);
    setTimeout(() => setPingSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#090909] relative selection:bg-black selection:text-white overflow-x-hidden">
      {/* Varaxis-Inspired Scroll Motion Director */}
      <ScrollMotionDirector />

      {/* Floating Header */}
      <FloatingHeader />

      <main>
        {/* ══════════════════════════════════════════════════════════════════════
            HERO SECTION: ASYMMETRIC REFERENCE 1 LAYOUT WITH VARAXIS SCROLL DYNAMICS
            Left: Editorial Copy & CTAs | Right: Asset Graphics Constellation
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="pt-12 sm:pt-16 pb-16 sm:pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Hero Content */}
            <div className="lg:col-span-6 flex flex-col items-start text-left" data-vx-observe="true">
              {/* Collegiate pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E7E7E7] text-xs font-medium text-[#242424] mb-6 shadow-xs select-none">
                <span className="w-2 h-2 rounded-full bg-[#090909]" />
                <span>Verified Collegiate Network</span>
              </div>

              {/* Two-Tone Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6 text-[#090909]">
                Your college network.
                <br />
                <span className="text-[#737373] font-bold">Your next trajectory.</span>
              </h1>

              {/* Supporting Editorial Prose */}
              <p className="text-base sm:text-lg text-[#454545] leading-relaxed max-w-xl mb-8">
                Direct, asynchronous mentorship connecting university students with alumni working across Tier-1 engineering, product, and design organizations.
              </p>

              {/* Dual Tactile CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-8">
                <Button variant="primary" size="lg" asChild className="rounded-full px-7">
                  <Link href="/alumni" className="flex items-center justify-center gap-2 group">
                    <span>Explore Alumni Directory</span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild className="rounded-full px-7">
                  <a href="#how-it-operates" className="flex items-center justify-center gap-2">
                    <span>Operational Rail</span>
                  </a>
                </Button>
              </div>

              {/* Checkmarks Row (Matching Reference 1) */}
              <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-6 text-xs text-[#737373] font-medium pt-2 border-t border-[#E7E7E7] w-full max-w-xl">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#090909] font-bold">✓</span>
                  <span>Institutional .edu verification required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#090909] font-bold">✓</span>
                  <span>Zero recruiter spam</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#090909] font-bold">✓</span>
                  <span>96% mean response rate</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset (Parallax Drift on Scroll) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div
                className="relative w-full max-w-[560px] lg:max-w-none vx-parallax-asset"
                data-parallax="hero"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landinpage_assets.png"
                  alt="Alumni Network Constellation, Directory Card, and 96.4% Response Rate"
                  className="w-full h-auto object-contain select-none pointer-events-none drop-shadow-md rounded-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            COMPANY LOGO STRIP: OUR ALUMNI WORK AT (MONOCHROME WORDMARKS)
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="border-y border-[#E7E7E7] bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#737373] mb-6">
              OUR ALUMNI WORK AT
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 grayscale hover:grayscale-0 transition-all">
              <span className="font-bold text-lg tracking-tight text-[#090909]">datadog</span>
              <span className="font-extrabold text-xl tracking-tight text-[#090909]">stripe</span>
              <span className="font-semibold text-lg tracking-tight text-[#090909]">▲ Vercel</span>
              <span className="font-bold text-xl tracking-tight text-[#090909]">airbnb</span>
              <span className="font-black text-lg tracking-wider text-[#090909]">NETFLIX</span>
              <span className="font-bold text-lg tracking-tight text-[#090909]">Google</span>
              <span className="font-semibold text-lg tracking-tight text-[#090909]">Microsoft</span>
              <span className="text-xs font-semibold text-[#737373]">+ MANY MORE</span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            THE PREMISE: THREE CORE REALITIES (VARAXIS-INSPIRED WORD DRIFT)
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16 sm:space-y-24">
            {/* Statement 01 */}
            <div data-vx-observe="true" className="space-y-3">
              <span className="font-mono text-xs font-semibold text-[#737373] tracking-widest uppercase">
                01 · THE PROBLEM
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#090909] leading-tight">
                Talent arrives in isolation.
              </h2>
              <p className="text-base sm:text-lg text-[#555555] max-w-2xl leading-relaxed">
                Graduates disperse into high-growth technology companies while undergraduate students navigate opaque job boards and blind application queues.
              </p>
              <div className="vx-rule mt-6 max-w-sm">
                <div className="vx-rule-solid" />
              </div>
            </div>

            {/* Statement 02 */}
            <div data-vx-observe="true" className="space-y-3 sm:ml-12 md:ml-20">
              <span className="font-mono text-xs font-semibold text-[#737373] tracking-widest uppercase">
                02 · THE FRICTION
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#090909] leading-tight">
                Cold outreach becomes noise.
              </h2>
              <p className="text-base sm:text-lg text-[#555555] max-w-2xl leading-relaxed">
                An 8% response rate on LinkedIn and recruiter algorithms drain student momentum away from engineering portfolio craftsmanship and system design fundamentals.
              </p>
              <div className="vx-rule mt-6 max-w-sm">
                <div className="vx-rule-solid" />
              </div>
            </div>

            {/* Statement 03 */}
            <div data-vx-observe="true" className="space-y-3 sm:ml-24 md:ml-36">
              <span className="font-mono text-xs font-semibold text-[#737373] tracking-widest uppercase">
                03 · THE RESOLUTION
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#090909] leading-tight">
                Collegiate trust gives velocity.
              </h2>
              <p className="text-base sm:text-lg text-[#555555] max-w-2xl leading-relaxed">
                A shared alma mater creates instant institutional affinity. AlumniPath turns impersonal hiring hurdles into asynchronous, high-trust mentorship loops.
              </p>
              <div className="vx-rule mt-6 max-w-sm">
                <div className="vx-rule-solid" />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            HOW MENTORSHIP OPERATES: 5-STATION SCROLL-SCRUBBED TRACK (VARAXIS PRINCIPLES LINE)
           ══════════════════════════════════════════════════════════════════════ */}
        <section id="how-it-operates" className="py-24 border-t border-[#E7E7E7] bg-white scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-16" data-vx-observe="true">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[#737373] block mb-2">
                OPERATIONAL ARCHITECTURE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#090909]">
                How AlumniPath operates.
              </h2>
              <p className="text-sm sm:text-base text-[#555555] mt-3 leading-relaxed">
                Five verifiable stations embedded into every mentorship engagement, continuously scrubbed as you advance.
              </p>
            </div>

            {/* The Live Track Container */}
            <div className="relative pl-10 sm:pl-16 md:pl-20 vx-track" data-line-track="true">
              {/* Stationary Guide Rail */}
              <div className="vx-rail w-[2px] top-4 bottom-4 left-4 sm:left-6 -translate-x-1/2" />
              {/* Dynamic Scroll-Scrubbed Fill Line */}
              <div
                className="vx-fill w-[2px] top-4 left-4 sm:left-6 -translate-x-1/2"
                data-line-fill="true"
                style={{ height: "0%" }}
              />

              {/* Station List */}
              <div className="space-y-12 sm:space-y-16">
                {[
                  {
                    num: "01",
                    title: "Capture & Institutional Verification",
                    kicker: "Cryptographic Campus Binding",
                    desc: "Every alumnus and student registers with verified institutional credentials. Accounts are cross-referenced with academic records and enterprise corporate emails to guarantee absolute identity authenticity.",
                    meta: "FERPA Compliant · Zero Spam Policy",
                  },
                  {
                    num: "02",
                    title: "Trajectory & Skill Gap Calibration",
                    kicker: "Production Engineering Milestones",
                    desc: "Students map university coursework against real-world production competencies (distributed concurrency, microservices, system design loops). Immediate clarity on what senior engineers actually look for.",
                    meta: "7 Comprehensive Milestones · Real Tech Stacks",
                  },
                  {
                    num: "03",
                    title: "Asynchronous Direct Advisory",
                    kicker: "High-Signal Structured Notes",
                    desc: "No scheduling back-and-forth or missed video calls. Students submit structured guidance requests with project repos and specific questions; mentors respond with deep technical advisory.",
                    meta: "< 24h Mean Turnaround · 96.4% Response",
                  },
                  {
                    num: "04",
                    title: "Deep Architecture Teardown & Mock Loops",
                    kicker: "Senior Engineering Review",
                    desc: "Staff and Senior Engineers from Datadog, Stripe, Airbnb, and Vercel conduct line-by-line portfolio teardowns, resume audits, and mock technical whiteboard loops.",
                    meta: "Google XYZ Format · Real Whiteboard Rubrics",
                  },
                  {
                    num: "05",
                    title: "Placement Endorsement & Internal Referral",
                    kicker: "Direct Collegiate Bridge",
                    desc: "Once milestones and advisory loops are mastered, mentors write direct internal referral recommendations into their organizations, bypassing automated ATS resume screening entirely.",
                    meta: "Direct Hiring Loop · Top Tier-1 Tech Placement",
                  },
                ].map((station, idx) => (
                  <div key={station.num} className="relative group">
                    {/* Floating Station Node Marker */}
                    <div className="absolute -left-10 sm:-left-16 md:-left-20 top-1">
                      <span
                        className="vx-station-node"
                        data-station-node="true"
                        data-step={idx === 0 ? "head" : "ahead"}
                      >
                        {station.num}
                      </span>
                    </div>

                    {/* Station Content Card */}
                    <div
                      className="vx-station-card p-6 sm:p-8 rounded-2xl bg-[#FAFAFA] border border-[#E7E7E7]"
                      data-station-card="true"
                      data-step={idx === 0 ? "head" : "ahead"}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="font-mono text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                          Station {station.num} · {station.kicker}
                        </span>
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#E7E7E7] text-[#242424] w-fit">
                          {station.meta}
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#090909] mb-2">
                        {station.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#555555] leading-relaxed max-w-3xl">
                        {station.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            INTERACTIVE NETWORK HUD (TELEMETRY & MENTOR DISCOVERY)
           ══════════════════════════════════════════════════════════════════════ */}
        <section id="network-hud" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E7E7E7] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.04)] relative">
            {/* Telemetry Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#E7E7E7] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#090909]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                    Live Network Trajectory HUD
                  </h3>
                </div>
                <p className="text-sm font-semibold text-[#090909] mt-1">
                  Direct Collegiate Bridge · University of Technology
                </p>
              </div>

              {/* Hub Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {["All", "Cloud & Infra", "Frontend Systems", "Product Strategy", "AI & ML"].map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => setActiveHubFilter(hub)}
                    className={`text-xs font-medium px-3.5 py-1.5 rounded-full transition-all shrink-0 ${
                      activeHubFilter === hub
                        ? "bg-[#090909] text-white"
                        : "text-[#555555] hover:text-[#090909] hover:bg-[#F4F4F4]"
                    }`}
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>

            {/* Matrix & Detail Hologram Card */}
            <div className="grid lg:grid-cols-12 gap-8 items-center py-8">
              {/* Left: Node Selector Matrix */}
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-2">
                  Select a Verified Alumnus Node
                </p>
                <div className="space-y-2.5">
                  {TRAJECTORY_NODES.filter(
                    (node) => activeHubFilter === "All" || node.hub === activeHubFilter
                  ).map((node) => {
                    const isSelected = selectedNode.id === node.id;
                    return (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNode(node)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-[#F4F4F4] border-[#090909] shadow-xs"
                            : "bg-white border-[#E7E7E7] hover:border-[#A8A8A8]"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={node.name} size="md" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[#090909] truncate">
                                {node.name}
                              </span>
                              <span className="text-[10px] font-semibold text-[#242424] bg-white border border-[#E7E7E7] px-2 py-0.5 rounded-full">
                                Class of &apos;{String(node.graduationYear).slice(-2)}
                              </span>
                            </div>
                            <p className="text-xs text-[#555555] truncate mt-0.5">
                              {node.role} · <strong className="text-[#090909]">{node.company}</strong>{" "}
                              <span className="text-[#737373] font-normal">({node.former})</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="hidden sm:inline-block text-[11px] font-medium text-[#242424] bg-white border border-[#E7E7E7] px-2.5 py-0.5 rounded-full">
                            {node.responseRate} Resp
                          </span>
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isSelected ? "bg-[#090909] text-white" : "bg-[#F4F4F4] text-[#737373]"
                            }`}
                          >
                            <ChevronRight size={13} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Focused Node Detail Card */}
              <div className="lg:col-span-5">
                <div className="bg-[#F4F4F4] rounded-2xl p-6 border border-[#E7E7E7] shadow-xs">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E7E7E7]">
                    <div className="flex items-center gap-3">
                      <Avatar name={selectedNode.name} size="lg" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-[#090909]">{selectedNode.name}</h4>
                          <span title="Verified Alumni">
                            <ShieldCheck size={14} className="text-[#090909]" />
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#090909] mt-0.5">
                          {selectedNode.role} at {selectedNode.company}
                        </p>
                        <p className="text-[11px] text-[#737373]">
                          {selectedNode.former} · {selectedNode.degree}
                        </p>
                      </div>
                    </div>
                    <Badge variant="dark" size="sm">
                      Active Mentor
                    </Badge>
                  </div>

                  {/* Trajectory Timeline Pill */}
                  <div className="my-4 p-3 rounded-xl bg-white border border-[#E7E7E7]">
                    <div className="flex items-center justify-between text-[11px] text-[#555555] font-medium mb-1.5">
                      <span className="flex items-center gap-1">
                        <GraduationCap size={12} className="text-[#090909]" />
                        Campus Root
                      </span>
                      <span>Current Organization</span>
                    </div>
                    <div className="w-full bg-[#E7E7E7] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#090909] h-full w-full rounded-full" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[#737373] mt-1">
                      <span>Class of {selectedNode.graduationYear}</span>
                      <span>{selectedNode.company}</span>
                    </div>
                  </div>

                  {/* Mentorship Insight */}
                  <div className="p-3.5 rounded-xl bg-white border border-[#E7E7E7] text-xs text-[#454545] leading-relaxed mb-4 italic">
                    &ldquo;{selectedNode.mentorshipQuote}&rdquo;
                  </div>

                  {/* Skills pills */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {selectedNode.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-[#E7E7E7] text-[#242424]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      onClick={handlePing}
                      className="rounded-full text-xs"
                    >
                      {pingSent ? (
                        <span className="flex items-center gap-1.5">
                          <Check size={14} /> Advisory Note Sent!
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Send size={13} /> Request Guidance Note
                        </span>
                      )}
                    </Button>
                    <Button variant="secondary" size="sm" asChild className="rounded-full text-xs shrink-0">
                      <Link href="/alumni">Directory</Link>
                    </Button>
                  </div>

                  {pingSent && (
                    <p className="text-[11px] text-[#090909] font-medium text-center mt-2.5">
                      ✓ Connected to queue. {selectedNode.name} usually responds in 4 hours.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-4 border-t border-[#E7E7E7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737373]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#090909]" />
                  Real-Time Network Telemetry
                </span>
                <span>Active Industry Leaders</span>
              </div>
              <Link
                href="/alumni"
                className="font-semibold text-[#090909] hover:underline flex items-center gap-1"
              >
                Explore All Verified Alumni Trajectories <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            THE MENTORSHIP CONTINUUM (3-PHASE EDITORIAL STORYTELLING)
           ══════════════════════════════════════════════════════════════════════ */}
        <section id="continuum" className="py-20 border-t border-[#E7E7E7] bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-12" data-vx-observe="true">
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-[#737373] mb-2">
                THE MENTORSHIP CONTINUUM
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#090909]">
                A deliberate bridge from student ambitions to senior execution.
              </h2>
              <p className="text-sm sm:text-base text-[#555555] mt-3 leading-relaxed">
                Cold LinkedIn DMs have an 8% response rate. AlumniPath creates verified, high-trust collegiate channels designed for substance.
              </p>
            </div>

            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Stage Selector */}
              <div className="lg:col-span-5 space-y-3.5">
                {[
                  {
                    act: "01",
                    title: "The Verification Gate",
                    tag: "Trust & Credibility",
                    desc: "Every alumnus and student registers with verified university identity. Zero spam, zero fake recruiters — only graduates committed to advising their alma mater.",
                  },
                  {
                    act: "02",
                    title: "The Trajectory Engine",
                    tag: "Milestone Roadmaps",
                    desc: "Compare your current coursework and projects against real industry milestones. Identify your distributed systems and system design skill gaps early.",
                  },
                  {
                    act: "03",
                    title: "The Direct Advisory Loop",
                    tag: "1-on-1 Guidance",
                    desc: "Schedule private 1-on-1 guidance sessions, mock whiteboards, and resume teardowns directly with senior engineering and product leads.",
                  },
                ].map((stage, idx) => {
                  const isActive = activeStoryStage === idx;
                  return (
                    <div
                      key={stage.act}
                      onClick={() => setActiveStoryStage(idx)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#090909] text-white border-[#090909] shadow-sm"
                          : "bg-white border-[#E7E7E7] hover:border-[#A8A8A8]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${
                            isActive ? "text-[#A8A8A8]" : "text-[#737373]"
                          }`}
                        >
                          Phase {stage.act}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-white/10 text-white border-white/20"
                              : "bg-[#F4F4F4] text-[#242424] border-[#E7E7E7]"
                          }`}
                        >
                          {stage.tag}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-bold mb-1 ${
                          isActive ? "text-white" : "text-[#090909]"
                        }`}
                      >
                        {stage.title}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed ${
                          isActive ? "text-[#E7E7E7]" : "text-[#555555]"
                        }`}
                      >
                        {stage.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Visual Stage Canvas */}
              <div className="lg:col-span-7">
                <div className="bg-[#FAFAFA] rounded-3xl p-6 sm:p-8 border border-[#E7E7E7] shadow-xs min-h-[400px] flex flex-col justify-between">
                  {activeStoryStage === 0 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E7E7]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={18} className="text-[#090909]" />
                          <span className="text-sm font-bold text-[#090909]">
                            Collegiate Verification Layer
                          </span>
                        </div>
                        <Badge variant="dark" size="sm">
                          Academic Cryptography
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-white border border-[#E7E7E7] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#090909] text-white flex items-center justify-center font-bold text-xs">
                              ✓
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#090909]">Institutional Email Validation</p>
                              <p className="text-[11px] text-[#737373]">Matches verified @university.edu registrar records</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#090909]">Active</span>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-[#E7E7E7] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#090909] text-white flex items-center justify-center font-bold text-xs">
                              ✓
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#090909]">Current Employer Affiliation</p>
                              <p className="text-[11px] text-[#737373]">Validated through corporate domain verification</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold text-[#090909]">Verified</span>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-[#E7E7E7]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-[#090909]">Average Advisory Response Rate</span>
                            <span className="text-sm font-bold text-[#090909]">96.4%</span>
                          </div>
                          <p className="text-[11px] text-[#555555]">
                            Graduates commit to reviewing collegiate inquiries without recruiter filters or paywalls.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStoryStage === 1 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E7E7]">
                        <span className="text-sm font-bold text-[#090909]">
                          Career Roadmap: Full-Stack &amp; Distributed Systems
                        </span>
                        <Badge variant="default" size="sm">
                          Milestone 2 of 4
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3.5 rounded-xl bg-white border-l-4 border-l-[#090909] border border-[#E7E7E7]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                            Phase 1 · Mastered (100%)
                          </span>
                          <p className="text-xs font-bold text-[#090909] mt-0.5">Web Foundations &amp; Relational Schema Design</p>
                          <p className="text-[11px] text-[#555555]">PostgreSQL indices, React 19 architecture, REST contracts</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border-l-4 border-l-[#454545] border border-[#E7E7E7]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#090909]">
                            Phase 2 · In Progress (Mentored by Marcus Vance)
                          </span>
                          <p className="text-xs font-bold text-[#090909] mt-0.5">Distributed Systems &amp; Concurrency</p>
                          <p className="text-[11px] text-[#555555]">Redis caching layers, Docker containerization, Kafka queues</p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border-l-4 border-l-[#E7E7E7] border border-[#E7E7E7]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                            Phase 3 · Target Milestone
                          </span>
                          <p className="text-xs font-bold text-[#555555] mt-0.5">High-Scale Architectural Whiteboards</p>
                          <p className="text-[11px] text-[#737373]">Mock system design loops with senior mentors</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStoryStage === 2 && (
                    <div className="space-y-5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E7E7]">
                        <span className="text-sm font-bold text-[#090909]">
                          Direct Mentorship Advisory Session
                        </span>
                        <Badge variant="dark" size="sm">
                          Confirmed Session
                        </Badge>
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-[#E7E7E7] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <Avatar name="Sarah Chen" size="md" />
                            <div>
                              <p className="text-xs font-bold text-[#090909]">Sarah Chen</p>
                              <p className="text-[11px] text-[#737373]">Senior Frontend Architect · Vercel</p>
                            </div>
                          </div>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#090909] text-white">
                            45 Min Advisory
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#E7E7E7] space-y-2">
                          <p className="text-xs font-semibold text-[#090909]">Session Agenda:</p>
                          <ul className="space-y-1.5 text-[11px] text-[#555555]">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#090909]" />
                              Portfolio &amp; GitHub repository code teardown
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#090909]" />
                              Vercel internship technical screening preview
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#090909]" />
                              Internal referral recommendations &amp; next steps
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between text-xs text-[#737373]">
                    <span>Step {activeStoryStage + 1} of 3</span>
                    <button
                      type="button"
                      onClick={() => setActiveStoryStage((p) => (p + 1) % 3)}
                      className="font-semibold text-[#090909] hover:underline flex items-center gap-1"
                    >
                      Next Phase <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ══════════════════════════════════════════════════════════════════════
            EMPIRICAL TRUST & IMPACT METRICS STRIP (ANIMATED SCROLL TELEMETRY)
           ══════════════════════════════════════════════════════════════════════ */}
        <section id="metrics" className="py-16 border-t border-[#E7E7E7] bg-white scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E7E7]" data-vx-observe="true">
              <div className="pt-4 sm:pt-0 sm:px-6 first:pl-0">
                <span
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#090909] block tabular-nums"
                  data-counter="true"
                  data-target="100"
                  data-suffix="%"
                >
                  100%
                </span>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#737373] mt-1.5">
                  Verified Alumni Mentors
                </p>
                <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                  Every mentor verified with institutional .edu collegiate credentials.
                </p>
              </div>

              <div className="pt-4 sm:pt-0 sm:px-6">
                <span
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#090909] block tabular-nums"
                  data-counter="true"
                  data-target="96.4"
                  data-suffix="%"
                >
                  96.4%
                </span>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#737373] mt-1.5">
                  Advisory Response Rate
                </p>
                <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                  Versus 8% on cold LinkedIn messaging. Verified collegiate trust.
                </p>
              </div>

              <div className="pt-4 sm:pt-0 sm:px-6">
                <span
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#090909] block tabular-nums"
                  data-counter="true"
                  data-target="24"
                  data-prefix="< "
                  data-suffix="h"
                >
                  &lt; 24h
                </span>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#737373] mt-1.5">
                  Mean Response Time
                </p>
                <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                  Average time for an active alumni mentor to confirm an inquiry.
                </p>
              </div>

              <div className="pt-4 sm:pt-0 sm:px-6">
                <span
                  className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#090909] block tabular-nums"
                  data-counter="true"
                  data-target="100"
                  data-suffix="%"
                >
                  100%
                </span>
                <p className="font-mono text-xs font-semibold uppercase tracking-wider text-[#737373] mt-1.5">
                  Collegiate Verification
                </p>
                <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                  Requires confirmed university affiliation and academic credentials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            JOIN CALL-TO-ACTION SECTION
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 sm:p-14 border border-[#E7E7E7] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.06)] text-center relative transition-all duration-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F4F4] border border-[#E7E7E7] text-[#090909] text-xs font-semibold mb-6 transition-all duration-200">
              <Sparkles size={13} />
              <span>
                {conversionRole === "student"
                  ? "Join the 2026 Academic Cohort"
                  : "Verified Alumni Advisory Network"}
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#090909] leading-tight max-w-2xl mx-auto transition-all duration-200">
              {conversionRole === "student"
                ? "Your next career breakthrough starts with one collegiate conversation."
                : "Empower the next generation of engineers from your alma mater."}
            </h2>

            <p className="text-sm sm:text-base text-[#555555] max-w-xl mx-auto mt-4 leading-relaxed transition-all duration-200">
              {conversionRole === "student"
                ? "Direct, asynchronous mentorship connecting university students with alumni leaders across tech, product, and design."
                : "Guide ambitious students, conduct mock technical reviews, critique portfolios, and refer top collegiate talent."}
            </p>

            {/* Interactive Role Toggle */}
            <div className="inline-flex items-center p-1 rounded-full bg-[#F4F4F4] border border-[#E7E7E7] my-8 select-none">
              <button
                type="button"
                onClick={() => setConversionRole("student")}
                className={`text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  conversionRole === "student"
                    ? "bg-[#090909] text-white shadow-xs"
                    : "text-[#737373] hover:text-[#090909]"
                }`}
              >
                I am a Student
              </button>
              <button
                type="button"
                onClick={() => setConversionRole("alumni")}
                className={`text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer ${
                  conversionRole === "alumni"
                    ? "bg-[#090909] text-white shadow-xs"
                    : "text-[#737373] hover:text-[#090909]"
                }`}
              >
                I am an Alumnus Mentor
              </button>
            </div>

            {/* Dynamic CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
              <Button
                variant="primary"
                size="lg"
                asChild
                className="rounded-full w-full sm:w-auto px-8 min-w-[210px] shadow-xs"
              >
                <Link
                  href={
                    conversionRole === "student"
                      ? "/signup?role=student"
                      : "/signup?role=alumni"
                  }
                  className="flex items-center justify-center gap-2"
                >
                  <span>
                    {conversionRole === "student"
                      ? "Create Student Account"
                      : "Register as Alumnus Mentor"}
                  </span>
                  <ArrowRight size={14} />
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="lg"
                asChild
                className="rounded-full w-full sm:w-auto px-8 min-w-[190px] shadow-xs"
              >
                <Link
                  href={conversionRole === "student" ? "/alumni" : "/alumni-dashboard"}
                >
                  {conversionRole === "student"
                    ? "Browse Directory"
                    : "Access Mentor Portal"}
                </Link>
              </Button>
            </div>

            {/* Account Sign In Anchor with explicit vertical clearance */}
            <div className="pt-8 pb-1 flex items-center justify-center">
              <p className="text-xs text-[#737373] text-center">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#090909] font-semibold hover:underline ml-1 inline-block"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          EDITORIAL MONOCHROME FOOTER
         ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#E7E7E7] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2.5 mb-3">
                <div className="h-7 w-7 rounded-lg bg-[#090909] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  <span>A</span>
                </div>
                <Wordmark />
              </Link>
              <p className="text-xs text-[#555555] leading-relaxed max-w-sm mb-4">
                The verified collegiate alumni mentorship platform connecting undergraduate and graduate students directly with alumni leaders across tech, product, and design.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F4F4F4] border border-[#E7E7E7] text-[11px] font-medium text-[#242424]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#090909]" />
                <span>All Systems Operational · Spring 2026 Ready</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#090909] mb-3">Product</p>
              <ul className="space-y-2 text-xs text-[#555555]">
                <li>
                  <Link href="/alumni" className="hover:text-[#090909] transition-colors">
                    Discover Alumni
                  </Link>
                </li>
                <li>
                  <Link href="/messages" className="hover:text-[#090909] transition-colors">
                    Direct Advisory
                  </Link>
                </li>
                <li>
                  <Link href="/career-roadmap" className="hover:text-[#090909] transition-colors">
                    Career Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="/career-assistant" className="hover:text-[#090909] transition-colors">
                    AI Career Assistant
                  </Link>
                </li>
                <li>
                  <Link href="/resume-review" className="hover:text-[#090909] transition-colors">
                    Resume Review
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#090909] mb-3">Portals</p>
              <ul className="space-y-2 text-xs text-[#555555]">
                <li>
                  <Link href="/dashboard" className="hover:text-[#090909] transition-colors">
                    Student Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/alumni-dashboard" className="hover:text-[#090909] transition-colors">
                    Alumni Portal
                  </Link>
                </li>
                <li>
                  <Link href="/alumni-dashboard/opportunities" className="hover:text-[#090909] transition-colors">
                    Alumni Opportunities
                  </Link>
                </li>
                <li>
                  <Link href="/alumni-dashboard/community" className="hover:text-[#090909] transition-colors">
                    Community Board
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#090909] mb-3">Institutional</p>
              <ul className="space-y-2 text-xs text-[#555555]">
                <li>
                  <a href="#" className="hover:text-[#090909] transition-colors">
                    University Registrar API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#090909] transition-colors">
                    Privacy Charter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#090909] transition-colors">
                    Terms of Advisory
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-[#090909] transition-colors">
                    Security &amp; FERPA
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#E7E7E7] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#737373]">
            <p>© 2026 AlumniPath Inc. Meticulously crafted for collegiate excellence.</p>
            <p>San Francisco · Seattle · New York · Boston</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
