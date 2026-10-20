"use client";

import { useState, useRef, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  CheckCheck,
  ArrowRightLeft,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  subscribeToDashboardStorage,
  loadAuthSession,
  loadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  setSessionRole,
  defaultStudentSession,
} from "@/lib/dashboard-storage";
import { notificationsData } from "@/lib/mock-data";

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
  title?: string;
  subtitle?: string;
}

export function AppHeader({
  onToggleMobileMenu,
  title = "Good morning, Mirsha 👋",
  subtitle = "Computer Science · Second Year · Fall 2026 Semester",
}: AppHeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const session = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAuthSession,
    () => defaultStudentSession
  );

  const notifications = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadNotifications,
    () => notificationsData
  );

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isAlumni = session.role === "alumni";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E7E7E7] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 -ml-2 rounded-lg text-[#090909] hover:bg-[#F4F4F4]"
            aria-label="Toggle Navigation"
          >
            <Menu size={20} />
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#090909]">
            {title}
          </h1>
          <p className="text-xs text-[#737373] hidden sm:block font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8A8A8]"
          />
          <input
            type="text"
            placeholder="Search alumni, companies, skills..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/alumni?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
              }
            }}
            className="w-full h-9 pl-9 pr-3 rounded-full text-xs bg-[#F4F4F4] border border-transparent focus:border-[#090909] focus:bg-white focus:outline-none transition-all placeholder:text-[#A8A8A8] text-[#090909]"
          />
        </div>

        {/* Switch to Alumni View pill */}
        <button
          type="button"
          onClick={() => {
            const newRole = isAlumni ? "student" : "alumni";
            setSessionRole(newRole);
            router.push(isAlumni ? "/dashboard" : "/alumni-dashboard");
          }}
          className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium border border-[#E7E7E7] bg-white text-[#242424] hover:bg-[#F4F4F4] transition-colors"
        >
          <ArrowRightLeft size={12} className="text-[#737373]" />
          <span>{isAlumni ? "Switch to Student View" : "Switch to Alumni View"}</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((p) => !p)}
            className="relative h-9 w-9 rounded-full border border-[#E7E7E7] bg-white text-[#090909] hover:bg-[#F4F4F4] flex items-center justify-center transition-colors"
            aria-label="View notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#090909]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E7E7E7] shadow-[0_12px_32px_rgba(0,0,0,0.08)] py-2 z-50 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#E7E7E7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#090909]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold bg-[#090909] text-white px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] font-medium text-[#737373] hover:text-[#090909] flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#E7E7E7]">
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((n) => {
                    const isUnread = !n.read;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setShowNotifications(false);
                          if (n.actionUrl) router.push(n.actionUrl);
                        }}
                        className={cn(
                          "p-3 transition-colors cursor-pointer flex items-start gap-2.5",
                          isUnread ? "bg-[#FAFAFA]" : "hover:bg-[#F4F4F4]"
                        )}
                      >
                        <div className="w-7 h-7 rounded-full bg-[#090909] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {n.actorName ? n.actorName.charAt(0) : "A"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#090909] leading-tight">
                            {n.title}
                          </p>
                          <p className="text-[11px] text-[#737373] mt-0.5 line-clamp-2 leading-relaxed">
                            {n.description}
                          </p>
                        </div>
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#090909] shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-xs text-[#737373]">
                    No notifications right now.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
