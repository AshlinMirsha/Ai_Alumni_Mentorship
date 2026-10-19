"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { CareerStatsStrip } from "@/components/dashboard/CareerStatsStrip";
import { RecommendedMentorCard } from "@/components/dashboard/RecommendedMentorCard";
import { CareerRoadmapPreview } from "@/components/dashboard/CareerRoadmapPreview";
import { StudentProfileCard } from "@/components/dashboard/StudentProfileCard";
import { CareerOverview } from "@/components/dashboard/CareerOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { EditProfileModal } from "@/components/dashboard/EditProfileModal";
import { AlumniDetailModal } from "@/components/dashboard/AlumniDetailModal";
import {
  recommendedAlumniData,
  currentStudent,
  initialRoadmapStages,
  initialMentorshipActivity,
  calculateProfileCompletion,
} from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  saveStudentProfile,
  resetStudentProfile,
  loadRoadmapStages,
  saveRoadmapStages,
  resetRoadmapStages,
  loadMentorshipActivity,
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
  const mentorshipActivity = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadMentorshipActivity,
    () => initialMentorshipActivity
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

  // Real statistics computation
  const profileCompletion = calculateProfileCompletion(student);
  const connectionsCount =
    (mentorshipActivity.acceptedMentorships?.length || 0) +
    (mentorshipActivity.pendingRequests?.length || 0);
  const completedStages = roadmapStages.filter((s) => s.status === "completed").length;
  const unreadMessagesCount = (mentorshipActivity.recentConversations || []).reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111827] text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle size={15} className="text-[#057642] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* A. TOP NAVIGATION */}
      <DashboardNav
        studentName={student.name}
        onOpenEditProfile={() => setIsEditProfileOpen(true)}
      />

      {/* CENTERED DASHBOARD CONTAINER (Max-width 1280px) */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 pb-16">
        {/* B. WELCOME HEADER */}
        <DashboardHeader
          studentName={student.name}
          department={student.department}
          academicYear={student.academicYear || "Second Year"}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
        />

        {/* C. CAREER OVERVIEW STRIP */}
        <CareerStatsStrip
          profilePercent={profileCompletion.percent}
          connectionsCount={connectionsCount}
          roadmapCompletedCount={completedStages}
          roadmapTotalCount={roadmapStages.length}
          unreadMessagesCount={unreadMessagesCount}
          onOpenEditProfile={() => setIsEditProfileOpen(true)}
        />

        {/* TWO-COLUMN GRID: Left ~68% / Right ~32%, aligned at top */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.9fr)] gap-8 items-start">
          {/* ─────────────────────────────────────────────────────────────
              D. MAIN CONTENT AREA (Left Column ~68%)
          ───────────────────────────────────────────────────────────── */}
          <div className="space-y-8 min-w-0">
            {/* 1. RECOMMENDED FOR YOU */}
            <section aria-labelledby="recommended-alumni-title" className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2
                    id="recommended-alumni-title"
                    className="text-lg sm:text-xl font-bold text-[#111827] tracking-tight"
                  >
                    Recommended for you
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#4B5563] mt-0.5">
                    Professionals whose experience aligns with your career interests.
                  </p>
                </div>

                <Link
                  href="/alumni"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E40AF] hover:underline shrink-0"
                >
                  <span>View all</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {/* Responsive layout with comfortable spacing (2 columns on tablet/desktop) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {recommendedAlumniData.map((alumni) => (
                  <RecommendedMentorCard
                    key={alumni.id}
                    alumni={alumni}
                    onViewProfile={(selected) => setSelectedAlumniForDetail(selected)}
                  />
                ))}
              </div>
            </section>

            {/* 2. COMPACT ROADMAP PREVIEW */}
            <section aria-label="Career Roadmap Overview">
              <CareerRoadmapPreview
                stages={roadmapStages}
                targetCareer={student.careerGoal || "Full-Stack Software Engineer"}
                onStatusChange={handleRoadmapStatusChange}
                onResetRoadmap={handleResetRoadmap}
              />
            </section>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              E. COMPACT SUPPORTING SIDEBAR (Right Column ~32%)
          ───────────────────────────────────────────────────────────── */}
          <aside className="space-y-6 min-w-0">
            {/* A. YOUR PROFILE */}
            <StudentProfileCard
              student={student}
              onOpenEditProfile={() => setIsEditProfileOpen(true)}
            />

            {/* B. NEXT CAREER STEP */}
            <CareerOverview
              targetRole={student.careerGoal || "Full-Stack Software Engineer"}
              currentSkills={student.skills.map((s) => (typeof s === "string" ? s : s.name))}
            />

            {/* C. QUICK ACCESS */}
            <QuickActions />
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
      <footer className="mt-auto border-t border-[#E5E7EB] bg-white py-6">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6B7280]">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/alumni" className="hover:text-[#111827] transition-colors">
              Alumni Directory
            </Link>
            <Link href="/career-roadmap" className="hover:text-[#111827] transition-colors">
              Roadmaps
            </Link>
            <Link href="/career-assistant" className="hover:text-[#111827] transition-colors">
              AI Assistant
            </Link>
            <Link href="/" className="hover:text-[#111827] transition-colors">
              Platform Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
