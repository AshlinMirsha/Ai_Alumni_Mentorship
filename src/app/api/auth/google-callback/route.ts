import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { validateEmail } from "@/lib/auth/validation";
import { isEmailRegistered, getRegisteredUser } from "@/lib/auth/registered-users";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = body?.email;
    const userId = body?.userId;

    const emailErr = validateEmail(email);
    if (emailErr || !email || typeof email !== "string") {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          error: "Invalid email address returned from Google.",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const supabase = getAdminClient();

    // 1. Check database profiles table
    let dbProfile: any = null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, company:companies(*)")
        .eq("email", normalizedEmail)
        .maybeSingle();

      if (!error && data) {
        dbProfile = data;
      }
    } catch {
      // Table may not yet be initialized in Supabase
    }

    // 2. Check persistent registration registry
    const localAccount = getRegisteredUser(normalizedEmail);
    const isRegistered = Boolean(dbProfile || localAccount || isEmailRegistered(normalizedEmail));

    // 3. Security Rule: If account is not registered in AlumniPath, reject immediately!
    // Google OAuth must never grant implicit registration or bypass university/alumni verification.
    if (!isRegistered) {
      return NextResponse.json(
        {
          success: false,
          registered: false,
          error: "You haven't registered with AlumniPath yet. Please sign up first.",
          code: "ACCOUNT_NOT_REGISTERED",
        },
        { status: 403 }
      );
    }

    // 4. Derive trusted role strictly from database profile or registry — NEVER from Google metadata
    const trustedRole = dbProfile?.role || localAccount?.role || "student";
    const verificationStatus =
      dbProfile?.verification_status || localAccount?.verificationStatus || "unverified";
    const fullName =
      dbProfile?.full_name || localAccount?.fullName || "User";

    // 5. Verification check for alumni
    if (trustedRole === "alumni" && verificationStatus === "rejected") {
      return NextResponse.json(
        {
          success: false,
          registered: true,
          error: "Please complete the required verification before continuing.",
          code: "VERIFICATION_REQUIRED",
        },
        { status: 403 }
      );
    }

    // 6. Safely repair missing database profile without creating duplicates (onConflict: id)
    if (!dbProfile && localAccount && userId) {
      try {
        await supabase.from("profiles").upsert(
          {
            id: userId,
            email: normalizedEmail,
            full_name: localAccount.fullName,
            role: localAccount.role,
            verification_status: localAccount.verificationStatus,
            institution: localAccount.institution || null,
            department: localAccount.department || null,
            academic_year: localAccount.academicYear || null,
            current_role: localAccount.currentRole || null,
            current_company: localAccount.currentCompany || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch {
        // Ignore if table not yet created
      }
    }

    return NextResponse.json({
      success: true,
      registered: true,
      user: {
        id: userId || dbProfile?.id || localAccount?.id,
        email: normalizedEmail,
        fullName,
        role: trustedRole,
        verificationStatus,
        company: dbProfile?.current_company || localAccount?.currentCompany || null,
        institution: dbProfile?.institution || localAccount?.institution || null,
        department: dbProfile?.department || localAccount?.department || null,
      },
      redirectUrl: trustedRole === "alumni" ? "/alumni-dashboard" : "/dashboard",
    });
  } catch (error) {
    console.error("[Google Callback] Unexpected error:", error);
    return NextResponse.json(
      {
        success: false,
        registered: false,
        error: "An unexpected server error occurred during Google verification.",
      },
      { status: 500 }
    );
  }
}
