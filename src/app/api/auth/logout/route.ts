import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getBearerToken } from "@/lib/auth/authorize";

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    const supabase = getAdminClient();

    if (token) {
      // Invalidate session in Supabase Auth
      await supabase.auth.admin.signOut(token).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      message: "Signed out successfully.",
    });
  } catch (error) {
    console.error("[Logout] Error:", error);
    return NextResponse.json({
      success: true,
      message: "Signed out.",
    });
  }
}
