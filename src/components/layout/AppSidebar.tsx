"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  User,
  Users,
  MessageSquare,
  Map,
  Sparkles,
  FileText,
  Settings,
  CheckCircle2,
  ArrowRightLeft,
  LogOut,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSyncExternalStore } from "react";
import {
  subscribeToDashboardStorage,
  loadAuthSession,
  loadStudentProfile,
  loadMentorshipActivity,
  defaultStudentSession,
  setSessionRole,
} from "@/lib/dashboard-storage";
import { currentStudent, calculateProfileCompletion } from "@/lib/mock-data";

interface AppSidebarProps {
  className?: string;
  onCloseMobile?: () => void;
}

export function AppSidebar({ className, onCloseMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const session = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAuthSession,
    () => defaultStudentSession
  );

  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => ({ pendingRequests: [], acceptedMentorships: [], declinedRequests: [], completedMentorships: [], recentConversations: [] })
  );

  const isAlumni = session.role === "alumni";
  const studentName = session.name || student.name || "Student";
  const unreadCount = mentorshipActivity.recentConversations?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0;
  const profileCompletion = calculateProfileCompletion(student);

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
  }

  const studentNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Profile", href: "/profile", icon: User },
    { label: "Discover Alumni", href: "/alumni", icon: Users },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: unreadCount > 0 ? String(unreadCount) : undefined,
    },
    { label: "Community", href: "/community", icon: Users },
    { label: "Career Roadmap", href: "/career-roadmap", icon: Map },
    { label: "AI Assistant", href: "/career-assistant", icon: Sparkles },
    { label: "Resume Review", href: "/resume-review", icon: FileText },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const alumniNavItems: NavItem[] = [
    { label: "Dashboard", href: "/alumni-dashboard", icon: LayoutDashboard },
    { label: "Discover Students", href: "/alumni-dashboard/students", icon: Users },
    { label: "Requests", href: "/alumni-dashboard/requests", icon: MessageSquare },
    { label: "Messages", href: "/messages", icon: MessageSquare },
    { label: "Community", href: "/alumni-dashboard/community", icon: Users },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  const navItems = isAlumni ? alumniNavItems : studentNavItems;

  return (
    <aside
      className={cn(
        "w-64 shrink-0 bg-white border-r border-[#E7E7E7] flex flex-col justify-between h-screen sticky top-0 select-none z-30",
        className
      )}
    >
      {/* Top Branding */}
      <div className="p-5 pb-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group"
          onClick={onCloseMobile}
        >
          <div className="w-8 h-8 rounded-lg bg-[#090909] text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-sm transition-transform group-hover:scale-105">
            <span>A</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#090909]">
              AlumniPath
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#737373] font-semibold -mt-0.5">
              COLLEGIATE NETWORK
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-full text-[#737373] hover:text-[#090909] hover:bg-[#F4F4F4] transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href === "/alumni" && pathname.startsWith("/alumni")) ||
            (item.href === "/alumni" && pathname.startsWith("/directory")) ||
            (item.href === "/career-roadmap" && pathname.startsWith("/roadmap"));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-[#090909] text-white shadow-xs font-semibold"
                  : "text-[#555555] hover:text-[#090909] hover:bg-[#F4F4F4]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={16}
                  className={isActive ? "text-white" : "text-[#737373]"}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold",
                    isActive
                      ? "bg-white text-[#090909]"
                      : "bg-[#090909] text-white"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Strength & User Status */}
      <div className="p-3 border-t border-[#E7E7E7] space-y-3 bg-[#FAFAFA]">
        {/* Profile Strength Card (Matching Reference 2) */}
        {!isAlumni && (
          <div className="bg-white border border-[#E7E7E7] rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-[#090909] mb-1.5">
              <span>Profile Strength</span>
              <span className="font-bold">{profileCompletion.percent}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#EBEBEB] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#090909] rounded-full transition-all duration-300"
                style={{ width: `${profileCompletion.percent}%` }}
              />
            </div>
            <p className="text-[10px] text-[#737373] mt-1.5 flex items-center gap-1 font-medium">
              <CheckCircle2 size={11} className="text-[#090909]" />
              {profileCompletion.percent === 100
                ? "All essentials completed"
                : `${profileCompletion.missingCount} items to complete`}
            </p>
          </div>
        )}

        {/* User Monogram & Quick Switcher */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#090909] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {studentName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#090909] truncate leading-tight">
                {studentName}
              </p>
              <p className="text-[10px] text-[#737373] truncate leading-tight mt-0.5">
                {isAlumni ? "Alumni Mentor" : "Computer Science"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
