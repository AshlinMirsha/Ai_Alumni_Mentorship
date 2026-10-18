"use client";

import { useState, useEffect, type FormEvent } from "react";
import { XCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DeclineRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  requesterName?: string;
}

export function DeclineRequestModal({
  isOpen,
  onClose,
  onConfirm,
  requesterName = "the student",
}: DeclineRequestModalProps) {
  const [reason, setReason] = useState(
    "Currently at capacity for new mentorship engagements this term."
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="decline-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <XCircle size={20} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 id="decline-modal-title" className="text-base font-bold text-gray-900">
            Decline Mentorship Request
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Provide a polite explanation for <strong>{requesterName}</strong>. This note will be visible in their mentorship activity log.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1.5">
            <label htmlFor="decline-reason" className="text-xs font-semibold text-gray-700">
              Reason / Explanatory Note
            </label>
            <textarea
              id="decline-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white text-xs text-gray-900 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white shadow-2xs"
            >
              Decline Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
