"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
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
  CheckCircle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type AccountType = "student" | "alumni" | "";

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

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const score = Object.values(checks).filter(Boolean).length;
  const label = score < 2 ? "Weak" : score < 4 ? "Fair" : "Strong";
  const color = score < 2 ? "bg-[#cc1016]" : score < 4 ? "bg-[#915907]" : "bg-[#057642]";

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= score ? color : "bg-gray-200"
            )}
          />
        ))}
      </div>
      <p className={cn("text-xs font-medium", score < 2 ? "text-[#cc1016]" : score < 4 ? "text-[#915907]" : "text-[#057642]")}>
        Password strength: {label}
      </p>
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={cn(
          "w-full rounded-lg border bg-white text-xs text-gray-900 px-3 py-2 h-10",
          "border-gray-300 transition-colors duration-150",
          "focus:outline-none focus:ring-1 focus:ring-[#0a66c2] focus:border-[#0a66c2]",
          !value && "text-gray-400",
          error && "border-[#cc1016] focus:ring-[#cc1016] focus:border-[#cc1016]"
        )}
      >
        <option value="" disabled hidden>
          {placeholder ?? "Select…"}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-xs text-[#cc1016]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function SignupPage() {
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "",
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

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): FormErrors {
    const e: FormErrors = {};

    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email) e.email = "Email address is required.";
    else if (!validateEmail(form.email)) e.email = "Enter a valid email address.";

    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters.";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";

    if (!form.accountType) e.accountType = "Please select an account type.";
    if (!form.institution.trim()) e.institution = "Institution name is required.";

    if (form.accountType === "student") {
      if (!form.department.trim()) e.department = "Department is required.";
      if (!form.academicYear) e.academicYear = "Academic year is required.";
    }

    if (form.accountType === "alumni") {
      if (!form.graduationYear) e.graduationYear = "Graduation year is required.";
      if (!form.currentRole.trim()) e.currentRole = "Current role is required.";
      if (!form.currentCompany.trim()) e.currentCompany = "Current company is required.";
    }

    if (!form.termsAccepted)
      e.termsAccepted = "You must accept the terms to continue.";

    return e;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErrEl = document.querySelector("[aria-invalid='true']");
      if (firstErrEl) (firstErrEl as HTMLElement).focus();
      return;
    }
    setErrors({});
    setLoading(true);

    // Synchronize newly created details into centralized demo storage
    if (form.accountType === "student") {
      try {
        const { loadStudentProfile, saveStudentProfile, saveAuthSession } = await import("@/lib/dashboard-storage");
        const current = loadStudentProfile();
        saveStudentProfile({
          ...current,
          name: form.fullName.trim() || current.name,
          department: form.department.trim() || current.department,
          academicYear: form.academicYear || current.academicYear,
          university: form.institution.trim() || current.university,
        });
        saveAuthSession({
          isAuthenticated: true,
          role: "student",
          email: form.email,
          name: form.fullName.trim() || current.name,
          department: form.department.trim() || current.department,
        });
      } catch (err) {
        console.error("Failed to sync signup data", err);
      }
    } else if (form.accountType === "alumni") {
      try {
        const { loadAlumniProfile, saveAlumniProfile, saveAuthSession } = await import("@/lib/dashboard-storage");
        const currentAlumni = loadAlumniProfile();
        saveAlumniProfile({
          ...currentAlumni,
          name: form.fullName.trim() || currentAlumni.name,
          company: form.currentCompany.trim() || currentAlumni.company,
          role: form.currentRole.trim() || currentAlumni.role,
          graduationYear: Number(form.graduationYear) || currentAlumni.graduationYear,
        });
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

    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f3f5f7] px-4">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-md bg-[#0a66c2] flex items-center justify-center">
              <span className="text-white text-sm font-bold">A</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              Alumni<span className="text-[#0a66c2]">Path</span>
            </span>
          </Link>

          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-xs">
            <div className="h-12 w-12 rounded-full bg-[#eef8f1] border border-[#bfe3c9] flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={22} className="text-[#057642]" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              Account created!
            </h2>
            <p className="text-xs text-gray-600 mb-2">
              Welcome to AlumniPath,{" "}
              <strong className="text-gray-900">{form.fullName.split(" ")[0]}</strong>.
            </p>
            {form.accountType === "alumni" && (
              <div className="mt-3 mb-4 flex items-start gap-2 text-left rounded-lg border border-[#b2d5f8] bg-[#ebf3fb] px-3 py-2.5 text-xs text-[#004182]">
                <Info size={14} className="shrink-0 mt-0.5 text-[#0a66c2]" />
                <span>
                  Alumni accounts may require professional or institutional
                  verification before full access is granted.
                </span>
              </div>
            )}
            <Button variant="primary" fullWidth asChild className="rounded-full font-semibold bg-[#0a66c2] hover:bg-[#004182] mt-2">
              <Link href={form.accountType === "alumni" ? "/alumni-dashboard" : "/dashboard"}>
                {form.accountType === "alumni" ? "Go to Alumni Portal" : "Go to Dashboard"}
              </Link>
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0a66c2] font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f3f5f7] flex flex-col items-center justify-center py-10 px-4">
      {/* Logo */}
      <Link href="/" className="inline-flex items-center gap-2 mb-8">
        <div className="h-8 w-8 rounded-md bg-[#0a66c2] flex items-center justify-center">
          <span className="text-white text-sm font-bold">A</span>
        </div>
        <span className="text-lg font-bold tracking-tight text-gray-900">
          Alumni<span className="text-[#0a66c2]">Path</span>
        </span>
      </Link>

      <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-xs p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Make the most of your college network</h1>
          <p className="text-xs text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-[#0a66c2] font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* ── Basic Info ── */}
          <div className="space-y-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Basic Information
            </h2>

            <Input
              id="signup-name"
              label="Full name"
              type="text"
              placeholder="Priya Sharma"
              autoComplete="name"
              value={form.fullName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("fullName", e.target.value)}
              error={errors.fullName}
              leadingIcon={<User size={15} />}
            />

            <Input
              id="signup-email"
              label="College or work email"
              type="email"
              placeholder="priya@umich.edu"
              autoComplete="email"
              value={form.email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("email", e.target.value)}
              error={errors.email}
              leadingIcon={<Mail size={15} />}
              hint="Use your university or professional email address."
            />

            <div>
              <Input
                id="signup-password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                value={form.password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("password", e.target.value)}
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
              />
              <PasswordStrength password={form.password} />
            </div>

            <Input
              id="signup-confirm-password"
              label="Confirm password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              leadingIcon={<Lock size={15} />}
              trailingElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
          </div>

          {/* ── Account type ── */}
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Account Type
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {(["student", "alumni"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateField("accountType", type)}
                  className={cn(
                    "relative flex flex-col items-start gap-1.5 rounded-lg border p-3.5 text-left transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a66c2]",
                    form.accountType === type
                      ? "border-[#0a66c2] bg-[#ebf3fb] ring-1 ring-[#0a66c2]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  )}
                  aria-pressed={form.accountType === type}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center",
                    form.accountType === type ? "bg-[#d0e2f5]" : "bg-gray-100"
                  )}>
                    {type === "student" ? (
                      <GraduationCap size={16} className={form.accountType === type ? "text-[#0a66c2]" : "text-gray-600"} />
                    ) : (
                      <Briefcase size={16} className={form.accountType === type ? "text-[#0a66c2]" : "text-gray-600"} />
                    )}
                  </div>
                  <span className={cn("text-xs font-bold capitalize", form.accountType === type ? "text-[#004182]" : "text-gray-900")}>
                    {type}
                  </span>
                  <span className="text-[11px] text-gray-500 leading-normal">
                    {type === "student"
                      ? "Seeking career guidance and mentorship"
                      : "Share experience & advise students"}
                  </span>
                  {form.accountType === type && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle size={15} className="text-[#0a66c2]" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {errors.accountType && (
              <p role="alert" className="text-xs text-[#cc1016] flex items-center gap-1">
                <AlertCircle size={12} /> {errors.accountType}
              </p>
            )}
          </div>

          {/* ── Institution ── */}
          <Input
            id="signup-institution"
            label="College / University / Institution"
            type="text"
            placeholder="University of Michigan"
            value={form.institution}
            onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("institution", e.target.value)}
            error={errors.institution}
            leadingIcon={<Building2 size={15} />}
          />

          {/* ── Student-specific fields ── */}
          {form.accountType === "student" && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-[#f9fafb] p-4">
              <p className="text-xs font-bold text-[#0a66c2] flex items-center gap-1.5">
                <GraduationCap size={14} /> Student details
              </p>

              <Input
                id="signup-department"
                label="Department / Major"
                type="text"
                placeholder="Computer Science & Engineering"
                value={form.department}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("department", e.target.value)}
                error={errors.department}
              />

              <SelectField
                id="signup-academic-year"
                label="Academic Year"
                value={form.academicYear}
                onChange={(v) => updateField("academicYear", v)}
                options={ACADEMIC_YEARS}
                placeholder="Select your year…"
                error={errors.academicYear}
              />
            </div>
          )}

          {/* ── Alumni-specific fields ── */}
          {form.accountType === "alumni" && (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-[#f9fafb] p-4">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-[#0a66c2] mt-0.5 shrink-0" />
                <p className="text-xs text-gray-700">
                  Alumni accounts may require professional or institutional
                  verification before full access is granted.
                </p>
              </div>

              <SelectField
                id="signup-graduation-year"
                label="Graduation Year"
                value={form.graduationYear}
                onChange={(v) => updateField("graduationYear", v)}
                options={GRADUATION_YEARS}
                placeholder="Select year…"
                error={errors.graduationYear}
              />

              <Input
                id="signup-current-role"
                label="Current Job Role"
                type="text"
                placeholder="Senior Product Manager"
                value={form.currentRole}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("currentRole", e.target.value)}
                error={errors.currentRole}
                leadingIcon={<Briefcase size={15} />}
              />

              <Input
                id="signup-current-company"
                label="Current Company"
                type="text"
                placeholder="Stripe"
                value={form.currentCompany}
                onChange={(e: ChangeEvent<HTMLInputElement>) => updateField("currentCompany", e.target.value)}
                error={errors.currentCompany}
                leadingIcon={<Building2 size={15} />}
              />
            </div>
          )}

          {/* ── Terms ── */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                id="signup-terms"
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => {
                  updateField("termsAccepted", e.target.checked);
                }}
                className={cn(
                  "mt-0.5 h-4 w-4 rounded border-gray-300 text-[#0a66c2]",
                  "focus:ring-2 focus:ring-[#0a66c2] focus:ring-offset-0"
                )}
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                I agree to the{" "}
                <Link href="#" className="text-[#0a66c2] hover:underline font-medium">
                  User Agreement
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-[#0a66c2] hover:underline font-medium">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.termsAccepted && (
              <p role="alert" className="text-xs text-[#cc1016] flex items-center gap-1">
                <AlertCircle size={12} /> {errors.termsAccepted}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            fullWidth
            className="rounded-full font-semibold bg-[#0a66c2] hover:bg-[#004182]"
          >
            {loading ? "Creating account…" : "Agree & Join"}
          </Button>
        </form>
      </div>

      <p className="text-xs text-gray-500 mt-5">
        Already on AlumniPath?{" "}
        <Link href="/login" className="text-[#0a66c2] font-semibold hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}
