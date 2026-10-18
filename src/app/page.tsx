"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Users,
  BookOpen,
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
        dark ? "text-white" : "text-gray-900"
      }`}
    >
      Alumni<span className="text-blue-600">Path</span>
    </span>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Wordmark */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <Wordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#how-it-works"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="#alumni"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Discover Alumni
            </a>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button variant="primary" size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-2">
          <a
            href="#how-it-works"
            className="text-sm py-2 text-gray-700 border-b border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </a>
          <a
            href="#features"
            className="text-sm py-2 text-gray-700 border-b border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#alumni"
            className="text-sm py-2 text-gray-700 border-b border-gray-100"
            onClick={() => setMobileOpen(false)}
          >
            Discover Alumni
          </a>
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

// ─── Product Preview component (right side of hero) ──────────────────────────
function ProductPreview() {
  return (
    <div className="relative">
      {/* Browser chrome */}
      <div className="rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
        {/* Title bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 mx-4 bg-white border border-gray-200 rounded text-xs text-gray-400 px-2 py-0.5 text-center">
            alumnipath.app/alumni
          </div>
        </div>

        {/* App chrome */}
        <div className="bg-gray-50 flex" style={{ minHeight: 340 }}>
          {/* Mini sidebar */}
          <div className="w-10 bg-white border-r border-gray-100 flex flex-col items-center py-3 gap-3">
            <div className="w-5 h-5 rounded bg-blue-600" />
            <div className="w-4 h-0.5 rounded bg-blue-100 mt-2" />
            <div className="w-4 h-0.5 rounded bg-gray-200" />
            <div className="w-4 h-0.5 rounded bg-gray-200" />
            <div className="w-4 h-0.5 rounded bg-gray-200" />
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 overflow-hidden">
            {/* Student context bar */}
            <div className="bg-white rounded-md border border-gray-200 p-3 mb-3 flex items-center gap-2.5">
              <Avatar name="Priya Sharma" size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">Priya Sharma</p>
                <p className="text-xs text-gray-500 truncate">CS, 2025 · Targeting: Product Manager</p>
              </div>
              <Badge variant="blue" size="sm">72% match</Badge>
            </div>

            {/* Section label */}
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Recommended Alumni
            </p>

            {/* Alumni card 1 */}
            <div className="bg-white rounded-md border border-gray-200 p-3 mb-2 hover:border-blue-200 transition-colors">
              <div className="flex items-start gap-2.5">
                <Avatar name="Arjun Mehta" size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Arjun Mehta</p>
                      <p className="text-xs text-gray-500">Senior PM · Stripe</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-gray-700">94</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge size="sm" variant="blue">Product Strategy</Badge>
                    <Badge size="sm" variant="default">A/B Testing</Badge>
                    <Badge size="sm" variant="default">SQL</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    Went from SWE → PM. Mentors on product interviews and FinTech.
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-700">Open to mentoring</span>
                </div>
                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                  View profile →
                </span>
              </div>
            </div>

            {/* Alumni card 2 */}
            <div className="bg-white rounded-md border border-gray-200 p-3 hover:border-blue-200 transition-colors">
              <div className="flex items-start gap-2.5">
                <Avatar name="Rohan Verma" size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-900">Rohan Verma</p>
                      <p className="text-xs text-gray-500">Data Scientist · Netflix</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <span className="text-xs font-semibold text-gray-700">76</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    <Badge size="sm" variant="green">Python</Badge>
                    <Badge size="sm" variant="default">ML</Badge>
                    <Badge size="sm" variant="default">A/B Testing</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                    Builds recommendation systems. Helps students break into data science.
                  </p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-emerald-700">Open to mentoring</span>
                </div>
                <span className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">
                  View profile →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating label */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Alumni recommendations update based on your profile
      </div>
    </div>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Build Your Profile",
    description:
      "Add your skills, interests, projects, and career goals. The more context you provide, the better your matches.",
    icon: GraduationCap,
  },
  {
    step: "02",
    title: "Discover Relevant Alumni",
    description:
      "Explore alumni whose professional experience, company, and career path align with your goals.",
    icon: Compass,
  },
  {
    step: "03",
    title: "Learn and Grow",
    description:
      "Request mentorship, ask questions, and build a personalized career roadmap based on real experience.",
    icon: BookOpen,
  },
];

// ─── Features ────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Users,
    title: "Smart Alumni Matching",
    description:
      "Find alumni whose career paths, industries, and skills are most relevant to where you want to go.",
  },
  {
    icon: Brain,
    title: "AI Career Assistant",
    description:
      "Get thoughtful, context-aware career guidance. Ask questions, explore options, and think through decisions.",
  },
  {
    icon: MessageCircle,
    title: "Direct Mentorship",
    description:
      "Connect directly with alumni who are open to mentoring. Schedule sessions and build a real relationship.",
  },
  {
    icon: Map,
    title: "Career Roadmaps",
    description:
      "Map out a clear path to your target role with milestones, timelines, and skill-gap awareness.",
  },
  {
    icon: FileText,
    title: "Resume Feedback",
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
    <section id="alumni" className="py-20 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text */}
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
              How the platform helps
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              Choose your direction.
              <br />
              Find who can help you get there.
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Set a target role, and see alumni whose career journey is most
              relevant to yours — filtered by company, industry, skills, and
              mentorship availability.
            </p>

            <ul className="space-y-3">
              {[
                "Filter by industry, company, or graduation year",
                "See which alumni are open to mentorship",
                "Read their career story before reaching out",
                "Connect with a personalised intro message",
              ].map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <CheckCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button variant="primary" asChild>
                <Link href="/signup">
                  Start exploring <ArrowRight size={15} className="ml-1" />
                </Link>
              </Button>
            </div>
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
                availability: "available" as const,
              },
              {
                name: "Neha Kapoor",
                role: "Engineering Manager",
                company: "Airbnb",
                location: "San Francisco, CA",
                year: 2016,
                tags: ["Engineering Leadership", "System Design", "Career Growth"],
                availability: "limited" as const,
              },
              {
                name: "Sanya Gupta",
                role: "UX Design Lead",
                company: "Microsoft",
                location: "Seattle, WA",
                year: 2017,
                tags: ["UX Research", "Design Systems", "Portfolio Reviews"],
                availability: "available" as const,
              },
            ].map((a) => (
              <Card key={a.name} padding="md" className="hover:border-blue-200 transition-colors">
                <div className="flex items-start gap-3">
                  <Avatar name={a.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{a.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Building2 size={11} />
                          {a.role} · {a.company}
                        </p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} />
                          {a.location} · Class of {a.year}
                        </p>
                      </div>
                      <Badge
                        variant={a.availability === "available" ? "green" : "amber"}
                        size="sm"
                      >
                        {a.availability === "available" ? "Open to mentoring" : "Limited"}
                      </Badge>
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
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">A</span>
              </div>
              <Wordmark />
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              Alumni networking and career mentorship for college students.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Product</p>
            <ul className="space-y-2">
              {[
                ["Discover Alumni", "/alumni"],
                ["My Mentorships", "/mentorship"],
                ["AI Career Assistant", "/career-assistant"],
                ["Career Roadmap", "/career-roadmap"],
                ["Resume Review", "/resume-review"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Support</p>
            <ul className="space-y-2">
              {[
                ["Help Center", "#"],
                ["Contact Us", "#"],
                ["For Universities", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">Legal</p>
            <ul className="space-y-2">
              {[
                ["Privacy Policy", "#"],
                ["Terms of Service", "#"],
                ["Cookie Policy", "#"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            © 2026 AlumniPath. All rights reserved.
          </p>
          <p className="text-xs text-gray-400">
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
        {/* Hero */}
        <section className="py-16 md:py-24 border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left */}
              <div>
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-5">
                  Your college network, working for your future
                </p>

                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-5">
                  Find the right people.
                  <br />
                  <span className="text-blue-600">Build the right career.</span>
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
                  Connect with alumni who understand your ambitions, learn from
                  real career experiences, and build a clearer path toward your
                  professional goals.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <Button variant="primary" size="lg" asChild>
                    <Link href="/signup">
                      Find Your Mentor <ArrowRight size={15} className="ml-1" />
                    </Link>
                  </Button>
                  <Button variant="secondary" size="lg" asChild>
                    <a href="#how-it-works">Explore How It Works</a>
                  </Button>
                </div>

                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <CheckCircle size={13} className="text-emerald-500" />
                  Personalized alumni discovery based on your goals, skills, and interests
                </p>
              </div>

              {/* Right: Product Preview */}
              <div className="lg:pl-4">
                <ProductPreview />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
                How it works
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Three steps to a better career path
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {HOW_IT_WORKS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                          <Icon size={18} className="text-blue-600" />
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-1">
                          Step {item.step}
                        </p>
                        <h3 className="text-base font-semibold text-gray-900 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="py-20 bg-gray-50 border-t border-b border-gray-100"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
                Platform features
              </p>
              <h2 className="text-3xl font-bold text-gray-900">
                Everything you need to navigate your career
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} padding="md" className="bg-white">
                    <div className="h-9 w-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                      <Icon size={17} className="text-blue-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Platform preview */}
        <PlatformPreview />

        {/* Final CTA */}
        <section className="py-20 border-t border-gray-100">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              Your next career step starts with
              <br />
              the right conversation.
            </h2>
            <p className="text-gray-600 mb-8">
              Join other students who are connecting with alumni, getting real
              guidance, and building careers with intention.
            </p>
            <Button variant="primary" size="lg" asChild>
              <Link href="/signup">
                Create Your Account <ArrowRight size={15} className="ml-1" />
              </Link>
            </Button>
            <p className="text-xs text-gray-400 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
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
