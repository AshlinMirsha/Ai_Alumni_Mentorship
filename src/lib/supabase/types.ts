import type { UserRole } from "@/types";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type RoleType = UserRole | "admin";

export interface Company {
  id: string;
  name: string;
  domain?: string | null;
  status: "active" | "inactive" | "suspended";
  created_at?: string;
  updated_at?: string;
}

export interface CompanyVerificationCode {
  id: string;
  company_id: string;
  code_hash: string;
  code_prefix: string;
  status: "active" | "expired" | "revoked" | "exhausted";
  expires_at?: string | null;
  max_uses?: number | null;
  uses_count: number;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  // Join fields
  company?: Company;
}

export interface CompanyCodeRedemption {
  id: string;
  code_id: string;
  user_id: string;
  company_id: string;
  ip_hash?: string | null;
  redeemed_at?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: RoleType;
  institution?: string | null;
  department?: string | null;
  academic_year?: string | null;
  graduation_year?: number | null;
  current_role?: string | null;
  current_company?: string | null;
  company_id?: string | null;
  verification_status: VerificationStatus;
  verified_at?: string | null;
  verified_by_code_id?: string | null;
  headline?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // Optional join
  company?: Company | null;
}

export interface SignUpMetadata {
  full_name: string;
  role: UserRole;
  institution?: string;
  department?: string;
  academic_year?: string;
  graduation_year?: string | number;
  current_role?: string;
  current_company?: string;
  company_code?: string;
}

export interface StudentRegistrationInput {
  fullName: string;
  email: string;
  password: string;
  institution: string;
  department: string;
  academicYear: string;
}

export interface AlumniRegistrationInput {
  fullName: string;
  email: string;
  password: string;
  institution: string;
  currentRole: string;
  currentCompany: string;
  graduationYear: string | number;
  companyCode: string;
}

export interface VerifyCodeInput {
  code: string;
  companyName?: string;
}
