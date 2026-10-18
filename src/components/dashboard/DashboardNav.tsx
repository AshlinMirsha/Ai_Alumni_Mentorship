"use client";

import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  Users,
  Map,
  Sparkles,
  FileText,
  LayoutDashboard,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Settings,
  CheckCheck,
  ArrowRightLeft,
  Inbox,
  UserCheck,
  Briefcase,
  MessagesSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import {
  subscribeToDashboardStorage,
  loadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setSessionRole,
  loadAuthSession,
  defaultStudentSession,
} from "@/lib/dashboard-storage";
import { notificationsData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface DashboardNavProps {
  studentName?: string;
  onOpenEditProfile?: () => void;
}

export function DashboardNav({ studentName = "Ashlin", onOpenEditProfile }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  const isAlumni = session.role === "alumni";
  const effectiveName = isAlumni ? (session.name || "Marcus Vance") : studentName;
  const effectiveRole = isAlumni ? "Alumni Mentor" : "CS Student";

  const navItems = isAlumni
    ? [
        { label: "Dashboard", href: "/alumni-dashboard", icon: LayoutDashboard },
        { label: "Discover Students", href: "/alumni-dashboard/students", icon: Users },
        { label: "Requests", href: "/alumni-dashboard/requests", icon: Inbox },
        { label: "My Mentees", href: "/alumni-dashboard/mentees", icon: UserCheck },
        { label: "Opportunities", href: "/alumni-dashboard/opportunities", icon: Briefcase },
        { label: "Community", href: "/alumni-dashboard/community", icon: MessagesSquare },
        { label: "Messages", href: "/messages", icon: MessageSquare },
      ]
    : [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Discover Alumni", href: "/alumni", icon: Users },
        { label: "Messages", href: "/messages", icon: MessageSquare },
        { label: "Career Roadmap", href: "/career-roadmap", icon: Map },
        { label: "AI Assistant", href: "/career-assistant", icon: Sparkles },
        { label: "Resume Review", href: "/resume-review", icon: FileText },
      ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[54px]">
          {/* Logo & Brand */}
          <div className="flex items-center gap-4 xl:gap-6">
            <Link href={isAlumni ? "/alumni-dashboard" : "/dashboard"} className="flex items-center gap-2.5 group shrink-0">
              <div className="h-7 w-7 rounded bg-[#0a66c2] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#004182]">
                <span className="text-white text-xs font-bold tracking-tight">A</span>
              </div>
              <span className="text-base font-bold tracking-tight text-gray-900 hidden sm:inline-block">
                Alumni<span className="text-[#0a66c2]">Path</span>
              </span>
            </Link>

            {isAlumni && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]">
                Alumni Portal
              </span>
            )}

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150",
                      isActive
                        ? "bg-[#ebf3fb] text-[#0a66c2] font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                    )}
                  >
                    <Icon size={14} className={isActive ? "text-[#0a66c2]" : "text-gray-500"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-2">
            {/* Quick Switch to Alumni Portal */}
            <button
              type="button"
              onClick={() => {
                setSessionRole("alumni");
                router.push("/alumni-dashboard");
              }}
              title="Click to preview the platform as an Alumni Mentor"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors"
            >
              <ArrowRightLeft size={12} className="text-gray-500" />
              <span>Switch to Alumni View</span>
            </button>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications((p) => !p);
                  setShowUserMenu(false);
                }}
                className={cn(
                  "relative p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors",
                  showNotifications && "bg-gray-100 text-gray-900"
                )}
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0a66c2]" />
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg bg-white border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-gray-900">Notifications</h4>
                      {unreadCount > 0 ? (
                        <span className="text-[10px] font-bold bg-[#ebf3fb] text-[#0a66c2] px-1.5 py-0.2 rounded-full border border-[#b2d5f8]">
                          {unreadCount} unread
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-medium">All caught up</span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[11px] font-semibold text-[#0a66c2] hover:text-[#004182] flex items-center gap-1"
                      >
                        <CheckCheck size={12} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length > 0 ? (
                      notifications.slice(0, 6).map((n) => {
                        const isUnread = !n.read;
                        return (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationAsRead(n.id);
                              setShowNotifications(false);
                              if (n.actionUrl) {
                                router.push(n.actionUrl);
                              }
                            }}
                            className={cn(
                              "p-3 transition-colors cursor-pointer flex items-start gap-2.5",
                              isUnread ? "bg-[#f0f7fe]/70 hover:bg-[#ebf3fb]" : "hover:bg-gray-50"
                            )}
                          >
                            <div
                              className={cn(
                                "h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5",
                                isUnread
                                  ? "bg-[#0a66c2] text-white"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                              )}
                            >
                              {n.actorName ? n.actorName.charAt(0) : "N"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={cn("text-xs leading-tight", isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700")}>
                                  {n.title}
                                </p>
                                {isUnread && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#0a66c2] shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                                {n.description}
                              </p>
                              <span className="text-[10px] text-gray-400 mt-1 block">
                                {n.timestamp ? new Date(n.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "Recently"}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-8 text-center text-xs text-gray-400">
                        No notifications right now.
                      </div>
                    )}
                  </div>

                  <div className="p-2 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between px-3 text-xs">
                    <Link
                      href={isAlumni ? "/alumni-dashboard/requests" : "/alumni"}
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-[#0a66c2] font-semibold hover:underline"
                    >
                      {isAlumni ? "Review requests \u2192" : "Discover alumni \u2192"}
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-gray-600 hover:text-gray-900"
                    >
                      Open Messages
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu((p) => !p);
                  setShowNotifications(false);
                }}
                className={cn(
                  "flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition-colors text-left",
                  showUserMenu && "bg-gray-100"
                )}
              >
                <Avatar name={effectiveName} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-none">{effectiveName}</p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1">{effectiveRole}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white border border-gray-200 shadow-[0_4px_16px_rgba(0,0,0,0.12)] py-1.5 z-50">
                  <div className="px-3.5 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900">{effectiveName}</p>
                    <p className="text-[11px] text-gray-500">{session.email || "user@university.edu"}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-[#057642] bg-[#eef8f1] px-1.5 py-0.5 rounded font-medium border border-[#bfe3c9]">
                      <CheckCircle2 size={10} /> {effectiveRole}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenEditProfile?.();
                    }}
                    className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Edit Profile Details
                  </button>
                  <Link
                    href="/career-roadmap"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    My Career Roadmap
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={13} className="text-gray-400" />
                    <span>Settings &amp; Preferences</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      setSessionRole("alumni");
                      router.push("/alumni-dashboard");
                    }}
                    className="w-full text-left flex items-center justify-between px-3.5 py-2 text-xs text-[#0a66c2] hover:bg-blue-50 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRightLeft size={13} />
                      <span>Switch to Alumni View</span>
                    </span>
                    <span className="text-[10px] text-blue-600 bg-blue-100/60 px-1.5 py-0.5 rounded">
                      Demo
                    </span>
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <Link
                    href="/"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center justify-between px-3.5 py-2 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <span>Back to Homepage</span>
                    <ExternalLink size={12} />
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Switch Account / Log Out
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setMobileOpen((p) => !p)}
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          <div className="px-2.5 py-1.5 mb-2 rounded bg-amber-50 text-[11px] text-amber-800 border border-amber-200 flex items-center justify-between">
            <span>Signed in as <strong>{studentName}</strong></span>
            <span className="text-[10px] text-amber-600">Demo</span>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[#ebf3fb] text-[#0a66c2] font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon size={15} className={isActive ? "text-[#0a66c2]" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 font-medium hover:bg-gray-50 rounded-md"
            >
              <Settings size={15} className="text-gray-400" />
              <span>Settings &amp; Preferences</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                if (isAlumni) {
                  setSessionRole("student");
                  router.push("/dashboard");
                } else {
                  setSessionRole("alumni");
                  router.push("/alumni-dashboard");
                }
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs text-[#0a66c2] font-semibold hover:bg-blue-50 rounded-md"
            >
              <ArrowRightLeft size={14} />
              <span>{isAlumni ? "Switch to Student Portal \u2192" : "Switch to Alumni Portal \u2192"}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenEditProfile?.();
              }}
              className="w-full text-left px-3 py-2 text-xs text-gray-700 font-medium hover:bg-gray-50 rounded-md"
            >
              Update Profile Information &rarr;
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
