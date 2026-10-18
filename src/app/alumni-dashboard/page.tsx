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
  CheckCircle,
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
    showToast(`Session successfully scheduled with ${sessionData.studentName} for ${sessionData.date} at ${sessionData.time}!`);
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

  const pendingRequests = mentorshipActivity.pendingRequests;
  const activeMentees = mentorshipActivity.acceptedMentorships || [];
  const myOpportunities = opportunities.filter(
    (o) => o.postedByAlumniId === alumni.id || o.postedByAlumniName === alumni.name
  );

  // Total completed sessions calculation (Marcus Vance has 14 sessions logged)
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

  // Open profile modal for a pending request student
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

  // Filter recommendations: students whose skills / interests align with Marcus Vance (Go, Python, Systems, PostgreSQL, Docker)
  const recommendedStudents = students
    .filter((st) => !st.isMentee)
    .slice(0, 3);

  // Profile completion percent
  const profileCompletion = 92;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ─── SECTION 1: WELCOME SECTION ────────────────────────────────────────── */}
      <section aria-label="Welcome Banner" className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar name={alumni.name} size="lg" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  Welcome back, {alumni.name}
                </h1>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#057642] bg-[#eef8f1] px-2 py-0.5 rounded-full border border-[#bfe3c9]">
                  <ShieldCheck size={11} /> Verified Mentor
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                  Demo Data Active
                </span>
              </div>
              <p className="text-xs font-medium text-gray-700 mt-1">
                {alumni.role} at <span className="font-semibold text-gray-900">{alumni.company}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1 max-w-2xl leading-relaxed">
                You have <strong className="text-gray-800">{pendingRequests.length} pending mentorship requests</strong> waiting for your review and <strong className="text-gray-800">{upcomingSessions.length} upcoming 1:1 sessions</strong> scheduled this week. Thank you for empowering our student community!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAIAssistantOpen(true)}
              className="text-xs flex items-center gap-1.5 text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50"
            >
              <Sparkles size={13} />
              <span>AI Assistant</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs flex items-center gap-1.5 text-gray-700 border-gray-300 hover:bg-gray-50"
            >
              <Link href="/alumni-dashboard/profile">
                <Edit3 size={13} className="text-[#0a66c2]" />
                <span>Edit Profile</span>
              </Link>
            </Button>
            <Button
              variant="primary"
              size="sm"
              asChild
              className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
            >
              <Link href="/alumni-dashboard/students">
                <Users size={13} />
                <span>Discover Students</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── SECTION 3: MENTORSHIP OVERVIEW (COMPACT STATISTICS) ───────────────── */}
      <section aria-label="Mentorship Overview">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Pending Requests */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Pending Requests</span>
              <div className="h-7 w-7 rounded-full bg-blue-50 text-[#0a66c2] flex items-center justify-center">
                <Inbox size={15} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{pendingRequests.length}</span>
              <span className="text-[11px] text-gray-500">awaiting review</span>
            </div>
            <Link
              href="/alumni-dashboard/requests"
              className="mt-2 text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
            >
              <span>Review requests</span>
              <ChevronRight size={11} />
            </Link>
          </div>

          {/* 2. Active Mentees */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Active Mentees</span>
              <div className="h-7 w-7 rounded-full bg-emerald-50 text-[#057642] flex items-center justify-center">
                <UserCheck size={15} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{activeMentees.length}</span>
              <span className="text-[11px] text-gray-500">of 5 slots filled</span>
            </div>
            <Link
              href="/alumni-dashboard/mentees"
              className="mt-2 text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
            >
              <span>Manage cohort</span>
              <ChevronRight size={11} />
            </Link>
          </div>

          {/* 3. Upcoming Sessions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Upcoming Sessions</span>
              <div className="h-7 w-7 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
                <Calendar size={15} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</span>
              <span className="text-[11px] text-gray-500">scheduled calls</span>
            </div>
            <span className="mt-2 text-[11px] text-gray-500 block truncate">
              Next: {upcomingSessions[0]?.date.split(",")[0] || "None scheduled"}
            </span>
          </div>

          {/* 4. Completed Sessions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500">Completed Sessions</span>
              <div className="h-7 w-7 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center">
                <Clock size={15} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{completedSessionsCount}</span>
              <span className="text-[11px] text-[#057642] font-semibold">18 total hours</span>
            </div>
            <span className="mt-2 text-[11px] text-gray-400 block">
              100% attendance rate
            </span>
          </div>
        </div>
      </section>

      {/* ─── TWO-COLUMN WORKSPACE (Center Feed: 8 cols | Right Sidebar: 4 cols) ─── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* CENTER MAIN FEED (8 COLS) */}
        <div className="xl:col-span-8 space-y-5">
          {/* ─── SECTION 4: PENDING REQUESTS ─────────────────────────────────────── */}
          <section
            aria-label="Pending Mentorship Requests"
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">Recent Mentorship Requests</h2>
                {pendingRequests.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ebf3fb] text-[#0a66c2]">
                    {pendingRequests.length} pending
                  </span>
                )}
              </div>
              <Link
                href="/alumni-dashboard/requests"
                className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-gray-100">
              {pendingRequests.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="h-10 w-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-2">
                    <Inbox size={20} />
                  </div>
                  <p className="text-xs font-medium text-gray-900">No pending mentorship requests</p>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-sm mx-auto">
                    You have responded to all incoming requests. You can proactively browse students looking for mentors.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="mt-3 text-xs"
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
                          <Avatar name={studentName} size="md" className="shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-gray-900 truncate">
                                {studentName}
                              </h3>
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                                {studentYear}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 truncate mt-0.5">
                              {studentDept} · University of Technology
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#0a66c2]">
                              <Target size={11} className="shrink-0" />
                              <span className="font-medium truncate">
                                Career Interest: {careerInterest}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] text-gray-400 shrink-0">
                          {req.requestDate}
                        </span>
                      </div>

                      {/* Request Message */}
                      {req.requestMessage && (
                        <div className="mt-2.5 bg-gray-50/80 rounded-md p-2.5 border border-gray-100">
                          <p className="text-xs text-gray-700 leading-relaxed italic">
                            &ldquo;{req.requestMessage}&rdquo;
                          </p>
                          {req.student?.skills && req.student.skills.length > 0 && (
                            <div className="mt-2 flex items-center gap-1 flex-wrap">
                              <span className="text-[10px] text-gray-400 font-medium mr-1">Skills:</span>
                              {req.student.skills.slice(0, 4).map((sk) => (
                                <span
                                  key={sk}
                                  className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.2 rounded text-gray-600"
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
                          className="text-xs text-gray-600 hover:text-[#0a66c2] hover:bg-blue-50 px-2.5 h-8"
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
                            className="text-xs text-gray-600 hover:text-red-600 hover:border-red-200 h-8 px-3"
                          >
                            <X size={12} className="mr-1" />
                            <span>Decline</span>
                          </Button>
                          <Button
                            type="button"
                            variant="primary"
                            size="sm"
                            onClick={() => handleAccept(req.id, studentName)}
                            className="text-xs bg-[#0a66c2] hover:bg-[#004182] h-8 px-3"
                          >
                            <Check size={12} className="mr-1" />
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

          {/* ─── SECTION 5: UPCOMING SESSIONS ────────────────────────────────────── */}
          <section
            aria-label="Upcoming Mentorship Sessions"
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
              <div>
                <h2 className="text-sm font-bold text-gray-900">Upcoming Mentorship Sessions</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Confirmed and scheduled 1:1 sessions with student mentees
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="text-xs h-7 px-2.5 text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50 flex items-center gap-1"
                >
                  <Plus size={11} />
                  <span>Schedule Session</span>
                </Button>
                <Link
                  href="/alumni-dashboard/mentees"
                  className="text-xs font-semibold text-[#0a66c2] hover:underline"
                >
                  View All &rarr;
                </Link>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingSessions.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-500">
                  No upcoming mentorship sessions scheduled.
                </div>
              ) : (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <Avatar name={session.studentName} size="md" className="shrink-0" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-gray-900">
                              {session.studentName}
                            </h4>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${
                                session.status === "confirmed"
                                  ? "bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]"
                                  : "bg-blue-50 text-[#0a66c2] border border-[#b2d5f8]"
                              }`}
                            >
                              {session.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-gray-800 mt-0.5 leading-snug">
                            {session.topic}
                          </p>
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-gray-700">
                              <Calendar size={12} className="text-[#0a66c2]" />
                              {session.date}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} className="text-gray-400" />
                              {session.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Session Actions: Meeting Link (only when exists!) & View Details */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {session.meetUrl ? (
                          <Button
                            variant="primary"
                            size="sm"
                            asChild
                            className="bg-[#057642] hover:bg-[#045d34] text-xs h-8 px-2.5 flex items-center gap-1.5"
                          >
                            <a
                              href={session.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Video size={12} />
                              <span>Join Meet</span>
                              <ExternalLink size={10} />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic bg-gray-50 px-2 py-1 rounded border border-gray-100">
                            Link sent 15m prior
                          </span>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSessionForDetail(session)}
                          className="text-xs h-8 px-2.5 text-gray-700 border-gray-300 hover:bg-gray-50"
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

          {/* ─── SECTION 6: STUDENT RECOMMENDATIONS ──────────────────────────────── */}
          <section
            aria-label="Student Recommendations"
            className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900">Recommended Students</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#0a66c2] bg-blue-50 px-1.5 py-0.5 rounded">
                    <Sparkles size={10} /> Skills Match
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Students whose career interests align with your systems, Go, and backend expertise
                </p>
              </div>
              <Link
                href="/alumni-dashboard/students"
                className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <span>Browse all</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {recommendedStudents.map((st) => (
                <div
                  key={st.id}
                  className="p-3.5 rounded-lg border border-gray-200 bg-gray-50/30 flex flex-col justify-between hover:border-gray-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <Avatar name={st.name} size="md" />
                      {st.matchScore && (
                        <span className="text-[10px] font-bold text-[#057642] bg-[#eef8f1] border border-[#bfe3c9] px-1.5 py-0.2 rounded shrink-0">
                          {st.matchScore}% Match
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-gray-900 mt-2 truncate">
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-gray-500 truncate">
                      {st.academicYear} · {st.department}
                    </p>

                    <p className="text-[11px] text-gray-700 mt-1 line-clamp-2">
                      Goal: <strong className="font-semibold text-gray-900">{st.careerGoal}</strong>
                    </p>

                    <div className="mt-2 flex gap-1 flex-wrap">
                      {st.skills.slice(0, 3).map((sk) => {
                        const skName = typeof sk === "string" ? sk : sk.name;
                        return (
                          <span
                            key={skName}
                            className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600"
                          >
                            {skName}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentForDetail(st)}
                      className="text-[11px] font-semibold text-gray-600 hover:text-[#0a66c2] hover:underline"
                    >
                      View Profile
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudentForOffer(st)}
                      disabled={st.hasPendingRequest}
                      className="text-[11px] py-1 px-2.5 h-auto text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50"
                    >
                      {st.hasPendingRequest ? "Pending" : "Offer Mentorship"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ─── SECTION 7 & 2: RIGHT SIDEBAR (4 COLS) ────────────────────────────── */}
        <aside aria-label="Alumni Context Sidebar" className="xl:col-span-4 space-y-5">
          {/* ─── SECTION 2: PROFILE SUMMARY CARD ─────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-start gap-3.5">
              <Avatar name={alumni.name} size="lg" className="shrink-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {alumni.name}
                </h3>
                <p className="text-xs font-semibold text-[#0a66c2] truncate">
                  {alumni.role}
                </p>
                <p className="text-xs text-gray-600 truncate">{alumni.company}</p>
                <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-400">
                  <GraduationCap size={12} className="shrink-0" />
                  <span className="truncate">University of Technology · &apos;18</span>
                </div>
              </div>
            </div>

            {/* Skills & Expertise */}
            <div className="mt-3.5 pt-3 border-t border-gray-100">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                Expertise &amp; Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Distributed Systems",
                  "Go",
                  "Python",
                  "PostgreSQL",
                  "Docker",
                  "Observability",
                ].map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Profile Completion Indicator */}
            <div className="mt-4 pt-3.5 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-gray-800">Profile Completion</span>
                <span className="font-bold text-[#057642]">{profileCompletion}% Complete</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#057642] rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-500 mt-1.5">
                Complete the remaining 8% to boost mentee match accuracy.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <Link
                href="/alumni-dashboard/profile"
                className="text-xs text-[#0a66c2] font-semibold hover:underline flex items-center justify-center gap-1"
              >
                <span>Edit Full Profile</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>

          {/* ─── Profile Completion Reminders ─────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
              <AlertCircle size={14} className="text-[#0a66c2]" />
              <h3 className="text-xs font-bold text-gray-900">Profile Reminders</h3>
            </div>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-start gap-2 text-gray-700">
                <span className="h-4 w-4 rounded-full bg-blue-50 text-[#0a66c2] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  +4%
                </span>
                <span className="text-[11px]">Add your personal LinkedIn URL to verified contacts</span>
              </li>
              <li className="flex items-start gap-2 text-gray-700">
                <span className="h-4 w-4 rounded-full bg-blue-50 text-[#0a66c2] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  +4%
                </span>
                <span className="text-[11px]">Set 2 preferred weekly office hours time windows</span>
              </li>
            </ul>
            <Link
              href="/alumni-dashboard/profile"
              className="mt-3 text-[11px] font-semibold text-[#0a66c2] hover:underline block text-right"
            >
              Complete Now &rarr;
            </Link>
          </div>

          {/* ─── Upcoming University Events ───────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-[#0a66c2]" />
                <h3 className="text-xs font-bold text-gray-900">Campus Events</h3>
              </div>
              <span className="text-[10px] text-gray-400">Fall 2026</span>
            </div>

            <div className="mt-3 divide-y divide-gray-100">
              {universityEvents.map((event) => (
                <div key={event.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0a66c2] bg-blue-50 px-1.5 py-0.2 rounded">
                      {event.category}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {event.rsvpCount} RSVPs
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 mt-1 leading-snug">
                    {event.title}
                  </h4>
                  <div className="mt-1 text-[11px] text-gray-500 space-y-0.5">
                    <p>{event.date} · {event.time}</p>
                    <p className="flex items-center gap-1 text-gray-400">
                      <MapPin size={10} />
                      <span>{event.location}</span>
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-[10px] text-gray-500 line-clamp-1 flex-1 pr-2">
                      {event.description}
                    </p>
                    <Button
                      variant={event.isRegistered ? "outline" : "primary"}
                      size="sm"
                      onClick={() => handleToggleRsvp(event.id, event.title)}
                      className={`text-[10px] h-6 px-2 shrink-0 ${
                        event.isRegistered
                          ? "text-[#057642] border-[#bfe3c9] bg-[#eef8f1] hover:bg-[#e4f4e8]"
                          : "bg-[#0a66c2] hover:bg-[#004182]"
                      }`}
                    >
                      {event.isRegistered ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={10} /> Registered
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

          {/* ─── Relevant Career Opportunities ────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <Briefcase size={14} className="text-[#0a66c2]" />
                <h3 className="text-xs font-bold text-gray-900">Career Opportunities</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPostOpportunityOpen(true)}
                className="text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <Plus size={11} />
                <span>Post</span>
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {myOpportunities.length === 0 ? (
                <p className="text-xs text-gray-500 py-2 text-center">
                  No active postings. Post an internship or referral to connect with talent.
                </p>
              ) : (
                myOpportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-2.5 rounded-md border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        {opp.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-[#0a66c2] bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                        {opp.type}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {opp.company} · {opp.location}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="text-[#057642] font-semibold">
                        {opp.applicantsCount} applicants
                      </span>
                      <Link
                        href="/alumni-dashboard/opportunities"
                        className="text-[#0a66c2] hover:underline font-medium"
                      >
                        View applicants &rarr;
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ─── Mentorship Tips Widget ───────────────────────────────────────── */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
              <Award size={14} className="text-amber-600" />
              <h3 className="text-xs font-bold text-gray-900">Mentorship Tips</h3>
            </div>
            <div className="mt-3 space-y-2.5">
              {mentorshipTipsData.map((tip) => (
                <div key={tip.id} className="text-xs bg-amber-50/40 p-2.5 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                      {tip.category}
                    </span>
                  </div>
                  <h5 className="font-bold text-gray-900 text-[11px] mt-0.5">
                    {tip.title}
                  </h5>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                    {tip.tip}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* ─── MODALS ────────────────────────────────────────────────────────────── */}

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
