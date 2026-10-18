"use client";

import { UserCheck, Target, GraduationCap, Building2, Code2, FolderGit2, Sparkles } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
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
    <Card padding="md" className="border-gray-200 shadow-xs relative overflow-hidden">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-400" />

      {/* Header with editable sample info indicator */}
      <CardHeader className="border-b border-gray-100 pb-3 mb-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GraduationCap size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900">Student Profile</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/80">
            <Sparkles size={11} className="text-blue-600" />
            Editable Sample Profile
          </span>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Main profile row: Avatar + Demographics */}
        <div className="flex items-start gap-3.5">
          <Avatar name={student.name} size="xl" className="ring-2 ring-blue-100 ring-offset-2 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-bold text-gray-900 truncate">{student.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenEditProfile}
                className="text-xs h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
              >
                <UserCheck size={13} className="mr-1" />
                Edit
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-600 mt-1">
              <span className="inline-flex items-center gap-1">
                <Building2 size={12} className="text-gray-400" />
                {student.department}
              </span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-700 font-medium">{academicYear}</span>
            </div>

            {/* Target Role */}
            <div className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="text-gray-400">Target Role:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                <Target size={11} className="text-blue-600" />
                {careerGoal}
              </span>
            </div>
          </div>
        </div>

        {/* Skills section */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-gray-700 flex items-center gap-1">
              <Code2 size={13} className="text-gray-500" />
              Verified Skills
            </span>
            <span className="text-[11px] text-gray-400">{student.skills.length} skills</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {student.skills.map((skill) => (
              <Badge key={typeof skill === "string" ? skill : skill.name} variant="blue" size="sm">
                {typeof skill === "string" ? skill : skill.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Projects Preview if available */}
        {student.projects && student.projects.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700 flex items-center gap-1">
                <FolderGit2 size={13} className="text-gray-500" />
                Projects
              </span>
              <span className="text-[11px] text-gray-400">{student.projects.length} added</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1 pl-1">
              {student.projects.slice(0, 2).map((proj, idx) => (
                <li key={idx} className="truncate flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-blue-500" />
                  <span className="truncate">{proj}</span>
                </li>
              ))}
              {student.projects.length > 2 && (
                <li className="text-[11px] text-gray-400 pl-2.5">
                  +{student.projects.length - 2} more project{student.projects.length - 2 > 1 ? "s" : ""}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Profile Completion Indicator (derived from actual fields) */}
        <div className="pt-2">
          <ProfileCompletion completion={completion} onOpenEditProfile={onOpenEditProfile} />
        </div>

        {/* Footer info message */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500">
          <span>Editable sample data (stored locally)</span>
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            Edit Profile &rarr;
          </button>
        </div>
      </CardBody>
    </Card>
  );
}
