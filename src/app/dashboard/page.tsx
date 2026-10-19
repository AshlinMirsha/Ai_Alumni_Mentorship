"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Users, ArrowRight, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StudentProfileCard } from "@/components/dashboard/StudentProfileCard";
import { RecommendedMentorCard } from "@/components/dashboard/RecommendedMentorCard";
import { CareerOverview } from "@/components/dashboard/CareerOverview";
import { CareerRoadmapPreview } from "@/components/dashboard/CareerRoadmapPreview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { EditProfileModal } from "@/components/dashboard/EditProfileModal";
import { AlumniDetailModal } from "@/components/dashboard/AlumniDetailModal";
import {
  recommendedAlumniData,
  currentStudent,
  initialRoadmapStages,
} from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  saveStudentProfile,
  resetStudentProfile,
  loadRoadmapStages,
  saveRoadmapStages,
  resetRoadmapStages,
} from "@/lib/dashboard-storage";
import type {
  Student,
  RoadmapStageStatus,
  RecommendedAlumni,
} from "@/types";

export default function DashboardPage() {
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );
  const roadmapStages = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadRoadmapStages,
    () => initialRoadmapStages
  );

  // Modal states
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedAlumniForDetail, setSelectedAlumniForDetail] = useState<RecommendedAlumni | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Profile update handler
  const handleSaveProfile = (updatedStudent: Student) => {
    saveStudentProfile(updatedStudent);
    showToast("Profile updated successfully. Completion score recalculated!");
  };

  const handleResetProfile = () => {
    resetStudentProfile();
    showToast("Profile reset to sample demo data.");
  };

  // Roadmap status change handler
  const handleRoadmapStatusChange = (stageId: string, newStatus: RoadmapStageStatus) => {
    const updated = roadmapStages.map((stage) =>
      stage.id === stageId ? { ...stage, status: newStatus } : stage
    );
    saveRoadmapStages(updated);
    showToast(`Roadmap stage status updated to "${newStatus.replace("_", " ")}" (saved locally).`);
  };

  const handleResetRoadmap = () => {
    resetRoadmapStages();
    showToast("Roadmap stages reset to initial demo track.");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#191919] text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle size={15} className="text-[#057642] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Application Navigation Shell */}
      <DashboardNav
        studentName={student.name}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* COMPACT DASHBOARD HEADER */}
      <DashboardHeader
        studentName={student.name}
        department={student.department}
        academicYear={student.academicYear || "Second Year"}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* MAIN TWO-COLUMN DASHBOARD LAYOUT (68% Left / 32% Right, aligned to max-w 1200px) */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.9fr)_minmax(300px,0.9fr)] gap-6 items-start">
          {/* ─────────────────────────────────────────────────────────────
              LEFT COLUMN (~68% width): PRIMARY DASHBOARD CONTENT
          ───────────────────────────────────────────────────────────── */}
          <div className="space-y-6 min-w-0">
            {/* Mobile-only Student Profile Card (at top on mobile viewports) */}
            <div className="block lg:hidden">
              <StudentProfileCard
                student={student}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
              />
            </div>

            {/* 1. RECOMMENDED ALUMNI */}
            <section aria-labelledby="recommended-alumni-title" className="space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-[4px] bg-[#F0F5FA] text-[#2166A5] flex items-center justify-center border border-[#D0E0EF]">
                      <Users size={14} />
                    </div>
                    <h2 id="recommended-alumni-title" className="text-base sm:text-lg font-bold text-[#191919] tracking-tight">
                      Recommended Alumni
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-[#626262] mt-0.5">
                    Alumni professionals matched with your {student.department} background and {student.careerGoal || "Full-Stack Software Engineer"} aspirations
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="self-start sm:self-auto shrink-0 text-xs h-[32px] px-3 font-medium bg-white hover:bg-[#F5F7FA] text-[#252525] border border-[#D5D9DE] shadow-none"
                >
                  <Link href="/alumni" className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <span>View All Alumni</span>
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              </div>

              {/* 3 Alumni Cards Grid (repeat(3, minmax(0, 1fr))) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendedAlumniData.map((alumni) => (
                  <RecommendedMentorCard
                    key={alumni.id}
                    alumni={alumni}
                    onViewProfile={(selected) => setSelectedAlumniForDetail(selected)}
                  />
                ))}
              </div>

              {/* Illustrative demo match score disclaimer note */}
              <div className="flex items-start gap-2 p-2.5 rounded-[6px] bg-white border border-[#E1E5EA] text-xs text-[#626262]">
                <Info size={14} className="text-[#2166A5] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#191919]">Note:</strong> Displayed match scores are illustrative demo scores derived from shared technical skills, academic department, and target career goals.
                </span>
              </div>
            </section>

            {/* 2. CAREER ROADMAP TRACK */}
            <section aria-label="Career Roadmap Track">
              <CareerRoadmapPreview
                stages={roadmapStages}
                onStatusChange={handleRoadmapStatusChange}
                onResetRoadmap={handleResetRoadmap}
              />
            </section>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT SIDEBAR (~32% width): CONTEXTUAL TOOLS & PROFILE
          ───────────────────────────────────────────────────────────── */}
          <aside className="space-y-6 min-w-0">
            {/* A. STUDENT PROFILE (Desktop only - mobile is at top) */}
            <div className="hidden lg:block">
              <StudentProfileCard
                student={student}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
              />
            </div>

            {/* B. CAREER FOCUS */}
            <CareerOverview
              targetRole={student.careerGoal || "Full-Stack Software Engineer"}
              currentSkills={student.skills.map((s) => (typeof s === "string" ? s : s.name))}
            />

            {/* C. CAREER TOOLS */}
            <QuickActions />

            {/* RECENT ACTIVITY (Compact audit log) */}
            <RecentActivity />
          </aside>
        </div>
      </main>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        student={student}
        onSave={handleSaveProfile}
        onReset={handleResetProfile}
      />

      {/* Alumni Detail Preview Modal */}
      <AlumniDetailModal
        isOpen={Boolean(selectedAlumniForDetail)}
        onClose={() => setSelectedAlumniForDetail(null)}
        alumni={selectedAlumniForDetail}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#E1E5EA] bg-white py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#626262]">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking & Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/alumni" className="hover:text-[#191919] transition-colors">
              Alumni Directory
            </Link>
            <Link href="/career-roadmap" className="hover:text-[#191919] transition-colors">
              Roadmaps
            </Link>
            <Link href="/career-assistant" className="hover:text-[#191919] transition-colors">
              AI Assistant
            </Link>
            <Link href="/" className="hover:text-[#191919] transition-colors">
              Platform Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
