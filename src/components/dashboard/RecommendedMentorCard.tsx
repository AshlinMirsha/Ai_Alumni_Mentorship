"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { RecommendedAlumni } from "@/types";

interface RecommendedMentorCardProps {
  alumni: RecommendedAlumni;
  onViewProfile: (alumni: RecommendedAlumni) => void;
}

export function RecommendedMentorCard({
  alumni,
  onViewProfile,
}: RecommendedMentorCardProps) {
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 flex flex-col justify-between hover:border-[#D1D5DB] transition-all shadow-xs h-full">
      <div className="flex-1 flex flex-col">
        {/* Top: Avatar, Name, Role & Company, Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar name={alumni.name} size="md" className="shrink-0 ring-1 ring-gray-100" />
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewProfile(alumni)}
                className="text-left font-bold text-[15px] sm:text-base text-[#111827] hover:text-[#1E40AF] transition-colors truncate block max-w-full cursor-pointer"
              >
                {alumni.name}
              </button>
              <p className="text-xs sm:text-[13px] text-[#4B5563] truncate mt-0.5 font-medium">
                {alumni.role}
              </p>
              <p className="text-xs text-[#6B7280] flex items-center gap-1.5 mt-0.5 truncate">
                <Building2 size={12} className="text-[#9CA3AF] shrink-0" />
                <span className="truncate">{alumni.company}</span>
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] shrink-0">
            {alumni.matchScore}% match
          </span>
        </div>

        {/* 2 or 3 Relevant Skills */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {alumni.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-[#F3F4F6] text-[#374151]"
            >
              {skill.name}
            </span>
          ))}
        </div>

        {/* Short, Readable Matching Reason */}
        <p className="text-xs sm:text-[13px] text-[#4B5563] leading-relaxed line-clamp-2 my-2.5">
          {alumni.matchExplanation}
        </p>
      </div>

      {/* Action Buttons: Clean 2-column layout, zero line wrapping */}
      <div className="pt-3.5 mt-2 border-t border-[#F3F4F6] grid grid-cols-2 gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewProfile(alumni)}
          className="w-full text-xs h-[34px] px-2 rounded-lg font-medium justify-center whitespace-nowrap overflow-hidden text-ellipsis bg-white hover:bg-gray-50 text-[#374151] border border-[#D1D5DB] shadow-none cursor-pointer"
        >
          Quick View
        </Button>

        <Button
          variant="primary"
          size="sm"
          asChild
          className="w-full text-xs h-[34px] px-2 rounded-lg font-semibold justify-center whitespace-nowrap overflow-hidden text-ellipsis bg-[#1E40AF] hover:bg-[#1D4ED8] !text-white text-white border-0 shadow-none cursor-pointer"
        >
          <Link href={`/alumni/${alumni.id}`} className="inline-flex items-center justify-center gap-1.5">
            <span className="whitespace-nowrap">View Profile</span>
            <ArrowRight size={13} className="shrink-0 !text-white text-white" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
