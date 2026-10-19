"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  Building2,
  MapPin,
  Compass,
  Brain,
  Map,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

// ─── Shared Wordmark ──────────────────────────────────────────────────────────
function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`text-lg font-bold tracking-tight ${
        dark ? "text-white" : "text-[#191919]"
      }`}
    >
      Alumni<span className="text-[#2166A5]">Path</span>
    </span>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-[8px] bg-[#2166A5] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <Wordmark />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-[#626262] hover:text-[#191919] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-[#626262] hover:text-[#191919] transition-colors"
            >
              Features
            </a>
            <a
              href="#alumni"
              className="text-sm font-medium text-[#626262] hover:text-[#191919] transition-colors"
            >
              Discover Alumni
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login" className="text-sm font-medium text-[#191919]">
                Log In
              </Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/signup" className="!text-white text-white font-medium text-sm">
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-[#626262] hover:text-[#191919]"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E5E7EB] bg-white px-4 py-3 flex flex-col gap-2">
          <a
            href="#how-it-works"
            className="text-sm py-2 font-medium text-[#191919] border-b border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm py-2 font-medium text-[#191919] border-b border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#alumni"
            className="text-sm py-2 font-medium text-[#191919] border-b border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Discover Alumni
          </a>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="sm" fullWidth asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button variant="primary" size="sm" fullWidth asChild>
              <Link href="/signup" className="!text-white text-white font-medium">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Real Mock Alumni for Discover Section ────────────────────────────────────
const DIRECTORY_ALUMNI = [
  {
    id: "rec-001",
    name: "Marcus Vance",
    role: "Senior Backend Engineer",
    company: "Datadog",
    former: "Ex-Google",
    department: "Computer Science",
    graduationYear: 2020,
    location: "San Francisco, CA",
    skills: ["Python", "PostgreSQL", "Distributed Systems", "Docker"],
  },
  {
    id: "rec-002",
    name: "Elena Rostova",
    role: "Staff Software Engineer",
    company: "Airbnb",
    former: "Ex-Microsoft",
    department: "Computer Science",
    graduationYear: 2019,
    location: "Seattle, WA",
    skills: ["Java", "React", "Microservices", "System Design"],
  },
  {
    id: "rec-003",
    name: "Dev Patel",
    role: "VP of Product",
    company: "Stripe",
    former: "Ex-Meta",
    department: "Economics & CS",
    graduationYear: 2015,
    location: "New York, NY",
    skills: ["Product Strategy", "FinTech", "Pricing", "Leadership"],
  },
  {
    id: "rec-004",
    name: "Sarah Chen",
    role: "Senior Frontend Architect",
    company: "Vercel",
    former: "Ex-Dropbox",
    department: "Computer Science",
    graduationYear: 2020,
    location: "San Francisco, CA",
    skills: ["React", "Next.js", "Design Systems", "Web Performance"],
  },
];

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* ══════════════════════════════════════════════════════════════════════
            STEP 2: CENTERED EDITORIAL HERO WITH WIDE PHOTOGRAPHIC VISUAL
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="pt-16 sm:pt-20 md:pt-24 pb-16 md:pb-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            {/* Centered Hero Content Block */}
            <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
              {/* Subtle intro label */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium text-[#2166A5] bg-[#F0F5FA] border border-[#D0E0EF] mb-6 select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2166A5]" />
                <span>Verified University Alumni Network</span>
              </div>

              {/* Centered Main Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#191919] max-w-3xl mx-auto leading-[1.12] text-center">
                Your college network.
                <br />
                <span className="text-[#2166A5]">Your next opportunity.</span>
              </h1>

              {/* Elegantly Balanced Supporting Paragraph */}
              <p className="text-center text-[17px] sm:text-[18px] text-[#626262] leading-[1.6] max-w-[650px] mx-auto mt-5 sm:mt-6 mb-8 sm:mb-9 [text-wrap:balance]">
                Build meaningful connections with alumni, learn from their experiences,
                and discover opportunities that move your career forward.
              </p>

              {/* Centered Primary & Secondary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-4 w-full sm:w-auto">
                <Button variant="primary" size="lg" asChild className="w-full sm:w-auto">
                  <Link
                    href="/alumni"
                    className="inline-flex items-center justify-center gap-2 !text-white text-white font-medium px-6 sm:px-7"
                  >
                    <span>Find Your Mentor</span>
                    <ArrowRight size={16} className="!text-white text-white shrink-0" />
                  </Link>
                </Button>
                <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto">
                  <a
                    href="#how-it-works"
                    className="inline-flex items-center justify-center font-medium px-6 sm:px-7"
                  >
                    Explore the Network
                  </a>
                </Button>
              </div>

              {/* Centered Small Understated Line */}
              <p className="text-center text-xs sm:text-sm text-[#626262] font-normal mt-1 mb-10 sm:mb-14">
                Connecting students and alumni through shared experience.
              </p>
            </div>

            {/* Wide, Editorial-Style Photographic Composition */}
            <div className="relative w-full rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-sm bg-[#F7F9FC]">
              <div className="relative aspect-[16/8] sm:aspect-[21/9] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/hero-network.jpg"
                  alt="University graduates and alumni celebrating academic milestones and professional connection"
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle natural gradient overlay at bottom for seamless typography integration */}
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/65 via-black/30 to-transparent flex items-end justify-between px-6 sm:px-8 py-5 text-white">
                  <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#34D399]" />
                    <span>
                      500+ verified alumni actively mentoring across 45+ industries
                    </span>
                  </div>
                  <span className="hidden sm:inline-block text-xs text-white/80 font-normal">
                    University Alumni Community
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3: HOW IT WORKS (Horizontal 3-Step with Typography & Dividers)
           ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="how-it-works"
          className="py-20 md:py-28 bg-white border-t border-[#E5E7EB]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-16">
              <p className="text-xs font-semibold text-[#2166A5] uppercase tracking-wider mb-3">
                How It Works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] tracking-tight">
                A deliberate path from campus to industry.
              </h2>
              <p className="text-base text-[#626262] mt-3 leading-relaxed">
                No cold messaging, no transactional exchanges. Just straightforward
                mentorship anchored in verified university affiliation.
              </p>
            </div>

            {/* Horizontal three-step section using typography, spacing, and thin dividers */}
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E5E7EB] border-y border-[#E5E7EB]">
              {/* Step 01 */}
              <div className="py-8 md:py-10 md:pr-8">
                <span className="text-xs font-bold text-[#2166A5] tracking-wider uppercase block mb-2">
                  01
                </span>
                <h3 className="text-xl font-bold text-[#191919] tracking-tight mb-3">
                  Discover your network
                </h3>
                <p className="text-sm text-[#626262] leading-relaxed">
                  Filter graduates by industry, technical stack, company, and
                  graduation year to identify professionals whose trajectories
                  align with your aspirations.
                </p>
              </div>

              {/* Step 02 */}
              <div className="py-8 md:py-10 md:px-8">
                <span className="text-xs font-bold text-[#2166A5] tracking-wider uppercase block mb-2">
                  02
                </span>
                <h3 className="text-xl font-bold text-[#191919] tracking-tight mb-3">
                  Build meaningful connections
                </h3>
                <p className="text-sm text-[#626262] leading-relaxed">
                  Initiate direct conversations with tailored introductory notes.
                  Ask targeted questions about hiring loops, team culture, and
                  day-to-day engineering realities.
                </p>
              </div>

              {/* Step 03 */}
              <div className="py-8 md:py-10 md:pl-8">
                <span className="text-xs font-bold text-[#2166A5] tracking-wider uppercase block mb-2">
                  03
                </span>
                <h3 className="text-xl font-bold text-[#191919] tracking-tight mb-3">
                  Grow your career
                </h3>
                <p className="text-sm text-[#626262] leading-relaxed">
                  Translate senior alumni insights into structured career roadmaps,
                  interview confidence, and competitive resume positioning for
                  high-impact internships and full-time roles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3: FEATURES (Clean Editorial Layout with Alternating Content)
           ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="features"
          className="py-20 md:py-28 bg-[#F7F9FC] border-t border-[#E5E7EB]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl mb-16">
              <p className="text-xs font-semibold text-[#2166A5] uppercase tracking-wider mb-3">
                Platform Capabilities
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] tracking-tight">
                Designed for substantive professional guidance.
              </h2>
              <p className="text-base text-[#626262] mt-3 leading-relaxed">
                Every feature is built to turn university camaraderie into
                concrete career momentum.
              </p>
            </div>

            <div className="space-y-16 sm:space-y-20">
              {/* Alternating Feature 1: Alumni Discovery & Direct Advisory */}
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2166A5] bg-white border border-[#E5E7EB] px-3 py-1 rounded-md mb-4">
                    <Compass size={13} />
                    <span>Direct Alumni Advisory</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#191919] tracking-tight mb-4 leading-snug">
                    Cut through cold outreach. Connect with alumni who actually respond.
                  </h3>
                  <p className="text-sm sm:text-base text-[#626262] leading-relaxed mb-6">
                    Unlike open social networks where student messages get buried,
                    AlumniPath links you directly with graduates committed to
                    mentoring students from their alma mater.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Verified university identity and graduation credentials",
                      "Direct messaging without requiring expensive premium plans",
                      "Contextual introductions based on target roles and tech stack",
                    ].map((pt) => (
                      <li
                        key={pt}
                        className="flex items-start gap-2.5 text-sm text-[#191919]"
                      >
                        <CheckCircle
                          size={16}
                          className="text-[#057642] mt-0.5 shrink-0"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" asChild>
                    <Link href="/alumni">Browse Alumni Directory →</Link>
                  </Button>
                </div>

                {/* Visual Representation of Feature 1 */}
                <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-3">
                      <Avatar name="Marcus Vance" size="lg" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-semibold text-[#191919]">
                            Marcus Vance
                          </span>
                          <span className="text-[11px] font-semibold text-[#2166A5] bg-[#F0F5FA] border border-[#D0E0EF] px-2 py-0.5 rounded">
                            Verified Alum
                          </span>
                        </div>
                        <p className="text-xs text-[#626262] mt-0.5">
                          Senior Backend Engineer · Datadog
                        </p>
                        <p className="text-xs text-gray-400">
                          Ex-Google · B.S. in Computer Science
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#057642] bg-[#EEF8F1] border border-[#BFE3C9] px-2.5 py-1 rounded-full">
                      96% Response
                    </span>
                  </div>

                  <p className="text-xs text-[#626262] leading-relaxed mb-4 bg-[#F7F9FC] border border-[#E5E7EB] rounded-lg p-3">
                    &ldquo;I went through the campus recruitment cycle myself. I help
                    motivated students bridge the gap between classroom theory and
                    production engineering standards.&rdquo;
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="blue" size="sm">
                      Distributed Systems
                    </Badge>
                    <Badge variant="default" size="sm">
                      PostgreSQL
                    </Badge>
                    <Badge variant="default" size="sm">
                      System Design
                    </Badge>
                    <Badge variant="default" size="sm">
                      Docker
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Thin Divider */}
              <div className="border-t border-[#E5E7EB]" />

              {/* Alternating Feature 2: AI Career Guidance & Structured Roadmaps */}
              <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Visual Representation of Feature 2 */}
                <div className="order-2 lg:order-1 bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E7EB]">
                    <div className="flex items-center gap-2">
                      <Map size={16} className="text-[#2166A5]" />
                      <span className="text-sm font-semibold text-[#191919]">
                        Target Career Roadmap: Full-Stack Engineer
                      </span>
                    </div>
                    <span className="text-xs text-[#2166A5] font-medium bg-[#F0F5FA] px-2 py-0.5 rounded">
                      Milestone 2 of 4
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-2 border-[#057642] pl-3.5 py-0.5">
                      <p className="text-xs font-bold text-[#057642] uppercase tracking-wider">
                        Stage 1 · Completed
                      </p>
                      <p className="text-sm font-semibold text-[#191919]">
                        Core Web Architecture &amp; Relational Databases
                      </p>
                      <p className="text-xs text-[#626262] mt-0.5">
                        React state lifecycles, REST API standards, and PostgreSQL schemas
                      </p>
                    </div>

                    <div className="border-l-2 border-[#2166A5] pl-3.5 py-0.5">
                      <p className="text-xs font-bold text-[#2166A5] uppercase tracking-wider">
                        Stage 2 · Current Focus
                      </p>
                      <p className="text-sm font-semibold text-[#191919]">
                        Distributed Systems &amp; Concurrency
                      </p>
                      <p className="text-xs text-[#626262] mt-0.5">
                        Redis caching layers, Docker containerization, and message queues
                      </p>
                    </div>

                    <div className="border-l-2 border-gray-200 pl-3.5 py-0.5">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Stage 3 · Upcoming
                      </p>
                      <p className="text-sm font-semibold text-gray-500">
                        Technical Interview Loops &amp; System Design
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Mock architectural whiteboards with alumni mentors
                      </p>
                    </div>
                  </div>
                </div>

                {/* Text Description of Feature 2 */}
                <div className="order-1 lg:order-2">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2166A5] bg-white border border-[#E5E7EB] px-3 py-1 rounded-md mb-4">
                    <Brain size={13} />
                    <span>AI Career Assistance</span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-[#191919] tracking-tight mb-4 leading-snug">
                    Personalized career planning grounded in real alumni outcomes.
                  </h3>
                  <p className="text-sm sm:text-base text-[#626262] leading-relaxed mb-6">
                    Synthesize actual career trajectories from your university into
                    actionable milestones. Identify skill gaps before recruiters do
                    and prepare with structured guidance.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Custom milestones mapped to your target industry and graduation year",
                      "Context-aware recommendations on projects and technical frameworks",
                      "Actionable resume feedback tailored for modern applicant tracking systems",
                    ].map((pt) => (
                      <li
                        key={pt}
                        className="flex items-start gap-2.5 text-sm text-[#191919]"
                      >
                        <CheckCircle
                          size={16}
                          className="text-[#057642] mt-0.5 shrink-0"
                        />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                  <Button variant="secondary" asChild>
                    <Link href="/career-roadmap">Explore Career Roadmaps →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            STEP 3: DISCOVER ALUMNI DIRECTORY SHOWCASE
           ══════════════════════════════════════════════════════════════════════ */}
        <section
          id="alumni"
          className="py-20 md:py-28 bg-white border-t border-[#E5E7EB]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <p className="text-xs font-semibold text-[#2166A5] uppercase tracking-wider mb-2.5">
                  Verified Alumni Directory
                </p>
                <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] tracking-tight">
                  Experienced graduates ready to share their insights.
                </h2>
                <p className="text-base text-[#626262] mt-2">
                  Search across engineering, product management, and design alumni
                  who are actively open to connecting.
                </p>
              </div>
              <Button variant="primary" asChild className="shrink-0">
                <Link href="/alumni" className="inline-flex items-center !text-white text-white">
                  <Search size={14} className="mr-2 !text-white text-white" />
                  View Full Directory
                </Link>
              </Button>
            </div>

            {/* Clean Directory Table / List Layout */}
            <div className="border border-[#E5E7EB] rounded-xl overflow-hidden divide-y divide-[#E5E7EB] bg-white">
              {DIRECTORY_ALUMNI.map((alumnus) => (
                <div
                  key={alumnus.id}
                  className="p-5 sm:p-6 hover:bg-[#F7F9FC] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <Avatar name={alumnus.name} size="lg" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/alumni/${alumnus.id}`}
                          className="text-base font-semibold text-[#191919] hover:text-[#2166A5] transition-colors"
                        >
                          {alumnus.name}
                        </Link>
                        <span className="text-[11px] font-semibold text-[#2166A5] bg-[#F0F5FA] border border-[#D0E0EF] px-2 py-0.5 rounded">
                          Class of {alumnus.graduationYear}
                        </span>
                      </div>
                      <p className="text-sm text-[#191919] mt-0.5 font-medium flex items-center gap-1.5">
                        <Building2 size={13} className="text-gray-400" />
                        {alumnus.role} · {alumnus.company}{" "}
                        <span className="text-xs text-gray-400 font-normal">
                          ({alumnus.former})
                        </span>
                      </p>
                      <p className="text-xs text-[#626262] flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-gray-400" />
                        {alumnus.location} · {alumnus.department}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alumnus.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-[11px] font-normal text-[#4A4A4A] bg-[#F3F5F7] px-2 py-0.5 rounded"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 gap-2 sm:gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <span className="text-[11px] font-medium text-[#057642] bg-[#EEF8F1] border border-[#BFE3C9] px-2 py-0.5 rounded-full">
                      Verified Graduate
                    </span>
                    <Link
                      href={`/alumni/${alumnus.id}`}
                      className="text-xs font-semibold text-[#2166A5] hover:text-[#194F82] hover:underline flex items-center gap-1"
                    >
                      View Profile <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            FINAL CALL TO ACTION
           ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 md:py-28 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#191919] mb-4 tracking-tight leading-tight">
              Your next career step starts with
              <br />
              the right conversation.
            </h2>
            <p className="text-base text-[#626262] mb-8 leading-relaxed max-w-xl mx-auto">
              Join students and alumni building purposeful careers through shared
              university roots.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-6 !text-white text-white font-medium"
                >
                  <span>Create Your Account</span>
                  <ArrowRight size={15} className="ml-2 !text-white text-white shrink-0" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/alumni" className="px-6 font-medium">
                  Browse Directory
                </Link>
              </Button>
            </div>
            <p className="text-xs text-[#626262] mt-5">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[#2166A5] font-medium hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          FOOTER
         ══════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-[#E5E7EB] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-3">
                <div className="h-7 w-7 rounded-[8px] bg-[#2166A5] flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <Wordmark />
              </Link>
              <p className="text-sm text-[#626262] leading-relaxed">
                Alumni networking and career mentorship for university students.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-sm font-semibold text-[#191919] mb-3">Product</p>
              <ul className="space-y-2">
                {[
                  ["Discover Alumni", "/alumni"],
                  ["Direct Messages", "/messages"],
                  ["AI Career Assistant", "/career-assistant"],
                  ["Career Roadmap", "/career-roadmap"],
                  ["Resume Review", "/resume-review"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#626262] hover:text-[#191919] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="text-sm font-semibold text-[#191919] mb-3">Support</p>
              <ul className="space-y-2">
                {[
                  ["Help Center", "#"],
                  ["Contact Us", "#"],
                  ["For Universities", "#"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#626262] hover:text-[#191919] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-sm font-semibold text-[#191919] mb-3">Legal</p>
              <ul className="space-y-2">
                {[
                  ["Privacy Policy", "#"],
                  ["Terms of Service", "#"],
                  ["Cookie Policy", "#"],
                ].map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#626262] hover:text-[#191919] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E5E7EB] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[#626262]">
              © 2026 AlumniPath. All rights reserved.
            </p>
            <p className="text-xs text-[#626262]">
              Built for students, by people who were once students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
