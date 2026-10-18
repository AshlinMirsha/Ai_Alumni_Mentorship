"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  UserCheck,
  MessageSquare,
  CheckCircle2,
  Plus,
  Target,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  subscribeToDashboardStorage,
  loadMentorshipActivity,
  saveMentorshipActivity,
  addNotification,
} from "@/lib/dashboard-storage";
import { initialMentorshipActivity } from "@/lib/mock-data";

export default function MyMenteesPage() {
  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  const activeMentees = mentorshipActivity.acceptedMentorships || [];
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loggingSessionMenteeId, setLoggingSessionMenteeId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogSession = (menteeId: string) => {
    const updated = activeMentees.map((m) => {
      if (m.id === menteeId) {
        return {
          ...m,
          sessionCount: m.sessionCount + 1,
        };
      }
      return m;
    });

    saveMentorshipActivity({
      ...mentorshipActivity,
      acceptedMentorships: updated,
    });

    const mentee = activeMentees.find((m) => m.id === menteeId);
    if (mentee) {
      const studentName = mentee.student?.name || "Student";
      addNotification({
        id: `notif-${Date.now()}`,
        type: "session_reminder",
        title: `Mentorship session logged with ${studentName}`,
        description: `Session #${mentee.sessionCount + 1} completed. Notes saved.`,
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: "/alumni-dashboard/mentees",
        actorName: studentName,
      });
      showToast(`Logged session #${mentee.sessionCount + 1} with ${studentName}!`);
    }

    setLoggingSessionMenteeId(null);
    setSessionNotes("");
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
              <span>My Active Mentees</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Track student progress, scheduled 1-on-1 mentorship sessions, and personalized career roadmaps.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            asChild
            className="bg-[#0a66c2] hover:bg-[#004182] text-xs shrink-0"
          >
            <Link href="/alumni-dashboard/students" className="flex items-center gap-1.5">
              <Plus size={13} />
              <span>Invite New Mentee</span>
            </Link>
          </Button>
        </div>

        {/* Capacity Strip */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Current Roster</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              {activeMentees.length} / 5 Students
            </div>
            <span className="text-[10px] text-[#057642] font-medium">1 open slot</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Total Sessions</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              14 Sessions
            </div>
            <span className="text-[10px] text-gray-500 font-medium">Logged this year</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Feedback Score</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              4.98 / 5.0
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Exceptional mentor</span>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-[11px] text-gray-500 font-medium block">Avg Response</span>
            <div className="text-base font-bold text-gray-900 mt-0.5">
              &lt; 24 Hours
            </div>
            <span className="text-[10px] text-gray-500 font-medium">High engagement</span>
          </div>
        </div>
      </div>

      {/* Mentees Roster Grid */}
      {activeMentees.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center shadow-xs">
          <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto mb-3">
            <UserCheck size={24} />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No active mentees yet</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            You currently have no active mentorship relationships. Review pending student requests or discover students to offer guidance.
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
          {activeMentees.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-gray-200 rounded-lg p-5 shadow-xs hover:border-[#b2d5f8] transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Student Info */}
                <div className="flex items-start gap-3.5">
                  <Avatar name={m.student?.name || "Student"} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-gray-900">{m.student?.name || "Student"}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                        Active Mentee
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-0.5">
                      {m.student?.academicYear || "Undergraduate"} · {m.student?.department || "Computer Science"}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#0a66c2] font-semibold">
                      <Target size={13} className="shrink-0" />
                      <span>Focus: {m.focus}</span>
                    </div>
                  </div>
                </div>

                {/* Session Stats */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900 block">
                      {m.sessionCount} Sessions Logged
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      Started: {m.startDate}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setLoggingSessionMenteeId(m.id)}
                    className="text-xs text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50"
                  >
                    + Log Session
                  </Button>
                </div>
              </div>

              {/* Mentorship Track Progress Bar */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
                  <span className="font-semibold text-gray-900">Career Roadmap Progress</span>
                  <span>Milestone 3 of 5</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#0a66c2] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(25, m.sessionCount * 25))}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                  <span>Foundations &amp; Resume</span>
                  <span>System Design</span>
                  <span>Mock Loops</span>
                  <span>Offer Negotiation</span>
                </div>
              </div>

              {/* Next Actions Bar */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Target Goal: <strong className="text-gray-800">{m.student?.careerGoal || "Software Engineer"}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-xs text-[#0a66c2]"
                  >
                    <Link
                      href={`/messages?participantId=${m.student?.id || m.studentId}`}
                      className="flex items-center gap-1.5"
                    >
                      <MessageSquare size={12} />
                      <span>Message Mentee</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Log Session Modal */}
      {loggingSessionMenteeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setLoggingSessionMenteeId(null)}
          />
          <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-bold text-gray-900">Log Mentorship Session</h3>
            <p className="text-xs text-gray-500 mt-1">
              Record a 1-on-1 session discussion, mock interview feedback, or action items for your mentee.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Session Topic / Key Takeaways
                </label>
                <textarea
                  rows={3}
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="e.g. Conducted mock system design interview on rate limiters. Reviewed time complexity trade-offs and gave feedback on communication."
                  className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLoggingSessionMenteeId(null)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleLogSession(loggingSessionMenteeId)}
                  className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                >
                  Save &amp; Log Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
