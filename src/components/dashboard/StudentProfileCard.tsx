"use client";

import { UserCheck, Target, Building2, Code2, FolderGit2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
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
    <Card padding="none" className="border-gray-200 shadow-xs overflow-hidden">
      {/* Subtle profile banner header */}
      <div className="h-14 bg-[#e8edf2] border-b border-gray-200 relative">
        <div className="absolute top-2.5 right-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-gray-700 border border-gray-300">
            Student Profile
          </span>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Avatar overlapping banner */}
        <div className="flex items-end justify-between -mt-7 mb-2.5">
          <Avatar
            name={student.name}
            size="xl"
            className="ring-3 ring-white bg-white shadow-xs shrink-0"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenEditProfile}
            className="text-xs h-7 px-3 text-gray-700"
          >
            <UserCheck size={12} className="mr-1 text-gray-500" />
            Edit Profile
          </Button>
        </div>

        {/* Identity & Department */}
        <div>
          <h2 className="text-base font-bold text-gray-900 leading-snug">{student.name}</h2>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-600 mt-0.5">
            <span className="inline-flex items-center gap-1 font-medium">
              <Building2 size={12} className="text-gray-400" />
              {student.department}
            </span>
            <span className="text-gray-300">•</span>
            <span>{academicYear}</span>
          </div>

          {/* Career Goal */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 text-[11px]">Aspiration:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
              <Target size={11} className="text-[#0a66c2]" />
              {careerGoal}
            </span>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-3.5 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <Code2 size={12} className="text-gray-500" />
              Skills
            </span>
            <span className="text-[11px] text-gray-400">{student.skills.length} listed</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {student.skills.map((skill) => (
              <Badge key={typeof skill === "string" ? skill : skill.name} variant="blue" size="sm">
                {typeof skill === "string" ? skill : skill.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Projects Preview */}
        {student.projects && student.projects.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <FolderGit2 size={12} className="text-gray-500" />
                Featured Projects
              </span>
              <span className="text-[11px] text-gray-400">{student.projects.length}</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              {student.projects.slice(0, 2).map((proj, idx) => (
                <li key={idx} className="truncate flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-gray-400" />
                  <span className="truncate">{proj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Profile Completion Indicator */}
        <div className="mt-3.5 pt-3 border-t border-gray-100">
          <ProfileCompletion completion={completion} onOpenEditProfile={onOpenEditProfile} />
        </div>
      </div>
    </Card>
  );
}
