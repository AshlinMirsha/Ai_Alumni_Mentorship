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
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadMentorshipActivity,
  scheduleMentorshipSession,
  endMentorship,
  getStudentById,
  offerMentorshipToStudent,
} from "@/lib/dashboard-storage";
import { initialMentorshipActivity } from "@/lib/mock-data";
import { MentorshipDetailsModal } from "@/components/alumni-dashboard/MentorshipDetailsModal";
import { ScheduleSessionModal } from "@/components/alumni-dashboard/ScheduleSessionModal";
import { EndMentorshipModal } from "@/components/alumni-dashboard/EndMentorshipModal";
import { StudentDetailModal } from "@/components/alumni-dashboard/StudentDetailModal";
import { cn } from "@/lib/utils";
import type { Mentorship, DiscoverStudent } from "@/types";

export default function MyMenteesPage() {
  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const activeMentees = useMemo(
    () => mentorshipActivity.acceptedMentorships || [],
    [mentorshipActivity.acceptedMentorships]
  );
  const completedMentees = useMemo(
    () => mentorshipActivity.completedMentorships || [],
    [mentorshipActivity.completedMentorships]
  );


  const [activeTab, setActiveTab] = useState<"active" | "completed">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [selectedDetailsMentee, setSelectedDetailsMentee] = useState<Mentorship | null>(null);
  const [schedulingMentee, setSchedulingMentee] = useState<Mentorship | null>(null);
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
    scheduleMentorshipSession(sessionData);
    showToast(`Session successfully scheduled with ${sessionData.studentName} for ${sessionData.date} at ${sessionData.time}!`);
    setSchedulingMentee(null);
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

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs text-gray-700"
            >
              <Link href="/alumni-dashboard/requests">View Requests</Link>
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
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Active Roster</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {activeMentees.length} / 5 Students
            </div>
            <span className="text-[10px] text-[#057642] font-semibold">
              {5 - activeMentees.length > 0
                ? `${5 - activeMentees.length} available slots`
                : "At full capacity"}
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Total Sessions</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {totalSessionsCount} Sessions
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Logged across all tracks</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Completed Tracks</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {completedMentees.length} Students
            </div>
            <span className="text-[10px] text-[#0a66c2] font-semibold">
              Successful graduations
            </span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Mentor Rating</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              4.98 / 5.0
            </div>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Top 5% alumni mentor
            </span>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="mt-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("active")}
              className={cn(
                "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
                activeTab === "active"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              <span>Active Mentees</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-[#057642]">
                {activeMentees.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("completed")}
              className={cn(
                "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
                activeTab === "completed"
                  ? "border-[#0a66c2] text-[#0a66c2]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              )}
            >
              <History size={13} />
              <span>Completed History</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                {completedMentees.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="pb-2 relative w-full sm:w-64">
            <Search size={13} className="absolute left-2.5 top-2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mentee name or skill..."
              className="w-full pl-7 pr-3 py-1 text-xs bg-gray-50 border border-gray-200 rounded text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>
        </div>
      </div>

      {/* Mentees Roster Grid */}
      {displayedMentees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <UserCheck size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
            {activeTab === "active"
              ? "No active mentees currently found"
              : "No completed mentorship records found"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {activeTab === "active"
              ? "Review pending mentorship requests or browse the student directory to accept new mentees."
              : "Completed mentorship relationships will appear here once archived."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Button variant="outline" size="sm" asChild className="text-xs">
              <Link href="/alumni-dashboard/requests">Review Requests</Link>
            </Button>
            <Button variant="primary" size="sm" asChild className="text-xs bg-[#0a66c2]">
              <Link href="/alumni-dashboard/students">Discover Students</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedMentees.map((m) => {
            const studentName = m.student?.name || "Student";
            const studentId = m.studentId || m.student?.id;
            const isActive = m.status === "active";
            const isCompleted = m.status === "completed";

            // Milestone progress
            const milestones = m.milestones || [];
            const completedMilestonesCount = milestones.filter((ms) => ms.completed).length;
            const totalMilestonesCount = milestones.length;
            const progressPercent =
              m.progressPercent !== undefined
                ? m.progressPercent
                : totalMilestonesCount > 0
                ? Math.round((completedMilestonesCount / totalMilestonesCount) * 100)
                : 0;

            // Formatted next session
            let nextSessionFormatted: string | null = null;
            if (m.nextSession) {
              try {
                const d = new Date(m.nextSession);
                nextSessionFormatted = d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              } catch {
                nextSessionFormatted = m.nextSession;
              }
            }

            return (
              <div
                key={m.id}
                className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:border-[#b2d5f8] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <Avatar name={studentName} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900">{studentName}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                            Active Mentee
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0a66c2] border border-blue-200">
                            Completed Track
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">
                        {m.student?.department || "Computer Science"} · {m.student?.academicYear || "Undergraduate"}
                      </p>

                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#0a66c2] font-semibold">
                        <Target size={13} className="shrink-0" />
                        <span>Focus: {m.focus}</span>
                      </div>

                      {/* Career Goal */}
                      {m.student?.careerGoal && (
                        <div className="mt-1 text-xs text-gray-600">
                          Target Role: <strong className="text-gray-900">{m.student.careerGoal}</strong>
                        </div>
                      )}

                      {/* Skills they want to develop */}
                      {m.student?.skills && m.student.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1 items-center">
                          <span className="text-[10px] text-gray-400 font-medium mr-1">Skills developing:</span>
                          {m.student.skills.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.2 rounded text-[10px] bg-gray-100 text-gray-700 font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sessions & Timeline Info */}
                  <div className="shrink-0 flex flex-col md:items-end gap-2 text-xs">
                    <div className="md:text-right">
                      <span className="font-bold text-gray-900 block">
                        {m.sessionCount} Sessions Conducted
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">
                        Started: {m.startDate || "Recent"}
                      </span>
                    </div>

                    {/* Next Session indicator */}
                    {isActive && (
                      <div className="mt-1">
                        {nextSessionFormatted ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                            <Calendar size={12} />
                            <span>Next: {nextSessionFormatted}</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSchedulingMentee(m)}
                            className="text-[11px] font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                          >
                            <Calendar size={12} />
                            <span>Schedule Next Session &rarr;</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                    <span className="font-semibold text-gray-900 flex items-center gap-1.5">
                      <Award size={13} className="text-[#0a66c2]" />
                      <span>Roadmap &amp; Milestones</span>
                    </span>
                    <span className="font-bold text-[#0a66c2]">
                      {completedMilestonesCount} of {totalMilestonesCount} completed ({progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-[#0a66c2] rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenProfile(studentId, m)}
                      className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <User size={12} />
                      <span>View Profile</span>
                    </button>

                    <span className="text-gray-300">·</span>

                    <Link
                      href={`/messages?participantId=${studentId}`}
                      className="text-xs font-semibold text-gray-600 hover:text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <MessageSquare size={12} />
                      <span>Message Mentee</span>
                    </Link>
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
      />

      {/* Schedule Session Modal */}
      <ScheduleSessionModal
        isOpen={!!schedulingMentee}
        mentee={schedulingMentee}
        activeMentees={activeMentees}
        onClose={() => setSchedulingMentee(null)}
        onSessionScheduled={handleScheduleSubmit}
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
