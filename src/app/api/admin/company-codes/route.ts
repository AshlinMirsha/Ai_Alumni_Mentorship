import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorize";
import { generateCompanyCode } from "@/lib/auth/crypto";

/**
 * Checks for administrative authorization via Bearer token (Admin role)
 * or via trusted internal ADMIN_API_KEY header for administrative provisioning.
 */
async function authorizeAdmin(req: Request) {
  const adminSecret = process.env.ADMIN_API_KEY;
  const providedSecret = req.headers.get("x-admin-key");

  if (adminSecret && providedSecret && adminSecret === providedSecret) {
    return { authorized: true };
  }

  const roleCheck = await requireRole(req, ["admin"]);
  return roleCheck;
}

// GET /api/admin/company-codes - List all company verification codes
export async function GET(req: Request) {
  const auth = await authorizeAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: "Administrative authorization required." },
      { status: 403 }
    );
  }

  try {
    const supabase = getAdminClient();
    const { data: codes, error } = await supabase
      .from("company_verification_codes")
      .select("id, code_prefix, status, expires_at, max_uses, uses_count, notes, created_at, company:companies(id, name, domain)")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      codes: codes || [],
    });
  } catch (error) {
    console.error("[Admin Codes GET] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve verification codes." },
      { status: 500 }
    );
  }
}

// POST /api/admin/company-codes - Generate a new company verification code
export async function POST(req: Request) {
  const auth = await authorizeAdmin(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { success: false, error: "Administrative authorization required." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => null);

    const companyId = body?.companyId;
    const prefix = body?.prefix || "ALUM";
    const maxUses = body?.maxUses !== undefined ? Number(body.maxUses) : 1;
    const expiresAt = body?.expiresAt ? new Date(body.expiresAt).toISOString() : null;
    const notes = body?.notes || null;

    if (!companyId || typeof companyId !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid companyId is required." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();

    // Verify company exists
    const { data: company, error: compError } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", companyId)
      .single();

    if (compError || !company) {
      return NextResponse.json(
        { success: false, error: "Target company not found." },
        { status: 404 }
      );
    }

    // Generate cryptographically secure code
    const generated = generateCompanyCode(prefix);

    // Insert into company_verification_codes table
    const { data: inserted, error: insertError } = await supabase
      .from("company_verification_codes")
      .insert({
        company_id: company.id,
        code_hash: generated.hash,
        code_prefix: generated.prefix,
        status: "active",
        expires_at: expiresAt,
        max_uses: maxUses,
        uses_count: 0,
        notes: notes || `Generated for ${company.name}`,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Company verification code generated successfully.",
        code: {
          id: inserted.id,
          // Raw code is returned ONCE to the administrator for dispatching
          rawCode: generated.code,
          prefix: generated.prefix,
          companyName: company.name,
          maxUses,
          expiresAt,
          status: "active",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Admin Codes POST] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate verification code." },
      { status: 500 }
    );
  }
}
