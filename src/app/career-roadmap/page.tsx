"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Map,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Filter,
  Quote,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { RoadmapStageCard } from "@/components/roadmap/RoadmapStageCard";
import { SkillGapList } from "@/components/roadmap/SkillGapList";
import { EditRoleModal } from "@/components/roadmap/EditRoleModal";
import { Avatar } from "@/components/ui/Avatar";
import {
  currentStudent,
  initialRoadmapStages,
  alumniData,
} from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  saveStudentProfile,
  loadRoadmapStages,
  saveRoadmapStages,
  resetRoadmapStages,
} from "@/lib/dashboard-storage";
import type { RoadmapStageStatus, Student } from "@/types";

export default function CareerRoadmapPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );
  const stages = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadRoadmapStages,
    () => initialRoadmapStages
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = (stageId: string, newStatus: RoadmapStageStatus) => {
    const updated = stages.map((s) => (s.id === stageId ? { ...s, status: newStatus } : s));
    saveRoadmapStages(updated);
    showToast(`Milestone updated to "${newStatus.replace("_", " ")}".`);
  };

  const handleResetProgress = () => {
    resetRoadmapStages();
    setShowResetConfirm(false);
    showToast("Roadmap progress reset to initial demo track.");
  };

  const handleSaveRole = (newRole: string) => {
    const updatedStudent: Student = {
      ...student,
      careerGoal: newRole,
      careerGoals: [newRole, ...(student.careerGoals?.filter((g) => g !== newRole) || [])],
    };
    saveStudentProfile(updatedStudent);
    showToast(`Target role updated to "${newRole}".`);
  };

  const handleRegenerateRoadmap = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const reset = initialRoadmapStages.map((s, idx) => ({
        ...s,
        status: idx === 0 ? ("completed" as const) : idx === 1 ? ("in_progress" as const) : ("not_started" as const),
      }));
      saveRoadmapStages(reset);
      setIsRegenerating(false);
      showToast("Roadmap regenerated from tier-1 engineering curriculum.");
    }, 600);
  };

  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.status === "completed").length;
  const inProgressStages = stages.filter((s) => s.status === "in_progress").length;
  const completionPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 29;

  const filteredStages = useMemo(() => {
    if (statusFilter === "all") return stages;
    return stages.filter((s) => s.status === statusFilter);
  }, [stages, statusFilter]);

  const targetRole = student.careerGoal || "Full-Stack Software Engineer";

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
          title="Your Career Roadmap"
          subtitle={`Target: ${targetRole} · Mastered: ${completedStages} of ${totalStages} milestones`}
        />

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

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E7E7E7]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]">
                  <Map size={13} />
                  Curriculum Track
                </span>
                <span className="text-xs text-[#737373]">·</span>
                <span className="text-xs font-medium text-[#737373]">
                  {stages.length} Milestones
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#090909]">
                Career Roadmap: {targetRole}
              </h1>
              <p className="text-xs sm:text-sm text-[#555555] mt-1">
                A structured milestones path benchmarked against Tier-1 tech hiring bars.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsEditRoleOpen(true)}
                className="text-xs rounded-full h-8 px-3.5"
              >
                <Edit3 size={13} className="mr-1.5" />
                Change Role
              </Button>

              <Button
                variant="secondary"
                size="sm"
                disabled={isRegenerating}
                onClick={handleRegenerateRoadmap}
                className="text-xs rounded-full h-8 px-3.5"
              >
                <Sparkles size={13} className="mr-1.5" />
                {isRegenerating ? "Regenerating..." : "Regenerate Path"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-[#737373] hover:text-[#090909] rounded-full h-8 px-3"
              >
                <RotateCcw size={12} className="mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Two-Column Layout (Matching Reference 3 bottom half) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Milestones & Skill-Gap */}
            <div className="lg:col-span-8 space-y-8">
              {/* Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#090909]">
                  Milestone Progression
                </h2>

                <div className="flex items-center gap-1.5 text-xs">
                  <Filter size={13} className="text-[#737373]" />
                  <div className="flex items-center gap-1 bg-white border border-[#E7E7E7] p-0.5 rounded-full shadow-2xs">
                    {[
                      { id: "all", label: "All" },
                      { id: "not_started", label: "Planned" },
                      { id: "in_progress", label: "In Progress" },
                      { id: "completed", label: "Completed" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStatusFilter(tab.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          statusFilter === tab.id
                            ? "bg-[#090909] text-white shadow-xs"
                            : "text-[#737373] hover:text-[#090909]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Milestones Vertical Rail */}
              <div className="space-y-4">
                {filteredStages.map((stage) => (
                  <RoadmapStageCard
                    key={stage.id}
                    stage={stage}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>

              {/* Skill-Gap Analysis */}
              <SkillGapList student={student} targetRole={targetRole} />
            </div>

            {/* Right Column (4 cols): Side Cards (Matching Reference 3) */}
            <div className="lg:col-span-4 space-y-6">
              {/* 1. Current Progress Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                    Current Progress
                  </h3>
                  <span className="text-base font-extrabold text-[#090909]">
                    {completionPercentage}%
                  </span>
                </div>

                <div className="w-full bg-[#EBEBEB] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#090909] rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#737373]">
                  <span>
                    <strong className="text-[#090909]">{completedStages}</strong> of {totalStages} completed
                  </span>
                  <span>
                    <strong className="text-[#090909]">{inProgressStages}</strong> in progress
                  </span>
                </div>
              </div>

              {/* 2. Tip from Alumni Card (Matching Reference 3) */}
              <div className="bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Quote size={16} className="text-[#090909]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                    Tip from Alumni
                  </span>
                </div>

                <blockquote className="text-xs sm:text-[13px] text-[#454545] leading-relaxed italic">
                  &ldquo;Focus deeply on building one complex distributed project rather than 5 generic clones. Hiring managers look for understanding of edge cases, database indexing, and async failures.&rdquo;
                </blockquote>

                <div className="pt-2 border-t border-[#E7E7E7] flex items-center gap-3">
                  <Avatar name="Marcus Vance" size="sm" />
                  <div>
                    <p className="text-xs font-bold text-[#090909]">Marcus Vance</p>
                    <p className="text-[11px] text-[#737373]">Senior Infrastructure Engineer · Datadog</p>
                  </div>
                </div>
              </div>

              {/* 3. Recommended Mentors for this Role */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909] pb-2 border-b border-[#E7E7E7]">
                  Recommended Mentors
                </h3>
                <div className="space-y-3">
                  {alumniData.slice(0, 2).map((alumnus) => (
                    <div
                      key={alumnus.id}
                      className="p-3.5 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={alumnus.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#090909] truncate">{alumnus.name}</p>
                          <p className="text-[11px] text-[#737373] truncate">{alumnus.company}</p>
                        </div>
                      </div>
                      <Link
                        href={`/alumni/${alumnus.id}`}
                        className="text-xs font-semibold text-[#090909] hover:underline shrink-0"
                      >
                        Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Role Modal */}
      <EditRoleModal
        currentRole={targetRole}
        isOpen={isEditRoleOpen}
        onClose={() => setIsEditRoleOpen(false)}
        onSaveRole={handleSaveRole}
      />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-[#E7E7E7] max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#090909]">
              Reset Roadmap Progress?
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              This will restore all milestones to the default demo state. Any custom status toggles will be reset.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetProgress}
                className="rounded-full bg-[#090909] text-white"
              >
                Yes, Reset Progress
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
