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
      : 0;

  return (
    <section aria-label="Career Overview Summary" className="w-full">
      <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5E7EB]">
          {/* 1. Profile Completion */}
          <div className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#F9FAFB] transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7280]">Profile Completion</span>
              <button
                type="button"
                onClick={onOpenEditProfile}
                className="text-[#9CA3AF] hover:text-[#1E40AF] transition-colors cursor-pointer"
                title="Edit Profile"
              >
                <UserCheck size={15} />
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827]">
                {profilePercent}%
              </span>
              <span
                className={`text-xs font-semibold ${
                  profilePercent >= 80 ? "text-[#057642]" : "text-[#B45309]"
                }`}
              >
                {profilePercent >= 80 ? "Optimized" : "In Progress"}
              </span>
            </div>
            <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  profilePercent >= 80 ? "bg-[#057642]" : "bg-[#1E40AF]"
                }`}
                style={{ width: `${profilePercent}%` }}
              />
            </div>
          </div>

          {/* 2. Alumni Connections */}
          <Link
            href="/alumni"
            className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7280]">Alumni Connections</span>
              <Users size={15} className="text-[#9CA3AF] group-hover:text-[#1E40AF] transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827]">
                {connectionsCount}
              </span>
              <span className="text-xs text-[#6B7280]">
                {connectionsCount === 1 ? "Active mentor" : "Active mentors"}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-3 truncate flex items-center justify-between">
              <span>{connectionsCount > 0 ? "Connected across industry" : "Explore alumni mentors"}</span>
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1E40AF]" />
            </p>
          </Link>

          {/* 3. Roadmap Progress */}
          <Link
            href="/career-roadmap"
            className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7280]">Roadmap Progress</span>
              <Map size={15} className="text-[#9CA3AF] group-hover:text-[#1E40AF] transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827]">
                {roadmapPercent}%
              </span>
              <span className="text-xs text-[#6B7280]">
                {roadmapCompletedCount} of {roadmapTotalCount} milestones
              </span>
            </div>
            <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mt-3 overflow-hidden">
              <div
                className="h-full bg-[#1E40AF] rounded-full transition-all duration-300"
                style={{ width: `${roadmapPercent}%` }}
              />
            </div>
          </Link>

          {/* 4. Unread Messages */}
          <Link
            href="/messages"
            className="p-4 sm:p-5 flex flex-col justify-between group hover:bg-[#F9FAFB] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-[#6B7280]">Unread Messages</span>
              <MessageSquare size={15} className="text-[#9CA3AF] group-hover:text-[#1E40AF] transition-colors" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-[28px] font-bold tracking-tight text-[#111827]">
                {unreadMessagesCount}
              </span>
              <span className="text-xs text-[#6B7280]">
                {unreadMessagesCount === 1 ? "New message" : "New messages"}
              </span>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-3 truncate flex items-center justify-between">
              <span>{unreadMessagesCount > 0 ? "Awaiting your response" : "All conversations caught up"}</span>
              <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#1E40AF]" />
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
