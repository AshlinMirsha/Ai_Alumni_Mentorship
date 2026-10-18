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
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadMentorshipActivity,
  acceptMentorshipRequest,
  declineMentorshipRequest,
} from "@/lib/dashboard-storage";
import { initialMentorshipActivity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Mentorship } from "@/types";

type RequestTab = "all" | "pending" | "outgoing" | "accepted" | "declined";

export default function AlumniRequestsPage() {
  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const [activeTab, setActiveTab] = useState<RequestTab>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Combine pending, accepted (active), and history requests
  const allRequests = useMemo(() => {
    return [
      ...mentorshipActivity.pendingRequests,
      ...(mentorshipActivity.acceptedMentorships || []),
      ...(mentorshipActivity.declinedRequests || []),
    ];
  }, [mentorshipActivity]);

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

  const filteredRequests = useMemo(() => {
    let list: Mentorship[] = [];
    if (activeTab === "all") list = allRequests;
    else if (activeTab === "pending") list = pendingIncoming;
    else if (activeTab === "outgoing") list = pendingOutgoing;
    else if (activeTab === "accepted") list = acceptedList;
    else if (activeTab === "declined") list = declinedList;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(
      (r) =>
        (r.student?.name || "").toLowerCase().includes(q) ||
        r.focus.toLowerCase().includes(q) ||
        (r.requestMessage && r.requestMessage.toLowerCase().includes(q))
    );
  }, [activeTab, allRequests, pendingIncoming, pendingOutgoing, acceptedList, declinedList, searchQuery]);

  const handleAccept = (id: string, name: string) => {
    acceptMentorshipRequest(id);
    showToast(`Mentorship request from ${name} accepted! Student added to your active mentees.`);
  };

  const handleDecline = (id: string, name: string) => {
    declineMentorshipRequest(id);
    showToast(`Mentorship request from ${name} has been declined.`);
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
              Review and manage incoming mentorship requests from students, as well as invitations you have offered.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs shrink-0"
          >
            <Link href="/alumni-dashboard/students">Discover More Students &rarr;</Link>
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-5 border-b border-gray-200 flex flex-wrap gap-2 text-xs">
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
            <span>Incoming Pending</span>
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
            onClick={() => setActiveTab("outgoing")}
            className={cn(
              "pb-2.5 px-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5",
              activeTab === "outgoing"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            <span>Your Sent Offers</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                activeTab === "outgoing"
                  ? "bg-[#ebf3fb] text-[#0a66c2]"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {pendingOutgoing.length}
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
            <span>Accepted Mentees</span>
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
            <span>Archived / Declined</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
              {declinedList.length}
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
            <span>All Requests</span>
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
            placeholder="Search by student name or topic..."
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
              : activeTab === "outgoing"
              ? "You haven't offered any invitations yet"
              : "No requests found for this tab"}
          </h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {activeTab === "pending"
              ? "When students submit mentorship requests to you, they will appear here with their background and goals."
              : "Explore student profiles and send invitations to offer guidance."}
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
            const isOutgoing = req.direction === "outgoing";

            return (
              <div
                key={req.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-xs hover:border-[#b2d5f8] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <Avatar name={req.student?.name || "Student"} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-gray-900 truncate">
                          {req.student?.name || "Student"}
                        </h3>
                        {isOutgoing ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            Sent Invitation
                          </span>
                        ) : isPending ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            Awaiting Response
                          </span>
                        ) : isAccepted ? (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                            Active Mentee
                          </span>
                        ) : (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">
                            Archived
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                        {req.student?.academicYear || "Undergraduate"} · {req.student?.department || "Computer Science"}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#0a66c2] font-medium">
                        <Target size={12} className="shrink-0" />
                        <span>Focus: {req.focus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-gray-400 block">
                      Date: {req.requestDate}
                    </span>
                    {req.sessionCount > 0 && (
                      <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                        {req.sessionCount} sessions completed
                      </span>
                    )}
                  </div>
                </div>

                {req.requestMessage && (
                  <div className="mt-3 bg-gray-50 rounded-md p-3 border border-gray-100 text-xs text-gray-700 leading-relaxed italic">
                    &ldquo;{req.requestMessage}&rdquo;
                  </div>
                )}

                {/* Actions Bar */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/messages?participantId=${req.student?.id || req.studentId}`}
                      className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1"
                    >
                      <MessageSquare size={12} />
                      <span>Message Student</span>
                    </Link>
                  </div>

                  {isPending && !isOutgoing && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecline(req.id, req.student?.name || "Student")}
                        className="text-xs text-gray-600 hover:text-red-600"
                      >
                        <X size={12} className="mr-1" />
                        <span>Decline</span>
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => handleAccept(req.id, req.student?.name || "Student")}
                        className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                      >
                        <Check size={12} className="mr-1" />
                        <span>Accept Request</span>
                      </Button>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs"
                      >
                        <Link href="/alumni-dashboard/mentees">View Roster &rarr;</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
