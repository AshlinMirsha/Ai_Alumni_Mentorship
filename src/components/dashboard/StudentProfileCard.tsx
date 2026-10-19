"use client";

import { UserCheck, Target, Building2, Code2, FolderGit2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ProfileCompletion } from "@/components/dashboard/ProfileCompletion";
import type { Student } from "@/types";
import { calculateProfileCompletion } from "@/lib/mock-data";

interface StudentProfileCardProps {
  student: Student;
  onOpenEditProfile: () => void;
}

export function StudentProfileCard({ student, onOpenEditProfile }: StudentProfileCardProps) {
  const completion = calculateProfileCompletion(student);
  const careerGoal = student.careerGoal || student.careerGoals?.[0] || "Full-Stack Software Engineer";
  const academicYear = student.academicYear || "Second Year";

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-[12px] p-4 sm:p-5 shadow-2xs">
      {/* Identity Row */}
      <div className="flex items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            name={student.name}
            size="lg"
            className="ring-2 ring-gray-100 bg-white shadow-2xs shrink-0"
          />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#191919] leading-snug truncate">
              {student.name}
            </h3>
            <p className="text-xs text-[#626262] flex items-center gap-1.5 mt-0.5 truncate">
              <Building2 size={12} className="text-[#8C8C8C] shrink-0" />
              <span className="truncate">{student.department}</span>
            </p>
            <p className="text-[11px] text-[#8C8C8C] mt-0.5 font-medium">
              {academicYear}
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenEditProfile}
          className="text-xs h-[30px] px-2.5 rounded-[6px] font-medium text-[#252525] border border-[#D5D9DE] hover:bg-[#F5F7FA] shrink-0 whitespace-nowrap shadow-none"
        >
          <UserCheck size={12} className="mr-1 text-[#626262]" />
          Edit
        </Button>
      </div>

      {/* Target Role / Aspiration */}
      <div className="mb-3.5 p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E1E5EA]">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-[11px] font-medium text-[#626262] uppercase tracking-wider">
            Target Role
          </span>
          <span className="text-[10px] font-semibold text-[#2166A5] bg-[#F0F5FA] px-1.5 py-0.5 rounded border border-[#D0E0EF]">
            Active Goal
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#191919]">
          <Target size={13} className="text-[#2166A5] shrink-0" />
          <span className="truncate">{careerGoal}</span>
        </div>
      </div>

      {/* Skills */}
      <div className="mb-3.5 pt-3 border-t border-[#E1E5EA]">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-[#191919] flex items-center gap-1.5">
            <Code2 size={13} className="text-[#626262]" />
            Technical Skills
          </span>
          <span className="text-[11px] text-[#8C8C8C]">{student.skills.length} listed</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {student.skills.map((skill) => (
            <span
              key={typeof skill === "string" ? skill : skill.name}
              className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#F5F7FA] text-[#374151] border border-[#E1E5EA]"
            >
              {typeof skill === "string" ? skill : skill.name}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Projects */}
      {student.projects && student.projects.length > 0 && (
        <div className="mb-3.5 pt-3 border-t border-[#E1E5EA]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#191919] flex items-center gap-1.5">
              <FolderGit2 size={13} className="text-[#626262]" />
              Featured Projects
            </span>
            <span className="text-[11px] text-[#8C8C8C]">{student.projects.length}</span>
          </div>
          <ul className="text-xs text-[#4B5563] space-y-1">
            {student.projects.slice(0, 2).map((proj, idx) => (
              <li key={idx} className="truncate flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2166A5] shrink-0" />
                <span className="truncate">{proj}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Profile Completion Indicator */}
      <div className="pt-3 border-t border-[#E1E5EA]">
        <ProfileCompletion completion={completion} onOpenEditProfile={onOpenEditProfile} />
      </div>
    </div>
  );
}
