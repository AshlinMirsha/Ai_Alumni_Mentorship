"use client";

import { useState } from "react";
import {
  X,
  Calendar,
  Video,
  Clock,
  AlignLeft,
  AlertCircle,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { checkSessionConflict } from "@/lib/dashboard-storage";
import type { Mentorship, MentorshipSession } from "@/types";

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentee?: Mentorship | null;
  activeMentees?: Mentorship[];
  sessionToReschedule?: MentorshipSession | null;
  onSessionScheduled: (sessionData: {
    studentId: string;
    studentName: string;
    studentDepartment?: string;
    studentAcademicYear?: string;
    topic: string;
    date: string;
    time: string;
    meetUrl?: string;
    agenda?: string;
  }) => void;
  onSessionRescheduled?: (
    sessionId: string,
    sessionData: {
      date: string;
      time: string;
      topic?: string;
      meetUrl?: string;
      agenda?: string;
    }
  ) => void;
  onOpenAIAssistant?: (mentee: Mentorship | null) => void;
}

function ScheduleSessionInnerForm({
  onClose,
  mentee,
  activeMentees,
  sessionToReschedule,
  onSessionScheduled,
  onSessionRescheduled,
  onOpenAIAssistant,
}: Omit<ScheduleSessionModalProps, "isOpen">) {
  const isReschedule = !!sessionToReschedule;
  const initialMentee = mentee || (activeMentees && activeMentees.length > 0 ? activeMentees[0] : null);

  const [selectedMenteeId, setSelectedMenteeId] = useState<string>(() => {
    if (sessionToReschedule) {
      return sessionToReschedule.studentId;
    }
    return initialMentee?.id || "";
  });

  const [topic, setTopic] = useState(() => {
    if (sessionToReschedule) return sessionToReschedule.topic;
    return initialMentee ? `1:1 Mentorship Session: ${initialMentee.focus}` : "";
  });

  const [date, setDate] = useState(() => {
    if (sessionToReschedule) return sessionToReschedule.date;
    return "2026-10-22";
  });

  const [time, setTime] = useState(() => {
    if (sessionToReschedule) return sessionToReschedule.time;
    return "16:00";
  });

  const [meetUrl, setMeetUrl] = useState(() => {
    if (sessionToReschedule) return sessionToReschedule.meetUrl || "";
    return "https://meet.google.com/alm-ment-ses";
  });

  const [agenda, setAgenda] = useState(() => {
    if (sessionToReschedule) return sessionToReschedule.agenda || "";
    return "";
  });

  const [error, setError] = useState<string | null>(null);

  const currentSelectedMentee =
    mentee ||
    (activeMentees && activeMentees.find((m) => m.id === selectedMenteeId || m.studentId === selectedMenteeId)) ||
    (activeMentees && activeMentees[0]);

  // Conflict detection
  const conflict = checkSessionConflict(date, time, sessionToReschedule?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!topic.trim()) {
      setError("Please specify a session topic.");
      return;
    }
    if (!date) {
      setError("Please choose a date for the session.");
      return;
    }
    if (!time) {
      setError("Please specify a time.");
      return;
    }

    if (conflict.hasConflict && conflict.conflictingSession) {
      setError(
        `Scheduling Conflict: You already have a session scheduled with ${conflict.conflictingSession.studentName} on ${date} at ${time}. Please select an alternate time slot.`
      );
      return;
    }

    if (isReschedule && sessionToReschedule && onSessionRescheduled) {
      onSessionRescheduled(sessionToReschedule.id, {
        date,
        time,
        topic: topic.trim(),
        meetUrl: meetUrl.trim() || undefined,
        agenda: agenda.trim() || undefined,
      });
      onClose();
      return;
    }

    const studentId =
      currentSelectedMentee?.studentId ||
      currentSelectedMentee?.student?.id ||
      sessionToReschedule?.studentId ||
      "student-1";

    const studentName =
      currentSelectedMentee?.student?.name ||
      sessionToReschedule?.studentName ||
      "Student";

    const studentDepartment =
      currentSelectedMentee?.student?.department ||
      sessionToReschedule?.studentDepartment ||
      "Computer Science";

    const studentAcademicYear =
      currentSelectedMentee?.student?.academicYear ||
      sessionToReschedule?.studentAcademicYear ||
      "Undergraduate";

    onSessionScheduled({
      studentId,
      studentName,
      studentDepartment,
      studentAcademicYear,
      topic: topic.trim(),
      date,
      time,
      meetUrl: meetUrl.trim() || undefined,
      agenda: agenda.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg p-6 z-10 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5 text-gray-900">
          <div
            className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
              isReschedule ? "bg-amber-50 text-amber-600" : "bg-[#ebf3fb] text-[#0a66c2]"
            }`}
          >
            {isReschedule ? <RefreshCw size={18} /> : <Calendar size={18} />}
          </div>
          <div>
            <h2 className="text-sm font-bold">
              {isReschedule ? "Reschedule Mentorship Session" : "Schedule Mentorship Session"}
            </h2>
            <p className="text-xs text-gray-500">
              {isReschedule
                ? `Update session time or agenda with ${sessionToReschedule?.studentName}`
                : "Book a 1-on-1 career discussion or mock technical interview."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Live Conflict Warning Banner */}
        {conflict.hasConflict && conflict.conflictingSession && !error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5 text-amber-600" />
            <div className="leading-snug">
              <span className="font-bold">Schedule Conflict Detected:</span> You already have an active session with{" "}
              <strong>{conflict.conflictingSession.studentName}</strong> on {date} at {time}. You must pick another time before confirming.
            </div>
          </div>
        )}

        {/* Mentee Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mentee
          </label>
          {isReschedule ? (
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2.5">
              <Avatar name={sessionToReschedule?.studentName || "Student"} size="xs" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-gray-900 block truncate">
                  {sessionToReschedule?.studentName}
                </span>
                <span className="text-[11px] text-gray-500 block truncate">
                  {sessionToReschedule?.studentAcademicYear} · {sessionToReschedule?.studentDepartment}
                </span>
              </div>
            </div>
          ) : mentee ? (
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md flex items-center gap-2.5">
              <Avatar name={mentee.student?.name || "Student"} size="xs" />
              <div className="min-w-0">
                <span className="text-xs font-bold text-gray-900 block truncate">
                  {mentee.student?.name || "Student"}
                </span>
                <span className="text-[11px] text-gray-500 block truncate">
                  {mentee.student?.department || "Computer Science"} · {mentee.focus}
                </span>
              </div>
            </div>
          ) : activeMentees && activeMentees.length > 0 ? (
            <select
              value={selectedMenteeId}
              onChange={(e) => {
                setSelectedMenteeId(e.target.value);
                const selected = activeMentees.find((m) => m.id === e.target.value);
                if (selected) {
                  setTopic(`1:1 Mentorship Session: ${selected.focus}`);
                }
              }}
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              {activeMentees.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.student?.name || "Student"} — {m.focus}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-xs text-gray-500">No active mentees available.</p>
          )}
        </div>

        {/* Topic */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Session Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Distributed System Mock Technical Interview"
            required
            className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" />
              <span>Date</span> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="e.g. Oct 22, 2026 or 2026-10-22"
              required
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              <span>Time</span> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="e.g. 4:00 PM – 4:45 PM EDT"
              required
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>
        </div>

        {/* Video Meet URL */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
            <Video size={12} className="text-gray-400" />
            <span>Meeting URL (Google Meet / Zoom)</span>
          </label>
          <input
            type="url"
            value={meetUrl}
            onChange={(e) => setMeetUrl(e.target.value)}
            placeholder="https://meet.google.com/..."
            className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
        </div>

        {/* Agenda / Key Points */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-gray-700 flex items-center gap-1">
              <AlignLeft size={12} className="text-gray-400" />
              <span>Agenda &amp; Discussion Points</span>
            </label>
            {onOpenAIAssistant && (
              <button
                type="button"
                onClick={() => onOpenAIAssistant(currentSelectedMentee || null)}
                className="text-[11px] font-medium text-[#0a66c2] hover:underline flex items-center gap-1"
              >
                <Sparkles size={11} />
                <span>Draft with AI Assistant</span>
              </button>
            )}
          </div>
          <textarea
            rows={3}
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="e.g. 1. Review updated GitHub repo and database indexing PR. 2. 30-minute system design practice. 3. Q&A on on-call rotations."
            className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={conflict.hasConflict}
            className={`text-xs ${
              isReschedule
                ? "bg-amber-600 hover:bg-amber-700"
                : "bg-[#0a66c2] hover:bg-[#004182]"
            }`}
          >
            {isReschedule ? "Confirm Reschedule" : "Confirm & Schedule"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ScheduleSessionModal(props: ScheduleSessionModalProps) {
  if (!props.isOpen) return null;

  const formKey = props.sessionToReschedule
    ? `reschedule-${props.sessionToReschedule.id}`
    : `new-${props.mentee?.id || "default"}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={props.onClose}
      />
      <ScheduleSessionInnerForm key={formKey} {...props} />
    </div>
  );
}
