"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Inbox,
  Check,
  X,
  MessageSquare,
  Search,
  CheckCircle2,
  Target,
  User,
  Clock,
  Award,

} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import {
  subscribeToDashboardStorage,
  loadMentorshipActivity,
  acceptMentorshipRequest,
  declineMentorshipRequest,
  getStudentById,
  offerMentorshipToStudent,
} from "@/lib/dashboard-storage";
import { initialMentorshipActivity } from "@/lib/mock-data";
import { DeclineRequestModal } from "@/components/alumni-dashboard/DeclineRequestModal";
import { StudentDetailModal } from "@/components/alumni-dashboard/StudentDetailModal";
import { cn } from "@/lib/utils";
import type { Mentorship, DiscoverStudent } from "@/types";

type RequestTab = "pending" | "accepted" | "declined" | "completed" | "outgoing" | "all";

export default function AlumniRequestsPage() {
  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const [activeTab, setActiveTab] = useState<RequestTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [declineTargetRequest, setDeclineTargetRequest] = useState<Mentorship | null>(null);
  const [detailStudent, setDetailStudent] = useState<DiscoverStudent | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const pendingIncoming = useMemo(
    () => mentorshipActivity.pendingRequests.filter((r) => r.direction !== "outgoing"),
    [mentorshipActivity.pendingRequests]
  );
  const pendingOutgoing = useMemo(
    () => mentorshipActivity.pendingRequests.filter((r) => r.direction === "outgoing"),
    [mentorshipActivity.pendingRequests]
  );
  const acceptedList = useMemo(
    () => mentorshipActivity.acceptedMentorships || [],
    [mentorshipActivity.acceptedMentorships]
  );
  const declinedList = useMemo(
    () => mentorshipActivity.declinedRequests || [],
    [mentorshipActivity.declinedRequests]
  );
  const completedList = useMemo(
    () => mentorshipActivity.completedMentorships || [],
    [mentorshipActivity.completedMentorships]
  );

  // Combine all requests for "All" tab
  const allRequests = useMemo(() => {
    return [
      ...pendingIncoming,
      ...pendingOutgoing,
      ...acceptedList,
      ...declinedList,
      ...completedList,
    ];
  }, [pendingIncoming, pendingOutgoing, acceptedList, declinedList, completedList]);

  const filteredRequests = useMemo(() => {
    let list: Mentorship[] = [];
    if (activeTab === "pending") list = pendingIncoming;
    else if (activeTab === "accepted") list = acceptedList;
    else if (activeTab === "declined") list = declinedList;
    else if (activeTab === "completed") list = completedList;
    else if (activeTab === "outgoing") list = pendingOutgoing;
    else if (activeTab === "all") list = allRequests;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        (r.student?.name || "").toLowerCase().includes(q) ||
        r.focus.toLowerCase().includes(q) ||
        (r.student?.department || "").toLowerCase().includes(q) ||
        (r.requestMessage && r.requestMessage.toLowerCase().includes(q))
    );
  }, [activeTab, pendingIncoming, acceptedList, declinedList, completedList, pendingOutgoing, allRequests, searchQuery]);

  const handleAccept = (req: Mentorship) => {
    if (processingId) return;
    setProcessingId(req.id);
    const studentName = req.student?.name || "Student";
    const res = acceptMentorshipRequest(req.id);
    if (res.success) {
      showToast(`Mentorship request from ${studentName} accepted! Student added to your active mentees.`);
    }
    setProcessingId(null);
  };

  const handleConfirmDecline = (requestId: string, reason?: string) => {
    const target = mentorshipActivity.pendingRequests.find((r) => r.id === requestId);
    const studentName = target?.student?.name || "Student";
    declineMentorshipRequest(requestId, reason);
    showToast(`Mentorship request from ${studentName} declined.`);
  };

  const handleViewProfile = (req: Mentorship) => {
    const studentId = req.studentId || req.student?.id;
    if (studentId) {
      const existing = getStudentById(studentId);
      if (existing) {
        setDetailStudent(existing);
        return;
      }
    }

    // Fallback construct from request data
    const fallbackStudent: DiscoverStudent = {
      id: studentId || "temp-student",
      name: req.student?.name || "Student",
      headline: `${req.student?.academicYear || "Student"} in ${req.student?.department || "Computer Science"}`,
      university: "University of Technology",
      department: req.student?.department || "Computer Science",
      academicYear: req.student?.academicYear || "Undergraduate",
      graduationYear: 2027,
      careerGoal: req.student?.careerGoal || req.focus,
      skills: (req.student?.skills || ["Problem Solving", "Systems Design"]).map((s, idx) => ({
        id: `sk-${idx}`,
        name: s,
        level: "intermediate",
      })),
      interests: (req.student?.interests || ["Software Engineering"]).map((i, idx) => ({
        id: `int-${idx}`,
        name: i,
      })),
      bio: req.requestMessage || "Motivated university student looking to expand technical expertise and career perspectives.",
      seekingMentorshipIn: [req.focus],
      projects: ["Full-Stack Distributed System", "Database Performance Optimizer"],
      matchScore: 92,
      privacy: {
        isProfilePublic: true,
        showGpa: false,
        showEmail: false,
        showResume: true,
        showAchievements: true,
      },
    };
    setDetailStudent(fallbackStudent);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#191919] text-white text-xs px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls Surface */}
      <div className="bg-white border border-[#E7E7E7] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191919] tracking-tight flex items-center gap-2.5">
              <Inbox size={22} className="text-[#090909]" />
              <span>Mentorship Requests</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-2xl leading-relaxed">
              Review and manage incoming mentorship requests from students, track personalized invitations, and manage your mentorship pipeline.
            </p>
          </div>

          <Link
            href="/alumni-dashboard/students"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-[#090909] bg-white hover:bg-neutral-100 border border-[#E7E7E7] rounded-full transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            <span>Discover Students</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Tab Navigation and Search Row */}
        <div className="pt-4 border-t border-[#EAEAEA] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0" role="tablist">
            {[
              { key: "pending", label: "Pending", count: pendingIncoming.length, badgeColor: "bg-neutral-100 text-neutral-800" },
              { key: "accepted", label: "Accepted", count: acceptedList.length, badgeColor: "bg-neutral-900 text-white" },
              { key: "declined", label: "Declined", count: declinedList.length, badgeColor: "bg-[#F3F2EF] text-[#666666]" },
              { key: "completed", label: "Completed", count: completedList.length, badgeColor: "bg-neutral-100 text-neutral-800" },
              { key: "outgoing", label: "Sent Invitations", count: pendingOutgoing.length, badgeColor: "bg-neutral-100 text-neutral-800" },
              { key: "all", label: "All", count: allRequests.length, badgeColor: "bg-[#F3F2EF] text-[#666666]" },
            ].map((t) => {
              const isSelected = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveTab(t.key as RequestTab)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0",
                    isSelected
                      ? "bg-[#090909] text-white shadow-2xs"
                      : "text-[#666666] hover:text-[#191919] hover:bg-neutral-100"
                  )}
                >
                  <span>{t.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-none",
                      isSelected ? "bg-white/20 text-white" : t.badgeColor
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-72 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student, topic, department..."
              className="w-full pl-8 pr-8 py-2 text-xs bg-[#F8FAFC] border border-[#D9D9D9] rounded-lg text-[#191919] placeholder-[#888888] focus:bg-white focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-[#D9D9D9] rounded-lg p-12 sm:p-16 text-center shadow-xs">
          <div className="h-14 w-14 rounded-full bg-[#F3F2EF] text-[#666666] flex items-center justify-center mx-auto mb-4">
            <Inbox size={26} />
          </div>
          <h3 className="text-base font-bold text-[#191919]">
            {activeTab === "pending"
              ? "No pending requests from students"
              : activeTab === "accepted"
              ? "No accepted mentees found"
              : activeTab === "declined"
              ? "No declined requests in history"
              : activeTab === "completed"
              ? "No completed mentorship tracks yet"
              : activeTab === "outgoing"
              ? "You haven't sent any invitations yet"
              : "No requests found matching your search"}
          </h3>
          <p className="text-xs sm:text-sm text-[#666666] mt-1.5 max-w-md mx-auto leading-relaxed">
            {activeTab === "pending"
              ? "When students submit mentorship requests to you, they will appear here with their background and career goals."
              : "Browse the student directory to discover and invite promising students to connect."}
          </p>
          <Link
            href="/alumni-dashboard/students"
            className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 text-xs font-semibold text-[#090909] bg-white hover:bg-neutral-100 border border-[#E7E7E7] rounded-full transition-colors"
          >
            <span>Browse Students</span>
            <span>&rarr;</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isPending = req.status === "pending";
            const isAccepted = req.status === "active";
            const isDeclined = req.status === "declined";
            const isCompleted = req.status === "completed";
            const isOutgoing = req.direction === "outgoing";
            const studentName = req.student?.name || "Student";
            const studentId = req.studentId || req.student?.id;

            return (
              <div
                key={req.id}
                className="bg-white border border-[#E7E7E7] hover:border-black rounded-xl p-5 sm:p-6 shadow-xs hover:shadow-sm transition-all space-y-4"
              >
                {/* Header Row: Student Information & Status */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <Avatar name={studentName} size="md" className="shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(req)}
                          className="text-sm font-bold text-[#191919] hover:text-black hover:underline truncate text-left"
                        >
                          {studentName}
                        </button>

                        {isOutgoing ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                            Sent Invitation
                          </span>
                        ) : isPending ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]">
                            Pending Review
                          </span>
                        ) : isAccepted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-900 text-white">
                            Active Mentee
                          </span>
                        ) : isCompleted ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-800 border border-neutral-200">
                            Completed Track
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F3F2EF] text-[#666666] border border-[#D9D9D9]">
                            Declined
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#666666] mt-0.5 truncate">
                        {req.student?.academicYear || "Undergraduate"} · {req.student?.department || "Computer Science"}
                      </p>

                      {req.student?.careerGoal && (
                        <p className="text-xs text-[#444444] mt-1">
                          Career Aspiration: <strong className="text-[#191919] font-semibold">{req.student.careerGoal}</strong>
                        </p>
                      )}

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-900 font-semibold">
                        <Target size={13} className="shrink-0" />
                        <span>Requested Focus: {req.focus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#EAEAEA]">
                    <span className="text-xs text-[#888888] inline-flex items-center sm:justify-end gap-1.5">
                      <Clock size={12} className="shrink-0" />
                      <span>Requested: {req.requestDate || "Recent"}</span>
                    </span>
                    {req.sessionCount > 0 && (
                      <span className="text-xs text-neutral-800 font-semibold block mt-1">
                        {req.sessionCount} session{req.sessionCount === 1 ? "" : "s"} conducted
                      </span>
                    )}
                  </div>
                </div>

                {/* Student message quote */}
                {req.requestMessage && (
                  <div className="bg-[#F8FAFC] rounded-md p-3.5 border border-[#EAEAEA] text-xs text-[#444444] leading-relaxed italic">
                    &ldquo;{req.requestMessage}&rdquo;
                  </div>
                )}

                {/* Decline reason note if declined */}
                {isDeclined && req.declinedReason && (
                  <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-md text-xs text-neutral-800">
                    <span className="font-semibold block text-[11px] mb-0.5">Decline Reason Provided:</span>
                    <span>{req.declinedReason}</span>
                  </div>
                )}

                {/* Career Interests / Skills Pills */}
                {req.student?.interests && req.student.interests.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="text-[11px] text-[#888888] font-medium mr-1">Interests:</span>
                    {req.student.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-full text-[11px] bg-neutral-100 text-neutral-900 border border-neutral-200 font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3.5 border-t border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleViewProfile(req)}
                      className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1.5 py-1"
                    >
                      <User size={13} />
                      <span>View Student Profile</span>
                    </button>

                    <span className="text-[#D9D9D9]">·</span>

                    <Link
                      href={`/messages?participantId=${studentId}`}
                      className="text-xs font-semibold text-[#666666] hover:text-black hover:underline flex items-center gap-1.5 py-1"
                    >
                      <MessageSquare size={13} />
                      <span>Message Student</span>
                    </Link>
                  </div>

                  {/* Pending incoming request actions */}
                  {isPending && !isOutgoing && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={processingId === req.id}
                        onClick={() => setDeclineTargetRequest(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#666666] hover:text-black hover:bg-neutral-100 border border-[#D9D9D9] transition-colors"
                      >
                        <X size={13} />
                        <span>Decline</span>
                      </button>
                      <button
                        type="button"
                        disabled={processingId === req.id}
                        onClick={() => handleAccept(req)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#090909] hover:bg-[#242424] text-white shadow-2xs transition-colors"
                      >
                        <Check size={13} />
                        <span>{processingId === req.id ? "Accepting..." : "Accept Request"}</span>
                      </button>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="flex items-center gap-2">
                      <Link
                        href="/alumni-dashboard/mentees"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 border border-[#E7E7E7] transition-colors"
                      >
                        <span>View Mentee Profile</span>
                        <span>&rarr;</span>
                      </Link>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-900 font-semibold bg-neutral-100 border border-neutral-200 px-2.5 py-1 rounded-full">
                      <Award size={14} />
                      <span>Track Successfully Concluded</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Request Modal */}
      <DeclineRequestModal
        isOpen={!!declineTargetRequest}
        request={declineTargetRequest}
        onClose={() => setDeclineTargetRequest(null)}
        onConfirmDecline={handleConfirmDecline}
      />

      {/* Student Detail Modal */}
      <StudentDetailModal
        student={detailStudent}
        isOpen={!!detailStudent}
        onClose={() => setDetailStudent(null)}
        onOfferMentorship={(student) => {
          offerMentorshipToStudent(student.id, student.careerGoal);
          showToast(`Mentorship invitation sent to ${student.name}!`);
          setDetailStudent(null);
        }}
      />
    </div>
  );
}
