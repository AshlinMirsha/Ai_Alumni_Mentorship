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
  Sparkles,
  User,
  ArrowRight,
  ExternalLink,
  Check,
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
import { notificationsData, alumniData } from "@/lib/mock-data";
import { Avatar } from "@/components/ui/Avatar";

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
  const [notifFilter, setNotifFilter] = useState<"all" | "unread">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);

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

  // Filtered notifications based on active tab
  const displayedNotifications =
    notifFilter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  // Filtered search results
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchedMentors = trimmedQuery
    ? alumniData
        .filter(
          (a) =>
            a.name.toLowerCase().includes(trimmedQuery) ||
            a.company.toLowerCase().includes(trimmedQuery) ||
            a.role.toLowerCase().includes(trimmedQuery) ||
            a.skills.some((s) => s.name.toLowerCase().includes(trimmedQuery))
        )
        .slice(0, 4)
    : [];

  const quickNav = [
    { label: "Discover Alumni", href: "/alumni", desc: "Filter 540+ mentors" },
    { label: "Career Roadmap", href: "/career-roadmap", desc: "Track execution milestones" },
    { label: "Direct Advisory Messages", href: "/messages", desc: "Chat with mentors" },
    { label: "AI Career Assistant", href: "/career-assistant", desc: "Mock loops & advice" },
    { label: "Resume Review", href: "/resume-review", desc: "Portfolio critique" },
  ].filter(
    (item) =>
      !trimmedQuery ||
      item.label.toLowerCase().includes(trimmedQuery) ||
      item.desc.toLowerCase().includes(trimmedQuery)
  );

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ⌘K / Ctrl+K keyboard shortcut to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          setShowSearchDropdown(true);
        } else if (mobileSearchInputRef.current) {
          setMobileSearchOpen(true);
          mobileSearchInputRef.current.focus();
        }
      }
      if (e.key === "Escape") {
        setShowSearchDropdown(false);
        setShowNotifications(false);
        setMobileSearchOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleExecuteSearch = (query: string) => {
    if (!query.trim()) return;
    setShowSearchDropdown(false);
    setMobileSearchOpen(false);
    router.push(`/alumni?q=${encodeURIComponent(query.trim())}`);
  };

  const handleToggleRole = () => {
    const newRole = isAlumni ? "student" : "alumni";
    const target = isAlumni ? "/dashboard" : "/alumni-dashboard";
    setSessionRole(newRole);
    router.push(target);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E7E7E7] px-4 sm:px-8 py-3.5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Hamburger & Contextual Title */}
        <div className="flex items-center gap-3 min-w-0">
          {onToggleMobileMenu && (
            <button
              type="button"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#090909] hover:bg-[#F4F4F4] transition-colors cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu size={20} />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#090909] truncate">
              {title}
            </h1>
            <p className="text-xs text-[#737373] hidden sm:block font-medium truncate">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right: Working Search Bar, Role Switcher Toggle, Notifications */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Desktop Search Bar with Live Instant Results */}
          <div className="relative hidden md:block w-64 lg:w-80" ref={searchRef}>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleExecuteSearch(searchQuery);
                  }
                }}
                placeholder="Search alumni, companies, skills..."
                className="w-full h-9 pl-9 pr-12 rounded-full text-xs bg-[#F4F4F4] border border-transparent focus:border-[#090909] focus:bg-white focus:outline-none transition-all placeholder:text-[#737373] text-[#090909]"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#090909] p-0.5"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              ) : (
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#737373] bg-white border border-[#E7E7E7] px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Live Search Instant Results Popover */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 mt-2 rounded-2xl bg-white border border-[#E7E7E7] shadow-[0_16px_36px_rgba(0,0,0,0.1)] py-2 z-50 overflow-hidden animate-in fade-in duration-150">
                {trimmedQuery && matchedMentors.length > 0 && (
                  <div className="mb-2">
                    <p className="px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                      Verified Mentors
                    </p>
                    <div className="divide-y divide-[#F4F4F4]">
                      {matchedMentors.map((alumnus) => (
                        <Link
                          key={alumnus.id}
                          href={`/alumni/${alumnus.id}`}
                          onClick={() => setShowSearchDropdown(false)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-[#FAFAFA] transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar name={alumnus.name} size="sm" />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#090909] group-hover:text-[#454545] truncate">
                                {alumnus.name}
                              </p>
                              <p className="text-[11px] text-[#737373] truncate">
                                {alumnus.role} · <strong className="text-[#090909]">{alumnus.company}</strong>
                              </p>
                            </div>
                          </div>
                          <ArrowRight size={12} className="text-[#737373] group-hover:text-[#090909] shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                    Quick Navigation
                  </p>
                  <div className="divide-y divide-[#F4F4F4]">
                    {quickNav.slice(0, 4).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setShowSearchDropdown(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-[#FAFAFA] transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#090909] group-hover:text-[#454545]">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-[#737373]">{item.desc}</p>
                        </div>
                        <ArrowRight size={12} className="text-[#737373] group-hover:text-[#090909] shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                {trimmedQuery && (
                  <div className="pt-2 mt-1 border-t border-[#E7E7E7] px-4 py-1.5 bg-[#FAFAFA]">
                    <button
                      type="button"
                      onClick={() => handleExecuteSearch(searchQuery)}
                      className="w-full text-left text-xs font-medium text-[#090909] hover:underline flex items-center justify-between"
                    >
                      <span>Search directory for &ldquo;{searchQuery}&rdquo;</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen((p) => !p)}
            className="md:hidden h-9 w-9 rounded-full border border-[#E7E7E7] bg-white text-[#090909] hover:bg-[#F4F4F4] flex items-center justify-center transition-colors"
            aria-label="Toggle mobile search"
          >
            <Search size={16} />
          </button>

          {/* Interactive Role Switcher Pill (Desktop + Mobile) */}
          <button
            type="button"
            onClick={handleToggleRole}
            className="inline-flex items-center gap-1.5 h-9 px-3 sm:px-3.5 rounded-full text-xs font-medium border border-[#E7E7E7] bg-white text-[#090909] hover:bg-[#F4F4F4] hover:border-[#090909] transition-all cursor-pointer shadow-2xs"
            title={isAlumni ? "Switch to Student View" : "Switch to Alumni View"}
          >
            <ArrowRightLeft size={13} className="text-[#090909]" />
            <span className="hidden sm:inline">
              {isAlumni ? "Switch to Student View" : "Switch to Alumni View"}
            </span>
            <span className="sm:hidden">
              {isAlumni ? "Student" : "Alumni"}
            </span>
          </button>

          {/* Notifications Popover */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setShowNotifications((p) => !p)}
              className="relative h-9 w-9 rounded-full border border-[#E7E7E7] bg-white text-[#090909] hover:bg-[#F4F4F4] flex items-center justify-center transition-colors cursor-pointer"
              aria-label="View notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#090909] animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-[#E7E7E7] shadow-[0_16px_36px_rgba(0,0,0,0.1)] py-2 z-50 overflow-hidden animate-in fade-in duration-150">
                {/* Header */}
                <div className="px-4 py-2.5 border-b border-[#E7E7E7] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#090909]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold bg-[#090909] text-white px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => markAllNotificationsAsRead()}
                      className="text-[11px] font-semibold text-[#090909] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck size={13} />
                      <span>Mark all read</span>
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

                {/* Notification Items List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-[#E7E7E7]">
                  {displayedNotifications.length > 0 ? (
                    displayedNotifications.map((n) => {
                      const isUnread = !n.read;
                      return (
                        <div
                          key={n.id}
                          onClick={() => {
                            if (isUnread) markNotificationAsRead(n.id);
                            setShowNotifications(false);
                            if (n.actionUrl) router.push(n.actionUrl);
                          }}
                          className={cn(
                            "p-3.5 transition-colors cursor-pointer flex items-start gap-3 group relative",
                            isUnread ? "bg-[#FAFAFA] hover:bg-[#F4F4F4]" : "hover:bg-[#FAFAFA]"
                          )}
                        >
                          <div className="w-8 h-8 rounded-full bg-[#090909] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {n.actorName ? n.actorName.charAt(0) : "A"}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-[#090909] leading-tight truncate">
                                {n.title}
                              </p>
                              <span className="text-[10px] text-[#737373] shrink-0">
                                {n.timestamp || "Recent"}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#555555] mt-1 line-clamp-2 leading-relaxed">
                              {n.description}
                            </p>
                          </div>
                          {isUnread && (
                            <span
                              className="w-2 h-2 rounded-full bg-[#090909] shrink-0 mt-2"
                              title="Unread notification"
                            />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-10 text-center text-xs text-[#737373]">
                      No {notifFilter === "unread" ? "unread" : ""} notifications right now.
                    </div>
                  )}
                </div>

                {/* Footer Link */}
                <div className="p-2 border-t border-[#E7E7E7] bg-white text-center">
                  <Link
                    href="/messages"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-semibold text-[#090909] hover:underline inline-flex items-center gap-1.5 py-1"
                  >
                    <span>View Direct Messages</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Mobile Search Drawer */}
      {mobileSearchOpen && (
        <div className="md:hidden pt-2 border-t border-[#E7E7E7] animate-in fade-in duration-150">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]"
            />
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleExecuteSearch(searchQuery);
                }
              }}
              placeholder="Search alumni, companies, skills..."
              className="w-full h-9 pl-9 pr-8 rounded-full text-xs bg-[#F4F4F4] border border-[#090909] focus:outline-none text-[#090909]"
            />
            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]"
              aria-label="Close search"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
