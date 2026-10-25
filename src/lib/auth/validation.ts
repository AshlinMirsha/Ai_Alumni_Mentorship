import type {
  StudentRegistrationInput,
  AlumniRegistrationInput,
} from "../supabase/types";

export interface ValidationResult<T> {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized?: T;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: unknown): string | null {
  if (typeof email !== "string" || !email.trim()) {
    return "Email address is required.";
  }
  const clean = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(clean)) {
    return "Please provide a valid email address.";
  }
  return null;
}

export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || !password) {
    return "Password is required.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  return null;
}

export function validateStudentRegistration(
  body: unknown
): ValidationResult<StudentRegistrationInput> {
  const errors: Record<string, string> = {};

  if (!body || typeof body !== "object") {
    return { isValid: false, errors: { general: "Invalid request payload." } };
  }

  const data = body as Record<string, unknown>;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(data.password);
  if (passErr) errors.password = passErr;

  if (typeof data.fullName !== "string" || data.fullName.trim().length < 2) {
    errors.fullName = "Full name is required (minimum 2 characters).";
  }

  if (typeof data.institution !== "string" || data.institution.trim().length < 2) {
    errors.institution = "University or institution name is required.";
  }

  if (typeof data.department !== "string" || !data.department.trim()) {
    errors.department = "Department / Major is required.";
  }

  if (typeof data.academicYear !== "string" || !data.academicYear.trim()) {
    errors.academicYear = "Academic year is required.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      fullName: (data.fullName as string).trim(),
      email: (data.email as string).trim().toLowerCase(),
      password: data.password as string,
      institution: (data.institution as string).trim(),
      department: (data.department as string).trim(),
      academicYear: (data.academicYear as string).trim(),
    },
  };
}

export function validateAlumniRegistration(
  body: unknown
): ValidationResult<AlumniRegistrationInput> {
  const errors: Record<string, string> = {};

  if (!body || typeof body !== "object") {
    return { isValid: false, errors: { general: "Invalid request payload." } };
  }

  const data = body as Record<string, unknown>;

  const emailErr = validateEmail(data.email);
  if (emailErr) errors.email = emailErr;

  const passErr = validatePassword(data.password);
  if (passErr) errors.password = passErr;

  if (typeof data.fullName !== "string" || data.fullName.trim().length < 2) {
    errors.fullName = "Full name is required (minimum 2 characters).";
  }

  if (typeof data.institution !== "string" || data.institution.trim().length < 2) {
    errors.institution = "Alma mater or institution name is required.";
  }

  if (typeof data.currentRole !== "string" || !data.currentRole.trim()) {
    errors.currentRole = "Current position or title is required.";
  }

  if (typeof data.currentCompany !== "string" || !data.currentCompany.trim()) {
    errors.currentCompany = "Organization or company name is required.";
  }

  const gradYear = Number(data.graduationYear);
  if (!gradYear || gradYear < 1950 || gradYear > 2035) {
    errors.graduationYear = "Please provide a valid graduation year.";
  }

  // Mandatory Company Code Check
  if (
    typeof data.companyCode !== "string" ||
    !data.companyCode.trim() ||
    data.companyCode.trim().length < 6
  ) {
    errors.companyCode =
      "A valid company verification code is required for alumni registration.";
  }

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    sanitized: {
      fullName: (data.fullName as string).trim(),
      email: (data.email as string).trim().toLowerCase(),
      password: data.password as string,
      institution: (data.institution as string).trim(),
      currentRole: (data.currentRole as string).trim(),
      currentCompany: (data.currentCompany as string).trim(),
      graduationYear: gradYear,
      companyCode: (data.companyCode as string).trim().toUpperCase(),
    },
  };
}
