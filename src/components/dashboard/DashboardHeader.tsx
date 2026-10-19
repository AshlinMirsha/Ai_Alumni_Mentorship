"use client";

import Link from "next/link";
import { Users, UserCheck } from "lucide-react";
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
  const effectiveName = studentName && studentName.trim().length > 0 ? studentName : "Mirsha";

  return (
    <div className="w-full pt-8 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Left: Greeting, Subtitle, Department & Year in subtle text */}
        <div>
          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight text-[#111827]">
            Good morning, {effectiveName}
          </h1>
          <p className="text-sm sm:text-base text-[#4B5563] mt-1">
            Your career development, alumni connections, and learning progress.
          </p>
          <p className="text-xs text-[#6B7280] mt-1.5 font-medium">
            {department} · {academicYear}
          </p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          <Button
            variant="primary"
            size="md"
            asChild
            className="h-[38px] px-4 rounded-lg text-xs font-semibold bg-[#1E40AF] hover:bg-[#1D4ED8] !text-white text-white border-0 shadow-none whitespace-nowrap cursor-pointer"
          >
            <Link href="/alumni" className="inline-flex items-center gap-2">
              <Users size={15} className="!text-white text-white shrink-0" />
              <span>Discover Alumni</span>
            </Link>
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={onOpenEditProfile}
            className="h-[38px] px-4 rounded-lg text-xs font-semibold bg-white hover:bg-gray-50 text-[#374151] border border-[#D1D5DB] shadow-none whitespace-nowrap cursor-pointer"
          >
            <UserCheck size={15} className="text-[#6B7280] mr-1.5 shrink-0" />
            <span>Update Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
