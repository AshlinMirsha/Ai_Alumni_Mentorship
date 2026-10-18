"use client";

import { Building2, Briefcase, Sparkles, UserPlus } from "lucide-react";
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
      className="flex flex-col justify-between border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-xs hover:shadow-md overflow-hidden bg-white group"
    >
      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Top Header: Avatar, Name, Company, Match Score Badge */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-3.5">
            <div className="flex items-start gap-3">
              <Avatar name={alumni.name} size="lg" className="ring-2 ring-gray-100 group-hover:ring-blue-100 transition-all" />
              <div>
                <h3 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {alumni.name}
                </h3>
                <p className="text-xs font-medium text-gray-800 flex items-center gap-1.5 mt-0.5">
                  <span className="truncate">{alumni.role}</span>
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Building2 size={12} className="text-gray-400 shrink-0" />
                  <span className="truncate">{alumni.company}</span>
                </p>
              </div>
            </div>

            {/* Match score badge with demo indicator label */}
            <div className="flex flex-col items-end shrink-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles size={11} className="text-blue-500" />
                {alumni.matchScore}%
              </span>
              <span className="text-[10px] text-gray-400 font-medium mt-0.5" title="Illustrative demo match score">
                Demo Score
              </span>
            </div>
          </div>

          {/* Experience tag */}
          <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
              <Briefcase size={11} className="text-gray-500" />
              {alumni.experienceYears}
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] text-gray-500 truncate">
              {alumni.mentorshipAvailability === "available" ? "Open for 1:1 mentorship" : "Limited capacity"}
            </span>
          </div>

          {/* Relevant Skills */}
          <div className="mb-3.5">
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
              Relevant Skills
            </p>
            <div className="flex flex-wrap gap-1">
              {alumni.skills.slice(0, 4).map((skill) => (
                <Badge key={skill.id} variant="default" size="sm">
                  {skill.name}
                </Badge>
              ))}
              {alumni.skills.length > 4 && (
                <span className="text-[10px] text-gray-400 self-center pl-1">
                  +{alumni.skills.length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Short Match Explanation */}
          <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
            <span className="font-semibold text-slate-800">Why matched: </span>
            {alumni.matchExplanation}
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onViewProfile(alumni)}
          className="text-xs h-8 flex-1"
        >
          View Profile
        </Button>

        <Button
          variant={isRequested ? "secondary" : "primary"}
          size="sm"
          disabled={isRequested}
          onClick={() => onRequestMentorship(alumni)}
          className="text-xs h-8 flex-1 inline-flex items-center justify-center gap-1"
        >
          {isRequested ? (
            <span>Requested</span>
          ) : (
            <>
              <UserPlus size={13} />
              <span>Request</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
