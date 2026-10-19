"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import {
  saveAuthSession,
  defaultStudentSession,
  defaultAlumniSession,
} from "@/lib/dashboard-storage";

// ─── Shared Brand Wordmark ───────────────────────────────────────────────────
function Wordmark() {
  return (
    <span className="text-xl font-bold tracking-tight text-[#191919]">
      Alumni<span className="text-[#2166A5]">Path</span>
    </span>
  );
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [forgotNotice, setForgotNotice] = useState(false);

  // Auto redirect after successful submission
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => {
      router.push(role === "alumni" ? "/alumni-dashboard" : "/dashboard");
    }, 1800);
    return () => clearTimeout(timer);
  }, [submitted, role, router]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!email) errs.email = "Email address is required.";
    else if (!validateEmail(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    const isAlumni =
      role === "alumni" ||
      email.toLowerCase().includes("datadog") ||
      email.toLowerCase().includes("stripe") ||
      email.toLowerCase().includes("alumni");
    const activeRole: UserRole = isAlumni ? "alumni" : "student";
    setRole(activeRole);

    saveAuthSession(
      activeRole === "alumni"
        ? {
            ...defaultAlumniSession,
            email: email || defaultAlumniSession.email,
            name: email.toLowerCase().includes("arjun")
              ? "Arjun Mehta"
              : defaultAlumniSession.name,
            isAuthenticated: true,
          }
        : {
            ...defaultStudentSession,
            email: email || defaultStudentSession.email,
            name: email.toLowerCase().includes("priya")
              ? "Priya Sharma"
              : defaultStudentSession.name,
            isAuthenticated: true,
          }
    );

    // Simulate network authentication request (demo mode)
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSubmitted(true);
  }

  // ─── Post-Login Success Screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-[8px] bg-[#2166A5] flex items-center justify-center shrink-0 shadow-xs">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <Wordmark />
            </Link>
          </div>
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-xs text-center">
            <div className="h-12 w-12 rounded-full bg-[#EEF8F1] border border-[#BFE3C9] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-6 w-6 text-[#057642]" />
            </div>
            <h2 className="text-lg font-bold text-[#191919] mb-1.5 tracking-tight">
              {role === "alumni"
                ? "Signed in as Alumni Mentor"
                : "Signed in as Student"}
            </h2>
            <p className="text-xs sm:text-sm text-[#626262] mb-6 leading-relaxed">
              {role === "alumni"
                ? "Welcome back to the Alumni Mentor Portal! Directing to your workspace…"
                : "Welcome back! Redirecting to your student dashboard…"}
            </p>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              asChild
              className="h-[46px] rounded-[8px] font-semibold bg-[#2166A5] hover:bg-[#194F82] !text-white text-white border-0 shadow-none"
            >
              <Link href={role === "alumni" ? "/alumni-dashboard" : "/dashboard"}>
                {role === "alumni"
                  ? "Go to Alumni Dashboard"
                  : "Go to Student Dashboard"}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Redesigned Two-Column Login Experience ───────────────────────────
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* ════════════════════════════════════════════════════════════════════════
          LEFT SECTION (~45%): SOPHISTICATED EDITORIAL PROMOTIONAL PANEL
         ════════════════════════════════════════════════════════════════════════ */}
      <aside className="hidden lg:flex lg:w-[45%] xl:w-[46%] bg-[#F7F9FC] border-r border-[#E5E7EB] flex-col justify-between px-12 xl:px-16 py-12 min-h-screen">
        {/* Brand Logo Header */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-[8px] bg-[#2166A5] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <Wordmark />
          </Link>
        </div>

        {/* Central Editorial Content Block */}
        <div className="my-auto py-8 max-w-[460px] w-full">
          {/* Small Introductory Label (Small uppercase, slight letter spacing, restrained blue accent, no pill) */}
          <p className="text-xs font-semibold tracking-wider uppercase text-[#2166A5] mb-4">
            YOUR UNIVERSITY. YOUR NETWORK.
          </p>

          {/* Main Primary Headline (38-42px on desktop, 650-700 weight, line-height 1.15, dark charcoal, "a connection." in #2166A5) */}
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[42px] font-bold text-[#191919] tracking-tight leading-[1.15] mb-5">
            Your next chapter
            <br />
            starts with <span className="text-[#2166A5]">a connection.</span>
          </h1>

          {/* Supporting Paragraph (16-17px, line height 1.65, muted gray, max-w ~440px, left-aligned) */}
          <p className="text-[16px] sm:text-[17px] text-[#626262] leading-[1.65] max-w-[440px] mb-8">
            Connect with alumni who have been where you want to go. Learn from
            their experiences and move forward with confidence.
          </p>

          {/* Large Editorial Landscape Photograph (16:9 aspect, object-cover, 10px rounded corners, thin border, NO overlaid labels) */}
          <div className="relative w-full rounded-[10px] overflow-hidden border border-[#E5E7EB] shadow-xs bg-white mb-3.5">
            <div className="relative aspect-[16/9] w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-network.jpg"
                alt="University Alumni and Student Mentorship"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Subtle Supporting Line beneath image (Plain text, no card, no border, no shadow) */}
          <p className="text-xs sm:text-sm text-[#626262] font-normal">
            Strong connections can shape your career.
          </p>
        </div>

        {/* Left Column Subtle Footer */}
        <div className="pt-6 text-xs text-[#8C8C8C] flex items-center justify-between max-w-[460px]">
          <span>&copy; 2026 AlumniPath</span>
          <span>Career Mentorship Platform</span>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════════════════════
          RIGHT SECTION (~55%): CLEAN, BALANCED LOGIN EXPERIENCE
         ════════════════════════════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-10 lg:py-16 bg-white min-h-screen">
        {/* Mobile Header with AlumniPath Logo */}
        <div className="lg:hidden text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-[8px] bg-[#2166A5] flex items-center justify-center shrink-0 shadow-xs">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <Wordmark />
          </Link>
        </div>

        {/* Centered Login Content Form Container */}
        <div className="w-full max-w-[440px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[28px] font-bold text-[#191919] tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-[#626262] mt-1.5">
              Sign in to continue to your AlumniPath network.
            </p>
          </div>

          {/* Role Selector Segmented Control */}
          <div className="mb-4">
            <div
              role="tablist"
              aria-label="User portal role"
              className="p-1 bg-[#F3F4F6] rounded-[8px] border border-[#E5E7EB] grid grid-cols-2 gap-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={role === "student"}
                onClick={() => {
                  setRole("student");
                  if (email.includes("datadog") || email.includes("stripe")) {
                    setEmail("priya@umich.edu");
                  }
                }}
                className={cn(
                  "py-2 px-3 text-xs sm:text-sm font-medium rounded-[6px] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer",
                  role === "student"
                    ? "bg-white text-[#2166A5] font-semibold shadow-xs border border-[#E2E8F0]"
                    : "text-[#626262] hover:text-[#191919]"
                )}
              >
                {role === "student" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2166A5]" />
                )}
                Student Portal
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={role === "alumni"}
                onClick={() => {
                  setRole("alumni");
                  if (email.includes("umich") || email === "") {
                    setEmail("marcus.vance@datadog.com");
                  }
                }}
                className={cn(
                  "py-2 px-3 text-xs sm:text-sm font-medium rounded-[6px] transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer",
                  role === "alumni"
                    ? "bg-white text-[#2166A5] font-semibold shadow-xs border border-[#E2E8F0]"
                    : "text-[#626262] hover:text-[#191919]"
                )}
              >
                {role === "alumni" && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2166A5]" />
                )}
                Alumni Mentor Portal
              </button>
            </div>
          </div>

          {/* Compact Demo Accounts Section */}
          <div className="mb-5 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[8px] p-3 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-[#374151] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2166A5]" />
                Quick-fill demo accounts:
              </span>
              <span className="text-[10px] text-[#626262] bg-[#E5E7EB]/70 px-1.5 py-0.5 rounded font-medium">
                Demo Mode
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setEmail("priya@umich.edu");
                  setPassword("password123");
                  setErrors({});
                  setForgotNotice(false);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer",
                  role === "student" && email === "priya@umich.edu"
                    ? "bg-[#F0F5FA] border-[#2166A5] text-[#2166A5]"
                    : "bg-white border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#191919]"
                )}
              >
                Student (Priya)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("alumni");
                  setEmail("marcus.vance@datadog.com");
                  setPassword("password123");
                  setErrors({});
                  setForgotNotice(false);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer",
                  role === "alumni" && email === "marcus.vance@datadog.com"
                    ? "bg-[#F0F5FA] border-[#2166A5] text-[#2166A5]"
                    : "bg-white border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#191919]"
                )}
              >
                Alumni (Marcus Vance)
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("alumni");
                  setEmail("arjun@stripe.com");
                  setPassword("password123");
                  setErrors({});
                  setForgotNotice(false);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-[6px] text-xs font-medium border transition-colors cursor-pointer",
                  role === "alumni" && email === "arjun@stripe.com"
                    ? "bg-[#F0F5FA] border-[#2166A5] text-[#2166A5]"
                    : "bg-white border-[#D1D5DB] text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#191919]"
                )}
              >
                Alumni (Arjun)
              </button>
            </div>
          </div>

          {/* Google Sign-In Secondary Action Button */}
          <button
            type="button"
            onClick={() => {
              setErrors({
                general:
                  "Google sign-in is not yet configured for demo mode. Please select a demo account above or use email and password.",
              });
            }}
            className="w-full flex items-center justify-center gap-3 h-[44px] rounded-[8px] border border-[#D1D5DB] bg-white text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] hover:border-[#9CA3AF] active:bg-[#F3F4F6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2166A5] cursor-pointer"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center my-5">
            <div className="flex-1 border-t border-[#E5E7EB]" />
            <span className="px-3 text-xs text-[#8C8C8C] uppercase tracking-wider font-medium bg-white">
              or
            </span>
            <div className="flex-1 border-t border-[#E5E7EB]" />
          </div>

          {/* Notice & Error Messages */}
          {errors.general && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[8px] border border-[#F9D2D5] bg-[#FEEFF0] p-3 text-xs text-[#CC1016]">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-[#CC1016]" />
              <span className="flex-1 leading-relaxed">{errors.general}</span>
              <button
                type="button"
                onClick={() => setErrors((p) => ({ ...p, general: undefined }))}
                className="text-[#CC1016] hover:opacity-80 cursor-pointer"
                aria-label="Dismiss notice"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {forgotNotice && (
            <div className="mb-4 flex items-start gap-2.5 rounded-[8px] border border-[#B2D5F8] bg-[#EBF3FB] p-3 text-xs text-[#004182]">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-[#2166A5]" />
              <span className="flex-1 leading-relaxed">
                In demo mode, you can sign in using password{" "}
                <strong className="font-semibold underline">password123</strong> or
                click any quick-fill persona above.
              </span>
              <button
                type="button"
                onClick={() => setForgotNotice(false)}
                className="text-[#004182] hover:opacity-80 cursor-pointer"
                aria-label="Dismiss notice"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <Input
              id="login-email"
              label="Email address"
              type="email"
              placeholder="you@university.edu"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              error={errors.email}
              leadingIcon={<Mail size={16} />}
              required
            />

            {/* Password Field with Label-Aligned Forgot Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="text-xs sm:text-sm font-medium text-[#374151] tracking-tight"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotNotice(true)}
                  className="text-xs sm:text-sm text-[#2166A5] hover:text-[#194F82] font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2166A5] rounded cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
                leadingIcon={<Lock size={16} />}
                trailingElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                required
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D1D5DB] text-[#2166A5] focus:ring-2 focus:ring-[#2166A5]/20 focus:outline-none cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-[#4B5563]">
                  Remember me for 30 days
                </span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              fullWidth
              className="h-[46px] sm:h-[48px] rounded-[8px] font-semibold text-sm sm:text-base bg-[#2166A5] hover:bg-[#194F82] active:bg-[#143F68] !text-white text-white border-0 transition-colors shadow-none mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Signing in…</span>
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Join Now / Signup Navigation */}
          <p className="mt-8 text-center text-sm text-[#626262]">
            New to AlumniPath?{" "}
            <Link
              href="/signup"
              className="text-[#2166A5] font-semibold hover:text-[#194F82] hover:underline"
            >
              Join now
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
