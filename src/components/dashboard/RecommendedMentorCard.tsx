"use client";

import Link from "next/link";
import { Building2, Briefcase, MapPin, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { RecommendedAlumni } from "@/types";

interface RecommendedMentorCardProps {
  alumni: RecommendedAlumni;
  onViewProfile: (alumni: RecommendedAlumni) => void;
  onRequestMentorship?: (alumni: RecommendedAlumni) => void;
  isRequested?: boolean;
}

export function RecommendedMentorCard({
  alumni,
  onViewProfile,
}: RecommendedMentorCardProps) {
  return (
    <div className="bg-white border border-[#E1E5EA] rounded-[10px] p-4 flex flex-col justify-between hover:border-[#C5C9CE] transition-all shadow-2xs h-full">
      <div className="flex-1 flex flex-col">
        {/* Header: Avatar, Info & Match Score */}
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <Avatar name={alumni.name} size="md" className="shrink-0 ring-1 ring-gray-100" />
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewProfile(alumni)}
                className="text-left font-bold text-sm text-[#191919] hover:text-[#2166A5] transition-colors truncate block max-w-full cursor-pointer"
              >
                {alumni.name}
              </button>
              <p className="text-xs font-medium text-[#4B5563] truncate mt-0.5">
                {alumni.role}
              </p>
              <p className="text-xs text-[#626262] flex items-center gap-1 mt-0.5 truncate">
                <Building2 size={12} className="text-[#8C8C8C] shrink-0" />
                <span className="truncate">{alumni.company}</span>
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          <div className="flex flex-col items-end shrink-0">
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-[4px] text-xs font-bold bg-[#F0F5FA] text-[#2166A5] border border-[#D0E0EF]">
              {alumni.matchScore}%
            </span>
            <span className="text-[10px] text-[#8C8C8C] font-medium mt-0.5">
              Match
            </span>
          </div>
        </div>

        {/* Experience & Location */}
        <div className="flex items-center gap-2 mb-3 text-xs text-[#626262]">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#F5F7FA] text-[#374151] font-medium text-[11px] border border-[#E1E5EA]">
            <Briefcase size={11} className="text-[#626262]" />
            {alumni.experienceYears || "4+ years"}
          </span>
          <span className="text-[#D1D5DB]">•</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#626262] truncate">
            <MapPin size={11} className="text-[#8C8C8C] shrink-0" />
            <span className="truncate">{alumni.location || "Alumni Network"}</span>
          </span>
        </div>

        {/* Relevant Skills */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {alumni.skills.slice(0, 3).map((skill) => (
              <span
                key={skill.id}
                className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#F5F7FA] text-[#374151] border border-[#E1E5EA]"
              >
                {skill.name}
              </span>
            ))}
            {alumni.skills.length > 3 && (
              <span className="text-[10px] text-[#8C8C8C] self-center pl-0.5 font-medium">
                +{alumni.skills.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Match Explanation */}
        <div className="p-2.5 rounded-[6px] bg-[#F8FAFC] border border-[#E1E5EA] text-xs text-[#4B5563] leading-relaxed mb-4">
          <strong className="text-[#191919] font-semibold">Match: </strong>
          {alumni.matchExplanation}
        </div>
      </div>

      {/* Card Action Buttons (Grid 2-col, white-space: nowrap, zero line wrapping) */}
      <div className="pt-3 border-t border-[#E1E5EA] grid grid-cols-2 gap-2 mt-auto">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewProfile(alumni)}
          className="w-full text-xs h-[34px] px-2 rounded-[6px] font-medium justify-center whitespace-nowrap overflow-hidden text-ellipsis bg-white hover:bg-[#F5F7FA] text-[#252525] border border-[#D5D9DE] shadow-none"
        >
          Quick View
        </Button>

        <Button
          variant="primary"
          size="sm"
          asChild
          className="w-full text-xs h-[34px] px-2 rounded-[6px] font-medium justify-center whitespace-nowrap overflow-hidden text-ellipsis bg-[#2166A5] hover:bg-[#194F82] !text-white text-white border-0 shadow-none"
        >
          <Link href={`/alumni/${alumni.id}`} className="inline-flex items-center justify-center gap-1 text-center">
            <span className="whitespace-nowrap">View Profile</span>
            <ArrowRight size={12} className="shrink-0 !text-white text-white" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
