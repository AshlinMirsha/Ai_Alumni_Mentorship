"use client";

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
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { MentorshipSession } from "@/types";

interface SessionDetailModalProps {
  session: MentorshipSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SessionDetailModal({
  session,
  isOpen,
  onClose,
}: SessionDetailModalProps) {
  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                session.status === "confirmed"
                  ? "bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]"
                  : "bg-blue-50 text-[#0a66c2] border border-[#b2d5f8]"
              }`}
            >
              {session.status}
            </span>
            <span className="text-xs text-gray-400">1:1 Mentorship Session</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
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
          </div>

          {/* Student Profile Card */}
          <div className="p-3.5 rounded-lg border border-gray-100 bg-gray-50/60 flex items-center justify-between">
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
              className="text-xs text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50"
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

          {/* Date, Time & Location */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-gray-100 bg-white">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Calendar size={13} className="text-[#0a66c2]" />
                <span className="font-medium text-[11px]">Scheduled Date</span>
              </div>
              <p className="font-semibold text-gray-900">{session.date}</p>
            </div>
            <div className="p-3 rounded-lg border border-gray-100 bg-white">
              <div className="flex items-center gap-1.5 text-gray-400 mb-1">
                <Clock size={13} className="text-[#0a66c2]" />
                <span className="font-medium text-[11px]">Duration / Time</span>
              </div>
              <p className="font-semibold text-gray-900">{session.time}</p>
            </div>
          </div>

          {/* Meeting Link Section - ONLY shown when one exists */}
          <div className="rounded-lg border border-gray-100 overflow-hidden">
            <div className="px-3.5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={14} className="text-[#0a66c2]" />
                <span className="text-xs font-bold text-gray-900">Video Meeting</span>
              </div>
              {session.meetUrl ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#057642] bg-[#eef8f1] px-1.5 py-0.5 rounded">
                  <CheckCircle2 size={10} /> Link Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                  <AlertCircle size={10} /> Pending Link
                </span>
              )}
            </div>

            <div className="p-3.5 bg-white">
              {session.meetUrl ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">
                      Google Meet Conference
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate max-w-xs">
                      {session.meetUrl}
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    asChild
                    className="bg-[#0a66c2] hover:bg-[#004182] text-xs shrink-0"
                  >
                    <a
                      href={session.meetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5"
                    >
                      <Video size={13} />
                      <span>Join Video Call</span>
                      <ExternalLink size={11} />
                    </a>
                  </Button>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 text-xs text-gray-600 bg-gray-50/60 p-2.5 rounded border border-gray-100">
                  <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Meeting link has not been assigned yet. A secure Google Meet room link will be automatically generated and dispatched to both participants 15 minutes before the session starts.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Agenda & Discussion Items */}
          {session.agenda && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                <FileText size={13} className="text-gray-500" />
                <span>Session Agenda</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                {session.agenda}
              </p>
            </div>
          )}

          {/* Notes if present */}
          {session.notes && (
            <div className="text-[11px] text-gray-500 bg-blue-50/40 p-2.5 rounded border border-blue-100 flex items-center gap-2">
              <User size={12} className="text-[#0a66c2] shrink-0" />
              <span>Mentor note: {session.notes}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
