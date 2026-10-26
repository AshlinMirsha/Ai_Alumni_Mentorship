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
  if (stages.length === 0) {
    return (
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E7E7]">
          <div>
            <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
              Career Roadmap
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-[#090909] mt-0.5 tracking-tight">
              {targetCareer}
            </h2>
          </div>
          <Link
            href="/career-roadmap"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#090909] hover:underline"
          >
            <span>Roadmap Setup</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="py-6 text-center space-y-3">
          <p className="text-xs sm:text-sm text-[#737373]">
            No path found for <strong className="text-[#090909]">{targetCareer}</strong>. Click Generate to create your customized path.
          </p>
          <Link
            href="/career-roadmap"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#090909] text-white text-xs font-semibold hover:bg-[#242424] transition-colors"
          >
            <Sparkles size={13} />
            <span>Generate Path</span>
          </Link>
        </div>
      </div>
    );
  }

  const completedStages = stages.filter((s) => s.status === "completed").length;
  const inProgressStage =
    stages.find((s) => s.status === "in_progress") ||
    stages.find((s) => s.status === "not_started") ||
    stages[0];
  const progressPercent = Math.round((completedStages / stages.length) * 100);

  const currentIdx = stages.findIndex((s) => s.id === inProgressStage?.id);
  const startIdx = Math.max(0, Math.min(currentIdx > 0 ? currentIdx - 1 : 0, stages.length - 3));
  const previewStages = stages.slice(startIdx, startIdx + 3);

  const getStatusBadge = (status: RoadmapStageStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#090909] text-white">
            <CheckCircle2 size={12} className="text-white" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]">
            <Clock size={12} className="text-[#090909]" />
            In Progress
          </span>
        );
      case "not_started":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F4F4F4] text-[#737373]">
            <Circle size={11} className="text-[#737373]" />
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
    <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E7E7]">
        <div>
          <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider block">
            Career Roadmap
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#090909] mt-0.5 tracking-tight">
            {targetCareer}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {onResetRoadmap && (
            <button
              type="button"
              onClick={onResetRoadmap}
              className="inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#090909] transition-colors cursor-pointer"
              title="Reset stages to initial demo state"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}

          <Link
            href="/career-roadmap"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#090909] hover:underline"
          >
            <span>View Full Roadmap</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="py-4">
        <div className="flex items-center justify-between text-xs font-medium text-[#555555] mb-2">
          <span>Overall Progress ({completedStages} of {stages.length} milestones)</span>
          <span className="font-bold text-[#090909]">{progressPercent}%</span>
        </div>
        <div className="w-full bg-[#EBEBEB] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#090909] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* Current Stage */}
      {inProgressStage && (
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E7E7E7] mb-4">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-[#090909]">
              Current Milestone: Milestone {inProgressStage.stepNumber} — {inProgressStage.title}
            </span>
            {getStatusBadge(inProgressStage.status)}
          </div>

          <div className="flex items-start gap-2 mt-2 pt-2 border-t border-[#E7E7E7] text-xs text-[#555555]">
            <Sparkles size={13} className="text-[#090909] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#090909]">Next Action: </span>
              <span>
                {inProgressStage.suggestedActivities?.[0] ||
                  inProgressStage.description}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Key Milestones Overview */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider block">
          Key Milestones
        </span>
        <div className="divide-y divide-[#E7E7E7]">
          {previewStages.map((stage) => (
            <div
              key={stage.id}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-[#090909] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                  {stage.stepNumber}
                </span>
                <span className="font-semibold text-[#090909] truncate">
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
