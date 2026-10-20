"use client";

import { Target } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Student } from "@/types";
import { calculateProfileCompletion } from "@/lib/mock-data";

interface StudentProfileCardProps {
  student: Student;
  onOpenEditProfile: () => void;
}

export function StudentProfileCard({
  student,
  onOpenEditProfile,
}: StudentProfileCardProps) {
  const completion = calculateProfileCompletion(student);
  const careerGoal =
    student.careerGoal || student.careerGoals?.[0] || "Full-Stack Software Engineer";
  const academicYear = student.academicYear || "Second Year";
  const displayName = student.name && student.name.trim().length > 0 ? student.name : "Mirsha";

  return (
    <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
      {/* Header: Avatar, Name, Department & Year + Edit Profile Link */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E7E7E7]">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={displayName}
            size="lg"
            className="ring-2 ring-[#E7E7E7] bg-white shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#090909] truncate">
              {displayName}
            </h3>
            <p className="text-xs text-[#555555] truncate mt-0.5">
              {student.department}
            </p>
            <p className="text-[11px] text-[#737373] mt-0.5">
              {academicYear}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenEditProfile}
          className="text-xs font-semibold text-[#090909] hover:underline shrink-0 cursor-pointer"
        >
          Edit Profile
        </button>
      </div>

      {/* Target Career Role */}
      <div className="py-3 border-b border-[#E7E7E7]">
        <span className="text-[10px] font-semibold text-[#737373] uppercase tracking-wider block">
          Target Career Role
        </span>
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#090909] mt-1">
          <Target size={13} className="text-[#090909] shrink-0" />
          <span className="truncate">{careerGoal}</span>
        </div>
      </div>

      {/* Profile Strength Indicator */}
      <div className="pt-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-[#555555]">Profile Strength</span>
          <span className="font-bold text-[#090909]">{completion.percent}%</span>
        </div>
        <div className="w-full bg-[#EBEBEB] rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#090909] transition-all duration-300"
            style={{ width: `${completion.percent}%` }}
          />
        </div>
        <p className="text-[11px] text-[#737373] mt-1.5 font-medium">
          {completion.percent === 100
            ? "All essentials completed"
            : `${completion.missingCount} recommended fields remaining`}
        </p>
      </div>
    </div>
  );
}
