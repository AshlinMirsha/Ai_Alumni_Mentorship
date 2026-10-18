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
import { Button } from "@/components/ui/Button";
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <Inbox size={20} className="text-[#0a66c2]" />
              <span>Mentorship Requests</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review and manage incoming mentorship requests from students, as well as invitations and relationship history.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs shrink-0"
          >
            <Link href="/alumni-dashboard/students">Discover Students &rarr;</Link>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 border-b border-gray-200 flex flex-wrap gap-1 sm:gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("pending")}
            className={cn(
              "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "pending"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Pending</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "pending"
                  ? "bg-[#ebf3fb] text-[#0a66c2]"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {pendingIncoming.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("accepted")}
            className={cn(
              "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "accepted"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Accepted</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-50 text-[#057642]">
              {acceptedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("declined")}
            className={cn(
              "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "declined"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Declined</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
              {declinedList.length}
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
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-50 text-[#0a66c2]">
              {completedList.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("outgoing")}
            className={cn(
              "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "outgoing"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Sent Invitations</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700">
              {pendingOutgoing.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={cn(
              "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "all"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
              {allRequests.length}
            </span>
          </button>
        </div>

        {/* Search inside requests */}
        <div className="mt-4 relative max-w-sm">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, topic, department..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-md text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
        </div>
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <Inbox size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">
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
              : "No requests found matching your filter"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {activeTab === "pending"
              ? "When students submit mentorship requests to you, they will appear here with their background and career goals."
              : "Browse the student directory to discover and invite promising students."}
          </p>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="mt-4 text-xs"
          >
            <Link href="/alumni-dashboard/students">Browse Students &rarr;</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
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
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-[#b2d5f8] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <Avatar name={studentName} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-xs font-bold text-gray-900">
                          {studentName}
                        </h3>

                        {isOutgoing ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Sent Invitation
                          </span>
                        ) : isPending ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Pending Review
                          </span>
                        ) : isAccepted ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                            Active Mentee
                          </span>
                        ) : isCompleted ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0a66c2] border border-blue-200">
                            Completed Track
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                            Declined
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {req.student?.academicYear || "Undergraduate"} · {req.student?.department || "Computer Science"}
                      </p>

                      {req.student?.careerGoal && (
                        <p className="text-[11px] text-gray-600 mt-0.5">
                          Career Goal: <strong className="text-gray-800">{req.student.careerGoal}</strong>
                        </p>
                      )}

                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#0a66c2] font-semibold">
                        <Target size={12} className="shrink-0" />
                        <span>Requested Focus: {req.focus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-gray-400 block flex items-center sm:justify-end gap-1">
                      <Clock size={11} />
                      <span>Requested: {req.requestDate || "Recent"}</span>
                    </span>
                    {req.sessionCount > 0 && (
                      <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                        {req.sessionCount} sessions conducted
                      </span>
                    )}
                  </div>
                </div>

                {/* Student message */}
                {req.requestMessage && (
                  <div className="mt-3 bg-gray-50 rounded-md p-3 border border-gray-100 text-xs text-gray-700 leading-relaxed italic">
                    &ldquo;{req.requestMessage}&rdquo;
                  </div>
                )}

                {/* Decline reason note if declined */}
                {isDeclined && req.declinedReason && (
                  <div className="mt-2.5 p-2.5 bg-rose-50/70 border border-rose-100 rounded-md text-xs text-rose-800">
                    <span className="font-semibold block text-[11px]">Decline Reason Provided:</span>
                    <span>{req.declinedReason}</span>
                  </div>
                )}

                {/* Career Interests / Skills Pills */}
                {req.student?.interests && req.student.interests.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-gray-400 font-medium mr-1">Interests:</span>
                    {req.student.interests.map((interest, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.2 rounded text-[10px] bg-gray-100 text-gray-600"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewProfile(req)}
                      className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <User size={12} />
                      <span>View Student Profile</span>
                    </button>

                    <span className="text-gray-300">·</span>

                    <Link
                      href={`/messages?participantId=${studentId}`}
                      className="text-xs font-semibold text-gray-600 hover:text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <MessageSquare size={12} />
                      <span>Message Student</span>
                    </Link>
                  </div>

                  {/* Pending incoming request actions */}
                  {isPending && !isOutgoing && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={processingId === req.id}
                        onClick={() => setDeclineTargetRequest(req)}
                        className="text-xs text-gray-600 hover:text-red-600"
                      >
                        <X size={12} className="mr-1" />
                        <span>Decline</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        disabled={processingId === req.id}
                        onClick={() => handleAccept(req)}
                        className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                      >
                        <Check size={12} className="mr-1" />
                        <span>{processingId === req.id ? "Accepting..." : "Accept Request"}</span>
                      </Button>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50"
                      >
                        <Link href="/alumni-dashboard/mentees">View Mentee Profile &rarr;</Link>
                      </Button>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="flex items-center gap-1.5 text-xs text-[#057642] font-semibold">
                      <Award size={13} />
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
