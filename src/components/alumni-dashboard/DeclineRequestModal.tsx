"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Mentorship } from "@/types";

interface DeclineRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Mentorship | null;
  onConfirmDecline: (requestId: string, reason?: string) => void;
}

const PRESET_REASONS = [
  "Currently at capacity for 1:1 mentees this term.",
  "The requested topic is outside my primary area of domain expertise.",
  "Work schedule and on-call commitments prevent sufficient time.",
  "Recommend checking out the alumni community discussion boards.",
];

export function DeclineRequestModal({
  isOpen,
  onClose,
  request,
  onConfirmDecline,
}: DeclineRequestModalProps) {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customNote, setCustomNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const studentName = request.student?.name || "Student";

  const handleDecline = () => {
    setIsSubmitting(true);
    const finalReason = customNote.trim()
      ? `${selectedReason} Note: ${customNote.trim()}`
      : selectedReason;

    onConfirmDecline(request.id, finalReason);
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

      {/* Modal Card */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-gray-900">
            <div className="h-8 w-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Decline Mentorship Request</h2>
              <p className="text-xs text-gray-500">
                Optionally provide a polite reason for {studentName}.
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

        {/* Request Summary */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded-md flex items-center gap-3">
          <Avatar name={studentName} size="sm" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">{studentName}</p>
            <p className="text-[11px] text-gray-500 truncate">
              {request.student?.department || "Computer Science"} · {request.student?.academicYear || "Undergraduate"}
            </p>
            <p className="text-[11px] text-[#0a66c2] font-medium mt-0.5 truncate">
              Focus: {request.focus}
            </p>
          </div>
        </div>

        {/* Select reason */}
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-semibold text-gray-700">
            Select a decline reason:
          </label>
          <div className="space-y-1.5">
            {PRESET_REASONS.map((reason) => (
              <label
                key={reason}
                className="flex items-start gap-2.5 p-2 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer text-xs text-gray-700 transition-colors"
              >
                <input
                  type="radio"
                  name="declineReason"
                  checked={selectedReason === reason}
                  onChange={() => setSelectedReason(reason)}
                  className="mt-0.5 text-[#0a66c2] focus:ring-[#0a66c2]"
                />
                <span className="leading-snug">{reason}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Optional Custom Note */}
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Optional encouragement or additional response:
          </label>
          <textarea
            rows={2}
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="e.g. Keep up the great work on your Go projects! Feel free to reach back out next semester."
            className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
          />
        </div>

        {/* Footer Actions */}
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
            variant="outline"
            size="sm"
            onClick={handleDecline}
            disabled={isSubmitting}
            className="text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            {isSubmitting ? "Declining..." : "Confirm & Decline"}
          </Button>
        </div>
      </div>
    </div>
  );
}
