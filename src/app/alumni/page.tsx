"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { Users, CheckCircle, Sparkles, FilterX } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { AlumniCard } from "@/components/alumni/AlumniCard";
import {
  AlumniFilters,
  type AlumniFilterState,
  initialFilterState,
} from "@/components/alumni/AlumniFilters";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { MentorshipRequestModal } from "@/components/dashboard/MentorshipRequestModal";
import {
  alumniData,
  currentStudent,
  initialMentorshipActivity,
} from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadMentorshipActivity,
  saveMentorshipActivity,
  addNotification,
} from "@/lib/dashboard-storage";
import type { Alumni, Mentorship, MentorshipActivityData } from "@/types";

export default function AlumniDiscoveryPage() {
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );
  const mentorshipData = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
  );

  // Filter state
  const [filters, setFilters] = useState<AlumniFilterState>(initialFilterState);

  // Modal & Toast states
  const [selectedAlumniForRequest, setSelectedAlumniForRequest] = useState<
    (Alumni & { experienceYears?: string }) | null
  >(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleFilterChange = <K extends keyof AlumniFilterState>(
    key: K,
    value: AlumniFilterState[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
  };

  // Distinct filter options extracted from mock dataset
  const roles = useMemo(
    () => Array.from(new Set(alumniData.map((a) => a.role))).sort(),
    []
  );
  const companies = useMemo(
    () => Array.from(new Set(alumniData.map((a) => a.company))).sort(),
    []
  );
  const industries = useMemo(
    () =>
      Array.from(
        new Set(
          alumniData.map((a) => a.industry).filter((i): i is string => Boolean(i))
        )
      ).sort(),
    []
  );
  const skills = useMemo(
    () =>
      Array.from(
        new Set(alumniData.flatMap((a) => a.skills.map((s) => s.name)))
      ).sort(),
    []
  );

  // Filter and sort alumni
  const filteredAlumni = useMemo(() => {
    return alumniData.filter((alumnus) => {
      // 1. Search query (name, role, company, skills, industry)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchesName = alumnus.name.toLowerCase().includes(q);
        const matchesRole = alumnus.role.toLowerCase().includes(q);
        const matchesCompany = alumnus.company.toLowerCase().includes(q);
        const matchesIndustry = (alumnus.industry || "").toLowerCase().includes(q);
        const matchesSkill = alumnus.skills.some((s) =>
          s.name.toLowerCase().includes(q)
        );
        if (
          !matchesName &&
          !matchesRole &&
          !matchesCompany &&
          !matchesIndustry &&
          !matchesSkill
        ) {
          return false;
        }
      }

      // 2. Role filter
      if (filters.role !== "all" && alumnus.role !== filters.role) {
        return false;
      }

      // 3. Company filter
      if (filters.company !== "all" && alumnus.company !== filters.company) {
        return false;
      }

      // 4. Industry filter
      if (filters.industry !== "all" && alumnus.industry !== filters.industry) {
        return false;
      }

      // 5. Skill filter
      if (
        filters.skill !== "all" &&
        !alumnus.skills.some((s) => s.name.toLowerCase() === filters.skill.toLowerCase())
      ) {
        return false;
      }

      // 6. Experience range filter
      if (filters.experienceRange !== "all") {
        const years = alumnus.yearsOfExperience ?? 0;
        if (filters.experienceRange === "1-3" && (years < 1 || years > 3)) {
          return false;
        }
        if (filters.experienceRange === "4-6" && (years < 4 || years > 6)) {
          return false;
        }
        if (filters.experienceRange === "7+" && years < 7) {
          return false;
        }
      }

      // 7. Graduation year filter
      if (filters.graduationYearRange !== "all") {
        const gy = alumnus.graduationYear;
        if (filters.graduationYearRange === "2021-2024" && (gy < 2021 || gy > 2024)) {
          return false;
        }
        if (filters.graduationYearRange === "2018-2020" && (gy < 2018 || gy > 2020)) {
          return false;
        }
        if (filters.graduationYearRange === "before-2018" && gy >= 2018) {
          return false;
        }
      }

      // 8. Mentorship availability filter
      if (
        filters.availability !== "all" &&
        alumnus.mentorshipAvailability !== filters.availability
      ) {
        return false;
      }

      return true;
    });
  }, [filters]);

  // Sort filtered alumni
  const sortedAlumni = useMemo(() => {
    const list = [...filteredAlumni];
    switch (filters.sortBy) {
      case "recommended":
        return list.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
      case "relevant":
        // Sort by skill overlap with student
        return list.sort((a, b) => {
          const aOverlap = a.skills.filter((as) =>
            student.skills.some(
              (ss) => ss.name.toLowerCase() === as.name.toLowerCase()
            )
          ).length;
          const bOverlap = b.skills.filter((bs) =>
            student.skills.some(
              (ss) => ss.name.toLowerCase() === bs.name.toLowerCase()
            )
          ).length;
          return bOverlap - aOverlap;
        });
      case "experienced":
        return list.sort(
          (a, b) => (b.yearsOfExperience ?? 0) - (a.yearsOfExperience ?? 0)
        );
      case "recent":
        return list.sort((a, b) => {
          const aActive = a.lastActive?.includes("today")
            ? 3
            : a.lastActive?.includes("week")
            ? 2
            : 1;
          const bActive = b.lastActive?.includes("today")
            ? 3
            : b.lastActive?.includes("week")
            ? 2
            : 1;
          return bActive - aActive;
        });
      default:
        return list;
    }
  }, [filteredAlumni, filters.sortBy, student.skills]);

  // Mentorship tracking
  const requestedAlumniIds = useMemo(() => {
    return new Set(
      mentorshipData.pendingRequests.map((r: Mentorship) => r.alumniId)
    );
  }, [mentorshipData.pendingRequests]);

  const acceptedAlumniIds = useMemo(() => {
    return new Set(
      mentorshipData.acceptedMentorships.map((m: Mentorship) => m.alumniId)
    );
  }, [mentorshipData.acceptedMentorships]);

  const handleOpenMentorshipModal = (
    alumnus: Alumni & { experienceYears?: string }
  ) => {
    setSelectedAlumniForRequest(alumnus);
  };

  const handleSubmitMentorshipRequest = (newRequest: Mentorship) => {
    const updated: MentorshipActivityData = {
      ...mentorshipData,
      pendingRequests: [newRequest, ...mentorshipData.pendingRequests],
    };
    saveMentorshipActivity(updated);
    addNotification({
      id: `notif-${Date.now()}`,
      type: "mentorship_request",
      title: `Mentorship request sent to ${newRequest.alumni.name}`,
      description: `Your request for "${newRequest.focus}" has been logged in My Mentorships.`,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: "/mentorship",
      actorName: newRequest.alumni.name,
    });
    showToast(`Mentorship request submitted to ${newRequest.alumni.name}!`);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <DashboardNav studentName={student.name} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-200/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <Users size={13} />
                Directory
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-medium text-gray-500">
                {alumniData.length} Alumni Profiles
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Discover Alumni
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Find professionals whose experience and career journey align with your goals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/career-roadmap"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <Sparkles size={13} />
              View Your Target Role Roadmap
            </Link>
          </div>
        </div>

        {/* Search, Filter Panel & Sort Controls */}
        <AlumniFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          roles={roles}
          companies={companies}
          industries={industries}
          skills={skills}
          totalResults={sortedAlumni.length}
          totalAlumniCount={alumniData.length}
        />

        {/* Alumni Grid / Results */}
        {alumniData.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title="No alumni available"
            description="The alumni directory is currently empty. Please check back soon as new alumni mentors join the network."
            className="py-16 bg-white"
          />
        ) : sortedAlumni.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedAlumni.map((alumnus) => (
              <AlumniCard
                key={alumnus.id}
                alumni={alumnus}
                isRequested={requestedAlumniIds.has(alumnus.id)}
                isAccepted={acceptedAlumniIds.has(alumnus.id)}
                onRequestMentorship={handleOpenMentorshipModal}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FilterX size={24} />}
            title="No alumni found matching your criteria"
            description="We couldn't find any alumni matching your active search query and filter combination. Try adjusting or clearing your filters to explore more profiles."
            actionLabel="Clear All Filters"
            onAction={handleResetFilters}
            className="py-16 bg-white"
          />
        )}
      </main>

      {/* Mentorship Request Modal */}
      <MentorshipRequestModal
        isOpen={Boolean(selectedAlumniForRequest)}
        alumni={selectedAlumniForRequest}
        studentName={student.name}
        studentCareerGoal={student.careerGoal || "Full-Stack Software Engineer"}
        onClose={() => setSelectedAlumniForRequest(null)}
        onSubmitRequest={handleSubmitMentorshipRequest}
        isAlreadyRequested={
          selectedAlumniForRequest
            ? requestedAlumniIds.has(selectedAlumniForRequest.id)
            : false
        }
      />

      {/* Shared Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/career-roadmap" className="hover:text-gray-900 transition-colors">
              Career Roadmap
            </Link>
            <Link href="/career-assistant" className="hover:text-gray-900 transition-colors">
              AI Career Assistant
            </Link>
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Platform Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
