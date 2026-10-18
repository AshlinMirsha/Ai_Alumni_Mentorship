"use client";

import Link from "next/link";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Alumni } from "@/types";

interface AlumniCardProps {
  alumni: Alumni & { experienceYears?: string };
  isRequested?: boolean;
  isAccepted?: boolean;
  onRequestMentorship?: (alumni: Alumni & { experienceYears?: string }) => void;
}

export function AlumniCard({
  alumni,
}: AlumniCardProps) {
  // Display experience
  const expDisplay =
    alumni.experienceYears ||
    (alumni.yearsOfExperience ? `${alumni.yearsOfExperience}+ yrs exp` : undefined);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs hover:shadow-md hover:border-gray-300 transition-all duration-150 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner / Match Indicator */}
      {alumni.matchScore && (
        <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-blue-800 font-semibold truncate">
            <Sparkles size={13} className="text-blue-600 shrink-0" />
            <span>{alumni.matchScore}% Match</span>
            <span className="text-[10px] font-normal text-blue-600/90 bg-blue-100 px-1.5 py-0.2 rounded">
              Demo Score
            </span>
          </div>
          {alumni.lastActive && (
            <span className="text-[11px] text-gray-500 shrink-0 flex items-center gap-1">
              <Clock size={11} className="text-gray-400" />
              {alumni.lastActive}
            </span>
          )}
        </div>
      )}

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header: Avatar, Name, Verification, Availability */}
        <div className="flex items-start gap-3.5 mb-3.5">
          <Avatar
            name={alumni.name}
            src={alumni.avatar}
            size="lg"
            className="ring-2 ring-gray-100 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/alumni/${alumni.id}`}
                className="font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors truncate"
              >
                {alumni.name}
              </Link>
              {/* Strictly render verification badge ONLY when isVerified === true */}
              {alumni.isVerified === true && (
                <span
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  title="Verified Alumni Profile"
                >
                  <ShieldCheck size={11} className="text-emerald-600" />
                  Verified
                </span>
              )}
            </div>

            <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">
              {alumni.role} <span className="font-normal text-gray-400">at</span> {alumni.company}
            </p>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-500 mt-1">
              <span className="flex items-center gap-1 truncate">
                <GraduationCap size={12} className="text-gray-400 shrink-0" />
                {alumni.degree || alumni.department} · &apos;{String(alumni.graduationYear).slice(-2)}
              </span>
              {expDisplay && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="flex items-center gap-1 truncate">
                    <Briefcase size={12} className="text-gray-400 shrink-0" />
                    {expDisplay}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Short Bio / Summary */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3.5 leading-relaxed flex-1">
          {alumni.bio}
        </p>

        {/* Match Explanation (Demo generated) */}
        {alumni.matchExplanation && (
          <div className="mb-3.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-600 leading-normal">
            <span className="font-semibold text-gray-800">Why matched: </span>
            <span>{alumni.matchExplanation}</span>
          </div>
        )}

        {/* Technical Skills */}
        <div className="mb-3.5">
          <div className="flex flex-wrap gap-1.5">
            {alumni.skills.slice(0, 4).map((skill) => (
              <span
                key={skill.id || skill.name}
                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
              >
                {skill.name}
              </span>
            ))}
            {alumni.skills.length > 4 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-100">
                +{alumni.skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Location & response details */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500 mb-1">
          <span className="inline-flex items-center gap-1.5 text-gray-600 font-medium">
            <span>{alumni.location || "Alumni Professional"}</span>
          </span>
          <span className="text-gray-400">
            {alumni.responseRate}% response rate
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="p-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-2">
        <Link
          href={`/alumni/${alumni.id}`}
          className="text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md hover:bg-gray-100"
        >
          View Profile
          <ArrowUpRight size={13} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
        </Link>

        <Link
          href={`/alumni/${alumni.id}`}
          className="text-xs font-semibold text-[#0a66c2] bg-[#ebf3fb] hover:bg-[#d0e5f9] border border-[#b2d5f8] px-3 py-1.5 rounded-md transition-colors inline-flex items-center gap-1"
        >
          <span>Connect &amp; Message</span>
        </Link>
      </div>
    </div>
  );
}
