"use client";

import Link from "next/link";
import { ArrowRight, Building2, Star } from "lucide-react";
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
    <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 flex flex-col justify-between hover:border-[#D1D1D1] transition-all shadow-xs h-full">
      <div className="flex-1 flex flex-col">
        {/* Top: Avatar, Name, Role & Company, Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar name={alumni.name} size="md" className="shrink-0 ring-2 ring-[#E7E7E7]" />
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onViewProfile(alumni)}
                className="text-left font-bold text-sm sm:text-base text-[#090909] hover:text-[#454545] transition-colors truncate block max-w-full cursor-pointer"
              >
                {alumni.name}
              </button>
              <p className="text-xs text-[#454545] truncate mt-0.5 font-medium">
                {alumni.role}
              </p>
              <p className="text-xs text-[#737373] flex items-center gap-1.5 mt-0.5 truncate">
                <Building2 size={12} className="text-[#737373] shrink-0" />
                <span className="truncate font-semibold text-[#090909]">{alumni.company}</span>
              </p>
            </div>
          </div>

          {/* Match Score Badge */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7] shrink-0">
            {alumni.matchScore}% match
          </span>
        </div>

        {/* 2 or 3 Relevant Skills */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {alumni.skills.slice(0, 3).map((skill) => (
            <span
              key={skill.id}
              className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F4F4F4] border border-[#E7E7E7] text-[#242424]"
            >
              {skill.name}
            </span>
          ))}
        </div>

        {/* Short, Readable Matching Reason */}
        <p className="text-xs text-[#555555] leading-relaxed line-clamp-2 my-2.5">
          {alumni.matchExplanation}
        </p>
      </div>

      {/* Action Buttons: Reference 2 layout */}
      <div className="pt-3.5 mt-2 border-t border-[#E7E7E7] grid grid-cols-2 gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewProfile(alumni)}
          className="w-full text-xs h-[36px] rounded-full font-medium justify-center"
        >
          Quick View
        </Button>

        <Button
          variant="primary"
          size="sm"
          asChild
          className="w-full text-xs h-[36px] rounded-full font-medium justify-center"
        >
          <Link href={`/alumni/${alumni.id}`} className="inline-flex items-center justify-center gap-1.5">
            <span>View Profile</span>
            <ArrowRight size={13} className="shrink-0" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
