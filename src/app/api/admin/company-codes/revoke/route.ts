import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorize";
import { hashCompanyCode } from "@/lib/auth/crypto";

async function authorizeAdmin(req: Request) {
  const adminSecret = process.env.ADMIN_API_KEY;
  const providedSecret = req.headers.get("x-admin-key");

  if (adminSecret && providedSecret && adminSecret === providedSecret) {
    return { authorized: true };
  }

  const roleCheck = await requireRole(req, ["admin"]);
  return roleCheck;
}

// POST /api/admin/company-codes/revoke
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
    const codeId = body?.codeId;
    const rawCode = body?.rawCode;

    if (!codeId && !rawCode) {
      return NextResponse.json(
        { success: false, error: "Either codeId or rawCode is required to revoke." },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    let query = supabase
      .from("company_verification_codes")
      .update({
        status: "revoked",
        updated_at: new Date().toISOString(),
      });

    if (codeId) {
      query = query.eq("id", codeId);
    } else if (rawCode) {
      const codeHash = hashCompanyCode(rawCode);
      query = query.eq("code_hash", codeHash);
    }

    const { data, error } = await query.select().maybeSingle();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Target verification code not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Company verification code [${data.code_prefix}...] successfully revoked.`,
      code: {
        id: data.id,
        prefix: data.code_prefix,
        status: "revoked",
      },
    });
  } catch (error) {
    console.error("[Revoke Code] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to revoke verification code." },
      { status: 500 }
    );
  }
}
