"use client";

import Link from "next/link";
import { Users, UserCheck, Sparkles, Calendar } from "lucide-react";
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
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          {/* Greeting text */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles size={12} className="text-blue-600" />
                Student Career Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                <Calendar size={12} className="text-gray-500" />
                {academicYear} · {department}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {`Good morning, ${studentName}`}
            </h1>

            <p className="text-sm text-gray-600 max-w-2xl leading-relaxed">
              Here is your career network and learning progress at a glance.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Prominent Action */}
            <Button variant="primary" size="md" asChild className="shadow-xs">
              <Link href="/alumni" className="inline-flex items-center gap-2">
                <Users size={16} />
                <span>Discover Alumni</span>
              </Link>
            </Button>

            {/* Smaller Action */}
            <Button
              variant="secondary"
              size="md"
              onClick={onOpenEditProfile}
              className="inline-flex items-center gap-1.5"
            >
              <UserCheck size={15} className="text-gray-600" />
              <span>Update Profile</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
