"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  MessageSquare,
  Sparkles,
  Briefcase,
  GraduationCap,
  MapPin,
  Globe,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Award,
  Users,
  Code2,
  FolderGit2,
  BookOpen,
  Bookmark,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { SendMessageModal } from "@/components/alumni/SendMessageModal";
import {
  currentStudent,
  initialMentorshipActivity,
} from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadMentorshipActivity,
  saveMentorshipActivity,
  addNotification,
} from "@/lib/dashboard-storage";
import type { Alumni, MentorshipActivityData, Conversation } from "@/types";

interface AlumniProfileClientProps {
  alumni: Alumni & { experienceYears?: string; coverUrl?: string };
}

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80";

export function AlumniProfileClient({ alumni }: AlumniProfileClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "experience" | "guidance" | "reviews" | "qa">("overview");

  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );
  const mentorshipData = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast("Profile link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleSendMessage = (newConv: Conversation) => {
    const updated: MentorshipActivityData = {
      ...mentorshipData,
      recentConversations: [
        newConv,
        ...mentorshipData.recentConversations.filter((c) => c.participantId !== alumni.id),
      ],
    };
    saveMentorshipActivity(updated);
    addNotification({
      id: `notif-${Date.now()}`,
      type: "message",
      title: `Guidance request sent to ${alumni.name}`,
      description: `Note: "${newConv.lastMessage.slice(0, 60)}..."`,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: `/messages?participantId=${alumni.id}`,
      actorName: alumni.name,
    });
    showToast(`Guidance inquiry dispatched to ${alumni.name}!`);
  };

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

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title="Mentor Profile"
          subtitle={`${alumni.name} · ${alumni.role} at ${alumni.company}`}
        />

        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#090909] text-white text-xs shadow-lg border border-[#242424] animate-in fade-in duration-150"
          >
            <CheckCircle2 size={14} className="text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Breadcrumb Back Link */}
          <div>
            <Link
              href="/alumni"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#090909] transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Alumni Directory
            </Link>
          </div>

          {/* Panoramic Grayscale Cover & Header Card (Matching Reference 3) */}
          <div className="bg-white rounded-3xl border border-[#E7E7E7] overflow-hidden shadow-xs">
            {/* Panoramic Architectural Cover Banner */}
            <div className="h-44 sm:h-56 bg-[#E7E7E7] relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={alumni.coverUrl || DEFAULT_COVER}
                alt="Architectural Cover"
                className="w-full h-full object-cover grayscale contrast-110"
              />
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[#090909] border border-[#E7E7E7] shadow-xs">
                  Class of {alumni.graduationYear}
                </span>
              </div>
            </div>

            {/* Overlapping Avatar & Header Metadata */}
            <div className="px-6 sm:px-8 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-14 sm:-mt-16 mb-5 gap-4">
                <div className="relative">
                  <Avatar
                    name={alumni.name}
                    src={alumni.avatar}
                    size="xl"
                    className="h-28 w-28 sm:h-32 sm:w-32 ring-4 ring-white bg-white shadow-md shrink-0 text-3xl font-bold"
                  />
                  {alumni.isVerified && (
                    <span
                      title="Verified Alumni"
                      className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#090909] text-white flex items-center justify-center text-xs font-bold ring-2 ring-white"
                    >
                      ✓
                    </span>
                  )}
                </div>

                {/* Primary Action Buttons (Matching Reference 3) */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsMessageModalOpen(true)}
                    className="rounded-full px-6 text-xs h-10 font-semibold"
                  >
                    <MessageSquare size={14} className="mr-1.5" />
                    Request Guidance
                  </Button>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => {
                      setIsSaved(!isSaved);
                      showToast(isSaved ? "Mentor removed from saved list" : "Mentor saved to your list!");
                    }}
                    className="rounded-full px-4 text-xs h-10 font-medium"
                  >
                    <Bookmark size={14} className={`mr-1.5 ${isSaved ? "fill-current" : ""}`} />
                    {isSaved ? "Saved" : "Save Mentor"}
                  </Button>

                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleShareProfile}
                    className="rounded-full px-3 text-xs h-10 font-medium text-[#737373] hover:text-[#090909]"
                  >
                    {copiedLink ? <Check size={14} className="mr-1" /> : <Share2 size={14} />}
                    {copiedLink ? "Copied" : "Share"}
                  </Button>
                </div>
              </div>

              {/* Title & Core Details */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#090909] tracking-tight">
                    {alumni.name}
                  </h1>
                  {alumni.matchScore && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]">
                      <Sparkles size={11} className="text-[#090909]" />
                      {alumni.matchScore}% Match for you
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-[#242424]">
                  {alumni.role} <span className="text-[#737373] font-normal">at</span>{" "}
                  <strong className="text-[#090909]">{alumni.company}</strong>
                </p>

                <p className="text-xs text-[#555555] max-w-2xl leading-relaxed">
                  {alumni.headline}
                </p>

                {/* Sub-meta tags */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#737373] pt-2">
                  <span className="flex items-center gap-1">
                    <GraduationCap size={13} className="text-[#090909]" />
                    {alumni.degree || alumni.department} · Class of {alumni.graduationYear}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#090909]" />
                    {alumni.location}
                  </span>
                  {alumni.industry && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={13} className="text-[#090909]" />
                        {alumni.industry}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Highlights Strip (Matching Reference 3) */}
              <div className="pt-4 mt-5 border-t border-[#E7E7E7] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-base sm:text-lg font-extrabold text-[#090909] block">
                    {alumni.responseRate}%
                  </span>
                  <span className="text-[11px] text-[#737373]">Response Rate</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-extrabold text-[#090909] block">
                    {alumni.averageResponseTime}
                  </span>
                  <span className="text-[11px] text-[#737373]">Avg Reply Time</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-extrabold text-[#090909] block">
                    {alumni.totalMentees || 15}
                  </span>
                  <span className="text-[11px] text-[#737373]">Sessions Hosted</span>
                </div>
                <div>
                  <span className="text-base sm:text-lg font-extrabold text-[#090909] block">
                    Top 1%
                  </span>
                  <span className="text-[11px] text-[#737373]">Collegiate Rating</span>
                </div>
              </div>
            </div>

            {/* Profile Navigation Tabs (Matching Reference 3) */}
            <div className="px-6 sm:px-8 border-t border-[#E7E7E7] bg-[#FAFAFA] flex items-center gap-1 overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "experience", label: "Experience" },
                { id: "guidance", label: "Guidance Areas" },
                { id: "reviews", label: "Reviews (28)" },
                { id: "qa", label: "Q&A" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all shrink-0 ${
                      isActive
                        ? "border-[#090909] text-[#090909]"
                        : "border-transparent text-[#737373] hover:text-[#090909]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content & Right Rail Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Columns */}
            <div className="lg:col-span-8 space-y-6">
              {/* About Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-[#090909] uppercase tracking-wider">
                  About {alumni.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#454545] leading-relaxed whitespace-pre-line">
                  {alumni.bio}
                </p>

                {alumni.linkedinUrl && (
                  <div className="pt-3 border-t border-[#E7E7E7] flex items-center justify-between">
                    <span className="text-xs text-[#737373]">Verified Professional Profile</span>
                    <a
                      href={alumni.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#090909] hover:underline"
                    >
                      <Globe size={13} />
                      View LinkedIn Profile
                      <ExternalLink size={11} className="text-[#737373]" />
                    </a>
                  </div>
                )}
              </div>

              {/* Professional Experience */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-[#090909] uppercase tracking-wider">
                  Professional Experience
                </h3>
                {alumni.workExperience && alumni.workExperience.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E7E7E7]">
                    {alumni.workExperience.map((exp, idx) => (
                      <div key={exp.id || idx} className="relative">
                        <div
                          className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                            exp.current ? "border-[#090909] bg-[#090909]" : "border-[#A8A8A8]"
                          }`}
                        />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-xs font-bold text-[#090909]">
                              {exp.role} · <span className="font-semibold">{exp.company}</span>
                            </h4>
                            <span className="text-[11px] font-medium text-[#737373] bg-[#F4F4F4] px-2 py-0.5 rounded-full">
                              {exp.startYear} – {exp.current ? "Present" : exp.endYear}
                            </span>
                          </div>
                          {exp.description && (
                            <p className="text-xs text-[#555555] leading-relaxed pt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#737373]">No experience listed.</p>
                )}
              </div>

              {/* Projects */}
              {alumni.projects && alumni.projects.length > 0 && (
                <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-[#090909] uppercase tracking-wider">
                    Featured Systems &amp; Projects
                  </h3>
                  <div className="space-y-3">
                    {alumni.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] space-y-2"
                      >
                        <h4 className="text-xs font-bold text-[#090909]">{proj.title}</h4>
                        <p className="text-xs text-[#555555] leading-relaxed">
                          {proj.description}
                        </p>
                        {proj.techStack && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] font-medium bg-white border border-[#E7E7E7] text-[#242424] px-2 py-0.5 rounded-full"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Guidance Rail & Skills (Matching Reference 3) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Areas of Guidance Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                    Areas of Guidance
                  </h3>
                  <Badge variant="dark" size="sm">
                    Verified Mentorship
                  </Badge>
                </div>

                <ul className="space-y-2 text-xs text-[#242424]">
                  {alumni.mentorshipAreas.map((area, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-[#090909] shrink-0 mt-0.5" />
                      <span>{area}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  onClick={() => setIsMessageModalOpen(true)}
                  className="rounded-full text-xs mt-3"
                >
                  Request Guidance Note
                </Button>
              </div>

              {/* Technical Skills */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909] pb-2 border-b border-[#E7E7E7]">
                  Technical Skills
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {alumni.skills.map((skill) => (
                    <span
                      key={skill.id || skill.name}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-[#E7E7E7] bg-[#F4F4F4] text-[#090909]"
                    >
                      <span>{skill.name}</span>
                      {skill.level && (
                        <span className="text-[10px] text-[#737373] capitalize">
                          · {skill.level}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909] pb-2 border-b border-[#E7E7E7]">
                  Education History
                </h3>
                {alumni.education?.map((edu, idx) => (
                  <div key={idx} className="space-y-0.5 text-xs">
                    <p className="font-bold text-[#090909]">{edu.institution}</p>
                    <p className="text-[#555555]">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-[11px] text-[#737373]">Class of {edu.graduationYear}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Guidance Request Modal */}
      <SendMessageModal
        isOpen={isMessageModalOpen}
        alumni={alumni}
        onClose={() => setIsMessageModalOpen(false)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
