"use client";

import Link from "next/link";
import {
  Map,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { RoadmapStage, RoadmapStageStatus } from "@/types";

interface CareerRoadmapPreviewProps {
  stages: RoadmapStage[];
  onStatusChange: (stageId: string, newStatus: RoadmapStageStatus) => void;
  onResetRoadmap?: () => void;
}

export function CareerRoadmapPreview({
  stages,
  onStatusChange,
  onResetRoadmap,
}: CareerRoadmapPreviewProps) {
  const completedStages = stages.filter((s) => s.status === "completed").length;
  const inProgressStages = stages.filter((s) => s.status === "in_progress").length;
  const progressPercent = Math.round((completedStages / stages.length) * 100);

  const getStatusBadge = (status: RoadmapStageStatus) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#EEF8F1] text-[#057642] border border-[#BFE3C9]">
            <CheckCircle2 size={12} className="text-[#057642]" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#FFF8EA] text-[#915907] border border-[#FDE5B2]">
            <Clock size={12} className="text-[#915907]" />
            In Progress
          </span>
        );
      case "not_started":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-medium bg-[#F3F4F6] text-[#626262] border border-[#E1E5EA]">
            <Circle size={12} className="text-gray-400" />
            Not Started
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
    <div className="bg-white border border-[#E1E5EA] rounded-[12px] p-5 sm:p-6 shadow-2xs">
      {/* Header */}
      <div className="pb-3 border-b border-[#E1E5EA] mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-[6px] bg-[#F0F5FA] text-[#2166A5] flex items-center justify-center border border-[#D0E0EF] shrink-0">
            <Map size={16} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#191919] tracking-tight">
              Career Roadmap Track
            </h2>
            <p className="text-xs text-[#626262] mt-0.5">
              Interactive 4-stage path to Full-Stack Software Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {onResetRoadmap && (
            <button
              type="button"
              onClick={onResetRoadmap}
              className="inline-flex items-center gap-1 text-xs text-[#626262] hover:text-[#191919] px-2 py-1 rounded-[6px] hover:bg-[#F3F4F6] transition-colors cursor-pointer"
              title="Reset stages to initial demo state"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
          <span className="text-xs font-semibold text-[#191919] bg-[#F5F7FA] px-2.5 py-1 rounded-[6px] border border-[#E1E5EA]">
            {completedStages}/{stages.length} Completed ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E5E7EB] rounded-full h-1.5 overflow-hidden mb-4">
        <div
          className="h-full bg-[#2166A5] rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Compact Roadmap Stages List */}
      <div className="space-y-2.5">
        {stages.map((stage, index) => {
          const isCompleted = stage.status === "completed";
          const isInProgress = stage.status === "in_progress";

          return (
            <div
              key={stage.id}
              className="p-3 sm:py-3.5 sm:px-4 rounded-[8px] border border-[#E1E5EA] bg-white hover:border-[#C5C9CE] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Step number badge */}
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                      isCompleted
                        ? "bg-[#EEF8F1] text-[#057642] border border-[#BFE3C9]"
                        : isInProgress
                        ? "bg-[#FFF8EA] text-[#915907] border border-[#FDE5B2]"
                        : "bg-[#F3F4F6] text-[#626262] border border-[#E1E5EA]"
                    }`}
                  >
                    {stage.stepNumber ?? (stage as unknown as { order?: number }).order ?? index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-[#191919]">{stage.title}</h4>
                      <span className="text-xs text-[#626262]">· {stage.estimatedWeeks || "4-6 weeks"}</span>
                    </div>
                    <p className="text-xs text-[#4B5563] mt-0.5 leading-relaxed">
                      {stage.description}
                    </p>

                    {/* Skills Tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(stage.keySkills || []).map((skill: string) => (
                        <span
                          key={skill}
                          className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#F5F7FA] text-[#374151] border border-[#E1E5EA]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Status Toggle Button */}
                <div className="shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => onStatusChange(stage.id, cycleStatus(stage.status))}
                    className="cursor-pointer transition-transform hover:scale-105 active:scale-95"
                    title="Click to advance status"
                  >
                    {getStatusBadge(stage.status)}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View Full Roadmap Link */}
      <div className="pt-3.5 border-t border-[#E1E5EA] mt-4 flex items-center justify-between text-xs">
        <span className="text-[#626262]">
          {inProgressStages > 0 ? "Stage in progress — review recommended skills" : "All stages up to date"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-xs font-semibold text-[#2166A5] hover:text-[#194F82] p-0 h-auto"
        >
          <Link href="/career-roadmap" className="inline-flex items-center gap-1.5">
            <span>View Full Roadmap</span>
            <ArrowRight size={13} />
          </Link>
        </Button>
      </div>
    </div>
  );
}
