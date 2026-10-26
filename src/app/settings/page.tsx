"use client";

import { useState, useEffect, useSyncExternalStore, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Shield,
  Bell,
  Briefcase,
  Palette,
  CheckCircle2,
  RotateCcw,
  LogOut,
  Info,
  Save,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadAlumniProfile,
  loadAuthSession,
  loadUserSettings,
  saveUserSettings,
  resetUserSettings,
  applyTheme,
  loadCurrentTheme,
  type ThemeMode,
  defaultStudentSession,
  logoutAuthSession,
  clearUserSessionData,
} from "@/lib/dashboard-storage";
import { createClient } from "@/lib/supabase/client";
import { currentStudent, defaultAlumniUser, initialUserSettings } from "@/lib/mock-data";
import type { UserSettings } from "@/types";

type SectionTab =
  | "account"
  | "profile"
  | "career"
  | "notifications"
  | "privacy"
  | "appearance";

export default function SettingsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const authSession = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAuthSession,
    () => defaultStudentSession
  );
  const isAlumni = authSession.role === "alumni";

  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const alumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
  );

  const initialSettings = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadUserSettings,
    () => initialUserSettings
  );

  const [activeTab, setActiveTab] = useState<SectionTab>("account");
  const [formData, setFormData] = useState<UserSettings>(initialSettings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    setFormData(initialSettings);
  }, [initialSettings]);

  useEffect(() => {
    // Keep local form data in sync if theme is switched externally (e.g. from AppHeader)
    const handleCustomThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.theme) {
        setFormData((prev) => ({
          ...prev,
          appearance: { ...prev.appearance, theme: detail.theme },
        }));
      }
    };
    window.addEventListener("alumnipath-theme-change", handleCustomThemeChange);
    return () => window.removeEventListener("alumnipath-theme-change", handleCustomThemeChange);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectTheme = (theme: ThemeMode) => {
    const updated: UserSettings = {
      ...formData,
      appearance: {
        ...formData.appearance,
        theme,
      },
    };
    setFormData(updated);
    applyTheme(theme);
    saveUserSettings(updated);
    showToast(
      `Theme switched to ${
        theme === "dark" ? "Dark Mode" : theme === "light" ? "Light Mode" : "System Default"
      }`
    );
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    saveUserSettings(formData);
    showToast("Settings and preferences saved successfully (persisted in demo storage).");
  };

  const handleReset = () => {
    const res = resetUserSettings();
    setFormData(res);
    showToast("All settings restored to default sample values.");
  };

  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    const current = formData.careerPreferences.preferredSkills;
    if (!current.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        careerPreferences: {
          ...formData.careerPreferences,
          preferredSkills: [...current, skillInput.trim()],
        },
      });
    }
    setSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      careerPreferences: {
        ...formData.careerPreferences,
        preferredSkills: formData.careerPreferences.preferredSkills.filter(
          (s) => s !== skillToRemove
        ),
      },
    });
  };

  const tabs = [
    { id: "account" as SectionTab, label: "Account", icon: User },
    { id: "profile" as SectionTab, label: "Profile", icon: User },
    { id: "career" as SectionTab, label: "Career Preferences", icon: Briefcase },
    { id: "notifications" as SectionTab, label: "Notification Preferences", icon: Bell },
    { id: "privacy" as SectionTab, label: "Privacy & Visibility", icon: Shield },
    { id: "appearance" as SectionTab, label: "Appearance", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex antialiased text-[#090909]">
      {/* App Sidebar (Desktop) */}
      <AppSidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
          <div className="relative w-64 h-full bg-white">
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title="Platform Settings"
          subtitle={isAlumni ? "Verified Alumni Mentor Account Configuration" : "Student Account & Preferences"}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#090909] text-white text-xs shadow-lg border border-[#242424] animate-in fade-in duration-200"
          >
            <CheckCircle2 size={14} className="text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E7E7E7]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F4F4] text-[#090909] border border-[#090909]/20">
                <Settings size={13} />
                User Preferences
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-normal text-[#737373]">
                {isAlumni ? "Verified Alumni Mentor Account" : "Student Account"}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#090909]">
              Platform Settings
            </h1>
            <p className="text-sm text-[#737373] mt-0.5">
              Manage your personal credentials, privacy rules, career targets, and alert preferences.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs inline-flex items-center gap-1.5 rounded-full"
            >
              <RotateCcw size={12} />
              Reset All
            </Button>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="p-3.5 bg-white border border-[#E7E7E7] rounded-lg flex items-center justify-between gap-3 text-xs text-[#737373] shadow-xs">
          <div className="flex items-center gap-2">
            <Info size={15} className="text-[#090909] shrink-0" />
            <span>
              <strong className="text-[#090909]">Local Configuration:</strong> Preference changes are persisted in local browser storage and synchronize across the Dashboard, Messages, and Career modules. In production, these changes will sync to the central PostgreSQL database.
            </span>
          </div>
        </div>

        {/* Settings Layout: Left Tabs Sidebar + Right Form Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">
          {/* Navigation Sidebar */}
          <div className="bg-white rounded-lg border border-[#E7E7E7] p-1.5 shadow-xs space-y-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all text-left ${
                    isActive
                      ? "bg-[#F4F4F4] text-[#090909] font-semibold"
                      : "text-[#737373] hover:text-[#090909] hover:bg-[#FAFAFA]"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-[#090909]" : "text-gray-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Main Form Pane (3 Cols) */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-3 bg-white rounded-lg border border-[#E7E7E7] p-5 sm:p-7 shadow-xs space-y-5"
          >
            {/* 1. ACCOUNT SECTION */}
            {activeTab === "account" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-[#E7E7E7]">
                  <h2 className="text-base font-bold text-[#090909]">1. Account Credentials &amp; Access</h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Your institutional authentication status and login information.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#090909] block">
                      Registered University Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={isAlumni ? (authSession.email || "marcus.vance@datadog.com") : formData.account.email}
                      className="w-full rounded-md border border-[#E7E7E7] bg-[#FAFAFA] text-xs text-[#737373] px-3 py-2 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-[#737373]">
                      {isAlumni
                        ? "Verified corporate & institutional address."
                        : "Managed by University of Technology Single Sign-On (SSO)."}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#090909] block">
                      Account Role &amp; Tier
                    </label>
                    <input
                      type="text"
                      disabled
                      value={isAlumni ? `Alumni Mentor · ${alumni.company}` : "Student Member (Active)"}
                      className="w-full rounded-md border border-[#E7E7E7] bg-[#FAFAFA] text-xs text-[#737373] px-3 py-2 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-[#737373]">
                      {isAlumni
                        ? `Class of ${alumni.graduationYear} · ${alumni.department}`
                        : `Active since ${formData.account.accountCreatedAt}.`}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E7E7E7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-[#090909]">Session Management</h3>
                    <p className="text-[11px] text-[#737373]">Sign out of your active demo session.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="text-xs text-[#090909] hover:text-[#090909] hover:bg-[#F4F4F4] border-[#E7E7E7] inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full"
                  >
                    <LogOut size={13} />
                    <span>Log Out of Account</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 2. PROFILE SECTION */}
            {activeTab === "profile" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-[#E7E7E7]">
                  <h2 className="text-base font-bold text-[#090909]">2. Student Profile Details</h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Information visible to alumni mentors and peers in directory searches.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="student-name" className="text-xs font-semibold text-[#090909] block">
                      Full Name
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      value={formData.profile.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, name: e.target.value },
                        })
                      }
                      className="w-full rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3 py-2 h-9 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="student-department" className="text-xs font-semibold text-[#090909] block">
                      Academic Department / Major
                    </label>
                    <input
                      id="student-department"
                      type="text"
                      value={formData.profile.department}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, department: e.target.value },
                        })
                      }
                      className="w-full rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3 py-2 h-9 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="academic-year" className="text-xs font-semibold text-[#090909] block">
                      Current Academic Year
                    </label>
                    <select
                      id="academic-year"
                      value={formData.profile.academicYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: { ...formData.profile, academicYear: e.target.value },
                        })
                      }
                      className="w-full rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3 py-2 h-9 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    >
                      <option value="First Year">First Year (Freshman)</option>
                      <option value="Second Year">Second Year (Sophomore)</option>
                      <option value="Third Year">Third Year (Junior)</option>
                      <option value="Final Year">Final Year (Senior)</option>
                      <option value="Graduate Student">Graduate Student (Masters / PhD)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="grad-year" className="text-xs font-semibold text-[#090909] block">
                      Expected Graduation Year
                    </label>
                    <input
                      id="grad-year"
                      type="number"
                      value={formData.profile.graduationYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          profile: {
                            ...formData.profile,
                            graduationYear: parseInt(e.target.value, 10) || 2027,
                          },
                        })
                      }
                      className="w-full rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3 py-2 h-9 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bio-text" className="text-xs font-semibold text-[#090909] block">
                    Bio &amp; Personal Background
                  </label>
                  <textarea
                    id="bio-text"
                    rows={3}
                    value={formData.profile.bio}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profile: { ...formData.profile, bio: e.target.value },
                      })
                    }
                    className="w-full rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] p-3 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909] leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 3. CAREER PREFERENCES */}
            {activeTab === "career" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-[#E7E7E7]">
                  <h2 className="text-base font-bold text-[#090909]">
                    {isAlumni ? "3. Mentorship & Professional Preferences" : "3. Career & Networking Preferences"}
                  </h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Shapes your personalized roadmap, alumni recommendations, and assistant prompts.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="target-role-pref" className="text-xs font-semibold text-[#090909] block">
                    Target Primary Career Role
                  </label>
                  <input
                    id="target-role-pref"
                    type="text"
                    value={formData.careerPreferences.targetRole}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        careerPreferences: {
                          ...formData.careerPreferences,
                          targetRole: e.target.value,
                        },
                      })
                    }
                    className="w-full rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3 py-2 h-9 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    placeholder="e.g. Full-Stack Software Engineer, Machine Learning Engineer"
                  />
                </div>

                {/* Preferred Technical Skills */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#090909] block">
                    Technical Skills Focus Inventory
                  </label>
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {formData.careerPreferences.preferredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F4F4F4] border border-[#090909]/20 text-xs font-medium text-[#090909]"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="text-[#090909] hover:text-[#242424]"
                          title="Remove skill"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                      placeholder="Add a skill (e.g. Kubernetes, TypeScript, Go)..."
                      className="flex-1 rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3 py-2 h-9 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSkill}
                      className="text-xs rounded-full"
                    >
                      Add Skill
                    </Button>
                  </div>
                </div>

                {/* Preferred Industries */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#090909] block">
                    Preferred Industries
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      "Cloud Computing & SaaS",
                      "Developer Tooling & DevOps",
                      "Artificial Intelligence & ML",
                      "Fintech & Payments",
                      "E-Commerce & Marketplaces",
                      "Cybersecurity & Infrastructure",
                    ].map((ind) => {
                      const isChecked =
                        formData.careerPreferences.preferredIndustries.includes(ind);
                      return (
                        <label
                          key={ind}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-[#E7E7E7] hover:bg-[#FAFAFA] cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const list = formData.careerPreferences.preferredIndustries;
                              const updated = e.target.checked
                                ? [...list, ind]
                                : list.filter((item) => item !== ind);
                              setFormData({
                                ...formData,
                                careerPreferences: {
                                  ...formData.careerPreferences,
                                  preferredIndustries: updated,
                                },
                              });
                            }}
                            className="rounded border-[#E7E7E7] text-[#090909] focus:ring-[#090909]"
                          />
                          <span className="text-[#090909] font-medium">{ind}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATION PREFERENCES */}
            {activeTab === "notifications" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-[#E7E7E7]">
                  <h2 className="text-base font-bold text-[#090909]">4. Notification Alerts &amp; Digest</h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Control which platform events trigger in-app bell indicators and email notifications.
                  </p>
                </div>

                <div className="space-y-3">
                  {(isAlumni
                    ? [
                        {
                          key: "mentorshipRequests" as const,
                          title: "Mentorship Inquiries & Updates",
                          description: "Alert me when a student submits or updates a mentorship inquiry.",
                        },
                        {
                          key: "messages" as const,
                          title: "Direct Messages",
                          description: "Notify me when a student or mentee sends a new chat message.",
                        },
                        {
                          key: "careerReminders" as const,
                          title: "Mentorship Session Reminders",
                          description: "Send reminders for upcoming scheduled mentorship sessions.",
                        },
                        {
                          key: "weeklyDigest" as const,
                          title: "Weekly Network Digest",
                          description: "Summary of new student mentees matching your industry expertise.",
                        },
                      ]
                    : [
                        {
                          key: "messages" as const,
                          title: "Direct Messages",
                          description: "Notify me when an alumnus sends a new chat message.",
                        },
                        {
                          key: "careerReminders" as const,
                          title: "Career Roadmap Milestones",
                          description: "Send reminders for active roadmap stages and capstone project deliverables.",
                        },
                        {
                          key: "weeklyDigest" as const,
                          title: "Weekly Network Digest",
                          description: "Summary of new alumni profiles matching your target career role.",
                        },
                      ]
                  ).map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start justify-between p-3.5 rounded-lg border border-[#E7E7E7] hover:bg-[#FAFAFA]/70 transition-colors cursor-pointer gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#090909] block">{item.title}</span>
                        <p className="text-[11px] text-[#737373] leading-relaxed">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notificationPreferences[item.key]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notificationPreferences: {
                              ...formData.notificationPreferences,
                              [item.key]: e.target.checked,
                            },
                          })
                        }
                        className="mt-1 h-4 w-4 rounded border-[#E7E7E7] text-[#090909] focus:ring-[#090909] shrink-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 5. PRIVACY SECTION */}
            {activeTab === "privacy" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-[#E7E7E7]">
                  <h2 className="text-base font-bold text-[#090909]">5. Privacy &amp; Directory Visibility</h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Determine who can find your profile and initiate contact.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#090909] block">
                      Profile Discoverability
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "public", title: "Public to Alumni", desc: "All verified alumni can find and view your profile." },
                        { id: "university_only", title: "University Only", desc: "Only students and alumni from your institution." },
                        { id: "private", title: "Private", desc: "Only alumni you explicitly contact can view your profile." },
                      ].map((opt) => (
                        <label
                          key={opt.id}
                          className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                            formData.privacy.profileVisibility === opt.id
                              ? "border-[#090909] bg-[#F4F4F4]/40 ring-1 ring-[#090909]"
                              : "border-[#E7E7E7] hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={opt.id}
                              checked={formData.privacy.profileVisibility === opt.id}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  privacy: {
                                    ...formData.privacy,
                                    profileVisibility: e.target.value as "public" | "university_only" | "private",
                                  },
                                })
                              }
                              className="text-[#090909] focus:ring-[#090909]"
                            />
                            <span className="text-xs font-bold text-[#090909]">{opt.title}</span>
                          </div>
                          <p className="text-[11px] text-[#737373] leading-snug">{opt.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  {isAlumni && (
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-semibold text-[#090909] block">
                        Mentorship Availability Status
                      </label>
                      <select
                        value={formData.privacy.mentorshipAvailability}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            privacy: {
                              ...formData.privacy,
                              mentorshipAvailability: e.target.value as "open" | "busy" | "closed",
                            },
                          })
                        }
                        className="w-full rounded-md border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3 py-2 h-9 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                      >
                        <option value="open">Open for Mentorship Inquiries</option>
                        <option value="busy">Limited Availability (Exam / Project Period)</option>
                        <option value="closed">Not Currently Seeking Mentorship</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 6. APPEARANCE SECTION */}
            {activeTab === "appearance" && (
              <div className="space-y-5 animate-in fade-in duration-150">
                <div className="pb-3 border-b border-[#E7E7E7]">
                  <h2 className="text-base font-bold text-[#090909]">6. Appearance &amp; Display Theme</h2>
                  <p className="text-xs text-[#737373] mt-0.5">
                    Customize your color scheme preference and interface density.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-[#090909] block">
                    Color Theme Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "light" as const, label: "Light Mode", icon: Sun },
                      { id: "dark" as const, label: "Dark Mode", icon: Moon },
                      { id: "system" as const, label: "System Default", icon: Monitor },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isSelected = formData.appearance.theme === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectTheme(item.id)}
                          className={`p-3.5 rounded-lg border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#090909] bg-[#F4F4F4]/40 ring-1 ring-[#090909] font-bold text-[#090909]"
                              : "border-[#E7E7E7] text-[#090909] hover:bg-[#FAFAFA]"
                          }`}
                        >
                          <Icon size={18} className={isSelected ? "text-[#090909]" : "text-gray-400"} />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center justify-between p-3.5 rounded-lg border border-[#E7E7E7] hover:bg-[#FAFAFA] cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-[#090909] block">Compact Card Density</span>
                      <p className="text-[11px] text-[#737373]">Reduce vertical card paddings in alumni search and dashboards.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.appearance.compactMode}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          appearance: {
                            ...formData.appearance,
                            compactMode: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 rounded border-[#E7E7E7] text-[#090909] focus:ring-[#090909]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Save Action Footer */}
            <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
              <span className="text-[11px] text-[#737373]">
                Changes saved here persist in your local browser state.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="px-6 py-2 text-xs font-semibold inline-flex items-center gap-2 rounded-full bg-[#090909] hover:bg-[#242424] shadow-xs"
              >
                <Save size={14} />
                <span>Save All Changes</span>
              </Button>
            </div>
          </form>
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E7E7E7] max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#090909]">Sign Out of AlumniPath?</h3>
            <p className="text-xs text-[#737373] leading-relaxed">
              You will be redirected to the sign in page. Your mock profile and saved demo activity will remain stored in this browser.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  setShowLogoutConfirm(false);
                  try {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                  } catch (e) {
                    console.warn("SignOut error:", e);
                  }
                  clearUserSessionData();
                  logoutAuthSession();
                  router.push("/login");
                }}
                className="bg-[#090909] hover:bg-red-800 text-white rounded-full"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
