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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { RoadmapStageCard } from "@/components/roadmap/RoadmapStageCard";
import { SkillGapList } from "@/components/roadmap/SkillGapList";
import { EditRoleModal } from "@/components/roadmap/EditRoleModal";
import {
  currentStudent,
  initialRoadmapStages,
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
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Status change handler
  const handleStatusChange = (stageId: string, newStatus: RoadmapStageStatus) => {
    const updated = stages.map((s) => (s.id === stageId ? { ...s, status: newStatus } : s));
    saveRoadmapStages(updated);
    showToast(`Stage status updated to "${newStatus.replace("_", " ")}" (saved locally).`);
  };

  // Reset roadmap handler
  const handleResetProgress = () => {
    resetRoadmapStages();
    setShowResetConfirm(false);
    showToast("Roadmap progress reset to initial demo track.");
  };

  // Save updated target role
  const handleSaveRole = (newRole: string) => {
    const updatedStudent: Student = {
      ...student,
      careerGoal: newRole,
      careerGoals: [newRole, ...(student.careerGoals?.filter((g) => g !== newRole) || [])],
    };
    saveStudentProfile(updatedStudent);
    showToast(`Target role updated to "${newRole}".`);
  };

  // Regenerate roadmap UI action (with clear integration disclaimer)
  const handleRegenerateRoadmap = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      // Re-initialize stages for role
      const reset = initialRoadmapStages.map((s, idx) => ({
        ...s,
        status: idx === 0 ? ("completed" as const) : idx === 1 ? ("in_progress" as const) : ("not_started" as const),
      }));
      saveRoadmapStages(reset);
      setIsRegenerating(false);
      showToast(
        "Roadmap regenerated from role curriculum template. (Backend AI generator will be connected in future releases)."
      );
    }, 700);
  };

  // Accurate overall completion percentage calculated from ACTUAL status of roadmap stages
  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.status === "completed").length;
  const inProgressStages = stages.filter((s) => s.status === "in_progress").length;
  const completionPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  // Filtered stages
  const filteredStages = useMemo(() => {
    if (statusFilter === "all") return stages;
    return stages.filter((s) => s.status === statusFilter);
  }, [stages, statusFilter]);

  const targetRole = student.careerGoal || "Full-Stack Software Engineer";
  const learningObjective =
    "Master cloud-native backend architecture, design robust REST APIs with PostgreSQL, and build deployable web services to meet junior-to-mid SWE hiring bars.";

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs shadow-lg border border-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <DashboardNav studentName={student.name} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <Map size={13} />
                Curriculum Track
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-medium text-gray-500">
                {stages.length} Milestones
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Your Career Roadmap
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              A structured plan based on your target role and current skills.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditRoleOpen(true)}
              className="text-xs inline-flex items-center gap-1.5"
            >
              <Edit3 size={13} />
              Edit Target Role
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isRegenerating}
              onClick={handleRegenerateRoadmap}
              className="text-xs inline-flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-blue-600" />
              {isRegenerating ? "Regenerating..." : "Regenerate Roadmap"}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-gray-500 hover:text-red-600 inline-flex items-center gap-1"
            >
              <RotateCcw size={12} />
              Reset Progress
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PROFILE CONTEXT CARD                                                      */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-2xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-5 border-b border-gray-100">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Current Target Career Track
              </span>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {targetRole}
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditRoleOpen(true)}
                  className="p-1 rounded text-gray-400 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                  title="Change Target Role"
                >
                  <Edit3 size={14} />
                </button>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl pt-1">
                <strong>Learning Objective:</strong> {learningObjective}
              </p>
            </div>

            {/* Overall Progress Gauge (Calculated strictly from actual stage status) */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 min-w-56 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-700">Roadmap Completion</span>
                <span className="text-blue-600 text-sm font-bold">{completionPercentage}%</span>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5">
                <span>
                  <strong>{completedStages}</strong> of {totalStages} completed
                </span>
                <span>
                  <strong>{inProgressStages}</strong> active
                </span>
              </div>
            </div>
          </div>

          {/* Current Skills Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-700">Your Current Skills:</span>
              {student.skills.map((skill) => (
                <span
                  key={skill.id || skill.name}
                  className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-800 rounded-md font-medium text-[11px]"
                >
                  {skill.name}
                </span>
              ))}
            </div>

            <Link
              href="/alumni"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 self-start sm:self-auto"
            >
              Find Mentors for this Role →
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ROADMAP STAGES SECTION                                                    */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Curriculum Milestones</h2>
              <p className="text-xs text-gray-500">
                Click any stage to expand activities, capstone projects, and recommended resources.
              </p>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
              <Filter size={13} className="text-gray-400" />
              <span className="text-gray-500 hidden sm:inline">Filter:</span>
              <div className="flex items-center gap-1 bg-white border border-gray-200 p-0.5 rounded-lg shadow-2xs">
                {[
                  { id: "all", label: "All" },
                  { id: "not_started", label: "Not Started" },
                  { id: "in_progress", label: "In Progress" },
                  { id: "completed", label: "Completed" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      statusFilter === tab.id
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stages List */}
          <div className="space-y-3.5">
            {filteredStages.map((stage) => (
              <RoadmapStageCard
                key={stage.id}
                stage={stage}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PART 3: SKILL-GAP ANALYSIS SECTION                                        */}
        {/* ========================================================================= */}
        <section aria-labelledby="skill-gap-analysis-title">
          <SkillGapList student={student} targetRole={targetRole} />
        </section>
      </main>

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
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-900">
              Reset Roadmap Progress?
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              This will restore all stages to the default demo state. Any custom status toggles will be reset.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetProgress}
                className="bg-red-600 hover:bg-red-700"
              >
                Yes, Reset Progress
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/career-assistant" className="hover:text-gray-900 transition-colors">
              AI Career Assistant
            </Link>
            <Link href="/resume-review" className="hover:text-gray-900 transition-colors">
              Resume Review
            </Link>
            <Link href="/alumni" className="hover:text-gray-900 transition-colors">
              Alumni Directory
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
