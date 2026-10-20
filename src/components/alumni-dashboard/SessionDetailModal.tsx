"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  FileText,
  User,
  AlertCircle,
  RefreshCw,
  Ban,
  CheckCircle,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { MentorshipSession } from "@/types";

interface SessionDetailModalProps {
  session: MentorshipSession | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule?: (session: MentorshipSession) => void;
  onCancel?: (session: MentorshipSession) => void;
  onComplete?: (session: MentorshipSession, notes?: string) => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
  onReschedule,
  onCancel,
  onComplete,
}: SessionDetailModalProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");

  if (!isOpen || !session) return null;

  const isCancelled = session.status === "cancelled";
  const isCompleted = session.status === "completed";
  const isRescheduled = session.status === "rescheduled";

  const getStatusBadge = () => {
    return "bg-neutral-100 text-neutral-900 border-neutral-200";
  };

  const handleMarkComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComplete) {
      onComplete(session, completeNotes.trim() || undefined);
    }
    setIsCompleting(false);
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
      <div className="relative bg-white rounded-2xl border border-[#E7E7E7] shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E7E7E7] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge()}`}
            >
              {session.status}
            </span>
            <span className="text-xs text-neutral-500">1:1 Mentorship Session</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:text-black hover:bg-neutral-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {session.topic}
            </h3>
            {isRescheduled && session.previousDate && (
              <p className="text-[11px] text-neutral-700 mt-1 flex items-center gap-1 font-medium">
                <RefreshCw size={11} />
                <span>Rescheduled from {session.previousDate} at {session.previousTime}</span>
              </p>
            )}
            {isCancelled && session.cancellationReason && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium bg-red-50 p-2.5 rounded-xl border border-red-100">
                <Ban size={12} className="shrink-0" />
                <span>Cancelled: {session.cancellationReason}</span>
              </p>
            )}
          </div>

          {/* Student Profile Card */}
          <div className="p-3.5 rounded-xl border border-[#E7E7E7] bg-neutral-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={session.studentName} size="md" />
              <div>
                <h4 className="text-xs font-bold text-gray-900">
                  {session.studentName}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {session.studentAcademicYear} · {session.studentDepartment}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs text-neutral-900 border-neutral-300 hover:bg-neutral-100 rounded-full"
            >
              <Link
                href={`/messages?participantId=${session.studentId}`}
                className="flex items-center gap-1.5"
              >
                <MessageSquare size={12} />
                <span>Message</span>
              </Link>
            </Button>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#E7E7E7] bg-white">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Calendar size={13} className="text-neutral-900" />
                <span className="font-medium text-[11px]">Date</span>
              </div>
              <p className="font-semibold text-gray-900">{session.date}</p>
            </div>
            <div className="p-3.5 rounded-xl border border-[#E7E7E7] bg-white">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Clock size={13} className="text-neutral-900" />
                <span className="font-medium text-[11px]">Time</span>
              </div>
              <p className="font-semibold text-gray-900">{session.time}</p>
            </div>
          </div>

          {/* Video Meeting Link Section */}
          <div className="rounded-xl border border-[#E7E7E7] overflow-hidden">
            <div className="px-3.5 py-2.5 bg-neutral-50 border-b border-[#E7E7E7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={14} className="text-neutral-900" />
                <span className="text-xs font-bold text-gray-900">Video Conference</span>
              </div>
              {session.meetUrl ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Link Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                  <AlertCircle size={10} /> Pending Link
                </span>
              )}
            </div>

            <div className="p-3.5 bg-white">
              {session.meetUrl ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      Google Meet Conference
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate max-w-xs">
                      {session.meetUrl}
                    </p>
                  </div>
                  {!isCancelled && (
                    <Button
                      variant="primary"
                      size="sm"
                      asChild
                      className="bg-[#090909] hover:bg-[#242424] text-white text-xs shrink-0 rounded-full px-4"
                    >
                      <a
                        href={session.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5"
                      >
                        <Video size={13} />
                        <span>Join Call</span>
                        <ExternalLink size={11} />
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Meeting link not assigned. Both participants will receive an automated room link prior to session commencement.
                </p>
              )}
            </div>
          </div>

          {/* Agenda */}
          {session.agenda && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <FileText size={13} className="text-gray-500" />
                <span>Session Agenda / Discussion Plan</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                {session.agenda}
              </p>
            </div>
          )}

          {/* Notes */}
          {session.notes && (
            <div className="text-[11px] text-neutral-800 bg-neutral-50 p-3 rounded-xl border border-neutral-200 flex items-start gap-2">
              <User size={13} className="text-neutral-900 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-900 block mb-0.5">Mentor Notes:</span>
                <span>{session.notes}</span>
              </div>
            </div>
          )}

          {/* Complete Session Form Area (collapsible) */}
          {isCompleting && (
            <form onSubmit={handleMarkComplete} className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                <CheckCircle size={14} />
                <span>Mark Session as Completed</span>
              </div>
              <p className="text-[11px] text-gray-600">
                Summarize milestones reached and key student takeaways. This will update the student&apos;s mentorship progress.
              </p>
              <textarea
                rows={2}
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                placeholder="e.g. Reviewed architecture trade-offs. Ashlin will implement Redis caching by next milestone."
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCompleting(false)}
                  className="text-xs rounded-full"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs bg-[#090909] hover:bg-[#242424] text-white rounded-full px-4"
                >
                  Save &amp; Complete Session
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Action Controls Footer */}
        <div className="px-5 py-3 bg-neutral-50 border-t border-[#E7E7E7] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {!isCancelled && !isCompleted && onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCancel(session)}
                className="text-xs text-neutral-700 border-neutral-300 hover:bg-neutral-100 rounded-full"
              >
                <Ban size={12} className="mr-1" />
                <span>Cancel Session</span>
              </Button>
            )}

            {!isCancelled && !isCompleted && onReschedule && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onReschedule(session)}
                className="text-xs text-neutral-900 border-neutral-300 hover:bg-neutral-100 rounded-full"
              >
                <RefreshCw size={12} className="mr-1" />
                <span>Reschedule</span>
              </Button>
            )}

            {!isCancelled && !isCompleted && onComplete && !isCompleting && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCompleting(true)}
                className="text-xs text-neutral-900 border-neutral-300 hover:bg-neutral-100 rounded-full"
              >
                <CheckCircle size={12} className="mr-1" />
                <span>Mark Completed</span>
              </Button>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-full border-neutral-300">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
