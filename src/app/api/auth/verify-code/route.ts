import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { hashCompanyCode } from "@/lib/auth/crypto";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/auth/rate-limiter";
import { getClientIp } from "@/lib/auth/authorize";

export async function POST(req: Request) {
  const clientIp = getClientIp(req);

  try {
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          valid: false,
          error: `Rate limit exceeded. Please try again in ${
            rateCheck.retryAfterSeconds || 60
          } seconds.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    const code = body?.code;

    if (!code || typeof code !== "string" || code.trim().length < 6) {
      return NextResponse.json(
        {
          valid: false,
          error: "Please enter a valid company verification code.",
        },
        { status: 400 }
      );
    }

    const codeHash = hashCompanyCode(code);
    const supabase = getAdminClient();

    const { data: codeRecord, error } = await supabase
      .from("company_verification_codes")
      .select("*, company:companies(*)")
      .eq("code_hash", codeHash)
      .maybeSingle();

    if (error || !codeRecord) {
      const failInfo = recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid company verification code.",
          remainingAttempts: failInfo.remainingAttempts,
        },
        { status: 400 }
      );
    }

    if (codeRecord.status !== "active") {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          valid: false,
          error: `This company verification code is ${codeRecord.status}.`,
        },
        { status: 400 }
      );
    }

    if (codeRecord.expires_at && new Date(codeRecord.expires_at) < new Date()) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          valid: false,
          error: "This company verification code has expired.",
        },
        { status: 400 }
      );
    }

    if (
      codeRecord.max_uses !== null &&
      codeRecord.uses_count >= codeRecord.max_uses
    ) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        {
          valid: false,
          error: "This verification code has reached its maximum usage limit.",
        },
        { status: 400 }
      );
    }

    // Success - reset rate limiter
    resetRateLimit(clientIp);

    return NextResponse.json({
      valid: true,
      companyId: codeRecord.company_id,
      companyName: codeRecord.company?.name || "Verified Organization",
      expiresAt: codeRecord.expires_at,
    });
  } catch (error) {
    console.error("[Verify Code] Unexpected error:", error);
    return NextResponse.json(
      {
        valid: false,
        error: "Server error verifying company code.",
      },
      { status: 500 }
    );
  }
}
