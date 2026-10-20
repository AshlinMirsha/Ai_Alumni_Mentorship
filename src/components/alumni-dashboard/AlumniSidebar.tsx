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
    },
    {
      label: "My Mentees",
      href: "/alumni-dashboard/mentees",
      icon: UserCheck,
      badge: activeMenteesCount > 0 ? `${activeMenteesCount}` : null,
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
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-4 shadow-xs">
        <div className="flex items-start gap-3">
          <Avatar name={alumni.name} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-[#090909] truncate">{alumni.name}</h3>
              <span title="Verified Alumni">
                <ShieldCheck size={13} className="text-[#090909] shrink-0" />
              </span>
            </div>
            <p className="text-[11px] text-[#454545] truncate mt-0.5">{alumni.role}</p>
            <p className="text-[11px] font-semibold text-[#090909] truncate">{alumni.company}</p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#E7E7E7] flex items-center justify-between text-[11px]">
          <span className="inline-flex items-center gap-1.5 text-[#090909] font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-[#090909] animate-pulse" />
            Accepting Mentees
          </span>
          <span className="text-[#737373] font-medium">
            {activeMenteesCount}/5 active
          </span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-2.5 shadow-xs">
        <p className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373]">
          Alumni Navigation
        </p>

        <nav className="space-y-1">
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
                  "flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#090909] text-white font-semibold shadow-2xs"
                    : "text-[#555555] hover:text-[#090909] hover:bg-[#F4F4F4]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    size={15}
                    className={cn(
                      "shrink-0 transition-colors",
                      isActive ? "text-white" : "text-[#737373]"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={cn(
                      "px-1.5 py-0.2 text-[10px] font-bold rounded-full",
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
        </nav>
      </div>

      {/* Role Switching & Demo Badge */}
      <div className="bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl p-4 text-left shadow-2xs">
        <div className="flex items-center gap-1.5 text-[#090909] mb-1">
          <Sparkles size={13} className="text-[#090909]" />
          <span className="text-[11px] font-bold">Interactive Platform Switcher</span>
        </div>
        <p className="text-[11px] text-[#555555] leading-relaxed mb-3">
          Currently previewing as alumnus mentor <strong>{alumni.name}</strong>. Switch to student view anytime to test both roles.
        </p>
        <button
          type="button"
          onClick={handleSwitchToStudent}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-[#090909] hover:bg-[#242424] rounded-full transition-colors cursor-pointer shadow-xs"
        >
          <ArrowRightLeft size={13} />
          <span>Switch to Student View</span>
        </button>
      </div>
    </aside>
  );
}
