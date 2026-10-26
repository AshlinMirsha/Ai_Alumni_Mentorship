"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Users,
  Inbox,
  UserCheck,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  Check,
  X,
  Target,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Video,
  ExternalLink,
  Edit3,
  Award,
  MapPin,
  GraduationCap,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadAlumniProfile,
  loadMentorshipActivity,
  acceptMentorshipRequest,
  declineMentorshipRequest,
  loadStudentsList,
  loadOpportunities,
  loadUpcomingSessions,
  loadUniversityEvents,
  toggleEventRsvp,
  scheduleMentorshipSession,
  rescheduleMentorshipSession,
  cancelMentorshipSession,
  completeMentorshipSession,
} from "@/lib/dashboard-storage";
import {
  defaultAlumniUser,
  initialMentorshipActivity,
  studentsData,
  initialOpportunities,
  initialUpcomingSessions,
  universityEventsData,
  mentorshipTipsData,
} from "@/lib/mock-data";
import { OfferMentorshipModal } from "@/components/alumni-dashboard/OfferMentorshipModal";
import { PostOpportunityModal } from "@/components/alumni-dashboard/PostOpportunityModal";
import { StudentDetailModal } from "@/components/alumni-dashboard/StudentDetailModal";
import { SessionDetailModal } from "@/components/alumni-dashboard/SessionDetailModal";
import { ScheduleSessionModal } from "@/components/alumni-dashboard/ScheduleSessionModal";
import { CancelSessionModal } from "@/components/alumni-dashboard/CancelSessionModal";
import { AIMentorshipAssistantModal } from "@/components/alumni-dashboard/AIMentorshipAssistantModal";
import type { DiscoverStudent, MentorshipSession, Mentorship } from "@/types";

