"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

function Wordmark() {
  return (
    <span className="text-lg font-bold tracking-tight text-gray-900">
      Alumni<span className="text-[#0a66c2]">Path</span>
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!email) errs.email = "Email address is required.";
    else if (!validateEmail(email)) errs.email = "Enter a valid email address.";
    if (!password) errs.password = "Password is required.";
    else if (password.length < 8) errs.password = "Password must be at least 8 characters.";
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

    // Simulate network request (demo mode)
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f5f7] px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-[#0a66c2] flex items-center justify-center">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <Wordmark />
            </Link>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-xs text-center">
            <div className="h-12 w-12 rounded-full bg-[#eef8f1] border border-[#bfe3c9] flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-[#057642]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">Sign in successful</h2>
            <p className="text-xs text-gray-600 mb-6">
              Welcome back! Redirecting you to your dashboard&hellip;
            </p>
            <Button variant="primary" fullWidth asChild className="rounded-full font-semibold bg-[#0a66c2] hover:bg-[#004182]">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f3f5f7]">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex lg:w-2/5 bg-[#1b2a47] flex-col justify-between p-12 text-white">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-[#0a66c2] flex items-center justify-center">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Alumni<span className="text-[#70b5f9]">Path</span>
          </span>
        </Link>

        <div>
          <blockquote className="text-gray-200 text-base leading-relaxed mb-6 font-normal">
            &ldquo;I had no idea how to break into product management. One
            structured conversation with an alumnus who had made that exact transition
            completely changed my trajectory.&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white text-xs font-bold">
              PS
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Priya Sharma</p>
              <p className="text-xs text-gray-300">CS, University of Michigan · Class of 2025</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          &copy; 2026 AlumniPath · Professional Alumni Networking
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Mobile logo */}
        <div className="lg:hidden text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-[#0a66c2] flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <Wordmark />
          </Link>
        </div>

        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg p-8 shadow-xs">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Sign in</h1>
            <p className="text-xs text-gray-600">
              Stay updated on your professional and mentorship community.
            </p>
          </div>

          <div className="mb-5 flex items-start gap-2.5 rounded-lg border border-[#b2d5f8] bg-[#ebf3fb] p-3 text-xs text-[#004182]">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-[#0a66c2]" />
            <div className="space-y-1.5 flex-1">
              <p>
                <strong>Demo mode:</strong> Use any email and password or click a quick-fill preset below to test:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("priya@umich.edu");
                    setPassword("password123");
                  }}
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-[#b2d5f8] text-[#0a66c2] hover:bg-[#d0e2f5] transition-colors"
                >
                  Student (Priya)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmail("arjun@stripe.com");
                    setPassword("password123");
                  }}
                  className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-[#b2d5f8] text-[#0a66c2] hover:bg-[#d0e2f5] transition-colors"
                >
                  Alumni (Arjun)
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Google sign-in (UI only) */}
            <button
              type="button"
              className={cn(
                "w-full flex items-center justify-center gap-3 h-10 rounded-full border border-gray-300",
                "bg-white text-xs font-semibold text-gray-700",
                "hover:bg-gray-50 transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a66c2]"
              )}
              onClick={() => {
                setErrors({ general: "Google sign-in is not yet available in demo mode. Please use email and password." });
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
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
              Continue with Google
            </button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {errors.general && (
              <div className="flex items-center gap-2 rounded-lg border border-[#f9d2d5] bg-[#feeff0] px-3 py-2 text-xs text-[#cc1016]">
                <AlertCircle size={14} className="shrink-0" />
                {errors.general}
              </div>
            )}

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
              leadingIcon={<Mail size={15} />}
              required
            />

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-semibold text-gray-700">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-[#0a66c2] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a66c2] rounded"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
                leadingIcon={<Lock size={15} />}
                trailingElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
                required
              />
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className={cn(
                  "h-4 w-4 rounded border-gray-300 text-[#0a66c2]",
                  "focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-0"
                )}
              />
              <span className="text-xs text-gray-700">Remember me for 30 days</span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              fullWidth
              className="rounded-full font-semibold bg-[#0a66c2] hover:bg-[#004182]"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-600">
            New to AlumniPath?{" "}
            <Link href="/signup" className="text-[#0a66c2] font-semibold hover:underline">
              Join now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
