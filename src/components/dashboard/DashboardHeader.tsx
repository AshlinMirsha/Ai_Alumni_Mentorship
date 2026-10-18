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
  studentName = "Ashlin",
  department = "Computer Science",
  academicYear = "Second Year",
  onOpenEditProfile,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Greeting text */}
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]">
                <Sparkles size={11} className="text-[#0a66c2]" />
                Student Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                <GraduationCap size={12} className="text-gray-500" />
                {academicYear} · {department}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
              Good morning, {studentName}
            </h1>

            <p className="text-xs sm:text-sm text-gray-600">
              Here is your career network and learning progress at a glance.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button variant="primary" size="md" asChild>
              <Link href="/alumni" className="inline-flex items-center gap-1.5">
                <Users size={15} />
                <span>Discover Alumni</span>
              </Link>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={onOpenEditProfile}
              className="inline-flex items-center gap-1.5"
            >
              <UserCheck size={14} className="text-gray-600" />
              <span>Update Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
