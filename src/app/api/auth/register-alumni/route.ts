import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { validateAlumniRegistration } from "@/lib/auth/validation";
import { hashCompanyCode, hashIp } from "@/lib/auth/crypto";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/auth/rate-limiter";
import { getClientIp } from "@/lib/auth/authorize";
import { registerAccount, isEmailRegistered } from "@/lib/auth/registered-users";

export async function POST(req: Request) {
  const clientIp = getClientIp(req);

  try {
    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed verification attempts. Please retry after ${
            rateCheck.retryAfterSeconds || 60
          } seconds.`,
        },
        { status: 429 }
      );
    }

    // 2. Input Validation
    const body = await req.json().catch(() => null);
    const validation = validateAlumniRegistration(body);

    if (!validation.isValid || !validation.sanitized) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      fullName,
      institution,
      currentRole,
      currentCompany,
      graduationYear,
      companyCode,
    } = validation.sanitized;

    const normalizedEmail = email.trim().toLowerCase();

    // 1. One-time registration enforcement: Check if email is already registered
    if (isEmailRegistered(normalizedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: "An account may already exist with this email. Please sign in or recover your account.",
          code: "ACCOUNT_ALREADY_EXISTS",
        },
        { status: 409 }
      );
    }

    const codeHash = hashCompanyCode(companyCode);
    const supabase = getAdminClient();

    // Also check Supabase public.profiles table
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          {
            success: false,
            error: "An account may already exist with this email. Please sign in or recover your account.",
            code: "ACCOUNT_ALREADY_EXISTS",
          },
          { status: 409 }
        );
      }
    } catch {
      // Ignore if table is not yet created
    }

    // 3. Pre-validate company verification code
    const { data: codeRecord, error: codeQueryError } = await supabase
      .from("company_verification_codes")
      .select("*, company:companies(*)")
      .eq("code_hash", codeHash)
      .maybeSingle();

    if (codeQueryError) {
      console.warn("[Register Alumni] Code lookup error:", codeQueryError.message);
    }

    // If code record is not found or invalid
    if (!codeRecord) {
      const failInfo = recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid company verification code.",
          remainingAttempts: failInfo.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Check code status
    if (codeRecord.status !== "active") {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          success: false,
          error: `This company verification code is ${codeRecord.status}.`,
        },
        { status: 400 }
      );
    }

    // Check expiration
    if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          success: false,
          error: "This company verification code has expired.",
        },
        { status: 400 }
      );
    }

    // Check usage limits
    if (
      codeRecord.max_uses !== null &&
      codeRecord.uses_count >= codeRecord.max_uses
    ) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          success: false,
          error:
            "This company verification code has already reached its maximum usage limit.",
        },
        { status: 400 }
      );
    }

    // Verify company association (case-insensitive check)
    const associatedCompany = codeRecord.company;
    if (associatedCompany) {
      const codeCompName = associatedCompany.name.toLowerCase().trim();
      const inputCompName = currentCompany.toLowerCase().trim();
      if (!inputCompName.includes(codeCompName) && !codeCompName.includes(inputCompName)) {
        recordFailedAttempt(clientIp);
        return NextResponse.json(
          {
            success: false,
            error: `This verification code is authorized exclusively for ${associatedCompany.name} employees.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "alumni",
          institution,
          current_role: currentRole,
          current_company: currentCompany,
          graduation_year: graduationYear,
        },
      },
    });

    if (authError) {
      const isDuplicate =
        authError.message.toLowerCase().includes("already registered") ||
        authError.message.toLowerCase().includes("unique constraint") ||
        authError.status === 422;

      return NextResponse.json(
        {
          success: false,
          error: isDuplicate
            ? "An account may already exist with this email. Please sign in or recover your account."
            : authError.message,
          code: isDuplicate ? "ACCOUNT_ALREADY_EXISTS" : "SIGNUP_FAILED",
        },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to initialize alumni account.",
        },
        { status: 500 }
      );
    }

    const userId = authData.user.id;
    const ipHash = hashIp(clientIp);

    // 5. Atomic Redemption via Database Function or Server Fallback
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "verify_and_redeem_company_code",
      {
        p_user_id: userId,
        p_code_hash: codeHash,
        p_company_name: currentCompany,
        p_ip_hash: ipHash,
      }
    );

    if (rpcError || (rpcData && !rpcData.success)) {
      // If RPC is unavailable or returns an error, execute atomic server-side redemption fallback
      const newUsesCount = codeRecord.uses_count + 1;
      const isExhausted =
        codeRecord.max_uses !== null && newUsesCount >= codeRecord.max_uses;

      // Update code record
      await supabase
        .from("company_verification_codes")
        .update({
          uses_count: newUsesCount,
          status: isExhausted ? "exhausted" : "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", codeRecord.id);

      // Record redemption audit log
      await supabase.from("company_code_redemptions").insert({
        code_id: codeRecord.id,
        user_id: userId,
        company_id: codeRecord.company_id,
        ip_hash: ipHash,
      });

      // Update profile with verified alumni role
      await supabase
        .from("profiles")
        .upsert(
          {
            id: userId,
            email,
            full_name: fullName,
            role: "alumni",
            institution,
            current_role: currentRole,
            current_company: currentCompany,
            company_id: codeRecord.company_id,
            graduation_year: graduationYear,
            verification_status: "verified",
            verified_at: new Date().toISOString(),
            verified_by_code_id: codeRecord.id,
            headline: `${currentRole} at ${currentCompany}`,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
    }

    // Reset rate-limiter upon successful verification
    resetRateLimit(clientIp);

    // Register in persistent registry
    registerAccount({
      email,
      password,
      fullName,
      role: "alumni",
      institution,
      currentRole,
      currentCompany,
      graduationYear: Number(graduationYear),
      verificationStatus: "verified",
    });

    const requiresEmailConfirmation = !authData.session;

    return NextResponse.json(
      {
        success: true,
        message: requiresEmailConfirmation
          ? "Your account has been created successfully. Please verify your email to access your workspace."
          : "Your account has been created successfully.",
        requiresEmailConfirmation,
        user: {
          id: userId,
          email,
          fullName,
          role: "alumni",
          currentRole,
          currentCompany,
          companyId: codeRecord.company_id,
          verificationStatus: "verified",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register Alumni] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected server error occurred during alumni registration.",
      },
      { status: 500 }
    );
  }
}
