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
    <div className="min-h-screen bg-[#f3f5f7] flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#191919] text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
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

      {/* SECTION 1: WELCOME HEADER */}
      <DashboardHeader
        studentName={student.name}
        department={student.department}
        academicYear={student.academicYear || "Second Year"}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────
              LEFT / MAIN DASHBOARD COLUMN (lg:col-span-8)
          ───────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8 space-y-6 lg:space-y-8">
            {/* Mobile-only Student Profile Card (on mobile, show profile at top) */}
            <div className="block lg:hidden">
              <StudentProfileCard
                student={student}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
              />
            </div>

            {/* SECTION 3: RECOMMENDED ALUMNI */}
            <section aria-labelledby="recommended-alumni-title" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-blue-600" />
                    <h2 id="recommended-alumni-title" className="text-base sm:text-lg font-bold text-gray-900">
                      Recommended Alumni
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Alumni professionals matched with your {student.department} background and {student.careerGoal || "Full-Stack Software Engineer"} aspirations
                  </p>
                </div>

                <Button variant="secondary" size="sm" asChild className="self-start sm:self-auto shrink-0 text-xs">
                  <Link href="/alumni" className="inline-flex items-center gap-1">
                    <span>View All Alumni</span>
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              </div>

              {/* Alumni Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedAlumniData.map((alumni) => (
                  <RecommendedMentorCard
                    key={alumni.id}
                    alumni={alumni}
                    onViewProfile={(selected) => setSelectedAlumniForDetail(selected)}
                  />
                ))}
              </div>

              {/* Illustrative demo score disclaimer note */}
              <div className="flex items-start gap-2 p-2.5 rounded-md bg-white border border-gray-200/80 text-[11px] text-gray-500">
                <Info size={13} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Displayed match scores are illustrative demo scores derived from shared technical skills, academic department, and target career goals.
                </span>
              </div>
            </section>

            {/* SECTION 5: CAREER ROADMAP PREVIEW */}
            <section aria-label="Career Roadmap Preview">
              <CareerRoadmapPreview
                stages={roadmapStages}
                onStatusChange={handleRoadmapStatusChange}
                onResetRoadmap={handleResetRoadmap}
              />
            </section>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              RIGHT CONTEXTUAL SIDEBAR (lg:col-span-4)
          ───────────────────────────────────────────────────────────── */}
          <aside className="lg:col-span-4 space-y-6 sticky top-20">
            {/* Desktop-only Student Profile Card */}
            <div className="hidden lg:block">
              {/* SECTION 2: STUDENT PROFILE SUMMARY */}
              <StudentProfileCard
                student={student}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
              />
            </div>

            {/* SECTION 4: CAREER OVERVIEW */}
            <CareerOverview
              targetRole={student.careerGoal || "Full-Stack Software Engineer"}
              currentSkills={student.skills.map((s) => (typeof s === "string" ? s : s.name))}
            />

            {/* SECTION 7: QUICK ACTIONS */}
            <QuickActions />

            {/* SECTION 8: RECENT ACTIVITY */}
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
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking & Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/alumni" className="hover:text-gray-900 transition-colors">
              Alumni Directory
            </Link>
            <Link href="/career-roadmap" className="hover:text-gray-900 transition-colors">
              Roadmaps
            </Link>
            <Link href="/career-assistant" className="hover:text-gray-900 transition-colors">
              AI Assistant
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
