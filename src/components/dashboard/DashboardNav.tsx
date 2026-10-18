"use client";

import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  Compass,
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
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import {
  subscribeToDashboardStorage,
  loadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
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

  const notifications = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadNotifications,
    () => notificationsData
  );

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Discover Alumni", href: "/alumni", icon: Users },
    { label: "Mentorships", href: "/mentorship", icon: Compass },
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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 shadow-xs group-hover:bg-blue-700 transition-colors">
                <span className="text-white text-sm font-bold">A</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                Alumni<span className="text-blue-600">Path</span>
              </span>
            </Link>

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
                      "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    <Icon size={14} className={isActive ? "text-blue-600" : "text-gray-400"} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-2.5">
            {/* Demo Mode Badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Demo Environment
            </span>

            {/* Notifications Popover */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => {
                  setShowNotifications((p) => !p);
                  setShowUserMenu(false);
                }}
                className="relative p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-gray-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-gray-900">Notifications</h4>
                      {unreadCount > 0 ? (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
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
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <CheckCheck size={12} />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
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
                            className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                              isUnread ? "bg-blue-50/40 hover:bg-blue-50/70" : "hover:bg-gray-50"
                            }`}
                          >
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                                isUnread
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {n.actorName ? n.actorName.charAt(0) : "N"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs leading-tight ${isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                                  {n.title}
                                </p>
                                {isUnread && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
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

                  <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between px-3 text-xs">
                    <Link
                      href="/mentorship"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-blue-600 font-semibold hover:underline"
                    >
                      View mentorship activity &rarr;
                    </Link>
                    <Link
                      href="/messages"
                      onClick={() => setShowNotifications(false)}
                      className="text-[11px] text-gray-500 hover:text-gray-900"
                    >
                      Open Messages
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu((p) => !p);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 text-left"
              >
                <Avatar name={studentName} size="sm" />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-none">{studentName}</p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1">CS Student</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-200 shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-900">{studentName}</p>
                    <p className="text-[11px] text-gray-500">ashlin.student@university.edu</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium border border-emerald-200">
                      <CheckCircle2 size={10} /> Active Student Account
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
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
        <div className="lg:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-1">
          <div className="px-2 py-1.5 mb-2 rounded bg-amber-50 text-[11px] text-amber-700 border border-amber-200">
            Logged in as <strong>{studentName}</strong> (Demo Student Mode)
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
                  "flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <Icon size={16} className={isActive ? "text-blue-600" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-gray-100 space-y-1">
            <Link
              href="/settings"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 font-medium hover:bg-gray-50 rounded-md"
            >
              <Settings size={16} className="text-gray-400" />
              <span>Settings &amp; Preferences</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenEditProfile?.();
              }}
              className="w-full text-left px-3 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-md"
            >
              Update Profile Information &rarr;
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
