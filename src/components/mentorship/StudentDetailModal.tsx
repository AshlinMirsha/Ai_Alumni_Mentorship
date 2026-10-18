"use client";

import { useEffect } from "react";
import { X, GraduationCap, Building2, Target, CheckCircle2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Mentorship } from "@/types";

interface StudentDetailModalProps {
  mentorship: Mentorship | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
}

export function StudentDetailModal({
  mentorship,
  isOpen,
  onClose,
  onAccept,
  onDecline,
}: StudentDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mentorship || !mentorship.student) return null;

  const student = mentorship.student;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-detail-title"
    >
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar name={student.name} size="lg" />
            <div>
              <h3 id="student-detail-title" className="text-base font-bold text-gray-900">
                {student.name}
              </h3>
              <p className="text-xs text-gray-500">
                {student.department} · {student.academicYear || "Student"}
              </p>
            </div>
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

        <div className="space-y-3 bg-gray-50/70 p-4 rounded-xl border border-gray-200 text-xs">
          <div className="flex items-center gap-2 text-gray-700">
            <Target size={14} className="text-blue-600 shrink-0" />
            <span>
              <strong>Target Career Goal:</strong> {student.careerGoal || "Software Engineer"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <GraduationCap size={14} className="text-blue-600 shrink-0" />
            <span>
              <strong>Institution:</strong> University of Technology
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Building2 size={14} className="text-blue-600 shrink-0" />
            <span>
              <strong>Department:</strong> {student.department}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <span className="font-semibold text-gray-800">Inquiry Request Note:</span>
          <p className="p-3 rounded-lg bg-blue-50/40 border border-blue-100 text-gray-700 leading-relaxed italic">
            &quot;{mentorship.requestMessage || mentorship.focus}&quot;
          </p>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>

          {mentorship.status === "pending" && (
            <div className="flex items-center gap-2">
              {onDecline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onDecline(mentorship.id);
                  }}
                  className="text-xs text-red-600 hover:bg-red-50"
                >
                  Decline
                </Button>
              )}
              {onAccept && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onAccept(mentorship.id);
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                >
                  <CheckCircle2 size={13} className="mr-1" />
                  Accept Mentee
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
