"use client";

import { useState, useSyncExternalStore, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  Search,
  ExternalLink,
  Settings,
  User,
  ShieldCheck,
  Briefcase,
  ArrowRightLeft,
  CheckCheck,
  LayoutDashboard,
  Users,
  Inbox,
  UserCheck,
  MessagesSquare,
  MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import {
  subscribeToDashboardStorage,
  loadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setSessionRole,
  loadAlumniProfile,
  loadMentorshipActivity,
} from "@/lib/dashboard-storage";
import { notificationsData, defaultAlumniUser, initialMentorshipActivity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface AlumniNavProps {
  onMobileToggle?: () => void;
  mobileOpen?: boolean;
}

export function AlumniNav({ onMobileToggle, mobileOpen }: AlumniNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const notifications = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadNotifications,
    () => notificationsData
  );

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

  const pendingRequestsCount = mentorshipActivity.pendingRequests?.length || 0;
  const activeMenteesCount = mentorshipActivity.acceptedMentorships?.length || 0;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { label: "Dashboard", href: "/alumni-dashboard", icon: LayoutDashboard, badge: null },
    { label: "Discover Students", href: "/alumni-dashboard/students", icon: Users, badge: null },
    {
      label: "Requests",
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
    { label: "Opportunities", href: "/alumni-dashboard/opportunities", icon: Briefcase, badge: null },
    { label: "Community", href: "/alumni-dashboard/community", icon: MessagesSquare, badge: null },
    { label: "Messages", href: "/messages", icon: MessageSquare, badge: null },
  ];

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

  const handleSwitchToStudent = () => {
    setSessionRole("student");
    router.push("/dashboard");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/alumni-dashboard/students?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-black/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[56px] gap-3 xl:gap-4">
          {/* Left: Brand & Portal Badge */}
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-7 h-full shrink-0">
            <Link href="/alumni-dashboard" className="flex items-center gap-2.5 group shrink-0">
              <div className="h-7 w-7 rounded-lg bg-[#0a66c2] flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_4px_rgba(10,102,194,0.3)] transition-transform group-hover:scale-105">
                <span className="text-white text-xs font-bold tracking-tight">A</span>
              </div>
              <span className="text-base font-bold tracking-tight text-[#1d1d1f] hidden sm:inline-block whitespace-nowrap">
                Alumni<span className="text-[#0a66c2]">Path</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 h-full">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/alumni-dashboard"
                    ? pathname === "/alumni-dashboard"
                    : pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 h-[34px] px-2.5 xl:px-3 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap shrink-0",
                      isActive
                        ? "bg-[#0a66c2]/[0.08] text-[#0a66c2] font-semibold shadow-[inset_0_0_0_1px_rgba(10,102,194,0.18)]"
                        : "text-[#515154] hover:text-[#1d1d1f] hover:bg-black/[0.04]"
                    )}
                  >
                    <Icon size={14} className={isActive ? "text-[#0a66c2]" : "text-[#86868b]"} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] font-bold bg-[#0a66c2]/10 text-[#0a66c2] px-1.5 py-0.2 rounded-full leading-none">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center relative">
              <Search size={14} className="absolute left-2.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, skills..."
                className="w-36 lg:w-44 xl:w-48 pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0A66C2] focus:border-[#0A66C2] transition-colors"
              />
            </form>

            {/* Quick Role Switcher Pill */}
            <button
              type="button"
              onClick={handleSwitchToStudent}
              title="Click to preview the platform as a student"
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#191919] hover:text-[#0A66C2] hover:bg-gray-100 border border-[#D9D9D9] rounded-full transition-colors whitespace-nowrap shrink-0"
            >
              <ArrowRightLeft size={12} className="text-[#0A66C2] shrink-0" />
              <span className="whitespace-nowrap">Switch to Student View</span>
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
                  "relative p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors",
                  showNotifications && "bg-gray-100 text-gray-900"
                )}
                aria-label="View notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-[#cc1016] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl liquid-glass-elevated border border-white/80 shadow-[0_20px_48px_-12px_rgba(10,22,40,0.14)] py-2 z-50 overflow-hidden animate-in fade-in">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.06]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-900">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#ebf3fb] text-[#0a66c2]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[11px] text-[#0a66c2] hover:underline flex items-center gap-1 font-medium"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-gray-500">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markNotificationAsRead(n.id);
                          }}
                          className={cn(
                            "px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer text-left",
                            !n.read && "bg-blue-50/40"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-gray-900 leading-tight">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0a66c2] shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {n.description}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">Alumni notifications active</span>
                    <Link
                      href="/settings"
                      onClick={() => setShowNotifications(false)}
                      className="text-[#0a66c2] hover:underline font-medium"
                    >
                      Preferences
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
                aria-label="User account menu"
              >
                <Avatar name={alumni.name} size="sm" />
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-semibold text-gray-900 leading-none">{alumni.name}</p>
                  <p className="text-[11px] text-gray-500 leading-none mt-1 truncate max-w-[120px]">
                    {alumni.company}
                  </p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl liquid-glass-elevated border border-white/80 shadow-[0_20px_48px_-12px_rgba(10,22,40,0.14)] py-2 z-50 overflow-hidden">
                  <div className="px-3.5 py-2.5 border-b border-black/[0.06]">
                    <p className="text-xs font-semibold text-[#1d1d1f]">{alumni.name}</p>
                    <p className="text-[11px] text-[#6e6e73] truncate">{alumni.headline}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#057642] bg-[#057642]/10 px-2 py-0.5 rounded-full font-medium border border-[#057642]/20">
                        <ShieldCheck size={10} /> Verified Mentor
                      </span>
                      <span className="text-[10px] text-gray-400">@ {alumni.company}</span>
                    </div>
                  </div>

                  <Link
                    href="/alumni-dashboard/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <User size={13} className="text-gray-400" />
                    <span>My Public Profile &amp; Bio</span>
                  </Link>

                  <Link
                    href="/alumni-dashboard/requests"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Briefcase size={13} className="text-gray-400" />
                    <span>Mentorship Requests</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Settings size={13} className="text-gray-400" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-gray-100 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSwitchToStudent();
                    }}
                    className="w-full text-left flex items-center justify-between px-3.5 py-2 text-xs text-[#0a66c2] hover:bg-blue-50 transition-colors font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRightLeft size={13} />
                      <span>Switch to Student View</span>
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

            {/* Mobile menu toggle button */}
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={onMobileToggle}
              aria-label="Toggle navigation drawer"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
