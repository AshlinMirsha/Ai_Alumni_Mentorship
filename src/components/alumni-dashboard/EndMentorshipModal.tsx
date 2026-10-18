"use client";

import { useState } from "react";
import { X, CheckCircle2, Award } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Mentorship } from "@/types";

interface EndMentorshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorship: Mentorship | null;
  onConfirmEnd: (mentorshipId: string, completionNotes?: string) => void;
}

export function EndMentorshipModal({
  isOpen,
  onClose,
  mentorship,
  onConfirmEnd,
}: EndMentorshipModalProps) {
  const [completionNotes, setCompletionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !mentorship) return null;

  const studentName = mentorship.student?.name || "Student";

  const handleConclude = () => {
    setIsSubmitting(true);
    onConfirmEnd(mentorship.id, completionNotes);
    setIsSubmitting(false);
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
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-gray-900">
            <div className="h-9 w-9 rounded-full bg-emerald-50 text-[#057642] flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Conclude Mentorship Track</h2>
              <p className="text-xs text-gray-500">
                Archive active engagement with {studentName}.
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

        {/* Mentorship Summary */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center gap-3">
            <Avatar name={studentName} size="md" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">{studentName}</p>
              <p className="text-[11px] text-gray-500 truncate">
                {mentorship.student?.department || "Computer Science"} · {mentorship.student?.academicYear || "Undergraduate"}
              </p>
              <p className="text-[11px] text-[#0a66c2] font-semibold mt-0.5 truncate">
                Focus: {mentorship.focus}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-200 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
            <div>
              <span className="text-gray-400 block">Sessions Completed</span>
              <span className="font-bold text-gray-900">{mentorship.sessionCount} sessions</span>
            </div>
            <div>
              <span className="text-gray-400 block">Started Date</span>
              <span className="font-bold text-gray-900">{mentorship.startDate || "Active"}</span>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-md text-xs text-blue-900 flex items-start gap-2">
          <CheckCircle2 size={15} className="text-[#0a66c2] shrink-0 mt-0.5" />
          <span>
            Concluding this relationship will transition the record to <strong>Completed Mentees</strong>, opening 1 mentee slot on your active roster. Your private mentorship notes and milestone history will remain preserved.
          </span>
        </div>

        {/* Optional Completion Notes */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Mentorship Summary &amp; Final Assessment (Private):
          </label>
          <textarea
            rows={3}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="e.g. Completed comprehensive full-stack and systems design preparation. Student received summer internship offer at Datadog."
            className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            🔒 These notes are strictly private to you and never shared with the student.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleConclude}
            disabled={isSubmitting}
            className="text-xs bg-[#057642] hover:bg-[#046237]"
          >
            {isSubmitting ? "Concluding..." : "Conclude & Archive Mentorship"}
          </Button>
        </div>
      </div>
    </div>
  );
}
