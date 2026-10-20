"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  UserCheck,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Target,
  Search,
  BookOpen,
  Award,
  User,
  History,
  XCircle,
  Sparkles,
  Clock,
  Video,
  ExternalLink,
  RefreshCw,
  Ban,
  CheckCircle,
  Plus,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadMentorshipActivity,
  loadUpcomingSessions,
  scheduleMentorshipSession,
  rescheduleMentorshipSession,
  cancelMentorshipSession,
  completeMentorshipSession,
  endMentorship,
  getStudentById,
  offerMentorshipToStudent,
} from "@/lib/dashboard-storage";
import { initialMentorshipActivity, initialUpcomingSessions } from "@/lib/mock-data";
import { MentorshipDetailsModal } from "@/components/alumni-dashboard/MentorshipDetailsModal";
import { ScheduleSessionModal } from "@/components/alumni-dashboard/ScheduleSessionModal";
import { CancelSessionModal } from "@/components/alumni-dashboard/CancelSessionModal";
import { SessionDetailModal } from "@/components/alumni-dashboard/SessionDetailModal";
import { AIMentorshipAssistantModal } from "@/components/alumni-dashboard/AIMentorshipAssistantModal";
import { EndMentorshipModal } from "@/components/alumni-dashboard/EndMentorshipModal";
import { StudentDetailModal } from "@/components/alumni-dashboard/StudentDetailModal";
import { cn } from "@/lib/utils";
import type { Mentorship, DiscoverStudent, MentorshipSession } from "@/types";

type PageTab = "active" | "sessions" | "completed";
type SessionFilter = "all" | "upcoming" | "completed" | "cancelled";

