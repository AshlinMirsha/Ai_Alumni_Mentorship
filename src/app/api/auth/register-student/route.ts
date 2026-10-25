import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { validateStudentRegistration } from "@/lib/auth/validation";
import { registerAccount, isEmailRegistered } from "@/lib/auth/registered-users";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const validation = validateStudentRegistration(body);

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

    const { email, password, fullName, institution, department, academicYear } =
      validation.sanitized;
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
      // Table may not yet be initialized in Supabase
    }

    // 2. Create account via Supabase Auth
    // The role in raw_user_meta_data is strictly forced to 'student'
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "student",
          institution,
          department,
          academic_year: academicYear,
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
          error: "Failed to initialize student account.",
        },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // 3. Ensure profile row exists in public.profiles with student role (onConflict: id prevents duplicates)
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          email: normalizedEmail,
          full_name: fullName,
          role: "student",
          institution,
          department,
          academic_year: academicYear,
          verification_status: "unverified",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.warn("[Register Student] Profile upsert warning:", profileError.message);
    }

    // 4. Register in persistent registry
    registerAccount({
      email: normalizedEmail,
      password,
      fullName,
      role: "student",
      institution,
      department,
      academicYear,
      verificationStatus: "unverified",
    });

    const requiresEmailConfirmation = !authData.session;

    return NextResponse.json(
      {
        success: true,
        message: "Your account has been created successfully.",
        requiresEmailConfirmation,
        user: {
          id: userId,
          email: normalizedEmail,
          fullName,
          role: "student",
          institution,
          department,
          academicYear,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Register Student] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected server error occurred during registration.",
      },
      { status: 500 }
    );
  }
}
