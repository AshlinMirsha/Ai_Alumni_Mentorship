"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Users,
  Compass,
  Brain,
  FileText,
  Map,
  Star,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
  MapPin,
  Building2,
  GraduationCap,
  MessageCircle,
  Briefcase,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";

// ─── Shared wordmark ──────────────────────────────────────────────────────────
function Wordmark({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`text-lg font-bold tracking-tight ${
        dark ? "text-white" : "text-[#191919]"
      }`}
    >
      Alumni<span className="text-[#0A66C2]">Path</span>
    </span>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-[#0A66C2] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <Wordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
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
            <Link
              href="/alumni"
              className="text-sm font-medium text-[#626262] hover:text-[#191919] transition-colors"
            >
              Discover Alumni
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login" className="text-sm font-medium text-[#191919]">
                Log In
              </Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/signup" className="text-sm font-medium">
                Get Started
              </Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-[#626262] hover:text-[#191919]"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
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
          <Link
            href="/alumni"
            className="text-sm py-2 font-medium text-[#191919] border-b border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Discover Alumni
          </Link>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="sm" fullWidth asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button variant="primary" size="sm" fullWidth asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Hero Visual (Open, Borderless Editorial Composition) ──────────────────────
function HeroVisual() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Clean, open editorial networking composition — without any enclosing browser mockup */}
      <div className="space-y-3.5">
        {/* Spotlight Alumni Card (Marcus Vance) */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 shadow-sm hover:border-[#0A66C2]/40 transition-colors">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name="Marcus Vance" size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-[#191919]">
                    Marcus Vance
                  </span>
                  <span className="inline-flex items-center text-[10px] font-semibold text-[#0A66C2] bg-[#F0F7FE] border border-[#DCEAF8] px-1.5 py-0.5 rounded">
                    Alum &apos;20
                  </span>
                </div>
                <p className="text-xs text-[#626262] mt-0.5 truncate">
                  Senior Backend Engineer · Datadog
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  Ex-Google · B.S. in Computer Science
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#057642] bg-[#EEF8F1] border border-[#BFE3C9] px-2 py-0.5 rounded-full shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[#057642]" />
              Active Mentor
            </span>
          </div>

          <p className="text-xs text-[#626262] leading-relaxed mb-3 bg-[#F7F9FC] border border-[#E5E7EB] rounded-lg p-3">
            &ldquo;Went through the campus recruitment cycle myself. I help students
            bridge the gap between coursework and production engineering standards.&rdquo;
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-gray-100 text-xs">
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] font-medium text-[#0A66C2] bg-[#F0F7FE] px-2 py-0.5 rounded">
                Distributed Systems
              </span>
              <span className="text-[11px] font-medium text-[#4A4A4A] bg-[#F3F5F7] px-2 py-0.5 rounded">
                PostgreSQL
              </span>
              <span className="text-[11px] font-medium text-[#4A4A4A] bg-[#F3F5F7] px-2 py-0.5 rounded">
                System Design
              </span>
            </div>
            <span className="text-[11px] font-medium text-[#626262]">
              96% response rate
            </span>
          </div>
        </div>

        {/* Connection Indicator Bar */}
        <div className="flex items-center justify-between px-3 py-1 text-xs text-[#626262]">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#0A66C2]" />
            <span className="font-medium text-[#191919]">
              Direct 1:1 Mentorship Path
            </span>
          </div>
          <span className="text-[11px] text-[#0A66C2] font-medium flex items-center gap-1">
            <Sparkles size={12} className="text-[#0A66C2]" />
            Verified campus match
          </span>
        </div>

        {/* Student Mentee Connection Card (Ashlin) */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-4 sm:p-5 shadow-sm hover:border-[#0A66C2]/40 transition-colors">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name="Ashlin" size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-semibold text-[#191919]">Ashlin</span>
                  <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    Student &apos;27
                  </span>
                </div>
                <p className="text-xs text-[#626262] mt-0.5 truncate">
                  Computer Science · Second Year
                </p>
                <p className="text-[11px] text-[#0A66C2] font-medium mt-0.5 truncate">
                  Targeting: Full-Stack Software Engineer
                </p>
              </div>
            </div>
            <Link
              href="/alumni"
              className="text-xs font-semibold text-[#0A66C2] hover:text-[#004182] hover:underline shrink-0 flex items-center gap-1"
            >
              Connect <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Companion Alum Preview (Elena Rostova) */}
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3.5 sm:p-4 shadow-sm hover:border-[#0A66C2]/40 transition-colors">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name="Elena Rostova" size="md" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#191919] truncate">
                    Elena Rostova
                  </span>
                  <span className="text-[10px] text-[#0A66C2] font-semibold shrink-0">
                    Alum &apos;19
                  </span>
                </div>
                <p className="text-[11px] text-[#626262] truncate">
                  Staff Software Engineer · Airbnb
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#626262] shrink-0">
              <Building2 size={12} className="text-gray-400" />
              <span>San Francisco, CA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── How It Works Data ────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Discover Alumni",
    description:
      "Search and filter alumni by company, role, skills, and industry to find mentors whose journeys align with your career goals.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Connect with Mentors",
    description:
      "Reach out with personalized messages, ask targeted career questions, and learn from real professional experiences.",
    icon: MessageCircle,
  },
  {
    step: "03",
    title: "Build Your Career",
    description:
      "Gain actionable industry insights, prepare for interviews, and map out a structured roadmap for your long-term success.",
    icon: GraduationCap,
  },
];

// ─── Features Data ────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: "Smart Alumni Matching",
    description:
      "Find alumni whose career paths, industries, and technical skills are most relevant to where you want to go.",
  },
  {
    icon: Brain,
    title: "AI Career Assistant",
    description:
      "Get thoughtful, context-aware career guidance. Ask questions, explore options, and think through decisions.",
  },
  {
    icon: MessageCircle,
    title: "Direct Networking",
    description:
      "Connect directly with alumni who walked the same campus. Ask questions and learn about real industry realities.",
  },
  {
    icon: Map,
    title: "Career Roadmaps",
    description:
      "Map out a clear path to your target role with milestones, timelines, and skill-gap awareness.",
  },
  {
    icon: FileText,
    title: "Resume Review",
    description:
      "Get structured feedback on your resume: impact, clarity, ATS keywords, and specific improvement areas.",
  },
  {
    icon: Star,
    title: "Personalized Guidance",
    description:
      "Recommendations and career insights tailored to your goals, background, and the alumni in your network.",
  },
];

// ─── Platform Preview Section ─────────────────────────────────────────────────
function PlatformPreview() {
  return (
    <section id="alumni" className="py-16 md:py-24 border-t border-[#E5E7EB] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: text */}
          <div>
            <p className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider mb-2.5">
              How the platform helps
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191919] mb-4 leading-tight tracking-tight">
              Choose your direction.
              <br />
              Find who can help you get there.
            </h2>
            <p className="text-sm sm:text-base text-[#626262] mb-6 leading-relaxed">
              Set a target role, and see alumni whose career journey is most
              relevant to yours — filtered by company, industry, skills, and
              graduation year.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Filter by industry, company, or graduation year",
                "Learn directly from engineers, PMs, and designers",
                "Read their career story before reaching out",
                "Connect with a personalized intro message",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-[#4A4A4A]">
                  <CheckCircle size={16} className="text-[#057642] mt-0.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <Button variant="primary" asChild>
              <Link href="/alumni" className="inline-flex items-center">
                Explore Alumni Directory <ArrowRight size={15} className="ml-1.5" />
              </Link>
            </Button>
          </div>

          {/* Right: mini alumni list preview */}
          <div className="space-y-3">
            {[
              {
                name: "Arjun Mehta",
                role: "Senior PM",
                company: "Stripe",
                location: "San Francisco, CA",
                year: 2018,
                tags: ["Product Strategy", "FinTech", "PM Interviews"],
              },
              {
                name: "Neha Kapoor",
                role: "Engineering Manager",
                company: "Airbnb",
                location: "San Francisco, CA",
                year: 2016,
                tags: ["Engineering Leadership", "System Design", "Career Growth"],
              },
              {
                name: "Sanya Gupta",
                role: "UX Design Lead",
                company: "Microsoft",
                location: "Seattle, WA",
                year: 2017,
                tags: ["UX Research", "Design Systems", "Portfolio Reviews"],
              },
            ].map((a) => (
              <Card
                key={a.name}
                padding="md"
                className="bg-white border border-[#E5E7EB] hover:border-[#0A66C2]/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Avatar name={a.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-[#191919]">{a.name}</p>
                        <p className="text-xs text-[#626262] flex items-center gap-1 mt-0.5">
                          <Building2 size={11} />
                          {a.role} · {a.company}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} />
                          {a.location} · Class of {a.year}
                        </p>
                      </div>
                      <span className="text-[11px] font-medium text-[#057642] bg-[#EEF8F1] border border-[#BFE3C9] px-2 py-0.5 rounded-full shrink-0">
                        Verified Alum
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {a.tags.map((t) => (
                        <Badge key={t} size="sm" variant="default">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5 mb-3">
              <div className="h-7 w-7 rounded-md bg-[#0A66C2] flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <Wordmark />
            </Link>
            <p className="text-sm text-[#626262] leading-relaxed">
              Alumni networking and career mentorship for college students.
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
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 border-b border-[#E5E7EB]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A66C2] bg-[#F0F7FE] border border-[#DCEAF8] rounded-full px-3.5 py-1 mb-5">
                  Your college network, working for your future
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] mb-5">
                  <span className="text-[#191919]">Find the right people.</span>
                  <br />
                  <span className="text-[#0A66C2]">Build the right career.</span>
                </h1>

                <p className="text-base sm:text-lg text-[#626262] leading-relaxed mb-8 max-w-lg">
                  Connect with alumni who understand your ambitions, learn from
                  real career experiences, and build a clearer path toward your
                  professional goals.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Button variant="primary" size="lg" asChild>
                    <Link href="/alumni" className="inline-flex items-center justify-center">
                      Find Your Mentor <ArrowRight size={15} className="ml-1.5" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <a href="#how-it-works" className="inline-flex items-center justify-center">
                      Explore How It Works
                    </a>
                  </Button>
                </div>

                <div className="pt-4 border-t border-[#E5E7EB] flex flex-wrap items-center gap-6 text-xs text-[#626262]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-[#057642]" />
                    <span>Verified Alumni</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Briefcase size={14} className="text-[#0A66C2]" />
                    <span>Top Tech &amp; Design Roles</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-[#057642]" />
                    <span>Direct Inquiries</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Open, Borderless Visual */}
              <div className="lg:pl-2">
                <HeroVisual />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white border-b border-[#E5E7EB]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider mb-2.5">
                How it works
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191919] tracking-tight">
                Three steps to a better career path
              </h2>
              <p className="text-sm sm:text-base text-[#626262] mt-3 leading-relaxed">
                A structured, reliable way for students to connect with experienced
                graduates who have walked the same path.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="bg-white border border-[#E5E7EB] rounded-lg p-6 hover:border-[#0A66C2]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-10 w-10 rounded-md bg-[#F0F7FE] border border-[#DCEAF8] flex items-center justify-center text-[#0A66C2]">
                        <Icon size={18} />
                      </div>
                      <span className="text-xs font-bold text-[#0A66C2] bg-[#F0F7FE] px-2.5 py-0.5 rounded-full">
                        Step {item.step}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-[#191919] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#626262] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="py-16 md:py-24 bg-[#F7F9FC] border-b border-[#E5E7EB]"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="text-xs font-semibold text-[#0A66C2] uppercase tracking-wider mb-2.5">
                Platform features
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#191919] tracking-tight">
                Everything you need to navigate your career
              </h2>
              <p className="text-sm sm:text-base text-[#626262] mt-3 leading-relaxed">
                Comprehensive tools to help students bridge the gap between college
                and professional life.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.title}
                    padding="md"
                    className="bg-white border border-[#E5E7EB] rounded-lg hover:border-[#0A66C2]/40 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-md bg-[#F0F7FE] border border-[#DCEAF8] flex items-center justify-center mb-3">
                      <Icon size={17} className="text-[#0A66C2]" />
                    </div>
                    <h3 className="text-sm font-semibold text-[#191919] mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#626262] leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Platform Preview Section */}
        <PlatformPreview />

        {/* Final CTA Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#191919] mb-4 leading-tight tracking-tight">
              Your next career step starts with
              <br />
              the right conversation.
            </h2>
            <p className="text-sm sm:text-base text-[#626262] mb-8 leading-relaxed">
              Join other students who are connecting with alumni, getting real
              guidance, and building careers with intention.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
              <Button variant="primary" size="lg" asChild>
                <Link href="/signup" className="inline-flex items-center">
                  Create Your Account <ArrowRight size={15} className="ml-1.5" />
                </Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/alumni">Browse Directory</Link>
              </Button>
            </div>
            <p className="text-xs text-[#626262] mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0A66C2] font-medium hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
