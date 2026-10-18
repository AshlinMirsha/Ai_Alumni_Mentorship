"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CancelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mentorName?: string;
}

export function CancelRequestModal({
  isOpen,
  onClose,
  onConfirm,
  mentorName = "the mentor",
}: CancelRequestModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div className="bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 max-w-sm w-full p-5 space-y-3.5">
        <div className="flex items-start justify-between">
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
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
          <h3 id="cancel-modal-title" className="text-base font-bold text-gray-900">
            Cancel Mentorship Request?
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Are you sure you want to withdraw your pending inquiry to <strong>{mentorName}</strong>? This action will remove the request from their queue.
          </p>
        </div>

        <div className="pt-2 flex justify-end gap-2.5">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Keep Request
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white shadow-2xs"
          >
            Yes, Cancel Request
          </Button>
        </div>
      </div>
    </div>
  );
}
