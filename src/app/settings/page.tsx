"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
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
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadUserSettings,
  saveUserSettings,
  resetUserSettings,
} from "@/lib/dashboard-storage";
import { currentStudent, initialUserSettings } from "@/lib/mock-data";
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
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <DashboardNav studentName={student.name} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <Settings size={13} />
                User Preferences
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-medium text-gray-500">Student Account</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Platform Settings
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your personal credentials, privacy rules, career targets, and alert preferences.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs inline-flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              Reset All
            </Button>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Info size={15} className="text-blue-600 shrink-0" />
            <span>
              <strong>Local Configuration:</strong> Preference changes are persisted in local browser storage and synchronize across the Dashboard, Mentorship, and Messages modules. In production, these changes will sync to the central PostgreSQL database.
            </span>
          </div>
        </div>

        {/* Settings Layout: Left Tabs Sidebar + Right Form Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Navigation Sidebar */}
          <div className="bg-white rounded-2xl border border-gray-200 p-2 sm:p-3 shadow-2xs space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-2xs"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon size={15} className={isActive ? "text-blue-600" : "text-gray-400"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Settings Main Form Pane (3 Cols) */}
          <form
            onSubmit={handleSave}
            className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-2xs space-y-6"
          >
            {/* 1. ACCOUNT SECTION */}
            {activeTab === "account" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">1. Account Credentials &amp; Access</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your institutional authentication status and login information.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Registered University Email
                    </label>
                    <input
                      type="email"
                      disabled
                      value={formData.account.email}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 px-3.5 py-2.5 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-gray-400">
                      Managed by University of Technology Single Sign-On (SSO).
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-700 block">
                      Account Role &amp; Tier
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Student Member (Active)"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 px-3.5 py-2.5 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-gray-400">
                      Active since {formData.account.accountCreatedAt}.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">Session Management</h3>
                    <p className="text-[11px] text-gray-500">Sign out of your active demo session.</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 inline-flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <LogOut size={13} />
                    <span>Log Out of Account</span>
                  </Button>
                </div>
              </div>
            )}

            {/* 2. PROFILE SECTION */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">2. Student Profile Details</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Information visible to alumni mentors and peers in directory searches.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="student-name" className="text-xs font-semibold text-gray-700 block">
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
                      className="w-full rounded-xl border border-gray-200 bg-white text-xs text-gray-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="student-department" className="text-xs font-semibold text-gray-700 block">
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
                      className="w-full rounded-xl border border-gray-200 bg-white text-xs text-gray-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="academic-year" className="text-xs font-semibold text-gray-700 block">
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
                      className="w-full rounded-xl border border-gray-200 bg-white text-xs text-gray-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="First Year">First Year (Freshman)</option>
                      <option value="Second Year">Second Year (Sophomore)</option>
                      <option value="Third Year">Third Year (Junior)</option>
                      <option value="Final Year">Final Year (Senior)</option>
                      <option value="Graduate Student">Graduate Student (Masters / PhD)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="grad-year" className="text-xs font-semibold text-gray-700 block">
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
                      className="w-full rounded-xl border border-gray-200 bg-white text-xs text-gray-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="bio-text" className="text-xs font-semibold text-gray-700 block">
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
                    className="w-full rounded-xl border border-gray-200 bg-white text-xs text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 3. CAREER PREFERENCES */}
            {activeTab === "career" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">3. Career &amp; Mentorship Preferences</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Shapes your personalized roadmap, alumni recommendations, and assistant prompts.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="target-role-pref" className="text-xs font-semibold text-gray-700 block">
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
                    className="w-full rounded-xl border border-gray-200 bg-white text-xs text-gray-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Full-Stack Software Engineer, Machine Learning Engineer"
                  />
                </div>

                {/* Preferred Technical Skills */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Technical Skills Focus Inventory
                  </label>
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {formData.careerPreferences.preferredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs font-medium text-blue-800"
                      >
                        <span>{sk}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="text-blue-500 hover:text-blue-800"
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
                      className="flex-1 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddSkill}
                      className="text-xs"
                    >
                      Add Skill
                    </Button>
                  </div>
                </div>

                {/* Preferred Industries */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 block">
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
                          className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
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
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-gray-800 font-medium">{ind}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. NOTIFICATION PREFERENCES */}
            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">4. Notification Alerts &amp; Digest</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Control which platform events trigger in-app bell indicators and email notifications.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      key: "mentorshipRequests" as const,
                      title: "Mentorship Inquiries & Updates",
                      description: "Alert me when a mentor accepts, declines, or sends a response to my request.",
                    },
                    {
                      key: "messages" as const,
                      title: "Direct Messages",
                      description: "Notify me when a mentor or mentee sends a new chat message.",
                    },
                    {
                      key: "careerReminders" as const,
                      title: "Career Roadmap Milestones",
                      description: "Send reminders for active roadmap stages and capstone project deliverables.",
                    },
                    {
                      key: "weeklyDigest" as const,
                      title: "Weekly Network Digest",
                      description: "Summary of new alumni mentors matching your target role and skills.",
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-start justify-between p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50/70 transition-colors cursor-pointer gap-4"
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-gray-900 block">{item.title}</span>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{item.description}</p>
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
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* 5. PRIVACY SECTION */}
            {activeTab === "privacy" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">5. Privacy &amp; Directory Visibility</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Determine who can find your profile and initiate contact.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 block">
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
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            formData.privacy.profileVisibility === opt.id
                              ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500"
                              : "border-gray-200 hover:bg-gray-50"
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
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-xs font-bold text-gray-900">{opt.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-snug">{opt.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-gray-700 block">
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
                      className="w-full rounded-xl border border-gray-200 bg-white text-xs text-gray-900 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open for Mentorship Inquiries</option>
                      <option value="busy">Limited Availability (Exam / Project Period)</option>
                      <option value="closed">Not Currently Seeking Mentorship</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 6. APPEARANCE SECTION */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="pb-4 border-b border-gray-100">
                  <h2 className="text-base font-bold text-gray-900">6. Appearance &amp; Display Theme</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Customize your color scheme preference and interface density.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold text-gray-700 block">
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
                          onClick={() =>
                            setFormData({
                              ...formData,
                              appearance: { ...formData.appearance, theme: item.id },
                            })
                          }
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2.5 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 font-bold text-blue-900"
                              : "border-gray-200 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon size={20} className={isSelected ? "text-blue-600" : "text-gray-400"} />
                          <span className="text-xs">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <div>
                      <span className="text-xs font-bold text-gray-900 block">Compact Card Density</span>
                      <p className="text-[11px] text-gray-500">Reduce vertical card paddings in alumni search and dashboards.</p>
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
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Save Action Footer */}
            <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                Changes saved here persist in your local browser state.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="px-6 py-2.5 text-xs font-semibold inline-flex items-center gap-2 shadow-2xs"
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">Sign Out of AlumniPath?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              You will be redirected to the sign in page. Your mock profile and saved demo activity will remain stored in this browser.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  router.push("/login");
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/mentorship" className="hover:text-gray-900 transition-colors">
              Mentorships
            </Link>
            <Link href="/messages" className="hover:text-gray-900 transition-colors">
              Messages
            </Link>
            <Link href="/career-roadmap" className="hover:text-gray-900 transition-colors">
              Career Roadmap
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
