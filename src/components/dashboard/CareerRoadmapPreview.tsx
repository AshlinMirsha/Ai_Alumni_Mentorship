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
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
            <CheckCircle2 size={11} className="text-[#057642]" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#fff8ea] text-[#915907] border border-[#fde5b2]">
            <Clock size={11} className="text-[#915907]" />
            In Progress
          </span>
        );
      case "not_started":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
            <Circle size={11} className="text-gray-400" />
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
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-2.5 mb-3 flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Map size={16} className="text-[#0a66c2]" />
          <div>
            <h2 className="text-sm font-bold text-gray-900">Career Roadmap Track</h2>
            <p className="text-xs text-gray-500">
              Interactive 4-stage path to Full-Stack Software Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onResetRoadmap && (
            <button
              type="button"
              onClick={onResetRoadmap}
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              title="Reset stages to initial demo state"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          )}
          <span className="text-xs font-semibold text-gray-700">
            {completedStages}/{stages.length} Completed ({progressPercent}%)
          </span>
        </div>
      </CardHeader>

      <CardBody className="space-y-3.5">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-[#0a66c2] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Timeline Stages List */}
        <div className="space-y-2.5">
          {stages.map((stage, index) => {
            const isCompleted = stage.status === "completed";
            const isInProgress = stage.status === "in_progress";

            return (
              <div
                key={stage.id}
                className="p-3 sm:p-3.5 rounded-md border border-gray-200 bg-white hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Step number badge */}
                    <div
                      className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCompleted
                          ? "bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]"
                          : isInProgress
                          ? "bg-[#fff8ea] text-[#915907] border border-[#fde5b2]"
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}
                    >
                      {stage.stepNumber ?? (stage as unknown as { order?: number }).order ?? index + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{stage.title}</h4>
                        <span className="text-[11px] text-gray-400">· {stage.estimatedWeeks || "4-6 weeks"}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                        {stage.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(stage.keySkills || []).map((skill: string) => (
                          <span
                            key={skill}
                            className="inline-block text-[11px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium border border-gray-200"
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
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {inProgressStages > 0 ? "Stage in progress — review recommended skills" : "All stages up to date"}
          </span>
          <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-[#0a66c2]">
            <Link href="/career-roadmap" className="inline-flex items-center gap-1">
              <span>Full Roadmap View</span>
              <ArrowRight size={12} />
            </Link>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
