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
      bgClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
      icon: Clock,
    },
    active: {
      label: "Active Mentorship",
      bgClass: "bg-neutral-900 text-white border-neutral-900",
      icon: CheckCircle2,
    },
    completed: {
      label: "Completed",
      bgClass: "bg-neutral-100 text-neutral-800 border-neutral-200",
      icon: CheckCircle2,
    },
    declined: {
      label: "Declined",
      bgClass: "bg-neutral-100 text-neutral-500 border-neutral-200",
      icon: XCircle,
    },
  }[mentorship.status] || {
    label: mentorship.status,
    bgClass: "bg-neutral-100 text-neutral-700 border-neutral-200",
    icon: Clock,
  };

  const StatusIcon = statusBadge.icon;

  return (
    <div className="bg-white rounded-2xl border border-[#E7E7E7] p-4 sm:p-5 shadow-xs hover:border-neutral-300 transition-all space-y-3.5">
      {/* Top Row: User Info + Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <Avatar name={displayName} size="md" className="shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">{displayName}</h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${statusBadge.bgClass}`}
              >
                <StatusIcon size={11} />
                {statusBadge.label}
              </span>
              <span className="text-[10px] font-medium text-neutral-600 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                {isIncoming ? "Incoming Mentee Request" : "Outgoing Request"}
              </span>
            </div>

            <p className="text-xs text-gray-600 flex items-center gap-1.5">
              <span>{displayRole}</span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Building2 size={11} className="text-gray-400" />
                {displayOrg}
              </span>
            </p>
          </div>
        </div>

        {/* Date information */}
        <div className="text-[11px] text-gray-400 sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-1">
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} />
            Requested: {mentorship.requestDate || mentorship.startDate || "Recent"}
          </span>
          {isAccepted && mentorship.nextSession && (
            <span className="text-neutral-900 font-medium">
              Next sync: {new Date(mentorship.nextSession).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>

      {/* Focus & Message Body */}
      <div className="space-y-1.5 text-xs">
        <div>
          <span className="font-semibold text-gray-700">Focus: </span>
          <span className="text-gray-800 font-medium">{mentorship.focus}</span>
        </div>

        {mentorship.requestMessage && (
          <div className="p-2.5 bg-gray-50 rounded-md border border-gray-200 text-gray-600 text-[11px] leading-relaxed">
            <p className="line-clamp-3 italic">&quot;{mentorship.requestMessage}&quot;</p>
          </div>
        )}

        {isDeclined && mentorship.declinedReason && (
          <div className="p-2.5 bg-[#fff8ea] rounded-md border border-[#fde5b2] text-[#915907] text-[11px] leading-relaxed flex items-start gap-2">
            <AlertCircle size={13} className="shrink-0 text-[#915907] mt-0.5" />
            <div>
              <strong>Reason: </strong>
              <span>{mentorship.declinedReason}</span>
            </div>
          </div>
        )}
      </div>

      {/* Actions Row */}
      <div className="pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Left Side: Context / Stats */}
        <div className="text-[11px] text-gray-400">
          {isAccepted ? (
            <span>
              <strong>{mentorship.sessionCount}</strong> session{mentorship.sessionCount === 1 ? "" : "s"} completed
            </span>
          ) : isPending ? (
            <span className="text-[#915907] font-medium">Awaiting response from {displayName.split(" ")[0]}</span>
          ) : (
            <span>Archived request</span>
          )}
        </div>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-2">
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
                className="text-xs bg-[#057642] hover:bg-[#045d34] border-[#057642] inline-flex items-center gap-1"
              >
                <Check size={12} />
                Accept
              </Button>
            </>
          )}

          {!isIncoming && isPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCancelRequest?.(mentorship.id)}
              className="text-xs text-gray-500 hover:text-red-600 hover:border-red-200 inline-flex items-center gap-1"
            >
              <Trash2 size={11} />
              Cancel
            </Button>
          )}

          {isAccepted && (
            <Link
              href="/messages"
              className="px-3 py-1.5 rounded-full bg-[#090909] hover:bg-[#242424] text-white font-medium text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare size={12} />
              <span>Message</span>
            </Link>
          )}

          {profileHref ? (
            <Link
              href={profileHref}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 font-medium text-xs inline-flex items-center gap-1 transition-colors"
            >
              <User size={12} />
              <span>Profile</span>
              <ArrowRight size={10} className="text-gray-400" />
            </Link>
          ) : isIncoming && onViewStudentProfile ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewStudentProfile(mentorship)}
              className="text-xs inline-flex items-center gap-1"
            >
              <User size={12} />
              <span>Student Profile</span>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
