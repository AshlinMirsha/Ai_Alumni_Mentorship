"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { MentorshipSession } from "@/types";

interface CancelSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: MentorshipSession | null;
  onConfirmCancel: (sessionId: string, reason: string) => void;
}

export function CancelSessionModal({
  isOpen,
  onClose,
  session,
  onConfirmCancel,
}: CancelSessionModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmCancel(session.id, reason.trim() || "Rescheduling required / Mentor conflict");
      setIsSubmitting(false);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5 text-gray-900">
            <div className="h-9 w-9 rounded-full bg-red-50 text-[#cc1016] flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold">Cancel Mentorship Session</h2>
              <p className="text-xs text-gray-500">
                Cancel session with {session.studentName}
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
          <div className="p-3 bg-red-50/70 border border-red-200 rounded-md text-xs text-red-900 leading-relaxed">
            Are you sure you want to cancel the session <strong>&ldquo;{session.topic}&rdquo;</strong> scheduled for <strong>{session.date} at {session.time}</strong>?
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Reason for Cancellation (Optional)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Work emergency / urgent project deadline. I will reach out to reschedule."
              className="w-full text-xs bg-white border border-gray-200 rounded-md p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#cc1016]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Keep Session
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#cc1016] hover:bg-red-800 text-white text-xs"
            >
              {isSubmitting ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
