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
  ArrowRight,
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
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
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

  const displayedNotifications =
    notifFilter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

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
    { label: "Profile", href: "/alumni-dashboard/profile", icon: User, badge: null },
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E7E7E7] shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px] gap-3 xl:gap-4">
          {/* Left: Brand & Nav Links */}
          <div className="flex items-center gap-4 lg:gap-6 xl:gap-7 h-full shrink-0">
            <Link href="/alumni-dashboard" className="flex items-center gap-2.5 group shrink-0">
              <div className="h-8 w-8 rounded-lg bg-[#090909] text-white flex items-center justify-center shrink-0 font-bold text-sm tracking-tight shadow-2xs transition-transform group-hover:scale-105">
                <span>A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-[#090909]">
                  Alumni<span className="text-[#454545]">Path</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-[#737373] font-semibold -mt-1 hidden sm:block">
                  ALUMNI PORTAL
                </span>
              </div>
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
                      "inline-flex items-center gap-1.5 h-[34px] px-3 text-xs font-medium rounded-full transition-all duration-150 whitespace-nowrap shrink-0",
                      isActive
                        ? "bg-[#090909] text-white font-semibold shadow-2xs"
                        : "text-[#555555] hover:text-[#090909] hover:bg-[#F4F4F4]"
                    )}
                  >
                    <Icon size={14} className={isActive ? "text-white" : "text-[#737373]"} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-none",
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

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center relative">
              <Search size={14} className="absolute left-3 text-[#737373] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, skills..."
                className="w-44 xl:w-52 pl-9 pr-3 py-1.5 text-xs bg-[#F4F4F4] border border-transparent focus:border-[#090909] focus:bg-white rounded-full text-[#090909] placeholder:text-[#737373] focus:outline-none transition-all"
              />
            </form>

            {/* Quick Role Switcher Pill */}
            <button
              type="button"
              onClick={handleSwitchToStudent}
              title="Click to switch back to Student platform view"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#090909] hover:bg-[#F4F4F4] border border-[#E7E7E7] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              <ArrowRightLeft size={12} className="text-[#090909] shrink-0" />
              <span className="hidden sm:inline">Switch to Student View</span>
              <span className="sm:hidden">Student</span>
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
                  "relative p-2 rounded-full text-[#090909] border border-[#E7E7E7] bg-white hover:bg-[#F4F4F4] transition-colors cursor-pointer",
                  showNotifications && "bg-[#F4F4F4]"
                )}
                aria-label="View notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#090909] animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E7E7E7] shadow-[0_16px_36px_rgba(0,0,0,0.1)] py-2 z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E7E7E7]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#090909]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#090909] text-white">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[11px] text-[#090909] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <CheckCheck size={12} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="px-4 py-2 bg-[#FAFAFA] border-b border-[#E7E7E7] flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNotifFilter("all")}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer",
                        notifFilter === "all"
                          ? "bg-[#090909] text-white"
                          : "text-[#737373] hover:text-[#090909]"
                      )}
                    >
                      All ({notifications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifFilter("unread")}
                      className={cn(
                        "text-[11px] px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer",
                        notifFilter === "unread"
                          ? "bg-[#090909] text-white"
                          : "text-[#737373] hover:text-[#090909]"
                      )}
                    >
                      Unread ({unreadCount})
                    </button>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E7E7E7]">
                    {displayedNotifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#737373]">
                        No {notifFilter === "unread" ? "unread" : ""} notifications right now.
                      </div>
                    ) : (
                      displayedNotifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (!n.read) markNotificationAsRead(n.id);
                            setShowNotifications(false);
                            if (n.actionUrl) router.push(n.actionUrl);
                          }}
                          className={cn(
                            "px-4 py-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer text-left flex items-start gap-3",
                            !n.read ? "bg-[#FAFAFA]" : "bg-white"
                          )}
                        >
                          <div className="w-7 h-7 rounded-full bg-[#090909] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {n.actorName ? n.actorName.charAt(0) : "A"}
                          </div>
                          <div className="flex-1 min-w-0 pr-2">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-[#090909] truncate">
                                {n.title}
                              </p>
                              <span className="text-[10px] text-[#737373] shrink-0">
                                {n.timestamp || "Recent"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#555555] line-clamp-2 mt-0.5 leading-relaxed">
                              {n.description}
                            </p>
                          </div>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#090909] shrink-0 mt-1.5" />
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-2 bg-[#FAFAFA] border-t border-[#E7E7E7] flex items-center justify-between text-xs">
                    <Link
                      href="/alumni-dashboard/requests"
                      onClick={() => setShowNotifications(false)}
                      className="text-[#090909] hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Review Requests</span>
                      <ArrowRight size={12} />
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setShowNotifications(false)}
                      className="text-[#737373] hover:text-[#090909] font-medium"
                    >
                      Settings
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
                  "flex items-center gap-2 p-1 rounded-full hover:bg-[#F4F4F4] transition-colors text-left cursor-pointer",
                  showUserMenu && "bg-[#F4F4F4]"
                )}
                aria-label="User account menu"
              >
                <Avatar name={alumni.name} size="sm" />
                <div className="hidden xl:block text-left">
                  <p className="text-xs font-bold text-[#090909] leading-none">{alumni.name}</p>
                  <p className="text-[10px] text-[#737373] leading-none mt-1 truncate max-w-[120px]">
                    {alumni.company}
                  </p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#E7E7E7] shadow-[0_16px_36px_rgba(0,0,0,0.1)] py-2 z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="px-4 py-3 border-b border-[#E7E7E7] bg-[#FAFAFA]">
                    <p className="text-xs font-bold text-[#090909]">{alumni.name}</p>
                    <p className="text-[11px] text-[#555555] truncate mt-0.5">{alumni.headline}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#090909] bg-white px-2 py-0.5 rounded-full font-bold border border-[#E7E7E7]">
                        <ShieldCheck size={11} className="text-[#090909]" /> Verified Mentor
                      </span>
                      <span className="text-[10px] text-[#737373]">@ {alumni.company}</span>
                    </div>
                  </div>

                  <Link
                    href="/alumni-dashboard/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#242424] hover:bg-[#F4F4F4] transition-colors"
                  >
                    <User size={13} className="text-[#737373]" />
                    <span>My Public Profile &amp; Bio</span>
                  </Link>

                  <Link
                    href="/alumni-dashboard/requests"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#242424] hover:bg-[#F4F4F4] transition-colors"
                  >
                    <Briefcase size={13} className="text-[#737373]" />
                    <span>Mentorship Requests</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-[#242424] hover:bg-[#F4F4F4] transition-colors"
                  >
                    <Settings size={13} className="text-[#737373]" />
                    <span>Account Settings</span>
                  </Link>

                  <div className="border-t border-[#E7E7E7] my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSwitchToStudent();
                    }}
                    className="w-full text-left flex items-center justify-between px-4 py-2.5 text-xs text-[#090909] hover:bg-[#F4F4F4] transition-colors font-semibold cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <ArrowRightLeft size={13} />
                      <span>Switch to Student View</span>
                    </span>
                    <span className="text-[10px] text-[#737373] bg-[#F4F4F4] px-1.5 py-0.5 rounded-full">
                      Demo
                    </span>
                  </button>

                  <div className="border-t border-[#E7E7E7] my-1" />

                  <Link
                    href="/"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center justify-between px-4 py-2 text-xs text-[#737373] hover:text-[#090909] hover:bg-[#F4F4F4] transition-colors"
                  >
                    <span>Back to Homepage</span>
                    <ExternalLink size={12} />
                  </Link>

                  <Link
                    href="/login"
                    onClick={() => setShowUserMenu(false)}
                    className="block px-4 py-2 text-xs text-[#090909] hover:bg-[#F4F4F4] transition-colors font-medium"
                  >
                    Switch Account / Log Out
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu toggle hamburger button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-lg text-[#090909] hover:bg-[#F4F4F4] transition-colors cursor-pointer"
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
