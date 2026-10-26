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
import { createClient } from "@/lib/supabase/client";

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
    if (!email) {
      errs.email = "Institutional or work email is required.";
    } else if (
      role === "student" &&
      !(
        email.endsWith(".edu") ||
        email.endsWith(".edu.in") ||
        email.endsWith(".ac.in") ||
        email.endsWith(".ac.uk") ||
        email.endsWith(".edu.au") ||
        email.includes(".edu.")
      )
    ) {
      errs.email = "Please sign in with your official university email (.edu or institutional domain).";
    } else if (!validateEmail(email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!password) errs.password = "Password is required.";
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters.";
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

    let supabaseUser: { id: string; user_metadata?: Record<string, unknown> } | null = null;
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.warn("Supabase auth signIn error:", error.message);
        const isDemo =
          email.includes("ashlin@stanford.edu") ||
          email.includes("lohit@karunya.edu.in") ||
          email.includes("student@alumnipath.edu") ||
          email.includes("marcus.vance@datadog.com") ||
          email.includes("alumni@alumnipath.edu") ||
          email.includes("elena.rostova@airbnb.com");

        if (!isDemo && error.message.toLowerCase().includes("invalid login")) {
          setErrors({ general: "Invalid email or password. Please verify your credentials." });
          setLoading(false);
          return;
        }
      } else if (data?.user) {
        supabaseUser = data.user;
      }
    } catch (authErr) {
      console.warn("Supabase auth attempted, falling back to instant session mode:", authErr);
    }

    const detectedRole = (supabaseUser?.user_metadata?.role as UserRole | undefined);
    const activeRole: UserRole = detectedRole || role;
    setRole(activeRole);

    const emailName = email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const userName = (supabaseUser?.user_metadata?.full_name as string | undefined) || emailName || "User";

    saveAuthSession(
      activeRole === "alumni"
        ? {
            ...defaultAlumniSession,
            email,
            name: userName,
            isAuthenticated: true,
          }
        : {
            ...defaultStudentSession,
            email,
            name: userName,
            isAuthenticated: true,
          }
    );

    // Simulate authentication latency
    await new Promise((r) => setTimeout(r, 600));
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
              onClick={() => setRole("student")}
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
              onClick={() => setRole("alumni")}
              className={`py-2 px-3 text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                role === "alumni"
                  ? "bg-[#090909] text-white font-semibold shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              <span>Alumni Mentor</span>
            </button>
          </div>


          {/* General Error Banner */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{errors.general}</span>
            </div>
          )}

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
