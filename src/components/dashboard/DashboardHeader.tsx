"use client";

import Link from "next/link";
import { Users, UserCheck, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface DashboardHeaderProps {
  studentName?: string;
  department?: string;
  academicYear?: string;
  onOpenEditProfile: () => void;
}

export function DashboardHeader({
  studentName = "Mirsha",
  department = "Computer Science",
  academicYear = "Second Year",
  onOpenEditProfile,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-[#E1E5EA]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Badges, Greeting, Subtitle */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-semibold bg-[#F0F5FA] text-[#2166A5] border border-[#D0E0EF]">
                <Sparkles size={12} className="text-[#2166A5]" />
                Student Hub
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[6px] text-xs font-medium bg-[#F5F7FA] text-[#4B5563] border border-[#E1E5EA]">
                <GraduationCap size={13} className="text-[#626262]" />
                {academicYear} · {department}
              </span>
            </div>

            <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-[#191919]">
              Good morning, {studentName}
            </h1>

            <p className="text-xs sm:text-sm text-[#626262]">
              Here is your career network and learning progress at a glance.
            </p>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <Button
              variant="primary"
              size="md"
              asChild
              className="h-[40px] px-4 rounded-[8px] font-medium bg-[#2166A5] hover:bg-[#194F82] !text-white text-white border-0 shadow-none whitespace-nowrap"
            >
              <Link href="/alumni" className="inline-flex items-center gap-2">
                <Users size={15} className="!text-white text-white" />
                <span>Discover Alumni</span>
              </Link>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={onOpenEditProfile}
              className="h-[40px] px-4 rounded-[8px] font-medium bg-white hover:bg-[#F5F7FA] text-[#252525] border border-[#D5D9DE] shadow-none whitespace-nowrap"
            >
              <UserCheck size={15} className="text-[#4B5563] mr-1.5" />
              <span>Update Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
