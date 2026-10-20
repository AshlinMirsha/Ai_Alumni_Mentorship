"use client";

import Link from "next/link";
import { UserCheck, Users, Map, MessageSquare, ArrowUpRight } from "lucide-react";

interface CareerStatsStripProps {
  profilePercent: number;
  connectionsCount: number;
  roadmapCompletedCount: number;
  roadmapTotalCount: number;
  unreadMessagesCount: number;
  onOpenEditProfile?: () => void;
}

export function CareerStatsStrip({
  profilePercent,
  connectionsCount,
  roadmapCompletedCount,
  roadmapTotalCount,
  unreadMessagesCount,
  onOpenEditProfile,
}: CareerStatsStripProps) {
  const roadmapPercent =
    roadmapTotalCount > 0
      ? Math.round((roadmapCompletedCount / roadmapTotalCount) * 100)
      : 29;

  return (
    <section aria-label="Career Overview Summary" className="w-full">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E7E7]">
          {/* 1. Profile Completion */}
          <div className="p-5 flex flex-col justify-between hover:bg-[#FAFAFA] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#737373]">Profile Completion</span>
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="text-[#737373] hover:text-[#090909] transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <UserCheck size={15} />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#090909]">
                {profilePercent}%
              </span>
              <span className="text-xs font-semibold text-[#242424]">
                All 6 sections verified
              </span>
            </div>
            <div className="w-full bg-[#EBEBEB] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#090909] transition-all duration-300"
                style={{ width: `${profilePercent}%` }}
              />
            </div>
          </div>

          {/* 2. Alumni Connections */}
          <Link
            href="/alumni"
            className="p-5 flex flex-col justify-between hover:bg-[#FAFAFA] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#737373]">Alumni Connections</span>
              <Users size={15} className="text-[#737373] group-hover:text-[#090909] transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#090909]">
                {connectionsCount}
              </span>
              <span className="text-xs text-[#737373]">
                +2 new this month
              </span>
            </div>
            <p className="text-[11px] text-[#737373] mt-3 truncate flex items-center justify-between">
              <span>Tier-1 network active</span>
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#090909]" />
            </p>
          </Link>

          {/* 3. Roadmap Progress */}
          <Link
            href="/career-roadmap"
            className="p-5 flex flex-col justify-between hover:bg-[#FAFAFA] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#737373]">Roadmap Progress</span>
              <Map size={15} className="text-[#737373] group-hover:text-[#090909] transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#090909]">
                {roadmapPercent}%
              </span>
              <span className="text-xs text-[#737373]">
                {roadmapCompletedCount} of {roadmapTotalCount} milestones
              </span>
            </div>
            <div className="w-full bg-[#EBEBEB] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="h-full bg-[#090909] rounded-full transition-all duration-300"
                style={{ width: `${roadmapPercent}%` }}
              />
            </div>
          </Link>

          {/* 4. Unread Messages */}
          <Link
            href="/messages"
            className="p-5 flex flex-col justify-between hover:bg-[#FAFAFA] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#737373]">Unread Messages</span>
              <MessageSquare size={15} className="text-[#737373] group-hover:text-[#090909] transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#090909]">
                {unreadMessagesCount}
              </span>
              <span className="text-xs text-[#737373]">
                From Marcus Vance · 12m ago
              </span>
            </div>
            <p className="text-[11px] text-[#737373] mt-3 truncate flex items-center justify-between">
              <span>Awaiting review notes</span>
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#090909]" />
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
