"use client";

import { Building2, Briefcase, UserPlus, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { RecommendedAlumni } from "@/types";

interface RecommendedMentorCardProps {
  alumni: RecommendedAlumni;
  onViewProfile: (alumni: RecommendedAlumni) => void;
  onRequestMentorship: (alumni: RecommendedAlumni) => void;
  isRequested?: boolean;
}

export function RecommendedMentorCard({
  alumni,
  onViewProfile,
  onRequestMentorship,
  isRequested = false,
}: RecommendedMentorCardProps) {
  return (
    <Card
      padding="none"
      className="flex flex-col justify-between border-gray-200 hover:border-gray-300 transition-all duration-150 overflow-hidden bg-white"
    >
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Header: Avatar, Name, Company, Match Score Badge */}
          <div className="flex items-start justify-between gap-2.5 mb-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <Avatar name={alumni.name} size="lg" className="shrink-0" />
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate hover:text-[#0a66c2] transition-colors cursor-pointer" onClick={() => onViewProfile(alumni)}>
                  {alumni.name}
                </h3>
                <p className="text-xs font-medium text-gray-700 truncate mt-0.5">
                  {alumni.role}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                  <Building2 size={11} className="text-gray-400 shrink-0" />
                  <span className="truncate">{alumni.company}</span>
                </p>
              </div>
            </div>

            {/* Match score badge */}
            <div className="flex flex-col items-end shrink-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]">
                {alumni.matchScore}%
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                Match
              </span>
            </div>
          </div>

          {/* Experience tag */}
          <div className="flex items-center gap-2 mb-2.5 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium text-[11px] border border-gray-200">
              <Briefcase size={10} className="text-gray-500" />
              {alumni.experienceYears}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] text-gray-500 truncate">
              {alumni.mentorshipAvailability === "available" ? "Open to mentor" : "Limited capacity"}
            </span>
          </div>

          {/* Relevant Skills */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {alumni.skills.slice(0, 3).map((skill) => (
                <Badge key={skill.id} variant="default" size="sm">
                  {skill.name}
                </Badge>
              ))}
              {alumni.skills.length > 3 && (
                <span className="text-[10px] text-gray-400 self-center pl-0.5">
                  +{alumni.skills.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Short Match Explanation */}
          <div className="p-2 rounded bg-gray-50 border border-gray-200 text-xs text-gray-600 leading-snug">
            <span className="font-semibold text-gray-800">Match: </span>
            {alumni.matchExplanation}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewProfile(alumni)}
          className="text-xs h-7 flex-1"
        >
          View Profile
        </Button>

        <Button
          variant={isRequested ? "secondary" : "primary"}
          size="sm"
          disabled={isRequested}
          onClick={() => onRequestMentorship(alumni)}
          className="text-xs h-7 flex-1 inline-flex items-center justify-center gap-1"
        >
          {isRequested ? (
            <>
              <Check size={12} className="text-[#057642]" />
              <span>Requested</span>
            </>
          ) : (
            <>
              <UserPlus size={12} />
              <span>Connect</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