function formatDisplayDate(dateStr?: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export default function MyMenteesPage() {
  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const allSessions = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadUpcomingSessions,
    () => initialUpcomingSessions
  );

  const activeMentees = useMemo(
    () => mentorshipActivity.acceptedMentorships || [],
    [mentorshipActivity.acceptedMentorships]
  );
  const completedMentees = useMemo(
    () => mentorshipActivity.completedMentorships || [],
    [mentorshipActivity.completedMentorships]
  );

  const [activeTab, setActiveTab] = useState<PageTab>("active");
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedDetailsMentee, setSelectedDetailsMentee] = useState<Mentorship | null>(null);
  const [schedulingMentee, setSchedulingMentee] = useState<Mentorship | null>(null);
  const [sessionToReschedule, setSessionToReschedule] = useState<MentorshipSession | null>(null);
  const [sessionToCancel, setSessionToCancel] = useState<MentorshipSession | null>(null);
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<MentorshipSession | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [aiAssistantInitialTab, setAiAssistantInitialTab] = useState<"session_prep" | "career_guidance" | "roadmap" | "student_matching" | "summary">("session_prep");
  const [aiAssistantMentee, setAiAssistantMentee] = useState<Mentorship | null>(null);

  const [endingMentee, setEndingMentee] = useState<Mentorship | null>(null);
  const [profileStudent, setProfileStudent] = useState<DiscoverStudent | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Compute total sessions across all active and completed mentorships
  const totalSessionsCount = useMemo(() => {
    const activeTotal = activeMentees.reduce((acc, m) => acc + (m.sessionCount || 0), 0);
    const completedTotal = completedMentees.reduce((acc, m) => acc + (m.sessionCount || 0), 0);
    return activeTotal + completedTotal;
  }, [activeMentees, completedMentees]);

  // Filtered mentees by search
  const displayedMentees = useMemo(() => {
    const list = activeTab === "active" ? activeMentees : completedMentees;
    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter((m) => {
      const studentName = (m.student?.name || "").toLowerCase();
      const dept = (m.student?.department || "").toLowerCase();
      const goal = (m.student?.careerGoal || "").toLowerCase();
      const focus = m.focus.toLowerCase();
      const skills = (m.student?.skills || []).map((s) => s.toLowerCase()).join(" ");
      return (
        studentName.includes(q) ||
        dept.includes(q) ||
        goal.includes(q) ||
        focus.includes(q) ||
        skills.includes(q)
      );
    });
  }, [activeTab, activeMentees, completedMentees, searchQuery]);

  // Filtered sessions
  const displayedSessions = useMemo(() => {
    let list = allSessions;
    if (sessionFilter === "upcoming") {
      list = allSessions.filter((s) => s.status === "scheduled" || s.status === "confirmed" || s.status === "rescheduled");
    } else if (sessionFilter === "completed") {
      list = allSessions.filter((s) => s.status === "completed");
    } else if (sessionFilter === "cancelled") {
      list = allSessions.filter((s) => s.status === "cancelled");
    }

    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.studentName.toLowerCase().includes(q) ||
        s.topic.toLowerCase().includes(q) ||
        s.studentDepartment.toLowerCase().includes(q)
    );
  }, [allSessions, sessionFilter, searchQuery]);

  const handleOpenProfile = (studentId?: string, mentee?: Mentorship) => {
    if (studentId) {
      const existing = getStudentById(studentId);
      if (existing) {
        setProfileStudent(existing);
        return;
      }
    }

    if (mentee) {
      const fallback: DiscoverStudent = {
        id: studentId || "mentee-student",
        name: mentee.student?.name || "Student",
        headline: `${mentee.student?.academicYear || "Student"} · ${mentee.student?.department || "Computer Science"}`,
        university: "University of Technology",
        department: mentee.student?.department || "Computer Science",
        academicYear: mentee.student?.academicYear || "Undergraduate",
        graduationYear: 2027,
        careerGoal: mentee.student?.careerGoal || mentee.focus,
        skills: (mentee.student?.skills || ["Distributed Systems", "Software Engineering"]).map((s, idx) => ({
          id: `sk-${idx}`,
          name: s,
          level: "advanced",
        })),
        interests: (mentee.student?.interests || ["Backend Engineering"]).map((i, idx) => ({
          id: `int-${idx}`,
          name: i,
        })),
        bio: `Active mentee in ${mentee.focus}. Focused on practical systems engineering and production interview readiness.`,
        seekingMentorshipIn: [mentee.focus],
        projects: ["High-Throughput Concurrent System", "PostgreSQL Index Optimization"],
        matchScore: 95,
        privacy: {
          isProfilePublic: true,
          showGpa: false,
          showEmail: false,
          showResume: true,
          showAchievements: true,
        },
      };
      setProfileStudent(fallback);
    }
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
    setSchedulingMentee(null);
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
    showToast(`Session rescheduled to ${data.date} at ${data.time}.`);
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
    showToast("Session cancelled. Notifications dispatched to participants.");
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

  const handleEndMentorshipConfirm = (mentorshipId: string, notes?: string) => {
    const mentee = activeMentees.find((m) => m.id === mentorshipId);
    const studentName = mentee?.student?.name || "Student";
    endMentorship(mentorshipId, notes);
    showToast(`Mentorship concluded with ${studentName}. Track archived to completed history.`);
    setEndingMentee(null);
    if (selectedDetailsMentee?.id === mentorshipId) {
      setSelectedDetailsMentee(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <UserCheck size={20} className="text-[#0a66c2]" />
              <span>My Mentees &amp; Career Tracks</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Guide students with dedicated 1-on-1 milestone tracking, session notes, and scheduled mock interview reviews.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAiAssistantInitialTab("session_prep");
                setAiAssistantMentee(activeMentees[0] || null);
                setIsAIAssistantOpen(true);
              }}
              className="text-xs text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50 flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>AI Assistant</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSchedulingMentee(activeMentees[0] || null)}
              className="text-xs flex items-center gap-1.5"
            >
              <Calendar size={13} className="text-[#0a66c2]" />
              <span>Schedule Session</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              asChild
              className="bg-[#0a66c2] hover:bg-[#004182] text-xs"
            >
              <Link href="/alumni-dashboard/students">Discover Students &rarr;</Link>
            </Button>
          </div>
        </div>

        {/* Capacity & Stats Strip */}
        <div className="mt-5 pt-5 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Active Roster</span>
              <UserCheck size={14} className="text-[#057642]" />
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {activeMentees.length} <span className="text-xs font-normal text-gray-500">/ 5 Capacity</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                5 - activeMentees.length > 0 ? "bg-[#057642]" : "bg-amber-500"
              )} />
              <span className={cn(
                "text-[11px] font-semibold",
                5 - activeMentees.length > 0 ? "text-[#057642]" : "text-amber-700"
              )}>
                {5 - activeMentees.length > 0
                  ? `${5 - activeMentees.length} available slots`
                  : "At full capacity"}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Upcoming Sessions</span>
              <Calendar size={14} className="text-[#0a66c2]" />
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {allSessions.filter((s) => s.status === "scheduled" || s.status === "confirmed" || s.status === "rescheduled").length}{" "}
              <span className="text-xs font-normal text-gray-500">Booked</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Calendar synchronized
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Total Sessions</span>
              <Clock size={14} className="text-purple-600" />
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {totalSessionsCount}{" "}
              <span className="text-xs font-normal text-gray-500">Delivered</span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium mt-1">
              Across all mentees
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-200/80 shadow-2xs hover:border-gray-300 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-medium">Completed Tracks</span>
              <Award size={14} className="text-[#0a66c2]" />
            </div>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {completedMentees.length}{" "}
              <span className="text-xs font-normal text-gray-500">Graduates</span>
            </div>
            <p className="text-[11px] text-[#0a66c2] font-semibold mt-1">
              Successful alumni transitions
            </p>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="mt-6 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2",
                activeTab === "active"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              <span>Active Mentees</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#057642] border border-[#bfe3c9]">
                {activeMentees.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("sessions")}
              className={cn(
                "pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2",
                activeTab === "sessions"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              <Calendar size={13} />
              <span>Mentorship Sessions</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0a66c2] border border-[#b2d5f8]">
                {allSessions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={cn(
                "pb-3 px-3 font-semibold border-b-2 transition-colors flex items-center gap-2",
                activeTab === "completed"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              <span>Completed Tracks</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-200">
                {completedMentees.length}
              </span>
            </button>
          </div>

          {/* Search Field */}
          <div className="relative pb-2.5">
            <Search size={14} className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by student name, career track, skills..."
              className="pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#0a66c2] w-64 sm:w-72 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* SESSIONS VIEW (PART A) */}
      {activeTab === "sessions" && (
        <div className="space-y-4">
          {/* Sub-Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 text-xs">
              {[
                { id: "upcoming" as SessionFilter, label: "Upcoming & Scheduled" },
                { id: "completed" as SessionFilter, label: "Completed / Past" },
                { id: "cancelled" as SessionFilter, label: "Cancelled" },
                { id: "all" as SessionFilter, label: "All Sessions" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSessionFilter(f.id)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    sessionFilter === f.id
                      ? "bg-[#0a66c2] text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSchedulingMentee(activeMentees[0] || null)}
              className="text-xs text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50 flex items-center gap-1"
            >
              <Plus size={12} />
              <span>Book New Session</span>
            </Button>
          </div>

          {displayedSessions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
              <Calendar size={32} className="mx-auto text-gray-300 mb-2" />
              <h3 className="text-sm font-bold text-gray-900">No sessions found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No mentorship sessions match the &quot;{sessionFilter}&quot; filter. Schedule a 1:1 session with an accepted mentee.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSchedulingMentee(activeMentees[0] || null)}
                className="mt-4 bg-[#0a66c2] hover:bg-[#004182] text-xs"
              >
                Schedule Session
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedSessions.map((sess) => {
                const isSessCancelled = sess.status === "cancelled";
                const isSessCompleted = sess.status === "completed";
                const isSessRescheduled = sess.status === "rescheduled";

                return (
                  <div
                    key={sess.id}
                    className="bg-white border border-gray-200/90 rounded-xl p-5 shadow-xs hover:border-[#b2d5f8] transition-all space-y-4"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex items-start gap-3.5 min-w-0">
                        <Avatar name={sess.studentName} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-sm font-bold text-gray-900 leading-snug">
                              {sess.topic}
                            </h3>
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                sess.status === "confirmed" && "bg-[#eef8f1] text-[#057642] border-[#bfe3c9]",
                                sess.status === "scheduled" && "bg-blue-50 text-[#0a66c2] border-[#b2d5f8]",
                                sess.status === "rescheduled" && "bg-amber-50 text-amber-700 border-amber-200",
                                sess.status === "completed" && "bg-purple-50 text-purple-700 border-purple-200",
                                sess.status === "cancelled" && "bg-red-50 text-red-700 border-red-200"
                              )}
                            >
                              {sess.status}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 mt-1">
                            With <strong className="text-gray-900">{sess.studentName}</strong> · {sess.studentAcademicYear} ({sess.studentDepartment})
                          </p>

                          {isSessRescheduled && sess.previousDate && (
                            <p className="text-[11px] text-amber-700 mt-1.5 flex items-center gap-1 font-medium">
                              <RefreshCw size={11} />
                              <span>Rescheduled from {formatDisplayDate(sess.previousDate)} at {sess.previousTime}</span>
                            </p>
                          )}

                          {isSessCancelled && sess.cancellationReason && (
                            <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                              <Ban size={11} />
                              <span>Cancelled: {sess.cancellationReason}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Date/Time Badge & Action */}
                      <div className="flex items-center gap-4 shrink-0 flex-wrap lg:justify-end">
                        <div className="px-3.5 py-2 bg-gray-50 rounded-lg border border-gray-200/80 text-left sm:text-right">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-900 text-xs">
                            <Calendar size={13} className="text-[#0a66c2]" />
                            <span>{formatDisplayDate(sess.date)}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-[11px] mt-0.5">
                            <Clock size={11} className="text-gray-400" />
                            <span>{sess.time}</span>
                          </div>
                        </div>

                        {/* Video Link */}
                        {sess.meetUrl && !isSessCancelled && (
                          <Button
                            variant="primary"
                            size="sm"
                            asChild
                            className="bg-[#0a66c2] hover:bg-[#004182] text-xs shrink-0"
                          >
                            <a
                              href={sess.meetUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5"
                            >
                              <Video size={13} />
                              <span>Join Call</span>
                              <ExternalLink size={11} />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Agenda Snippet */}
                    {sess.agenda && (
                      <div className="p-3 bg-gray-50/80 border border-gray-100 rounded-lg text-xs text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900 block mb-1">Discussion Agenda:</span>
                        <span>{sess.agenda}</span>
                      </div>
                    )}

                    {/* Notes Snippet if Completed */}
                    {sess.notes && (
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg text-xs text-purple-900 leading-relaxed">
                        <span className="font-semibold block mb-1">Mentor Notes &amp; Progress:</span>
                        <span>{sess.notes}</span>
                      </div>
                    )}

                    {/* Actions Toolbar */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSessionForDetail(sess)}
                          className="text-xs font-semibold text-[#0a66c2] hover:underline"
                        >
                          View Session Details
                        </button>
                        <span className="text-gray-300">·</span>
                        <Link
                          href={`/messages?participantId=${sess.studentId}`}
                          className="text-xs text-gray-600 hover:text-gray-900 hover:underline flex items-center gap-1"
                        >
                          <MessageSquare size={12} />
                          <span>Message {sess.studentName}</span>
                        </Link>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isSessCancelled && !isSessCompleted && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSessionToReschedule(sess)}
                              className="text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                            >
                              <RefreshCw size={11} className="mr-1" />
                              <span>Reschedule</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setSessionToCancel(sess)}
                              className="text-xs text-gray-500 hover:text-red-600 hover:border-red-200"
                            >
                              <Ban size={11} className="mr-1" />
                              <span>Cancel</span>
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteSession(sess)}
                              className="text-xs text-[#057642] border-emerald-200 hover:bg-emerald-50"
                            >
                              <CheckCircle size={11} className="mr-1" />
                              <span>Mark Complete</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MENTEES VIEW (ACTIVE / COMPLETED) */}
      {activeTab !== "sessions" && displayedMentees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <History size={36} className="mx-auto text-gray-300 mb-2" />
          <h3 className="text-sm font-bold text-gray-900">
            {activeTab === "active" ? "No active mentees found" : "No completed tracks yet"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {activeTab === "active"
              ? "You do not have any active mentorship tracks matching your search. Review pending requests or invite qualified students."
              : "Completed mentorships and alumni graduation histories will be stored here."}
          </p>
          {activeTab === "active" && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href="/alumni-dashboard/requests">View Requests</Link>
              </Button>
              <Button
                variant="primary"
                size="sm"
                asChild
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs"
              >
                <Link href="/alumni-dashboard/students">Discover Students</Link>
              </Button>
            </div>
          )}
        </div>
      ) : activeTab !== "sessions" && (
        <div className="space-y-4">
          {displayedMentees.map((m) => {
            const studentName = m.student?.name || "Student";
            const studentId = m.studentId || m.student?.id;
            const isActive = m.status === "active";
            const isCompleted = m.status === "completed";

            // Milestones progress
            const milestones = m.milestones || [];
            const completedMilestonesCount = milestones.filter((ms) => ms.completed).length;
            const totalMilestonesCount = milestones.length;
            const progressPercent =
              m.progressPercent !== undefined
                ? m.progressPercent
                : totalMilestonesCount > 0
                ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100)
                : 0;

            return (
              <div
                key={m.id}
                className="bg-white border border-gray-200/90 rounded-xl p-5 sm:p-6 shadow-xs hover:border-[#b2d5f8] transition-all space-y-4"
              >
                {/* Top Row: Student Identity & Mentorship Key Metrics */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <Avatar name={studentName} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleOpenProfile(studentId, m)}
                          className="text-base font-bold text-gray-900 hover:text-[#0a66c2] hover:underline text-left transition-colors"
                        >
                          {studentName}
                        </button>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            isActive && "bg-[#eef8f1] text-[#057642] border-[#bfe3c9]",
                            isCompleted && "bg-blue-50 text-[#0a66c2] border-blue-200"
                          )}
                        >
                          {isActive ? "Active Mentee" : "Completed Track"}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#0a66c2] border border-blue-100 flex items-center gap-1">
                          <Target size={12} className="shrink-0" />
                          <span>Track: {m.focus}</span>
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {m.student?.academicYear || "Undergraduate"} · {m.student?.department || "Computer Science"} · University of Technology
                      </p>
                    </div>
                  </div>

                  {/* Highlights Strip */}
                  <div className="flex items-center gap-2.5 shrink-0 flex-wrap lg:justify-end">
                    {m.startDate && (
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200/70 text-left sm:text-right">
                        <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wider">Started</span>
                        <span className="text-xs font-semibold text-gray-800">{formatDisplayDate(m.startDate)}</span>
                      </div>
                    )}
                    <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200/70 text-left sm:text-right">
                      <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wider">Sessions</span>
                      <span className="text-xs font-bold text-gray-900">{m.sessionCount || 0} completed</span>
                    </div>
                    {m.nextSession ? (
                      <div className="px-3 py-1.5 bg-blue-50/70 rounded-lg border border-blue-200/70 text-left sm:text-right">
                        <span className="text-[10px] text-[#0a66c2] font-semibold block uppercase tracking-wider">Next Session</span>
                        <span className="text-xs font-bold text-gray-900">{m.nextSession}</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200/70 text-left sm:text-right">
                        <span className="text-[10px] text-gray-400 font-medium block uppercase tracking-wider">Next Session</span>
                        <span className="text-xs text-gray-500 font-medium">Not booked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Row: Two-column split for Career Goals/Skills and Milestones Roadmap */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3.5 border-t border-gray-100 items-center">
                  <div className="lg:col-span-7 space-y-2">
                    {m.student?.careerGoal && (
                      <p className="text-xs text-gray-700 leading-relaxed">
                        <strong className="text-gray-900">Career Goal:</strong> {m.student.careerGoal}
                      </p>
                    )}

                    {m.student?.skills && m.student.skills.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        <span className="text-[11px] font-medium text-gray-400 mr-1">Skills:</span>
                        {m.student.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 bg-gray-50 text-gray-700 border border-gray-200/80 rounded-md text-[11px] font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-5 bg-gray-50/80 rounded-xl p-3.5 border border-gray-200/70">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                      <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <Award size={13} className="text-[#0a66c2]" />
                        <span>Milestone Progress</span>
                      </span>
                      <span className="font-bold text-[#0a66c2]">
                        {completedMilestonesCount} of {totalMilestonesCount} ({progressPercent}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-[#0a66c2] rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenProfile(studentId, m)}
                      className="font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <User size={12} />
                      <span>View Profile</span>
                    </button>

                    <span className="text-gray-300">·</span>

                    <Link
                      href={`/messages?participantId=${studentId}`}
                      className="font-semibold text-gray-600 hover:text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <MessageSquare size={12} />
                      <span>Message Mentee</span>
                    </Link>

                    <span className="text-gray-300">·</span>

                    <button
                      type="button"
                      onClick={() => {
                        setAiAssistantInitialTab("session_prep");
                        setAiAssistantMentee(m);
                        setIsAIAssistantOpen(true);
                      }}
                      className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={11} />
                      <span>Prepare with AI</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* View Details / Roadmap */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDetailsMentee(m)}
                      className="text-xs text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50"
                    >
                      <BookOpen size={12} className="mr-1" />
                      <span>View Details &amp; Roadmap</span>
                    </Button>

                    {/* Schedule Session */}
                    {isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSchedulingMentee(m)}
                        className="text-xs text-gray-700 hover:text-gray-900"
                      >
                        <Calendar size={12} className="mr-1" />
                        <span>Schedule Session</span>
                      </Button>
                    )}

                    {/* End Mentorship */}
                    {isActive && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEndingMentee(m)}
                        className="text-xs text-gray-500 hover:text-red-600 hover:border-red-200"
                      >
                        <XCircle size={12} className="mr-1" />
                        <span>End Mentorship</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Mentorship Details Modal (Page 3) */}
      <MentorshipDetailsModal
        mentorship={selectedDetailsMentee}
        isOpen={!!selectedDetailsMentee}
        onClose={() => setSelectedDetailsMentee(null)}
        onScheduleSession={(mentee) => {
          setSelectedDetailsMentee(null);
          setSchedulingMentee(mentee);
        }}
        onEndMentorship={(mentee) => {
          setSelectedDetailsMentee(null);
          setEndingMentee(mentee);
        }}
        onViewStudentProfile={(studentId) => {
          handleOpenProfile(studentId, selectedDetailsMentee || undefined);
        }}
        onOpenAIAssistant={(mentee) => {
          setAiAssistantInitialTab("session_prep");
          setAiAssistantMentee(mentee);
          setIsAIAssistantOpen(true);
        }}
      />

      {/* Schedule / Reschedule Session Modal */}
      <ScheduleSessionModal
        isOpen={!!schedulingMentee || !!sessionToReschedule}
        mentee={schedulingMentee}
        sessionToReschedule={sessionToReschedule}
        activeMentees={activeMentees}
        onClose={() => {
          setSchedulingMentee(null);
          setSessionToReschedule(null);
        }}
        onSessionScheduled={handleScheduleSubmit}
        onSessionRescheduled={handleRescheduleConfirm}
        onOpenAIAssistant={(m) => {
          setAiAssistantInitialTab("session_prep");
          setAiAssistantMentee(m);
          setIsAIAssistantOpen(true);
        }}
      />

      {/* Cancel Session Confirmation Modal */}
      <CancelSessionModal
        isOpen={!!sessionToCancel}
        session={sessionToCancel}
        onClose={() => setSessionToCancel(null)}
        onConfirmCancel={handleCancelConfirm}
      />

      {/* Session Detail Modal */}
      <SessionDetailModal
        isOpen={!!selectedSessionForDetail}
        session={selectedSessionForDetail}
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

      {/* AI Mentorship Assistant Modal */}
      <AIMentorshipAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        activeMentees={activeMentees}
        preselectedMentee={aiAssistantMentee}
        initialTab={aiAssistantInitialTab}
        onInsertAgenda={(agenda) => {
          showToast(`Agenda ready: ${agenda.slice(0, 40)}...`);
        }}
      />

      {/* End Mentorship Confirmation Modal */}
      <EndMentorshipModal
        isOpen={!!endingMentee}
        mentorship={endingMentee}
        onClose={() => setEndingMentee(null)}
        onConfirmEnd={handleEndMentorshipConfirm}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={profileStudent}
        isOpen={!!profileStudent}
        onClose={() => setProfileStudent(null)}
        onOfferMentorship={(student) => {
          offerMentorshipToStudent(student.id, student.careerGoal);
          showToast(`Invitation sent to ${student.name}!`);
          setProfileStudent(null);
        }}
      />
    </div>
  );
}
