"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  LayoutDashboard,
  Users,
  Inbox,
  UserCheck,
  Briefcase,
  MessagesSquare,
  MessageSquare,
  User,
  Settings,
  ShieldCheck,
  ArrowRightLeft,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import {
  subscribeToDashboardStorage,
  loadAlumniProfile,
  loadMentorshipActivity,
  setSessionRole,
} from "@/lib/dashboard-storage";
import { defaultAlumniUser, initialMentorshipActivity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AlumniSidebarProps {
  onItemClick?: () => void;
  className?: string;
}

export function AlumniSidebar({ onItemClick, className }: AlumniSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const alumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
  );

  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const pendingRequestsCount = mentorshipActivity.pendingRequests.length;
  const activeMenteesCount = (mentorshipActivity.acceptedMentorships || []).length;

  const navItems = [
    {
      label: "Dashboard",
      href: "/alumni-dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      label: "Discover Students",
      href: "/alumni-dashboard/students",
      icon: Users,
      badge: null,
    },
    {
      label: "Mentorship Requests",
      href: "/alumni-dashboard/requests",
      icon: Inbox,
      badge: pendingRequestsCount > 0 ? `${pendingRequestsCount}` : null,
      badgeColor: "bg-blue-100 text-[#0a66c2]",
    },
    {
      label: "My Mentees",
      href: "/alumni-dashboard/mentees",
      icon: UserCheck,
      badge: activeMenteesCount > 0 ? `${activeMenteesCount}` : null,
      badgeColor: "bg-emerald-50 text-[#057642]",
    },
    {
      label: "Opportunities",
      href: "/alumni-dashboard/opportunities",
      icon: Briefcase,
      badge: null,
    },
    {
      label: "Community",
      href: "/alumni-dashboard/community",
      icon: MessagesSquare,
      badge: null,
    },
    {
      label: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: "2",
      badgeColor: "bg-gray-100 text-gray-700",
    },
    {
      label: "My Profile",
      href: "/alumni-dashboard/profile",
      icon: User,
      badge: null,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      badge: null,
    },
  ];

  const handleSwitchToStudent = () => {
    setSessionRole("student");
    router.push("/dashboard");
    onItemClick?.();
  };

  return (
    <aside className={cn("w-full lg:w-64 shrink-0 flex flex-col gap-4", className)}>
      {/* Alumnus Mini Identity Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <Avatar name={alumni.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-gray-900 truncate">{alumni.name}</h3>
              <span title="Verified Alumni">
                <ShieldCheck size={13} className="text-[#057642] shrink-0" />
              </span>
            </div>
            <p className="text-[11px] text-gray-600 truncate mt-0.5">{alumni.role}</p>
            <p className="text-[11px] font-medium text-gray-500 truncate">{alumni.company}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-[#057642] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#057642] animate-pulse" />
            Accepting Mentees
          </span>
          <span className="text-gray-500 font-medium">
            {activeMenteesCount}/5 active
          </span>
        </div>
      </div>

      {/* Main Navigation Menu (Exactly 9 items) */}
      <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-xs">
        <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Alumni Navigation
        </p>

        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/alumni-dashboard"
                ? pathname === "/alumni-dashboard"
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[#ebf3fb] text-[#0a66c2] font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={16}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-[#0a66c2]" : "text-gray-400"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                      item.badgeColor || "bg-gray-100 text-gray-600"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switching & Demo Badge */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-3 text-left">
        <div className="flex items-center gap-1.5 text-slate-700 mb-1">
          <Sparkles size={12} className="text-[#0a66c2]" />
          <span className="text-[11px] font-semibold">Demo Role Switcher</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed mb-2.5">
          You are exploring as verified alumnus <strong>{alumni.name}</strong>. Switch to student view anytime to test both portals.
        </p>
        <button
          type="button"
          onClick={handleSwitchToStudent}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-medium text-[#0a66c2] bg-white border border-[#b2d5f8] rounded-md hover:bg-blue-50 transition-colors"
        >
          <ArrowRightLeft size={11} />
          <span>Switch to Student Portal</span>
        </button>
      </div>
    </aside>
  );
}
