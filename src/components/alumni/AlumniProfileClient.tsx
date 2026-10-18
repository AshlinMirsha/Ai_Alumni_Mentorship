"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  Briefcase,
  GraduationCap,
  MapPin,
  Globe,
  ShieldCheck,
  Check,
  ExternalLink,
  Award,
  Users,
  Code2,
  FolderGit2,
  BookOpen,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { MentorshipRequestModal } from "@/components/dashboard/MentorshipRequestModal";
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
import type { Alumni, Mentorship, MentorshipActivityData, Conversation } from "@/types";

interface AlumniProfileClientProps {
  alumni: Alumni & { experienceYears?: string };
}

export function AlumniProfileClient({ alumni }: AlumniProfileClientProps) {
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

  // Modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Status checks
  const isPending = mentorshipData.pendingRequests.some(
    (r: Mentorship) => r.alumniId === alumni.id
  );
  const isAccepted = mentorshipData.acceptedMentorships.some(
    (m: Mentorship) => m.alumniId === alumni.id
  );

  // Handle Share Profile
  const handleShareProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast("Profile link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Handle Mentorship Request Submission
  const handleSubmitMentorshipRequest = (newRequest: Mentorship) => {
    const updated: MentorshipActivityData = {
      ...mentorshipData,
      pendingRequests: [newRequest, ...mentorshipData.pendingRequests],
    };
    saveMentorshipActivity(updated);
    addNotification({
      id: `notif-${Date.now()}`,
      type: "mentorship_request",
      title: `Mentorship request sent to ${alumni.name}`,
      description: `Your request for "${newRequest.focus}" has been recorded. Check My Mentorships for status updates.`,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: "/mentorship",
      actorName: alumni.name,
    });
    showToast(`Mentorship request submitted to ${alumni.name}!`);
  };

  // Handle Sending a Direct Message
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
      title: `Message sent to ${alumni.name}`,
      description: `Message: "${newConv.lastMessage.slice(0, 60)}..."`,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: `/messages?participantId=${alumni.id}`,
      actorName: alumni.name,
    });
    showToast(`Message sent to ${alumni.name}!`);
  };

  // Availability styling
  const availabilityBadge = {
    available: {
      label: "Available for Mentorship",
      variant: "green" as const,
      dotClass: "bg-emerald-500",
    },
    limited: {
      label: "Limited Spots Available",
      variant: "amber" as const,
      dotClass: "bg-amber-500",
    },
    unavailable: {
      label: "Not Currently Accepting Mentees",
      variant: "gray" as const,
      dotClass: "bg-gray-400",
    },
  }[alumni.mentorshipAvailability];

  return (
    <div className="min-h-screen bg-[#f3f5f7] flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#191919] text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={15} className="text-[#057642] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <DashboardNav studentName={student.name} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Back Link */}
        <div>
          <Link
            href="/alumni"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Alumni Directory
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* PROFILE HEADER CARD (LinkedIn Style)                                      */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs">
          {/* Cover banner */}
          <div className="h-28 sm:h-36 bg-[#e8edf2] border-b border-gray-200 relative">
            <div className="absolute top-3 right-4 flex items-center gap-2">
              {alumni.isVerified === true && (
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-white text-[#057642] border border-[#bfe3c9] shadow-xs"
                  title="Verified Alumni Identity"
                >
                  <ShieldCheck size={12} className="text-[#057642]" />
                  Verified Alumni
                </span>
              )}
            </div>
          </div>

          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between -mt-12 sm:-mt-14 mb-4 gap-4">
              <Avatar
                name={alumni.name}
                src={alumni.avatar}
                size="xl"
                className="h-24 w-24 sm:h-28 sm:w-28 text-2xl ring-4 ring-white bg-white shadow-xs shrink-0"
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {isAccepted ? (
                  <div className="text-center py-1.5 px-3 rounded-full bg-[#eef8f1] border border-[#bfe3c9] text-xs font-semibold text-[#057642] flex items-center justify-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#057642]" />
                    Mentorship Active
                  </div>
                ) : isPending ? (
                  <div className="text-center py-1.5 px-3 rounded-full bg-[#fff8ea] border border-[#fde5b2] text-xs font-semibold text-[#915907] flex items-center justify-center gap-1.5 cursor-default">
                    <Clock size={13} className="text-[#915907]" />
                    Request Pending
                  </div>
                ) : alumni.mentorshipAvailability === "unavailable" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="rounded-full text-xs opacity-60 cursor-not-allowed"
                  >
                    Not Accepting Mentees
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsRequestModalOpen(true)}
                    className="rounded-full font-semibold bg-[#0a66c2] hover:bg-[#004182] text-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <Send size={12} />
                    Request Mentorship
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsMessageModalOpen(true)}
                  className="rounded-full font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 text-xs inline-flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={12} />
                  Message
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareProfile}
                  className="rounded-full font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs inline-flex items-center justify-center gap-1.5"
                >
                  {copiedLink ? (
                    <>
                      <Check size={12} className="text-[#057642]" />
                      <span className="text-[#057642] font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={12} />
                      Share
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  {alumni.name}
                </h1>
                {alumni.matchScore && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]">
                    <Sparkles size={11} className="text-[#0a66c2]" />
                    {alumni.matchScore}% Match
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-gray-800">
                {alumni.role} <span className="text-gray-400 font-normal">at</span>{" "}
                <span className="text-gray-900">{alumni.company}</span>
              </p>

              <p className="text-xs text-gray-600 max-w-2xl leading-relaxed">
                {alumni.headline}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <GraduationCap size={13} className="text-gray-400" />
                  {alumni.degree || alumni.department} · Class of {alumni.graduationYear}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-gray-400" />
                  {alumni.location}
                </span>
                {alumni.industry && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Briefcase size={13} className="text-gray-400" />
                      {alumni.industry}
                    </span>
                  </>
                )}
                {alumni.lastActive && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Clock size={12} />
                      {alumni.lastActive}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Mentorship Availability Status Banner */}
            <div className="pt-3.5 mt-3.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 font-medium text-gray-700">
                <span className={`h-2 w-2 rounded-full ${availabilityBadge.dotClass}`} />
                <Badge variant={availabilityBadge.variant} size="md">
                  {availabilityBadge.label}
                </Badge>
                <span className="text-gray-400 text-[11px] hidden sm:inline">·</span>
                <span className="text-gray-500 text-[11px] hidden sm:inline">
                  {alumni.totalMentees} students mentored
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-gray-500">
                <span>
                  <strong>{alumni.responseRate}%</strong> response rate
                </span>
                <span className="text-gray-300">·</span>
                <span>
                  Typically responds <strong>{alumni.averageResponseTime}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MATCH EXPLANATION                                                         */}
        {/* ========================================================================= */}
        {alumni.matchExplanation && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5 text-gray-900 font-bold text-xs">
                <Sparkles size={14} className="text-[#0a66c2] shrink-0" />
                <span>Why this mentor matches your goals</span>
              </div>
              <span className="text-[11px] font-semibold text-[#0a66c2] bg-[#ebf3fb] border border-[#b2d5f8] px-2 py-0.5 rounded">
                Match Analysis
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed">
              {alumni.matchExplanation}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Target Role
                </p>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">
                  {student.careerGoal || "Full-Stack Software Engineer"} ↔ {alumni.role}
                </p>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Shared Skills
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {alumni.skills
                    .filter((as) =>
                      student.skills.some(
                        (ss) => ss.name.toLowerCase() === as.name.toLowerCase()
                      )
                    )
                    .map((s) => (
                      <span
                        key={s.name}
                        className="text-[10px] font-medium bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8] px-1.5 py-0.2 rounded"
                      >
                        {s.name}
                      </span>
                    ))}
                  {alumni.skills.filter((as) =>
                    student.skills.some(
                      (ss) => ss.name.toLowerCase() === as.name.toLowerCase()
                    )
                  ).length === 0 && (
                    <span className="text-[11px] text-gray-500">Related tech stack</span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-md border border-gray-200">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Mentorship Focus
                </p>
                <p className="text-xs font-semibold text-gray-900 mt-0.5 truncate">
                  {alumni.mentorshipAreas[0] || "Architecture & System Design"}
                </p>
              </div>
            </div>
          </div>
        )}


        {/* ========================================================================= */}
        {/* 7 PROFILE SECTIONS (2-COLUMN GRID ON DESKTOP)                             */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. About */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">1. About</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-4 pt-3">
                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                  {alumni.bio || "No summary provided."}
                </p>

                {alumni.linkedinUrl && (
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Professional Profile</span>
                    <a
                      href={alumni.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <Globe size={13} />
                      View LinkedIn Profile
                      <ExternalLink size={11} className="text-gray-400" />
                    </a>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* 2. Professional Experience */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">2. Professional Experience</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-3">
                {alumni.workExperience && alumni.workExperience.length > 0 ? (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    {alumni.workExperience.map((exp, idx) => (
                      <div key={exp.id || idx} className="relative group">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[23px] top-1 h-3.5 w-3.5 rounded-full border-2 bg-white ${
                            exp.current
                              ? "border-blue-600 ring-2 ring-blue-100"
                              : "border-gray-400"
                          }`}
                        />

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-xs font-bold text-gray-900">
                              {exp.role} ·{" "}
                              <span className="text-gray-700 font-semibold">{exp.company}</span>
                            </h3>
                            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {exp.startYear} – {exp.current ? "Present" : exp.endYear}
                            </span>
                          </div>

                          {exp.current && (
                            <span className="inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                              Current Role
                            </span>
                          )}

                          {exp.description && (
                            <p className="text-xs text-gray-600 leading-relaxed pt-1">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No professional experience records listed.
                  </p>
                )}
              </CardBody>
            </Card>

            {/* 5. Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FolderGit2 size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">5. Featured Projects &amp; Work</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-3">
                {alumni.projects && alumni.projects.length > 0 ? (
                  <div className="space-y-3.5">
                    {alumni.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-gray-900">{proj.title}</h3>
                          {proj.url && (
                            <a
                              href={proj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                            >
                              Explore
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {proj.description}
                        </p>

                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] font-medium bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-500">
                    Portfolio projects under review or confidential proprietary work.
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Right Column / Contextual Info */}
          <div className="space-y-6">
            {/* 3. Education */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">3. Education</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-3.5 pt-3">
                {alumni.education && alumni.education.length > 0 ? (
                  alumni.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900">{edu.institution}</p>
                      <p className="text-xs text-gray-700">
                        {edu.degree} in {edu.field}
                      </p>
                      <p className="text-[11px] text-gray-400">Class of {edu.graduationYear}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No education history recorded.</p>
                )}
              </CardBody>
            </Card>

            {/* 4. Technical Skills */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Code2 size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">4. Technical Skills</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-3">
                {alumni.skills && alumni.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {alumni.skills.map((skill) => {
                      const levelColors = {
                        expert: "bg-blue-50 text-blue-800 border-blue-200",
                        advanced: "bg-indigo-50 text-indigo-800 border-indigo-200",
                        intermediate: "bg-gray-100 text-gray-800 border-gray-200",
                        beginner: "bg-gray-50 text-gray-600 border-gray-200",
                      }[skill.level || "intermediate"];

                      return (
                        <span
                          key={skill.id || skill.name}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border ${levelColors}`}
                        >
                          <span>{skill.name}</span>
                          {skill.level && (
                            <span className="text-[10px] opacity-70 capitalize">
                              · {skill.level}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">No technical skills listed.</p>
                )}
              </CardBody>
            </Card>

            {/* 6. Areas of Expertise */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">6. Areas of Expertise</h2>
                </div>
              </CardHeader>
              <CardBody className="pt-3">
                {alumni.areasOfExpertise && alumni.areasOfExpertise.length > 0 ? (
                  <ul className="space-y-2 text-xs text-gray-700">
                    {alumni.areasOfExpertise.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="text-blue-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">No expertise areas configured.</p>
                )}
              </CardBody>
            </Card>

            {/* 7. Mentorship Interests */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <h2 className="text-sm font-bold text-gray-900">7. Mentorship Interests</h2>
                </div>
              </CardHeader>
              <CardBody className="space-y-3.5 pt-3">
                <div>
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Primary Topics
                  </p>
                  {alumni.mentorshipAreas && alumni.mentorshipAreas.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {alumni.mentorshipAreas.map((area, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">General mentorship available upon request.</p>
                  )}
                </div>

                {alumni.mentorshipInterests && alumni.mentorshipInterests.length > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Specific Guidance Focus
                    </p>
                    <ul className="space-y-1.5 text-xs text-gray-600">
                      {alumni.mentorshipInterests.map((interest, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{interest}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
                  <div className="flex justify-between text-gray-600">
                    <span>Mentees Advised:</span>
                    <span className="font-semibold text-gray-900">{alumni.totalMentees}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Response Rate:</span>
                    <span className="font-semibold text-gray-900">{alumni.responseRate}%</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Average Response:</span>
                    <span className="font-semibold text-gray-900">{alumni.averageResponseTime}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      {/* Mentorship Request Modal */}
      <MentorshipRequestModal
        isOpen={isRequestModalOpen}
        alumni={alumni}
        studentName={student.name}
        studentCareerGoal={student.careerGoal || "Full-Stack Software Engineer"}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmitRequest={handleSubmitMentorshipRequest}
        isAlreadyRequested={isPending}
      />

      {/* Send Message Modal */}
      <SendMessageModal
        isOpen={isMessageModalOpen}
        alumni={alumni}
        isAccepted={isAccepted}
        isPending={isPending}
        onClose={() => setIsMessageModalOpen(false)}
        onOpenMentorshipRequest={() => setIsRequestModalOpen(true)}
        onSendMessage={handleSendMessage}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/alumni" className="hover:text-gray-900 transition-colors">
              Alumni Directory
            </Link>
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/career-roadmap" className="hover:text-gray-900 transition-colors">
              Career Roadmap
            </Link>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Platform Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
