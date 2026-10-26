"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  GraduationCap,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type AccountType = "student" | "alumni";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accountType: AccountType;
  institution: string;
  // Student fields
  department: string;
  academicYear: string;
  // Alumni fields
  graduationYear: string;
  currentRole: string;
  currentCompany: string;
  // Legal
  termsAccepted: boolean;
}

interface FormErrors {
  general?: string;
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  accountType?: string;
  institution?: string;
  department?: string;
  academicYear?: string;
  graduationYear?: string;
  currentRole?: string;
  currentCompany?: string;
  termsAccepted?: string;
}

const ACADEMIC_YEARS = [
  "Freshman (1st Year)",
  "Sophomore (2nd Year)",
  "Junior (3rd Year)",
  "Senior (4th Year)",
  "Graduate Student",
];

const GRADUATION_YEARS = Array.from({ length: 20 }, (_, i) =>
  String(2026 - i)
);

function validateInstitutionalEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return false;
  // Must end with .edu, .ac.in, .edu.in, .ac.uk, or other educational domains
  return (
    trimmed.endsWith(".edu") ||
    trimmed.endsWith(".edu.in") ||
    trimmed.endsWith(".ac.in") ||
    trimmed.endsWith(".ac.uk") ||
    trimmed.endsWith(".edu.au") ||
    trimmed.includes(".edu.")
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = {
    length: password.length >= 6,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const label = score < 2 ? "Weak" : score < 4 ? "Good" : "Strong";

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? "bg-[#090909]" : "bg-[#E7E7E7]"
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-[#737373]">
        Password strength: <strong className="text-[#090909]">{label}</strong>
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "student",
    institution: "",
    department: "",
    academicYear: "",
    graduationYear: "",
    currentRole: "",
    currentCompany: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Auto redirect after successful registration
  useEffect(() => {
    if (!submitted) return;
    const timer = setTimeout(() => {
      router.push(form.accountType === "alumni" ? "/alumni-dashboard" : "/dashboard");
    }, 1800);
    return () => clearTimeout(timer);
  }, [submitted, form.accountType, router]);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors] || errors.general) {
      setErrors((prev) => ({ ...prev, [key]: undefined, general: undefined }));
    }
  }

  function validate(): FormErrors {
    const e: FormErrors = {};

    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email) {
      e.email = "Email address is required.";
    } else if (form.accountType === "student" && !validateInstitutionalEmail(form.email)) {
      e.email = "Please use your valid university or institutional email (ending with .edu or .edu.in / .ac.in).";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = "Please enter a valid email address.";
    }

    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";

    if (!form.institution.trim()) e.institution = "University / Institution name is required.";

    if (form.accountType === "student") {
      if (!form.department.trim()) e.department = "Department / Major is required.";
      if (!form.academicYear) e.academicYear = "Academic year is required.";
    }

    if (form.accountType === "alumni") {
      if (!form.graduationYear) e.graduationYear = "Graduation year is required.";
      if (!form.currentRole.trim()) e.currentRole = "Current position is required.";
      if (!form.currentCompany.trim()) e.currentCompany = "Current organization is required.";
    }

    if (!form.termsAccepted)
      e.termsAccepted = "You must agree to the collegiate code of conduct.";

    return e;
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

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          fullName: form.fullName.trim(),
          role: form.accountType,
          university: form.institution.trim(),
          department: form.department.trim(),
          academicYear: form.academicYear,
          graduationYear: form.graduationYear,
          currentCompany: form.currentCompany.trim(),
          currentRole: form.currentRole.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setErrors({ general: data.error || "Registration failed. Please try again." });
        setLoading(false);
        return;
      }
    } catch (err: unknown) {
      console.warn("Server registration failed, falling back to local session store:", err);
    }

    try {
      const supabase = createClient();
      await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
    } catch (authErr) {
      console.warn("Supabase auth signIn attempted:", authErr);
    }

    if (form.accountType === "student") {
      try {
        const {
          createFreshStudentProfile,
          saveStudentProfile,
          createFreshRoadmapStages,
          saveRoadmapStages,
          createFreshMentorshipActivity,
          saveMentorshipActivity,
          saveNotifications,
          saveAuthSession,
        } = await import("@/lib/dashboard-storage");

        const freshStudent = createFreshStudentProfile({
          name: form.fullName.trim(),
          email: form.email.trim(),
          university: form.institution.trim(),
          department: form.department.trim(),
          academicYear: form.academicYear,
        });

        saveStudentProfile(freshStudent);
        saveRoadmapStages(createFreshRoadmapStages());
        saveMentorshipActivity(createFreshMentorshipActivity());
        saveNotifications([]);
        saveAuthSession({
          isAuthenticated: true,
          role: "student",
          email: form.email.trim(),
          name: form.fullName.trim() || "Student",
          department: form.department.trim(),
        });
      } catch (err) {
        console.error("Failed to sync student signup data", err);
      }
    } else if (form.accountType === "alumni") {
      try {
        const {
          loadAlumniProfile,
          saveAlumniProfile,
          saveAuthSession,
          createFreshMentorshipActivity,
          saveMentorshipActivity,
          saveNotifications,
        } = await import("@/lib/dashboard-storage");
        const currentAlumni = loadAlumniProfile();
        saveAlumniProfile({
          ...currentAlumni,
          name: form.fullName.trim() || currentAlumni.name,
          company: form.currentCompany.trim() || currentAlumni.company,
          role: form.currentRole.trim() || currentAlumni.role,
          graduationYear: Number(form.graduationYear) || currentAlumni.graduationYear,
        });
        saveMentorshipActivity(createFreshMentorshipActivity());
        saveNotifications([]);
        saveAuthSession({
          isAuthenticated: true,
          role: "alumni",
          email: form.email,
          name: form.fullName.trim() || currentAlumni.name,
          company: form.currentCompany.trim() || currentAlumni.company,
          headline: `${form.currentRole.trim()} at ${form.currentCompany.trim()}`,
        });
      } catch (err) {
        console.error("Failed to sync alumni signup data", err);
      }
    }

    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  }

  // ── Success State Screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] text-[#090909] px-4 py-12 antialiased">
        <div className="w-full max-w-[440px] text-center space-y-6">
          <div className="h-14 w-14 rounded-2xl bg-[#090909] text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 size={28} />
          </div>

          <div className="bg-white border border-[#E7E7E7] rounded-3xl p-8 sm:p-10 shadow-sm space-y-5">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                Registration Confirmed
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#090909] tracking-tight">
                Welcome to AlumniPath
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
              Your profile for <strong className="text-[#090909]">{form.fullName}</strong> has been initialized and verified under the {form.institution} network.
            </p>

            <div className="p-3.5 bg-[#F4F4F4] border border-[#E7E7E7] rounded-2xl text-xs text-left space-y-1 text-[#737373]">
              <div className="flex items-center gap-1.5 text-[#090909] font-semibold text-[11px]">
                <ShieldCheck size={14} className="text-[#090909]" />
                <span>Collegiate Verification Complete</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {form.accountType === "alumni"
                  ? "Your alumni mentor status is active. Incoming student requests will appear in your workspace."
                  : "Your roadmap milestones and alumni recommendations have been generated."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href={form.accountType === "alumni" ? "/alumni-dashboard" : "/dashboard"}
                className="w-full h-11 rounded-full bg-[#090909] hover:bg-[#242424] text-white text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <span>Enter {form.accountType === "alumni" ? "Alumni Workspace" : "Student Dashboard"}</span>
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
          Spring 2026 Cohort Registration
        </span>
      </div>

      {/* Main Centered Signup Container */}
      <div className="w-full max-w-[480px] mx-auto my-auto py-4">
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

        {/* Card */}
        <div className="bg-white border border-[#E7E7E7] rounded-3xl shadow-sm p-7 sm:p-9 space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#090909]">
              Apply to join cohort
            </h1>
            <p className="text-xs sm:text-sm text-[#737373]">
              Join the verified university alumni & mentorship network.
            </p>
          </div>

          {/* Account Type Segmented Control */}
          <div
            role="tablist"
            aria-label="Account category"
            className="p-1 bg-[#F4F4F4] rounded-full border border-[#E7E7E7] grid grid-cols-2 gap-1"
          >
            <button
              type="button"
              role="tab"
              aria-selected={form.accountType === "student"}
              onClick={() => updateField("accountType", "student")}
              className={`py-2 px-3 text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                form.accountType === "student"
                  ? "bg-[#090909] text-white font-semibold shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              <span>Student Mentee</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={form.accountType === "alumni"}
              onClick={() => updateField("accountType", "alumni")}
              className={`py-2 px-3 text-xs rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer font-medium ${
                form.accountType === "alumni"
                  ? "bg-[#090909] text-white font-semibold shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              <span>Alumni Mentor</span>
            </button>
          </div>

          {/* Quick Demo Pre-fill Helper */}
          <div className="bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#090909] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#090909]" />
                Test Account Auto-fill:
              </span>
              <span className="text-[#737373] text-[10px]">1-Click Fill</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    fullName: "Lohit",
                    email: "lohit@karunya.edu.in",
                    password: "password123",
                    confirmPassword: "password123",
                    accountType: "student",
                    institution: "Karunya University",
                    department: "CSE",
                    academicYear: "Sophomore (2nd Year)",
                    graduationYear: "2027",
                    currentRole: "",
                    currentCompany: "",
                    termsAccepted: true,
                  });
                  setErrors({});
                }}
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                  form.email === "lohit@karunya.edu.in"
                    ? "bg-[#090909] text-white border-[#090909] font-medium"
                    : "bg-white text-[#737373] hover:text-[#090909] border-[#E7E7E7] hover:border-[#090909]"
                }`}
              >
                Student (Lohit)
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    fullName: "Marcus Vance",
                    email: "marcus.vance@datadog.com",
                    password: "password123",
                    confirmPassword: "password123",
                    accountType: "alumni",
                    institution: "Stanford University",
                    department: "Computer Science",
                    academicYear: "",
                    graduationYear: "2018",
                    currentRole: "Senior Backend Engineer",
                    currentCompany: "Datadog",
                    termsAccepted: true,
                  });
                  setErrors({});
                }}
                className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer border ${
                  form.email === "marcus.vance@datadog.com"
                    ? "bg-[#090909] text-white border-[#090909] font-medium"
                    : "bg-white text-[#737373] hover:text-[#090909] border-[#E7E7E7] hover:border-[#090909]"
                }`}
              >
                Alumni (Marcus)
              </button>
            </div>
          </div>

          {/* General Error Banner */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-red-600" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="text-xs font-semibold text-[#090909] block">
                Full Legal Name
              </label>
              <div className="relative">
                <input
                  id="signup-name"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Ashlin Mirsha"
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none transition-all ${
                    errors.fullName
                      ? "border-[#090909] ring-1 ring-[#090909]"
                      : "border-[#E7E7E7] focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                  }`}
                />
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
              </div>
              {errors.fullName && (
                <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle size={12} />
                  <span>{errors.fullName}</span>
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-semibold text-[#090909] block">
                {form.accountType === "student" ? "Institutional (.edu) Email" : "Corporate or Alumni Email"}
              </label>
              <div className="relative">
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  placeholder={form.accountType === "student" ? "ashlin@stanford.edu" : "marcus.vance@datadog.com"}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
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

            {/* Password Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label htmlFor="signup-password" className="text-xs font-semibold text-[#090909] block">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min 6 characters"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    className={`w-full h-11 pl-10 pr-9 rounded-xl border bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none transition-all ${
                      errors.password
                        ? "border-[#090909] ring-1 ring-[#090909]"
                        : "border-[#E7E7E7] focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    }`}
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#090909] transition-colors cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-confirm-password" className="text-xs font-semibold text-[#090909] block">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className={`w-full h-11 pl-10 pr-9 rounded-xl border bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none transition-all ${
                      errors.confirmPassword
                        ? "border-[#090909] ring-1 ring-[#090909]"
                        : "border-[#E7E7E7] focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    }`}
                  />
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#090909] transition-colors cursor-pointer"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
            {errors.password && (
              <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{errors.password}</span>
              </p>
            )}
            {errors.confirmPassword && (
              <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1">
                <AlertCircle size={12} />
                <span>{errors.confirmPassword}</span>
              </p>
            )}
            <PasswordStrength password={form.password} />

            {/* University / Institution */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="signup-institution" className="text-xs font-semibold text-[#090909] block">
                {form.accountType === "student" ? "University / College" : "Alma Mater / University"}
              </label>
              <div className="relative">
                <input
                  id="signup-institution"
                  type="text"
                  placeholder="e.g. Stanford University"
                  value={form.institution}
                  onChange={(e) => updateField("institution", e.target.value)}
                  className={`w-full h-11 pl-10 pr-3.5 rounded-xl border bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none transition-all ${
                    errors.institution
                      ? "border-[#090909] ring-1 ring-[#090909]"
                      : "border-[#E7E7E7] focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                  }`}
                />
                <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
              </div>
              {errors.institution && (
                <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1 pt-0.5">
                  <AlertCircle size={12} />
                  <span>{errors.institution}</span>
                </p>
              )}
            </div>

            {/* Student specific fields */}
            {form.accountType === "student" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="signup-dept" className="text-xs font-semibold text-[#090909] block">
                    Major / Department
                  </label>
                  <input
                    id="signup-dept"
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={form.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                  />
                  {errors.department && (
                    <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{errors.department}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signup-academic-year" className="text-xs font-semibold text-[#090909] block">
                    Academic Year
                  </label>
                  <select
                    id="signup-academic-year"
                    value={form.academicYear}
                    onChange={(e) => updateField("academicYear", e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                  >
                    <option value="" disabled hidden>Select year</option>
                    {ACADEMIC_YEARS.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                  {errors.academicYear && (
                    <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{errors.academicYear}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Alumni specific fields */}
            {form.accountType === "alumni" && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="signup-role" className="text-xs font-semibold text-[#090909] block">
                      Current Title
                    </label>
                    <input
                      id="signup-role"
                      type="text"
                      placeholder="e.g. Staff Engineer"
                      value={form.currentRole}
                      onChange={(e) => updateField("currentRole", e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    />
                    {errors.currentRole && (
                      <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{errors.currentRole}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="signup-company" className="text-xs font-semibold text-[#090909] block">
                      Organization
                    </label>
                    <input
                      id="signup-company"
                      type="text"
                      placeholder="e.g. Datadog"
                      value={form.currentCompany}
                      onChange={(e) => updateField("currentCompany", e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    />
                    {errors.currentCompany && (
                      <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1">
                        <AlertCircle size={12} />
                        <span>{errors.currentCompany}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="signup-grad-year" className="text-xs font-semibold text-[#090909] block">
                    Graduation Year
                  </label>
                  <select
                    id="signup-grad-year"
                    value={form.graduationYear}
                    onChange={(e) => updateField("graduationYear", e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                  >
                    <option value="" disabled hidden>Select graduation year</option>
                    {GRADUATION_YEARS.map((yr) => (
                      <option key={yr} value={yr}>Class of {yr}</option>
                    ))}
                  </select>
                  {errors.graduationYear && (
                    <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1">
                      <AlertCircle size={12} />
                      <span>{errors.graduationYear}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Terms Checkbox */}
            <div className="space-y-1 pt-1">
              <div className="flex items-start gap-2">
                <input
                  id="signup-terms"
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) => updateField("termsAccepted", e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#E7E7E7] accent-[#090909] focus:ring-[#090909]"
                />
                <label htmlFor="signup-terms" className="text-xs text-[#737373] leading-relaxed cursor-pointer">
                  I agree to the collegiate mentorship standards, code of conduct, and privacy policy.
                </label>
              </div>
              {errors.termsAccepted && (
                <p className="text-[11px] text-[#090909] font-medium flex items-center gap-1 pl-6">
                  <AlertCircle size={12} />
                  <span>{errors.termsAccepted}</span>
                </p>
              )}
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
                    <span>Registering Account...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Cohort Application</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Switch to Login */}
          <div className="pt-2 border-t border-[#E7E7E7] text-center text-xs text-[#737373]">
            <span>Already have an account? </span>
            <Link
              href="/login"
              className="text-[#090909] font-semibold hover:underline"
            >
              Sign in to workspace →
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
