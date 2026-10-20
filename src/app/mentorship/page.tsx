"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldAlert, ArrowRight, LayoutDashboard, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  subscribeToDashboardStorage,
  loadAuthSession,
  defaultStudentSession,
} from "@/lib/dashboard-storage";

export default function MentorshipPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  const session = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAuthSession,
    () => defaultStudentSession
  );
  const isAlumniUser = session.role === "alumni";

  useEffect(() => {
    if (isAlumniUser) {
      router.replace("/alumni-dashboard/requests");
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.replace("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAlumniUser, router]);

  if (isAlumniUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
        <p className="text-xs text-gray-500">Redirecting to Alumni Mentorship Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col antialiased">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-[#E7E7E7] shadow-xs p-6 sm:p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto border border-neutral-200 shadow-2xs">
            <ShieldAlert size={22} />
          </div>

          <div className="space-y-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
              Access Restricted
            </span>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Mentorship Feature Unavailable
            </h1>
            <p className="text-xs text-gray-600 leading-relaxed pt-1">
              The Mentorship feature is not available for Student accounts. You can continue discovering verified alumni, exploring career roadmaps, or using our AI career tools.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E7E7E7] text-xs text-gray-500">
            Automatically redirecting to your Student Dashboard in{" "}
            <span className="font-bold text-gray-900">{countdown}s</span>...
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Button variant="primary" size="sm" asChild className="w-full sm:w-auto text-xs rounded-full bg-[#090909] hover:bg-[#242424] text-white">
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-1.5">
                <LayoutDashboard size={14} />
                <span>Go to Dashboard Now</span>
              </Link>
            </Button>
            <Button variant="secondary" size="sm" asChild className="w-full sm:w-auto text-xs rounded-full border-neutral-200 text-neutral-800 hover:bg-neutral-50">
              <Link href="/alumni" className="inline-flex items-center justify-center gap-1.5">
                <Users size={14} />
                <span>Discover Alumni</span>
                <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E7E7E7] bg-white py-4 text-center text-xs text-gray-400">
        © 2026 AlumniPath · Professional Networking
      </footer>
    </div>
  );
}
