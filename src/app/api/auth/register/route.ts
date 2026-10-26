import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      fullName,
      role = "student",
      university,
      department,
      academicYear,
      graduationYear,
      currentCompany,
      currentRole,
    } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    if (role === "student") {
      const isInstitutional =
        trimmedEmail.endsWith(".edu") ||
        trimmedEmail.endsWith(".edu.in") ||
        trimmedEmail.endsWith(".ac.in") ||
        trimmedEmail.endsWith(".ac.uk") ||
        trimmedEmail.endsWith(".edu.au") ||
        trimmedEmail.includes(".edu.");
      if (!isInstitutional) {
        return NextResponse.json(
          { error: "Students must register with a valid institutional or university email (.edu, .edu.in, .ac.in, etc.)." },
          { status: 400 }
        );
      }
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (!fullName || !fullName.trim()) {
      return NextResponse.json(
        { error: "Full legal name is required." },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Check if user already exists in auth.users
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    const userMetadata = {
      full_name: fullName.trim(),
      role: role === "alumni" ? "alumni" : "student",
      university: (university || "").trim(),
      major: (department || "").trim(),
      graduation_year: graduationYear ? Number(graduationYear) : undefined,
      academic_year: academicYear || undefined,
      current_company: (currentCompany || "").trim(),
      current_title: (currentRole || "").trim(),
    };

    if (existingUser) {
      // User exists, update password and ensure email is confirmed
      const { data: updated, error: updateErr } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
          user_metadata: userMetadata,
        });

      if (updateErr) {
        console.error("Failed to update existing user during registration:", updateErr);
        return NextResponse.json(
          { error: updateErr.message },
          { status: 400 }
        );
      }
      userId = updated.user.id;
    } else {
      // Create new user with pre-confirmed email
      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password,
          email_confirm: true,
          user_metadata: userMetadata,
        });

      if (createErr) {
        console.error("Failed to create user during registration:", createErr);
        return NextResponse.json(
          { error: createErr.message },
          { status: 400 }
        );
      }
      userId = created.user.id;
    }

    // Upsert into public.profiles
    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role: role === "alumni" ? "alumni" : "student",
      university: (university || "").trim(),
      major: (department || "").trim(),
      graduation_year: graduationYear ? Number(graduationYear) : null,
      current_company: (currentCompany || "").trim() || null,
      current_title: (currentRole || "").trim() || null,
      is_verified: true,
      available_for_mentorship: true,
      updated_at: new Date().toISOString(),
    });

    if (profileErr) {
      console.warn("Profile upsert warning:", profileErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Registration successful",
      user: {
        id: userId,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        role: role === "alumni" ? "alumni" : "student",
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Internal server error during registration";
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
