"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import type { RoadmapStage, RoadmapStageStatus } from "@/types";

interface CareerRoadmapPreviewProps {
  stages: RoadmapStage[];
  targetCareer?: string;
  onStatusChange: (stageId: string, newStatus: RoadmapStageStatus) => void;
  onResetRoadmap?: () => void;
}

export function CareerRoadmapPreview({
  stages,
  targetCareer = "Full-Stack Software Engineer",
  onStatusChange,
  onResetRoadmap,
}: CareerRoadmapPreviewProps) {
  const completedStages = stages.filter((s) => s.status === "completed").length;
  const inProgressStage =
    stages.find((s) => s.status === "in_progress") ||
    stages.find((s) => s.status === "not_started") ||
    stages[0];
  const progressPercent = Math.round((completedStages / stages.length) * 100);

  // Pick up to 3 stages to display as milestones (e.g. completed, current, upcoming)
  const currentIdx = stages.findIndex((s) => s.id === inProgressStage?.id);
  const startIdx = Math.max(0, Math.min(currentIdx > 0 ? currentIdx - 1 : 0, stages.length - 3));
  const previewStages = stages.slice(startIdx, startIdx + 3);

  const getStatusBadge = (status: RoadmapStageStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EEF8F1] text-[#057642] border border-[#BFE3C9]">
            <CheckCircle2 size={12} className="text-[#057642]" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE]">
            <Clock size={12} className="text-[#1E40AF]" />
            In Progress
          </span>
        );
      case "not_started":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#F3F4F6] text-[#6B7280]">
            <Circle size={11} className="text-gray-400" />
            Planned
          </span>
        );
    }
  };

  const cycleStatus = (current: RoadmapStageStatus): RoadmapStageStatus => {
    if (current === "not_started") return "in_progress";
    if (current === "in_progress") return "completed";
    return "not_started";
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F3F4F6]">
        <div>
          <span className="text-[11px] font-semibold text-[#1E40AF] uppercase tracking-wider block">
            Career Roadmap
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#111827] mt-0.5 tracking-tight">
            {targetCareer}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {onResetRoadmap && (
            <button
              type="button"
              onClick={onResetRoadmap}
              className="inline-flex items-center gap-1 text-xs text-[#6B7280] hover:text-[#111827] transition-colors cursor-pointer"
              title="Reset stages to initial demo state"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <Link
            href="/career-roadmap"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1E40AF] hover:underline"
          >
            <span>View Full Roadmap</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Overall Progress Indicator */}
      <div className="py-4">
        <div className="flex items-center justify-between text-xs font-medium text-[#4B5563] mb-2">
          <span>Overall Progress ({completedStages} of {stages.length} stages)</span>
          <span className="font-bold text-[#111827]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#1E40AF] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Current Stage & Next Recommended Milestone */}
      {inProgressStage && (
        <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] mb-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#111827]">
                Current Stage: Stage {inProgressStage.stepNumber} — {inProgressStage.title}
              </span>
            </div>
            {getStatusBadge(inProgressStage.status)}
          </div>

          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-[#EDF2F7] text-xs text-[#4B5563]">
            <Sparkles size={13} className="text-[#1E40AF] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#111827]">Next Recommended Milestone: </span>
              <span>
                {inProgressStage.suggestedActivities?.[0] ||
                  inProgressStage.description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key Milestones Overview (Up to 3 milestones) */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider block">
          Key Milestones
        </span>
        <div className="divide-y divide-[#F3F4F6]">
          {previewStages.map((stage) => (
            <div
              key={stage.id}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="h-5 w-5 rounded-full bg-gray-100 text-[#4B5563] text-[11px] font-bold flex items-center justify-center shrink-0">
                  {stage.stepNumber}
                </span>
                <span className="font-medium text-[#111827] truncate">
                  {stage.title}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onStatusChange(stage.id, cycleStatus(stage.status))}
                className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                title="Click to cycle status"
              >
                {getStatusBadge(stage.status)}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
