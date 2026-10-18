"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ArrowRight,
  User,
  AlertCircle,
  Building2,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Mentorship } from "@/types";

interface MentorshipCardProps {
  mentorship: Mentorship;
  onCancelRequest?: (requestId: string) => void;
  onAcceptRequest?: (requestId: string) => void;
  onDeclineRequest?: (requestId: string) => void;
  onViewStudentProfile?: (mentorship: Mentorship) => void;
}

export function MentorshipCard({
  mentorship,
  onCancelRequest,
  onAcceptRequest,
  onDeclineRequest,
  onViewStudentProfile,
}: MentorshipCardProps) {
  const isIncoming = mentorship.direction === "incoming";
  const isPending = mentorship.status === "pending";
  const isAccepted = mentorship.status === "active" || mentorship.status === "completed";
  const isDeclined = mentorship.status === "declined";

  // Determine display party
  const displayName = isIncoming && mentorship.student ? mentorship.student.name : mentorship.alumni.name;
  const displayRole = isIncoming && mentorship.student ? mentorship.student.careerGoal || "Student" : mentorship.alumni.role;
  const displayOrg = isIncoming ? "University of Technology" : mentorship.alumni.company;
  const profileHref = isIncoming ? undefined : `/alumni/${mentorship.alumniId}`;

  const statusBadge = {
    pending: {
      label: "Pending Response",
      bgClass: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Clock,
    },
    active: {
      label: "Active Mentorship",
      bgClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: CheckCircle2,
    },
    completed: {
      label: "Completed",
      bgClass: "bg-blue-50 text-blue-700 border-blue-200",
      icon: CheckCircle2,
    },
    declined: {
      label: "Declined",
      bgClass: "bg-gray-100 text-gray-600 border-gray-200",
      icon: XCircle,
    },
  }[mentorship.status] || {
    label: mentorship.status,
    bgClass: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Clock,
  };

  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-2xs hover:border-gray-300 transition-all space-y-4">
      {/* Top Row: User Info + Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5 pb-4 border-b border-gray-100">
        <div className="flex items-start gap-3.5">
          <Avatar name={displayName} size="md" className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{displayName}</h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBadge.bgClass}`}
              >
                <StatusIcon size={11} />
                {statusBadge.label}
              </span>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-1.5 py-0.2 rounded">
                {isIncoming ? "Incoming Mentee Request" : "Outgoing Inquiry"}
              </span>
            </div>

            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              <span>{displayRole}</span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Building2 size={12} className="text-gray-400" />
                {displayOrg}
              </span>
            </p>
          </div>
        </div>

        {/* Date information */}
        <div className="text-[11px] text-gray-400 sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-1">
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            Requested: {mentorship.requestDate || mentorship.startDate || "Recent"}
          </span>
          {isAccepted && mentorship.nextSession && (
            <span className="text-blue-600 font-medium">
              Next sync: {new Date(mentorship.nextSession).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* Focus & Message Body */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="font-semibold text-gray-700">Focus / Objective: </span>
          <span className="text-gray-800 font-medium">{mentorship.focus}</span>
        </div>

        {mentorship.requestMessage && (
          <div className="p-3 bg-gray-50/70 rounded-xl border border-gray-200/80 text-gray-600 text-[11px] leading-relaxed">
            <p className="line-clamp-3 italic">&quot;{mentorship.requestMessage}&quot;</p>
          </div>
        )}

        {isDeclined && mentorship.declinedReason && (
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong>Reason provided: </strong>
              <span>{mentorship.declinedReason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions Row */}
      <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Side: Context / Stats */}
        <div className="text-[11px] text-gray-400">
          {isAccepted ? (
            <span>
              <strong>{mentorship.sessionCount}</strong> session{mentorship.sessionCount === 1 ? "" : "s"} completed
            </span>
          ) : isPending ? (
            <span className="text-amber-600 font-medium">Awaiting response from {displayName.split(" ")[0]}</span>
          ) : (
            <span>Archived request record</span>
          )}
        </div>

        {/* Right Side: Action Buttons based on status & direction */}
        <div className="flex items-center gap-2">
          {/* For incoming requests: Accept & Decline buttons */}
          {isIncoming && isPending && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeclineRequest?.(mentorship.id)}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 inline-flex items-center gap-1"
              >
                <X size={12} />
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onAcceptRequest?.(mentorship.id)}
                className="text-xs bg-emerald-600 hover:bg-emerald-700 inline-flex items-center gap-1 shadow-2xs"
              >
                <Check size={12} />
                Accept Request
              </Button>
            </>
          )}

          {/* For outgoing pending request: Cancel request */}
          {!isIncoming && isPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancelRequest?.(mentorship.id)}
              className="text-xs text-gray-500 hover:text-red-600 hover:border-red-200 inline-flex items-center gap-1"
            >
              <Trash2 size={12} />
              Cancel Request
            </Button>
          )}

          {/* For accepted requests: Open direct conversation */}
          {isAccepted && (
            <Link
              href="/messages"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <MessageSquare size={13} />
              <span>Open Conversation</span>
            </Link>
          )}

          {/* View Profile Action */}
          {profileHref ? (
            <Link
              href={profileHref}
              className="px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-medium text-xs inline-flex items-center gap-1 transition-colors"
            >
              <User size={12} />
              <span>View Profile</span>
              <ArrowRight size={11} className="text-gray-400" />
            </Link>
          ) : isIncoming && onViewStudentProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStudentProfile(mentorship)}
              className="text-xs inline-flex items-center gap-1"
            >
              <User size={12} />
              <span>View Student Profile</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
