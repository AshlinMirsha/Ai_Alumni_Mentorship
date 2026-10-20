"use client";

import {
  X,
  Building2,
  MapPin,
  Calendar,
  Users,
  ExternalLink,
  Tag,
  Mail,
  Edit3,
  Trash2,
  Clock,
  Laptop,
} from "lucide-react";

import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Opportunity } from "@/types";

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  isAuthor: boolean;
  onEdit?: (opp: Opportunity) => void;
  onDelete?: (opp: Opportunity) => void;
  onToggleStatus?: (opp: Opportunity) => void;
}

export function OpportunityDetailModal({
  opportunity,
  isOpen,
  onClose,
  isAuthor,
  onEdit,
  onDelete,
  onToggleStatus,
}: OpportunityDetailModalProps) {
  if (!isOpen || !opportunity) return null;

  const isClosed = opportunity.status === "closed";

  const getBadgeColor = (type: string) => {
    return "bg-neutral-100 text-neutral-900 border-neutral-200";
  };

  const formatWorkArrangement = (wa?: string) => {
    switch (wa) {
      case "remote":
        return "Fully Remote";
      case "hybrid":
        return "Hybrid";
      case "on_site":
        return "On-Site";
      default:
        return "Flexible";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl border border-[#E7E7E7] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#E7E7E7] bg-neutral-50/70 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getBadgeColor(
                  opportunity.type
                )}`}
              >
                {opportunity.type.replace("_", " ")}
              </span>

              {opportunity.workArrangement && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white text-gray-700 border border-gray-200 flex items-center gap-1">
                  <Laptop size={10} />
                  <span>{formatWorkArrangement(opportunity.workArrangement)}</span>
                </span>
              )}

              {isClosed ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700">
                  Closed to New Applicants
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-100 text-neutral-900 border border-neutral-200">
                  Active Opportunity
                </span>
              )}

              {isAuthor && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-900 border border-neutral-200">
                  Your Listing
                </span>
              )}
            </div>

            <h2 className="text-base font-bold text-gray-900 mt-2 leading-snug">
              {opportunity.title}
            </h2>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-900 flex items-center gap-1">
                <Building2 size={13} className="text-gray-400" />
                <span>{opportunity.company}</span>
              </span>
              <span className="flex items-center gap-1 text-gray-500">
                <MapPin size={13} className="text-gray-400" />
                <span>{opportunity.location}</span>
              </span>
              {opportunity.deadline && (
                <span className="flex items-center gap-1 text-gray-400">
                  <Calendar size={13} />
                  <span>Deadline: {opportunity.deadline}</span>
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Author attribution strip */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Avatar name={opportunity.postedByAlumniName} size="sm" />
              <div>
                <span className="font-bold text-gray-900 block leading-tight">
                  Posted by {opportunity.postedByAlumniName}
                </span>
                <span className="text-[11px] text-gray-500">
                  {opportunity.postedByAlumniRole} · Posted on {opportunity.postedDate}
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-semibold text-[#057642] bg-[#eef8f1] px-2.5 py-1 rounded-full border border-[#bfe3c9] inline-flex items-center gap-1">
                <Users size={12} />
                <span>{opportunity.applicantsCount} applicants</span>
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider text-gray-500">
              Overview &amp; Mission
            </h3>
            <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-line bg-white p-3 border border-gray-200 rounded-md">
              {opportunity.description}
            </p>
          </div>

          {/* Eligibility Requirements */}
          {opportunity.eligibility && (
            <div>
              <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider text-gray-500">
                Eligibility Requirements
              </h3>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-md text-xs text-blue-900">
                {opportunity.eligibility}
              </div>
            </div>
          )}

          {/* Role Requirements / Key expectations */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider text-gray-500">
                Key Expectations &amp; Prerequisites
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                {opportunity.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Skills */}
          {opportunity.skills && opportunity.skills.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-900 mb-1.5 uppercase tracking-wider text-gray-500 flex items-center gap-1">
                <Tag size={12} />
                <span>Target Skills &amp; Technologies</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-1 text-xs rounded-md bg-gray-100 text-gray-800 font-medium border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Instructions / How to Apply */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <h3 className="text-xs font-bold text-gray-900">
              Application &amp; Submission Instructions
            </h3>
            {opportunity.contactInstructions ? (
              <p className="text-xs text-gray-700 leading-relaxed">
                {opportunity.contactInstructions}
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                Submit through the official portal or connect directly with the alumni author.
              </p>
            )}

            {opportunity.contactEmail && (
              <div className="pt-2 text-xs text-gray-600 flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400" />
                <span>Contact Email: <strong>{opportunity.contactEmail}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Author Management Actions */}
          <div className="flex items-center gap-2">
            {isAuthor ? (
              <>
                {onEdit && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onEdit(opportunity);
                    }}
                    className="text-xs text-neutral-900 border-neutral-300 hover:bg-neutral-100 rounded-full"
                  >
                    <Edit3 size={12} className="mr-1" />
                    <span>Edit Listing</span>
                  </Button>
                )}

                {onToggleStatus && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onToggleStatus(opportunity)}
                    className="text-xs text-neutral-900 border-neutral-300 rounded-full"
                  >
                    <Clock size={12} className="mr-1" />
                    <span>{isClosed ? "Reopen Listing" : "Mark as Closed"}</span>
                  </Button>
                )}

                {onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClose();
                      onDelete(opportunity);
                    }}
                    className="text-xs text-neutral-700 border-neutral-300 hover:bg-neutral-100 rounded-full"
                  >
                    <Trash2 size={12} className="mr-1" />
                    <span>Delete</span>
                  </Button>
                )}
              </>
            ) : (
              <span className="text-[11px] text-gray-400 italic">
                Verified Alumni Posting
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-full border-neutral-300"
            >
              Close
            </Button>

            {opportunity.applyUrl && !isClosed && (
              <a
                href={opportunity.applyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#090909] text-white font-semibold text-xs hover:bg-[#242424] transition-colors"
              >
                <span>Apply on Official Portal</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
