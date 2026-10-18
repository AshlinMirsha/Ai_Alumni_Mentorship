"use client";

import { useState } from "react";
import { X, Calendar, Video, Clock, AlignLeft, AlertCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Mentorship } from "@/types";

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentee?: Mentorship | null;
  activeMentees?: Mentorship[];
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
}

export function ScheduleSessionModal({
  isOpen,
  onClose,
  mentee,
  activeMentees = [],
  onSessionScheduled,
}: ScheduleSessionModalProps) {
  const initialMentee = mentee || (activeMentees.length > 0 ? activeMentees[0] : null);

  const [selectedMenteeId, setSelectedMenteeId] = useState<string>(() => initialMentee?.id || "");
  const [topic, setTopic] = useState(() => (initialMentee ? `1:1 Mentorship Session: ${initialMentee.focus}` : ""));
  const [date, setDate] = useState("2026-10-22");
  const [time, setTime] = useState("16:00");
  const [meetUrl, setMeetUrl] = useState("https://meet.google.com/alm-ment-ses");

  const [agenda, setAgenda] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;


  const currentSelectedMentee =
    mentee || activeMentees.find((m) => m.id === selectedMenteeId) || activeMentees[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedMentee) {
      setError("Please select an active mentee.");
      return;
    }
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

    const studentId = currentSelectedMentee.studentId || currentSelectedMentee.student?.id || "student-1";
    const studentName = currentSelectedMentee.student?.name || "Student";
    const studentDepartment = currentSelectedMentee.student?.department;
    const studentAcademicYear = currentSelectedMentee.student?.academicYear;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg p-6 z-10 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-gray-900">
            <div className="h-9 w-9 rounded-full bg-[#ebf3fb] text-[#0a66c2] flex items-center justify-center shrink-0">
              <Calendar size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Schedule Mentorship Session</h2>
              <p className="text-xs text-gray-500">
                Book a 1-on-1 career discussion or mock technical interview.
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
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Mentee Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mentee
            </label>
            {mentee ? (
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
            ) : (
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
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <Clock size={12} className="text-gray-400" />
                <span>Time (EST)</span> <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          {/* Video Meet URL */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <Video size={12} className="text-gray-400" />
              <span>Meeting Link (Optional)</span>
            </label>
            <input
              type="url"
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              placeholder="https://meet.google.com/... or Zoom link"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          {/* Agenda / Key Points */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
              <AlignLeft size={12} className="text-gray-400" />
              <span>Agenda / Preparation Notes (Optional)</span>
            </label>
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
              className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
            >
              Confirm &amp; Schedule
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
