"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Compass,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { MentorshipCard } from "@/components/mentorship/MentorshipCard";
import { CancelRequestModal } from "@/components/mentorship/CancelRequestModal";
import { DeclineRequestModal } from "@/components/mentorship/DeclineRequestModal";
import { StudentDetailModal } from "@/components/mentorship/StudentDetailModal";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadMentorshipActivity,
  acceptMentorshipRequest,
  declineMentorshipRequest,
  cancelMentorshipRequest,
  resetMentorshipActivity,
} from "@/lib/dashboard-storage";
import { currentStudent, initialMentorshipActivity } from "@/lib/mock-data";
import type { Mentorship } from "@/types";

type TabKey = "all" | "pending" | "accepted" | "declined";
type DirectionFilter = "all" | "outgoing" | "incoming";

export default function MentorshipPage() {
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [cancelingRequestId, setCancelingRequestId] = useState<string | null>(null);
  const [decliningRequestId, setDecliningRequestId] = useState<string | null>(null);
  const [selectedStudentMentorship, setSelectedStudentMentorship] = useState<Mentorship | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Combine all items
  const allMentorships = useMemo(() => {
    const pending = mentorshipActivity.pendingRequests || [];
    const accepted = mentorshipActivity.acceptedMentorships || [];
    const declined = mentorshipActivity.declinedRequests || [];
    return [...pending, ...accepted, ...declined];
  }, [mentorshipActivity]);

  // Tab counts
  const pendingCount = (mentorshipActivity.pendingRequests || []).length;
  const acceptedCount = (mentorshipActivity.acceptedMentorships || []).length;
  const declinedCount = (mentorshipActivity.declinedRequests || []).length;
  const totalCount = allMentorships.length;

  // Filtered list
  const filteredList = useMemo(() => {
    let list: Mentorship[] = [];
    if (activeTab === "all") {
      list = allMentorships;
    } else if (activeTab === "pending") {
      list = mentorshipActivity.pendingRequests || [];
    } else if (activeTab === "accepted") {
      list = mentorshipActivity.acceptedMentorships || [];
    } else if (activeTab === "declined") {
      list = mentorshipActivity.declinedRequests || [];
    }

    if (directionFilter !== "all") {
      list = list.filter((item) => (item.direction || "outgoing") === directionFilter);
    }

    return list;
  }, [activeTab, directionFilter, allMentorships, mentorshipActivity]);

  // Actions
  const handleConfirmCancel = () => {
    if (!cancelingRequestId) return;
    const ok = cancelMentorshipRequest(cancelingRequestId);
    setCancelingRequestId(null);
    if (ok) {
      showToast("Mentorship request has been cancelled.");
    }
  };

  const handleConfirmDecline = (reason: string) => {
    if (!decliningRequestId) return;
    const ok = declineMentorshipRequest(decliningRequestId, reason);
    setDecliningRequestId(null);
    if (ok) {
      showToast("Mentorship request declined and moved to Declined tab.");
    }
  };

  const handleAccept = (requestId: string) => {
    const res = acceptMentorshipRequest(requestId);
    if (res.success) {
      showToast("Mentorship request accepted! Direct messaging channel created.");
    }
  };

  const cancelingItem = allMentorships.find((m) => m.id === cancelingRequestId);
  const decliningItem = allMentorships.find((m) => m.id === decliningRequestId);

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <Check size={14} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <DashboardNav studentName={student.name} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <Compass size={13} />
                Network Connections
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-medium text-gray-500">
                {acceptedCount} Active Relationships
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              My Mentorships
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage your mentoring connections and requests.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetMentorshipActivity();
                showToast("Mentorship requests restored to default sample data.");
              }}
              className="text-xs inline-flex items-center gap-1.5"
              title="Reset mentorship inquiries to sample state"
            >
              <RotateCcw size={12} />
              Reset Demo Data
            </Button>

            <Link
              href="/alumni"
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Users size={13} />
              <span>Discover Alumni</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls Row: Tabs + Direction Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-white border border-gray-200 p-1 rounded-xl shadow-2xs overflow-x-auto">
            {[
              { key: "all" as TabKey, label: "All", count: totalCount },
              { key: "pending" as TabKey, label: "Pending", count: pendingCount },
              { key: "accepted" as TabKey, label: "Accepted", count: acceptedCount },
              { key: "declined" as TabKey, label: "Declined", count: declinedCount },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-2 shrink-0 ${
                  activeTab === tab.key
                    ? "bg-blue-50 text-blue-700 shadow-2xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === tab.key
                      ? "bg-blue-200/70 text-blue-800"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Direction Filter */}
          <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
            <Filter size={13} className="text-gray-400 shrink-0" />
            <span className="text-gray-500 hidden sm:inline">Perspective:</span>
            <select
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
              className="rounded-lg border border-gray-200 bg-white text-xs text-gray-800 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
            >
              <option value="all">All Inquiries ({totalCount})</option>
              <option value="outgoing">Outgoing (My Requests)</option>
              <option value="incoming">Incoming (From Students)</option>
            </select>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600 shrink-0" />
            <span>
              <strong>Simulated Mentorship Records:</strong> In this demo environment, requests, status transitions (Accept, Decline, Cancel), and conversation links update instantly in local browser storage and reflect on your dashboard.
            </span>
          </div>
        </div>

        {/* Mentorship Cards List or Meaningful Empty State */}
        {filteredList.length > 0 ? (
          <div className="space-y-4">
            {filteredList.map((mentorship) => (
              <MentorshipCard
                key={mentorship.id}
                mentorship={mentorship}
                onCancelRequest={(id) => setCancelingRequestId(id)}
                onAcceptRequest={handleAccept}
                onDeclineRequest={(id) => setDecliningRequestId(id)}
                onViewStudentProfile={(m) => setSelectedStudentMentorship(m)}
              />
            ))}
          </div>
        ) : (
          /* Empty States */
          <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-14 text-center space-y-4 shadow-2xs">
            <div className="h-14 w-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 mx-auto">
              {activeTab === "pending" ? (
                <Clock size={24} />
              ) : activeTab === "accepted" ? (
                <CheckCircle2 size={24} />
              ) : activeTab === "declined" ? (
                <XCircle size={24} />
              ) : (
                <Compass size={24} />
              )}
            </div>

            <div className="space-y-1.5 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-gray-900">
                {activeTab === "pending"
                  ? "No pending mentorship requests"
                  : activeTab === "accepted"
                  ? "No accepted mentorships yet"
                  : activeTab === "declined"
                  ? "No declined requests"
                  : "No mentorship connections found"}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {activeTab === "pending"
                  ? "You have answered or resolved all pending inquiries. Reach out to verified alumni to initiate a new career mentorship."
                  : activeTab === "accepted"
                  ? "Accepted mentorships give you direct access to 1:1 messaging, code reviews, and interview guidance."
                  : activeTab === "declined"
                  ? "Any requests that could not be accommodated will be archived here for your records."
                  : "Start expanding your professional network by discovering alumni in your target industry."}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/alumni"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
              >
                <Users size={13} />
                <span>Discover Alumni Mentors</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Modals */}
      <CancelRequestModal
        isOpen={Boolean(cancelingRequestId)}
        mentorName={cancelingItem?.alumni.name}
        onClose={() => setCancelingRequestId(null)}
        onConfirm={handleConfirmCancel}
      />

      <DeclineRequestModal
        isOpen={Boolean(decliningRequestId)}
        requesterName={
          decliningItem?.direction === "incoming" && decliningItem?.student
            ? decliningItem.student.name
            : decliningItem?.alumni.name
        }
        onClose={() => setDecliningRequestId(null)}
        onConfirm={handleConfirmDecline}
      />

      <StudentDetailModal
        isOpen={Boolean(selectedStudentMentorship)}
        mentorship={selectedStudentMentorship}
        onClose={() => setSelectedStudentMentorship(null)}
        onAccept={handleAccept}
        onDecline={(id) => setDecliningRequestId(id)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/messages" className="hover:text-gray-900 transition-colors">
              Messages
            </Link>
            <Link href="/alumni" className="hover:text-gray-900 transition-colors">
              Alumni Directory
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
