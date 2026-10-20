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
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import type { UserRole } from "@/types";
import {
  saveAuthSession,
  defaultStudentSession,
  defaultAlumniSession,
} from "@/lib/dashboard-storage";

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
    }, 1500);
    return () => clearTimeout(timer);
  }, [submitted, role, router]);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!email) errs.email = "Institutional or work email is required.";
    else if (!validateEmail(email)) errs.email = "Please enter a valid email address.";
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
      email.toLowerCase().includes("airbnb") ||
      email.toLowerCase().includes("stripe") ||
      email.toLowerCase().includes("alumni");
    const activeRole: UserRole = isAlumni ? "alumni" : "student";
    setRole(activeRole);

    saveAuthSession(
      activeRole === "alumni"
        ? {
            ...defaultAlumniSession,
            email: email || defaultAlumniSession.email,
            name: email.toLowerCase().includes("elena")
              ? "Elena Rostova"
              : email.toLowerCase().includes("marcus")
              ? "Marcus Vance"
              : defaultAlumniSession.name,
            isAuthenticated: true,
          }
        : {
            ...defaultStudentSession,
            email: email || defaultStudentSession.email,
            name: email.toLowerCase().includes("ashlin")
              ? "Ashlin Mirsha"
              : email.toLowerCase().includes("priya")
              ? "Priya Sharma"
              : defaultStudentSession.name,
            isAuthenticated: true,
          }
    );

    // Simulate authentication latency
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  }

  // ─── Post-Login Success Screen ──────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-[#090909] px-4 py-12 antialiased">
        <div className="w-full max-w-[420px] text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-[#090909] text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={28} />
          </div>

          <div className="bg-white border border-[#E7E7E7] rounded-3xl p-8 sm:p-10 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                Session Authenticated
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#090909] tracking-tight">
                {role === "alumni"
                  ? "Welcome, Alumni Mentor"
                  : "Welcome, Student"}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              {role === "alumni"
                ? "Connecting to your collegiate mentor workspace and incoming student guidance requests…"
                : "Synchronizing your roadmap milestones, recommended alumni, and mentor conversations…"}
            </p>

            <div className="pt-2">
              <Link
                href={role === "alumni" ? "/alumni-dashboard" : "/dashboard"}
                className="w-full h-11 rounded-full bg-[#090909] hover:bg-[#242424] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Continue to Workspace</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#090909] flex flex-col justify-between antialiased selection:bg-[#090909] selection:text-white py-8 px-4 sm:px-6">
      {/* Top Header Row */}
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#737373] hover:text-[#090909] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Return to AlumniPath</span>
        </Link>

        <span className="text-[11px] font-medium text-[#737373] hidden sm:inline">
          Verified University Network · Spring 2026
        </span>
      </div>

      {/* Centered Auth Card Container */}
      <div className="w-full max-w-[440px] mx-auto my-auto py-4">
        {/* Brand Icon Header */}
        <div className="mb-6 text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-[#090909] text-white flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-105">
              A
            </div>
            <span className="text-lg font-bold tracking-tight text-[#090909]">
              AlumniPath
            </span>
          </Link>
        </div>

        {/* White Centered Card */}
        <div className="bg-white border border-[#E7E7E7] rounded-3xl shadow-sm p-7 sm:p-9 space-y-6">
          {/* Card Title */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#090909]">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#737373]">
              Sign in to access your verified collegiate network.
            </p>
          </div>

          {/* Role Segmented Control */}
          <div
            role="tablist"
            aria-label="User portal role"
            className="p-1 bg-[#F4F4F4] rounded-full border border-[#E7E7E7] grid grid-cols-2 gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={role === "student"}
              onClick={() => {
                setRole("student");
                if (email.includes("datadog") || email.includes("airbnb")) {
                  setEmail("ashlin@stanford.edu");
                }
              }}
              className={`py-2 px-3 text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                role === "student"
                  ? "bg-[#090909] text-white font-semibold shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={role === "alumni"}
              onClick={() => {
                setRole("alumni");
                if (email.includes("stanford") || email === "") {
                  setEmail("marcus.vance@datadog.com");
                }
              }}
              className={`py-2 px-3 text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                role === "alumni"
                  ? "bg-[#090909] text-white font-semibold shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              <span>Alumni Mentor</span>
            </button>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#090909] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#090909]" />
                Demo Credentials:
              </span>
              <span className="text-[#737373] text-[10px]">Instant Fill</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setEmail("ashlin@stanford.edu");
                  setPassword("password123");
                  setErrors({});
                  setForgotNotice(false);
                }}
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                  role === "student" && email === "ashlin@stanford.edu"
                    ? "bg-[#090909] text-white border-[#090909] font-medium"
                    : "bg-white text-[#737373] hover:text-[#090909] border-[#E7E7E7] hover:border-[#090909]"
                }`}
              >
                Student (Ashlin)
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
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                  role === "alumni" && email === "marcus.vance@datadog.com"
                    ? "bg-[#090909] text-white border-[#090909] font-medium"
                    : "bg-white text-[#737373] hover:text-[#090909] border-[#E7E7E7] hover:border-[#090909]"
                }`}
              >
                Marcus (Datadog)
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole("alumni");
                  setEmail("elena.rostova@airbnb.com");
                  setPassword("password123");
                  setErrors({});
                  setForgotNotice(false);
                }}
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                  role === "alumni" && email === "elena.rostova@airbnb.com"
                    ? "bg-[#090909] text-white border-[#090909] font-medium"
                    : "bg-white text-[#737373] hover:text-[#090909] border-[#E7E7E7] hover:border-[#090909]"
                }`}
              >
                Elena (Airbnb)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold text-[#090909] block">
                {role === "alumni" ? "Work or Alumni Email" : "Institutional (.edu) Email"}
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder={role === "alumni" ? "marcus.vance@datadog.com" : "ashlin@stanford.edu"}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none transition-all ${
                    errors.email
                      ? "border-[#090909] ring-1 ring-[#090909]"
                      : "border-[#E7E7E7] focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                  }`}
                />
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
              </div>
              {errors.email && (
                <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle size={12} />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-[#090909]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotNotice(true)}
                  className="text-[11px] text-[#737373] hover:text-[#090909] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full h-11 pl-10 pr-10 rounded-xl border bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none transition-all ${
                    errors.password
                      ? "border-[#090909] ring-1 ring-[#090909]"
                      : "border-[#E7E7E7] focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                  }`}
                />
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#090909] transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle size={12} />
                  <span>{errors.password}</span>
                </p>
              )}
            </div>

            {/* Forgot Password Notice */}
            {forgotNotice && (
              <div className="p-3 bg-[#F4F4F4] border border-[#E7E7E7] rounded-xl text-xs text-[#090909] space-y-1">
                <span className="font-semibold block text-[11px]">Demo Mode Password Reset</span>
                <p className="text-[11px] text-[#737373]">
                  Use password <code className="text-[#090909] font-bold">password123</code> with any sample account above to sign in immediately.
                </p>
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="login-remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[#E7E7E7] accent-[#090909] focus:ring-[#090909]"
              />
              <label htmlFor="login-remember" className="text-xs text-[#737373] cursor-pointer">
                Keep me signed in on this device
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#090909] hover:bg-[#242424] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Platform</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Signup */}
          <div className="pt-2 border-t border-[#E7E7E7] text-center text-xs text-[#737373]">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/signup"
              className="text-[#090909] font-semibold hover:underline"
            >
              Apply to join cohort →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center text-[11px] text-[#737373] py-4">
        © 2026 AlumniPath · Collegiate Alumni Network &amp; Mentorship
      </div>
    </div>
  );
}
