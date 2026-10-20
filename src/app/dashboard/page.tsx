"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Modals & Toast
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedAlumniForDetail, setSelectedAlumniForDetail] = useState<RecommendedAlumni | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProfile = (updatedStudent: Student) => {
    saveStudentProfile(updatedStudent);
    showToast("Profile updated successfully. Completion score recalculated!");
  };

  const handleResetProfile = () => {
    resetStudentProfile();
    showToast("Profile reset to sample demo data.");
  };

  const handleRoadmapStatusChange = (stageId: string, newStatus: RoadmapStageStatus) => {
    const updated = roadmapStages.map((stage) =>
      stage.id === stageId ? { ...stage, status: newStatus } : stage
    );
    saveRoadmapStages(updated);
    showToast(`Roadmap stage status updated to "${newStatus.replace("_", " ")}".`);
  };

  const handleResetRoadmap = () => {
    resetRoadmapStages();
    showToast("Roadmap stages reset to initial demo track.");
  };

  const profileCompletion = calculateProfileCompletion(student);
  const connectionsCount =
    (mentorshipActivity.acceptedMentorships?.length || 0) +
    (mentorshipActivity.pendingRequests?.length || 0) || 7;
  const completedStages = roadmapStages.filter((s) => s.status === "completed").length || 2;
  const unreadMessagesCount = 1;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex antialiased text-[#090909]">
      {/* App Sidebar (Desktop) */}
      <AppSidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
          <div className="relative w-64 h-full bg-white">
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title={`Good morning, ${student.name || "Mirsha"} 👋`}
          subtitle={`${student.department} · ${student.academicYear || "Second Year"} · Fall 2026 Semester`}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#090909] text-white text-xs shadow-lg border border-[#242424] animate-in fade-in duration-150"
          >
            <CheckCircle2 size={14} className="text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16">
          {/* 4 Stat Cards Row (Matching Reference 2) */}
          <CareerStatsStrip
            profilePercent={profileCompletion.percent || 100}
            connectionsCount={connectionsCount}
            roadmapCompletedCount={completedStages}
            roadmapTotalCount={roadmapStages.length || 7}
            unreadMessagesCount={unreadMessagesCount}
            onOpenEditProfile={() => setIsEditProfileOpen(true)}
          />

          {/* Two-Column Grid: Left (Wider) / Right (Sidebar) */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.9fr)_minmax(320px,0.9fr)] gap-8 items-start">
            {/* Left Column */}
            <div className="space-y-8 min-w-0">
              {/* Recommended Alumni For You */}
              <section aria-labelledby="recommended-alumni-title" className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2
                      id="recommended-alumni-title"
                      className="text-lg sm:text-xl font-bold text-[#090909] tracking-tight"
                    >
                      Recommended Alumni for You
                    </h2>
                    <p className="text-xs text-[#737373] mt-0.5">
                      Based on your goal: <strong className="text-[#090909]">{student.careerGoal || "Full-Stack Software Engineer"}</strong>
                    </p>
                  </div>

                  <Link
                    href="/alumni"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#090909] hover:underline shrink-0"
                  >
                    <span>View all</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {recommendedAlumniData.slice(0, 2).map((alumni) => (
                    <RecommendedMentorCard
                      key={alumni.id}
                      alumni={alumni}
                      onViewProfile={(selected) => setSelectedAlumniForDetail(selected)}
                    />
                  ))}
                </div>
              </section>

              {/* Career Roadmap Preview */}
              <section aria-label="Career Roadmap Overview">
                <CareerRoadmapPreview
                  stages={roadmapStages}
                  targetCareer={student.careerGoal || "Full-Stack Software Engineer"}
                  onStatusChange={handleRoadmapStatusChange}
                  onResetRoadmap={handleResetRoadmap}
                />
              </section>
            </div>

            {/* Right Column */}
            <aside className="space-y-6 min-w-0">
              {/* Your Profile Card */}
              <StudentProfileCard
                student={student}
                onOpenEditProfile={() => setIsEditProfileOpen(true)}
              />

              {/* Your Next Step Card */}
              <CareerOverview
                targetRole={student.careerGoal || "Full-Stack Software Engineer"}
                currentSkills={student.skills.map((s) => (typeof s === "string" ? s : s.name))}
              />

              {/* Quick Access Grid */}
              <QuickActions />
            </aside>
          </div>
        </main>
      </div>

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
    </div>
  );
}
