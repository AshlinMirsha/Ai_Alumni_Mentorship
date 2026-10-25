"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  saveAuthSession,
  defaultStudentSession,
  defaultAlumniSession,
} from "@/lib/dashboard-storage";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState("Verifying Google authorization...");
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleOAuthCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const errorParam = params.get("error");
        const errorDesc = params.get("error_description");
        const code = params.get("code");

        const oauthOrigin =
          typeof window !== "undefined"
            ? sessionStorage.getItem("alumnipath_oauth_origin")
            : null;
        const fallbackPath = oauthOrigin === "signup" ? "/signup" : "/login";

        // 1. Handle OAuth cancellation or provider-level errors
        if (errorParam) {
          console.warn("[OAuth Callback] Provider error:", errorParam, errorDesc);
          if (errorParam === "access_denied") {
            router.replace(`${fallbackPath}?error=oauth_cancelled`);
          } else {
            router.replace(`${fallbackPath}?error=oauth_failed`);
          }
          return;
        }

        const supabase = getSupabaseClient();

        // 2. Check for active session first (detectSessionInUrl may have already completed it)
        setStatusMessage("Validating authenticated session...");
        let {
          data: { session },
        } = await supabase.auth.getSession();

        // If no session yet and code is present, attempt explicit code exchange
        if (!session && code) {
          setStatusMessage("Exchanging security token...");
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (!exchangeError && exchangeData?.session) {
            session = exchangeData.session;
          }
        }

        // If still no session, wait briefly for any background detection
        if (!session) {
          await new Promise((r) => setTimeout(r, 400));
          const retry = await supabase.auth.getSession();
          session = retry.data?.session;
        }

        if (!session?.user || !session.user.email) {
          console.warn("[OAuth Callback] No active session found.");
          router.replace(`${fallbackPath}?error=oauth_failed`);
          return;
        }

        // 3. Verify whether user has an existing registered AlumniPath account
        setStatusMessage("Verifying AlumniPath registration status...");
        const verifyRes = await fetch("/api/auth/google-callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: session.user.email,
            userId: session.user.id,
          }),
        });

        const verifyData = await verifyRes.json().catch(() => null);

        // 4. If user is NOT registered in AlumniPath or verification rejected, guide through registration
        if (!verifyRes.ok || !verifyData?.registered) {
          console.warn("[OAuth Callback] Unregistered or unverified Google account. Directing to registration.");
          await supabase.auth.signOut().catch(() => null);

          if (verifyData?.code === "VERIFICATION_REQUIRED") {
            router.replace("/login?error=verification_required");
          } else {
            // Direct unregistered Google user to complete one-time registration
            const userEmail = encodeURIComponent(session.user.email || "");
            const rawName =
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              "";
            const userName = encodeURIComponent(rawName);
            router.replace(`/signup?from=google&email=${userEmail}&name=${userName}`);
          }
          return;
        }

        // 5. Registered user: sync verified role and redirect to authorized dashboard
        setStatusMessage("Session authorized. Redirecting to workspace...");
        const verifiedRole = verifyData.user?.role === "alumni" ? "alumni" : "student";

        saveAuthSession(
          verifiedRole === "alumni"
            ? {
                ...defaultAlumniSession,
                email: verifyData.user.email,
                name: verifyData.user.fullName || defaultAlumniSession.name,
                company: verifyData.user.company || defaultAlumniSession.company,
                isAuthenticated: true,
              }
            : {
                ...defaultStudentSession,
                email: verifyData.user.email,
                name: verifyData.user.fullName || defaultStudentSession.name,
                department: verifyData.user.department || defaultStudentSession.department,
                isAuthenticated: true,
              }
        );

        router.replace(verifyData.redirectUrl || (verifiedRole === "alumni" ? "/alumni-dashboard" : "/dashboard"));
      } catch (err) {
        console.error("[OAuth Callback] Unexpected error:", err);
        const oauthOrigin =
          typeof window !== "undefined"
            ? sessionStorage.getItem("alumnipath_oauth_origin")
            : null;
        const fallbackPath = oauthOrigin === "signup" ? "/signup" : "/login";
        router.replace(`${fallbackPath}?error=oauth_failed`);
      }
    }

    handleOAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#090909] flex flex-col justify-center items-center p-6 antialiased">
      <div className="w-full max-w-[400px] text-center space-y-6">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-[#090909] text-white flex items-center justify-center font-bold text-base shadow-sm">
            A
          </div>
          <span className="text-xl font-bold tracking-tight text-[#090909]">
            AlumniPath
          </span>
        </Link>

        <div className="bg-white border border-[#E7E7E7] rounded-3xl p-8 sm:p-10 shadow-sm space-y-4">
          <div className="h-10 w-10 border-2 border-[#090909]/20 border-t-[#090909] rounded-full animate-spin mx-auto" />
          <div className="space-y-1.5">
            <h2 className="text-base font-bold text-[#090909]">
              Authenticating with Google
            </h2>
            <p className="text-xs text-[#737373] leading-relaxed">
              {statusMessage}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#737373]">
          AlumniPath Security Gateway · OAuth 2.0 PKCE Verification
        </p>
      </div>
    </div>
  );
}