export default function AlumniDashboardPage() {
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

  const students = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentsList,
    () => studentsData
  );

  const opportunities = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadOpportunities,
    () => initialOpportunities
  );

  const upcomingSessions = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadUpcomingSessions,
    () => initialUpcomingSessions
  );

  const universityEvents = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadUniversityEvents,
    () => universityEventsData
  );

  // Modal States
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<DiscoverStudent | null>(null);
  const [selectedStudentForOffer, setSelectedStudentForOffer] = useState<DiscoverStudent | null>(null);
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<MentorshipSession | null>(null);
  const [sessionToReschedule, setSessionToReschedule] = useState<MentorshipSession | null>(null);
  const [sessionToCancel, setSessionToCancel] = useState<MentorshipSession | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isPostOpportunityOpen, setIsPostOpportunityOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleScheduleSubmit = (sessionData: {
    studentId: string;
    studentName: string;
    studentDepartment?: string;
    studentAcademicYear?: string;
    topic: string;
    date: string;
    time: string;
    meetUrl?: string;
    agenda?: string;
  }) => {
    const res = scheduleMentorshipSession(sessionData);
    if (!res.success) {
      showToast(res.error || "Failed to schedule session due to a conflict.");
      return;
    }
    showToast(`Session scheduled with ${sessionData.studentName} for ${sessionData.date} at ${sessionData.time}!`);
    setIsScheduleModalOpen(false);
  };

  const handleRescheduleConfirm = (
    sessionId: string,
    data: {
      date: string;
      time: string;
      topic?: string;
      meetUrl?: string;
      agenda?: string;
    }
  ) => {
    const res = rescheduleMentorshipSession(sessionId, data);
    if (!res.success) {
      showToast(res.error || "Failed to reschedule session.");
      return;
    }
    showToast(`Session rescheduled to ${data.date} at ${data.time}!`);
    setSessionToReschedule(null);
    if (selectedSessionForDetail?.id === sessionId) {
      setSelectedSessionForDetail(res.session || null);
    }
  };

  const handleCancelConfirm = (sessionId: string, reason: string) => {
    const res = cancelMentorshipSession(sessionId, reason);
    if (!res.success) {
      showToast(res.error || "Failed to cancel session.");
      return;
    }
    showToast("Session cancelled. Notifications updated.");
    setSessionToCancel(null);
    if (selectedSessionForDetail?.id === sessionId) {
      setSelectedSessionForDetail(res.session || null);
    }
  };

  const handleCompleteSession = (session: MentorshipSession, notes?: string) => {
    const res = completeMentorshipSession(session.id, notes);
    if (!res.success) {
      showToast(res.error || "Failed to complete session.");
      return;
    }
    showToast(`Session "${session.topic}" marked as completed!`);
    if (selectedSessionForDetail?.id === session.id) {
      setSelectedSessionForDetail(res.session || null);
    }
  };

  const pendingRequests = mentorshipActivity.pendingRequests || [];
  const activeMentees = mentorshipActivity.acceptedMentorships || [];
  const myOpportunities = opportunities.filter(
    (o) => o.postedByAlumniId === alumni.id || o.postedByAlumniName === alumni.name
  );

  const completedSessionsCount = 14;

  const handleAccept = (requestId: string, studentName: string) => {
    acceptMentorshipRequest(requestId);
    showToast(`Accepted mentorship request from ${studentName}. Added to your active mentees.`);
  };

  const handleDecline = (requestId: string, studentName: string) => {
    declineMentorshipRequest(requestId, "At mentor cohort capacity this semester.");
    showToast(`Declined mentorship request from ${studentName}.`);
  };

  const handleToggleRsvp = (eventId: string, title: string) => {
    toggleEventRsvp(eventId);
    const ev = universityEvents.find((e) => e.id === eventId);
    const isNowRegistered = !ev?.isRegistered;
    showToast(
      isNowRegistered
        ? `Registered for "${title}". Added to your calendar.`
        : `Cancelled RSVP for "${title}".`
    );
  };

  const openStudentProfileForRequest = (req: Mentorship) => {
    const found = students.find((s) => s.id === req.studentId || s.name === req.student?.name);
    if (found) {
      setSelectedStudentForDetail(found);
      return;
    }
    const fallback: DiscoverStudent = {
      id: req.student?.id || req.studentId,
      name: req.student?.name || "Student",
      avatar: req.student?.avatar,
      headline: `${req.student?.academicYear || "Undergraduate"} · ${req.student?.department || "Engineering"}`,
      university: "University of Technology",
      department: req.student?.department || "Computer Science",
      academicYear: req.student?.academicYear || "Sophomore (2nd Year)",
      graduationYear: 2027,
      careerGoal: req.student?.careerGoal || "Software Engineer",
      skills: (req.student?.skills || ["Python", "SQL", "Git"]).map((sk, idx) => ({
        id: `sk-${idx}`,
        name: sk,
        level: "intermediate",
      })),
      interests: (req.student?.interests || ["Software Engineering", "Distributed Systems"]).map(
        (it, idx) => ({ id: `i-${idx}`, name: it })
      ),
      bio:
        req.requestMessage ||
        "Undergraduate student eager to connect with industry alumni for career mentorship and technical guidance.",
      seekingMentorshipIn: [req.focus],
      projects: ["Campus Networking Platform", "Distributed Task Orchestrator"],
      matchScore: 92,
    };
    setSelectedStudentForDetail(fallback);
  };

  const recommendedStudents = students
    .filter((st) => !st.isMentee)
    .slice(0, 3);

  const profileCompletion = 92;

  // Active upcoming sessions (not completed or cancelled)
  const activeUpcomingSessions = upcomingSessions.filter(
    (s) => s.status !== "completed" && s.status !== "cancelled"
  );

  return (
    <div className="w-full space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-[#090909] text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-neutral-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={15} className="text-white shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TWO-COLUMN GRID: Main Content (~68%) / Supporting Sidebar (~32%)
          Gap: 24px (gap-6), top-aligned (items-start)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.9fr)] gap-6 items-start">
        {/* ─────────────────────────────────────────────────────────────
            LEFT COLUMN (~68% width): PRIMARY ALUMNI & MENTORSHIP WORKSPACE
        ───────────────────────────────────────────────────────────── */}
        <div className="space-y-6 min-w-0">
          {/* ─── 1. COMPACT PROFESSIONAL PROFILE SUMMARY (PHASE 3) ─── */}
          <section
            aria-label="Alumni Profile Summary"
            className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {/* Identity & Credentials */}
              <div className="flex items-start gap-4 min-w-0">
                <Avatar
                  name={alumni.name}
                  size="lg"
                  className="shrink-0 ring-1 ring-neutral-200 bg-white"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold text-[#090909] tracking-tight truncate">
                      {alumni.name}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200 shrink-0">
                      <ShieldCheck size={12} className="text-neutral-900" />
                      <span>Verified Mentor</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-800 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-900 animate-pulse" />
                      <span>Accepting Mentees ({activeMentees.length}/5 slots)</span>
                    </span>
                  </div>

                  {/* Professional Position */}
                  <p className="text-xs sm:text-[13px] font-semibold text-[#090909] mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>{alumni.role}</span>
                    <span className="text-[#737373] font-normal">at</span>
                    <span className="text-[#090909] font-bold">{alumni.company}</span>
                    <span className="text-neutral-300 hidden sm:inline">·</span>
                    <span className="text-[#737373] font-normal text-xs">Ex-Google</span>
                  </p>

                  {/* University & Location Metadata */}
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-[#737373] flex-wrap">
                    <span className="flex items-center gap-1">
                      <GraduationCap size={13} className="text-[#737373] shrink-0" />
                      <span>{alumni.university || "University of Technology"} · {alumni.department || "Computer Science"} &apos;20</span>
                    </span>
                    <span className="text-neutral-300">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} className="text-[#737373] shrink-0" />
                      <span>{alumni.location || "San Francisco, CA"}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="h-8 px-3 text-xs font-semibold text-[#090909] border-[#E7E7E7] hover:bg-[#F4F4F4] flex items-center gap-1.5 cursor-pointer shadow-none rounded-full"
                >
                  <Sparkles size={13} />
                  <span>AI Assistant</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-8 px-3 text-xs font-semibold text-[#090909] border-[#E7E7E7] hover:bg-[#F4F4F4] flex items-center gap-1.5 cursor-pointer shadow-none rounded-full"
                >
                  <Link href="/alumni-dashboard/profile">
                    <Edit3 size={13} className="text-[#737373]" />
                    <span>Edit Profile</span>
                  </Link>
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  asChild
                  className="h-8 px-3.5 text-xs font-semibold bg-[#090909] hover:bg-[#242424] !text-white text-white flex items-center gap-1.5 cursor-pointer border-0 shadow-none rounded-full"
                >
                  <Link href="/alumni-dashboard/students">
                    <Users size={13} className="!text-white text-white" />
                    <span>Discover Students</span>
                  </Link>
                </Button>
              </div>
            </div>

            {/* Concise Domain Focus Tags */}
            <div className="mt-4 pt-3.5 border-t border-[#E7E7E7] flex items-center gap-2 flex-wrap text-xs">
              <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider mr-1">
                Mentoring Focus:
              </span>
              {[
                "Distributed Systems",
                "Go & Python Backend",
                "PostgreSQL Query Optimization",
                "Production Docker",
                "System Design Interviews",
              ].map((domain) => (
                <span
                  key={domain}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-200"
                >
                  {domain}
                </span>
              ))}
            </div>
          </section>

          {/* ─── 2. MENTORSHIP OVERVIEW METRICS STRIP ─── */}
          <section aria-label="Mentorship Metrics Summary" className="w-full">
            <div className="bg-white border border-[#E7E7E7] rounded-2xl shadow-xs overflow-hidden">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E7E7]">
                {/* 1. Pending Requests */}
                <Link
                  href="/alumni-dashboard/requests"
                  className="p-5 flex flex-col justify-between group hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#737373]">Pending Requests</span>
                    <Inbox size={15} className="text-[#090909] group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-[#090909]">
                      {pendingRequests.length}
                    </span>
                    <span className="text-xs text-neutral-900 font-semibold">
                      {pendingRequests.length === 1 ? "Review" : "Reviews"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2.5 truncate flex items-center justify-between">
                    <span>Awaiting your decision</span>
                    <ChevronRight size={12} className="text-neutral-400 group-hover:text-black" />
                  </p>
                </Link>

                {/* 2. Active Mentees */}
                <Link
                  href="/alumni-dashboard/mentees"
                  className="p-5 flex flex-col justify-between group hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#737373]">Active Mentees</span>
                    <UserCheck size={15} className="text-[#090909] group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-[#090909]">
                      {activeMentees.length}
                    </span>
                    <span className="text-xs text-[#737373]">of 5 slots filled</span>
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2.5 truncate flex items-center justify-between">
                    <span>Manage cohort</span>
                    <ChevronRight size={12} className="text-neutral-400 group-hover:text-black" />
                  </p>
                </Link>

                {/* 3. Upcoming Sessions */}
                <div className="p-5 flex flex-col justify-between hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#737373]">Upcoming Sessions</span>
                    <Calendar size={15} className="text-[#090909]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-[#090909]">
                      {activeUpcomingSessions.length}
                    </span>
                    <span className="text-xs text-[#737373]">scheduled calls</span>
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2.5 truncate">
                    {activeUpcomingSessions[0]
                      ? `Next: ${activeUpcomingSessions[0].date.split(",")[0]}`
                      : "No sessions this week"}
                  </p>
                </div>

                {/* 4. Completed Sessions */}
                <div className="p-5 flex flex-col justify-between hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-[#737373]">Completed Sessions</span>
                    <Clock size={15} className="text-[#090909]" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-[#090909]">
                      {completedSessionsCount}
                    </span>
                    <span className="text-xs text-neutral-900 font-semibold">18 hours total</span>
                  </div>
                  <p className="text-[11px] text-[#737373] mt-2.5 truncate">
                    100% attendance rate
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─── 3. UPCOMING MENTORSHIP SESSIONS (PHASE 4 — PRIMARY FEATURE) ─── */}
          <section
            aria-labelledby="upcoming-sessions-title"
            className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#E7E7E7] gap-2">
              <div>
                <h2
                  id="upcoming-sessions-title"
                  className="text-base sm:text-lg font-bold text-[#090909] tracking-tight"
                >
                  Upcoming Mentorship Sessions
                </h2>
                <p className="text-xs text-[#737373] mt-0.5">
                  Confirmed and scheduled 1:1 sessions with student mentees
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="h-8 px-3 text-xs font-semibold text-[#090909] border-[#E7E7E7] hover:bg-[#F4F4F4] flex items-center gap-1.5 cursor-pointer shadow-none rounded-full"
                >
                  <Plus size={13} />
                  <span>Schedule Session</span>
                </Button>

                <Link
                  href="/alumni-dashboard/mentees"
                  className="text-xs font-semibold text-[#090909] hover:underline inline-flex items-center gap-1"
                >
                  <span>View All Sessions</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>

            {/* Sessions List */}
            <div className="mt-4 space-y-3">
              {activeUpcomingSessions.length === 0 ? (
                <div className="py-8 text-center bg-neutral-50/50 rounded-2xl border border-dashed border-[#E7E7E7]">
                  <Calendar size={24} className="text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#090909]">
                    No upcoming mentorship sessions scheduled
                  </p>
                  <p className="text-[11px] text-[#737373] mt-1 max-w-sm mx-auto">
                    You can schedule a 1:1 call with any of your active mentees or review incoming requests.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="mt-3 text-xs font-medium text-neutral-900 border-[#E7E7E7] hover:bg-neutral-100 rounded-full"
                  >
                    + Schedule New Session
                  </Button>
                </div>
              ) : (
                activeUpcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-xl border border-[#E7E7E7] bg-white hover:border-black transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      {/* Left: Mentee Avatar, Name, Topic, Date/Time */}
                      <div className="flex items-start gap-3.5 min-w-0">
                        <Avatar name={session.studentName} size="md" className="shrink-0 ring-1 ring-neutral-200" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-[#090909] truncate">
                              {session.studentName}
                            </h3>
                            <span className="text-[11px] text-[#737373]">
                              {session.studentAcademicYear || "Undergraduate"} · {session.studentDepartment || "Computer Science"}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                session.status === "confirmed"
                                  ? "bg-[#090909] text-white"
                                  : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                              }`}
                            >
                              {session.status}
                            </span>
                          </div>

                          {/* Mentorship Topic (Prominent) */}
                          <p className="text-xs sm:text-[13px] font-semibold text-[#090909] mt-1 leading-snug">
                            {session.topic}
                          </p>

                          {/* Date and Time */}
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-[#737373] flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-[#090909]">
                              <Calendar size={13} className="text-neutral-900 shrink-0" />
                              <span>{session.date}</span>
                            </span>
                            <span className="text-neutral-300">·</span>
                            <span className="flex items-center gap-1">
                              <Clock size={13} className="text-neutral-400 shrink-0" />
                              <span>{session.time}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions (Join Meeting & View Details) */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {session.meetUrl ? (
                          <Button
                            variant="primary"
                            size="sm"
                            asChild
                            className="bg-[#090909] hover:bg-[#242424] !text-white text-white text-xs h-[34px] px-3.5 font-semibold flex items-center gap-1.5 border-0 shadow-none cursor-pointer rounded-full"
                          >
                            <a
                              href={session.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video size={13} className="!text-white text-white shrink-0" />
                              <span>Join Meeting</span>
                              <ExternalLink size={11} className="!text-white text-white shrink-0" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-[#737373] italic bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
                            Link sent 15m prior
                          </span>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSessionForDetail(session)}
                          className="h-[34px] px-3.5 text-xs font-semibold text-[#090909] border-[#E7E7E7] hover:bg-neutral-50 cursor-pointer shadow-none rounded-full"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ─── 4. RECENT MENTORSHIP REQUESTS ─── */}
          <section
            aria-labelledby="recent-requests-title"
            className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E7E7]">
              <div className="flex items-center gap-2">
                <h2
                  id="recent-requests-title"
                  className="text-base sm:text-lg font-bold text-[#090909] tracking-tight"
                >
                  Recent Mentorship Requests
                </h2>
                {pendingRequests.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-900 border border-neutral-200">
                    {pendingRequests.length} pending
                  </span>
                )}
              </div>
              <Link
                href="/alumni-dashboard/requests"
                className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1"
              >
                <span>View all requests</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-[#E7E7E7]">
              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center bg-neutral-50/50 rounded-2xl border border-dashed border-[#E7E7E7]">
                  <Inbox size={24} className="text-neutral-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-[#090909]">No pending mentorship requests</p>
                  <p className="text-[11px] text-[#737373] mt-1 max-w-sm mx-auto">
                    You have responded to all incoming student inquiries. You can discover students to offer mentorship.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mt-3 text-xs font-medium text-neutral-900 border-[#E7E7E7] hover:bg-neutral-100 rounded-full"
                  >
                    <Link href="/alumni-dashboard/students">Discover Students &rarr;</Link>
                  </Button>
                </div>
              ) : (
                pendingRequests.slice(0, 3).map((req) => {
                  const studentName = req.student?.name || "Student";
                  const studentDept = req.student?.department || "Computer Science";
                  const studentYear = req.student?.academicYear || "Undergraduate";
                  const careerInterest = req.student?.careerGoal || req.focus;

                  return (
                    <div key={req.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar name={studentName} size="md" className="shrink-0 ring-1 ring-neutral-200" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs sm:text-sm font-bold text-[#090909] truncate">
                                {studentName}
                              </h3>
                              <span className="text-[10px] text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 font-medium">
                                {studentYear}
                              </span>
                            </div>
                            <p className="text-xs text-[#737373] truncate mt-0.5">
                              {studentDept} · University of Technology
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-800">
                              <Target size={12} className="shrink-0" />
                              <span className="font-semibold truncate">
                                Career Goal: {careerInterest}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] text-neutral-400 shrink-0 font-medium">
                          {req.requestDate}
                        </span>
                      </div>

                      {/* Request Message Quote */}
                      {req.requestMessage && (
                        <div className="mt-2.5 bg-neutral-50 rounded-xl p-3 border border-[#E7E7E7]">
                          <p className="text-xs text-[#090909] leading-relaxed italic">
                            &ldquo;{req.requestMessage}&rdquo;
                          </p>
                          {req.student?.skills && req.student.skills.length > 0 && (
                            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-[#737373] font-semibold mr-1">Skills:</span>
                              {req.student.skills.slice(0, 4).map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[11px] bg-white border border-[#E7E7E7] px-2.5 py-0.5 rounded-full text-[#090909] font-medium"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons: View Profile, Accept, Decline */}
                      <div className="mt-3 flex items-center justify-between gap-2 pt-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => openStudentProfileForRequest(req)}
                          className="text-xs text-neutral-700 hover:text-black hover:bg-neutral-100 px-3 h-8 font-semibold cursor-pointer rounded-full"
                        >
                          <Users size={12} className="mr-1.5" />
                          <span>View Profile</span>
                        </Button>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDecline(req.id, studentName)}
                            className="text-xs text-neutral-700 hover:text-black border border-neutral-200 hover:border-black h-8 px-3.5 font-medium cursor-pointer rounded-full"
                          >
                            <X size={12} className="mr-1" />
                            <span>Decline</span>
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleAccept(req.id, studentName)}
                            className="text-xs bg-[#090909] hover:bg-[#242424] !text-white text-white h-8 px-4 font-semibold cursor-pointer border-0 shadow-xs rounded-full"
                          >
                            <Check size={12} className="mr-1 !text-white text-white" />
                            <span>Accept</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* ─── 5. RECOMMENDED STUDENTS TO MENTOR ─── */}
          <section
            aria-labelledby="recommended-students-title"
            className="bg-white border border-[#E7E7E7] rounded-2xl p-5 sm:p-6 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E7E7E7]">
              <div>
                <div className="flex items-center gap-2">
                  <h2
                    id="recommended-students-title"
                    className="text-base sm:text-lg font-bold text-[#090909] tracking-tight"
                  >
                    Recommended Students
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#090909] bg-[#F4F4F4] px-2.5 py-0.5 rounded-full border border-[#E7E7E7]">
                    <Sparkles size={11} /> Skills Match
                  </span>
                </div>
                <p className="text-xs text-[#555555] mt-0.5">
                  Students whose career interests align with your systems, Go, and backend expertise
                </p>
              </div>

              <Link
                href="/alumni-dashboard/students"
                className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 shrink-0"
              >
                <span>Browse all</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {recommendedStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-xl border border-[#E7E7E7] bg-white flex flex-col justify-between hover:border-black transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Avatar name={st.name} size="md" className="ring-1 ring-neutral-200" />
                      {st.matchScore && (
                        <span className="text-[10px] font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full shrink-0">
                          {st.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-[#090909] mt-2 truncate">
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-[#737373] truncate">
                      {st.academicYear} · {st.department}
                    </p>

                    <p className="text-xs text-[#090909] mt-1.5 line-clamp-2">
                      Goal: <strong className="font-semibold text-neutral-900">{st.careerGoal}</strong>
                    </p>

                    <div className="mt-2.5 flex gap-1 flex-wrap">
                      {st.skills.slice(0, 3).map((sk) => {
                        const skName = typeof sk === "string" ? sk : sk.name;
                        return (
                          <span
                            key={skName}
                            className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-800 border border-neutral-200 font-medium"
                          >
                            {skName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2.5 border-t border-[#E7E7E7] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForDetail(st)}
                      className="text-xs font-semibold text-neutral-700 hover:text-black hover:underline cursor-pointer"
                    >
                      View Profile
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudentForOffer(st)}
                      disabled={st.hasPendingRequest}
                      className="text-xs py-1 px-3 h-auto font-semibold text-neutral-900 border-[#E7E7E7] hover:bg-neutral-100 cursor-pointer rounded-full"
                    >
                      {st.hasPendingRequest ? "Pending" : "Offer Mentorship"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            RIGHT COLUMN (~32% width): SUPPORTING SIDEBAR (PHASE 5)
            Ordered: Profile Completion -> Reminders -> Events -> Opportunities -> Updates
        ───────────────────────────────────────────────────────────── */}
        <aside aria-label="Alumni Supporting Sidebar" className="space-y-6 min-w-0">
          {/* ─── A. PROFILE COMPLETION ─── */}
          <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E7E7]">
              <h3 className="text-sm font-bold text-[#090909]">Profile Completion</h3>
              <span className="text-xs font-bold text-[#090909]">{profileCompletion}% Complete</span>
            </div>

            <div className="mt-3">
              <div className="h-2 rounded-full bg-[#F4F4F4] overflow-hidden">
                <div
                  className="h-full bg-[#090909] rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-xs text-[#555555] mt-2 leading-relaxed">
                Complete the remaining 8% to maximize your visibility and student match accuracy.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E7E7E7]">
              <Link
                href="/alumni-dashboard/profile"
                className="text-xs font-semibold text-[#090909] hover:underline flex items-center justify-between"
              >
                <span>Edit Full Profile Details</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>

          {/* ─── B. PROFILE REMINDERS ─── */}
          <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#E7E7E7]">
              <AlertCircle size={15} className="text-[#090909]" />
              <h3 className="text-sm font-bold text-[#090909]">Profile Reminders</h3>
            </div>

            <ul className="mt-3 space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5 text-[#090909]">
                <span className="h-4 w-4 rounded-full bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  +4%
                </span>
                <span className="text-xs text-[#555555] leading-snug">
                  Add your personal LinkedIn URL to verified contacts
                </span>
              </li>
              <li className="flex items-start gap-2.5 text-[#090909]">
                <span className="h-4 w-4 rounded-full bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  +4%
                </span>
                <span className="text-xs text-[#555555] leading-snug">
                  Set 2 preferred weekly office hours time windows
                </span>
              </li>
            </ul>

            <div className="mt-3.5 pt-3 border-t border-[#E7E7E7]">
              <Link
                href="/alumni-dashboard/profile"
                className="text-xs font-semibold text-[#090909] hover:underline flex items-center justify-between"
              >
                <span>Complete Reminders Now</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* ─── C. CAMPUS EVENTS ─── */}
          <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E7E7]">
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-[#090909]" />
                <h3 className="text-sm font-bold text-[#090909]">Campus Events</h3>
              </div>
              <span className="text-[11px] font-medium text-[#737373]">Fall 2026</span>
            </div>

            <div className="mt-3 divide-y divide-[#E7E7E7]">
              {universityEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#090909] bg-[#F4F4F4] px-2 py-0.5 rounded-full border border-[#E7E7E7]">
                      {event.category}
                    </span>
                    <span className="text-[11px] text-[#737373]">
                      {event.rsvpCount} RSVPs
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#090909] mt-1.5 leading-snug">
                    {event.title}
                  </h4>

                  <div className="mt-1 text-xs text-[#737373] space-y-0.5">
                    <p>{event.date} · {event.time}</p>
                    <p className="flex items-center gap-1 text-[#737373]">
                      <MapPin size={11} className="shrink-0" />
                      <span>{event.location}</span>
                    </p>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-[#737373] line-clamp-1 flex-1">
                      {event.description}
                    </p>
                    <Button
                      variant={event.isRegistered ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleToggleRsvp(event.id, event.title)}
                      className={`text-xs h-7 px-2.5 shrink-0 font-medium cursor-pointer rounded-full ${
                        event.isRegistered
                          ? "text-neutral-900 border-neutral-300 bg-neutral-100 hover:bg-neutral-200"
                          : "bg-[#090909] hover:bg-[#242424] !text-white text-white border-0 shadow-none"
                      }`}
                    >
                      {event.isRegistered ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 size={11} /> Registered
                        </span>
                      ) : (
                        "RSVP"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── D. CAREER OPPORTUNITIES ─── */}
          <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#E7E7E7]">
              <div className="flex items-center gap-1.5">
                <Briefcase size={15} className="text-[#090909]" />
                <h3 className="text-sm font-bold text-[#090909]">Career Opportunities</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPostOpportunityOpen(true)}
                className="text-xs font-semibold text-neutral-900 hover:text-neutral-600 flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} />
                <span>Post Opportunity</span>
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {myOpportunities.length === 0 ? (
                <p className="text-xs text-[#737373] py-3 text-center">
                  No active postings. Publish an internship or role referral to connect with verified students.
                </p>
              ) : (
                myOpportunities.slice(0, 3).map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3.5 rounded-xl border border-[#E7E7E7] bg-white hover:border-black transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#090909] truncate">
                        {opp.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 shrink-0">
                        {opp.type}
                      </span>
                    </div>
                    <p className="text-xs text-[#737373] mt-0.5">
                      {opp.company} · {opp.location}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-[#E7E7E7]">
                      <span className="text-neutral-900 font-semibold">
                        {opp.applicantsCount} applicants
                      </span>
                      <Link
                        href="/alumni-dashboard/opportunities"
                        className="text-neutral-900 hover:underline font-semibold"
                      >
                        View &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─── E. RELEVANT UPDATES (MENTORSHIP BEST PRACTICES) ─── */}
          <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#E7E7E7]">
              <Award size={15} className="text-[#090909]" />
              <h3 className="text-sm font-bold text-[#090909]">Mentorship Best Practices</h3>
            </div>

            <div className="mt-3 space-y-3">
              {mentorshipTipsData.slice(0, 2).map((tip) => (
                <div key={tip.id} className="text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 inline-block">
                    {tip.category}
                  </span>
                  <h5 className="font-bold text-[#090909] text-xs mt-1">
                    {tip.title}
                  </h5>
                  <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                    {tip.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODALS & DIALOGS (ALL PRESERVED FUNCTIONALITY)
      ───────────────────────────────────────────────────────────── */}

      {/* Student Detail Modal (for View Profile) */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onOfferMentorship={(st) => {
          setSelectedStudentForDetail(null);
          setSelectedStudentForOffer(st);
        }}
      />

      {/* Offer Mentorship Modal */}
      <OfferMentorshipModal
        student={selectedStudentForOffer}
        isOpen={Boolean(selectedStudentForOffer)}
        onClose={() => setSelectedStudentForOffer(null)}
        onSuccess={(name) =>
          showToast(`Mentorship offer sent to ${name}! Track it under Mentorship Requests.`)
        }
      />

      {/* Session Detail Modal (for View Details on upcoming sessions) */}
      <SessionDetailModal
        session={selectedSessionForDetail}
        isOpen={Boolean(selectedSessionForDetail)}
        onClose={() => setSelectedSessionForDetail(null)}
        onReschedule={(session) => {
          setSelectedSessionForDetail(null);
          setSessionToReschedule(session);
        }}
        onCancel={(session) => {
          setSelectedSessionForDetail(null);
          setSessionToCancel(session);
        }}
        onComplete={handleCompleteSession}
      />

      {/* Schedule / Reschedule Session Modal */}
      <ScheduleSessionModal
        isOpen={isScheduleModalOpen || Boolean(sessionToReschedule)}
        sessionToReschedule={sessionToReschedule}
        activeMentees={activeMentees}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSessionToReschedule(null);
        }}
        onSessionScheduled={handleScheduleSubmit}
        onSessionRescheduled={handleRescheduleConfirm}
        onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
      />

      {/* Cancel Session Confirmation Modal */}
      <CancelSessionModal
        isOpen={Boolean(sessionToCancel)}
        session={sessionToCancel}
        onClose={() => setSessionToCancel(null)}
        onConfirmCancel={handleCancelConfirm}
      />

      {/* AI Mentorship Assistant Modal */}
      <AIMentorshipAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        activeMentees={activeMentees}
      />

      {/* Post Opportunity Modal */}
      <PostOpportunityModal
        isOpen={isPostOpportunityOpen}
        onClose={() => setIsPostOpportunityOpen(false)}
        onSuccess={(title) =>
          showToast(`Successfully published opportunity: "${title}".`)
        }
      />
    </div>
  );
}
