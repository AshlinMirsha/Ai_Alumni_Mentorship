"use client";

import Link from "next/link";
import {
  Map,
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  RotateCcw,
  Sparkles,
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Completed
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            In Progress
          </span>
        );
      case "not_started":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
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
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-3 mb-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Map size={16} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-gray-900">Career Roadmap Preview</h2>
            <p className="text-xs text-gray-500">
              Interactive 4-stage track to Full-Stack Software Engineering
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onResetRoadmap && (
            <button
              type="button"
              onClick={onResetRoadmap}
              className="inline-flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              title="Reset stages to initial demo state"
            >
              <RotateCcw size={11} />
              Reset
            </button>
          )}
          <span className="text-xs font-semibold text-gray-700">
            {completedStages} of {stages.length} Completed ({progressPercent}%)
          </span>
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Demo status instruction callout */}
        <div className="p-2.5 rounded bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-600 shrink-0" />
            <span>
              <strong>Demo Mode:</strong> You can click any stage status badge or use the selector to toggle your progress. Changes persist locally.
            </span>
          </div>
        </div>

        {/* Timeline Stages List */}
        <div className="space-y-3 relative">
          {stages.map((stage) => {
            const isCompleted = stage.status === "completed";
            const isInProgress = stage.status === "in_progress";

            return (
              <div
                key={stage.id}
                className={`p-3.5 sm:p-4 rounded-lg border transition-all ${
                  isCompleted
                    ? "bg-white border-emerald-200/80 shadow-2xs"
                    : isInProgress
                    ? "bg-amber-50/30 border-amber-200 shadow-2xs"
                    : "bg-gray-50/60 border-gray-200/70"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                  <div className="flex items-start gap-3">
                    {/* Step number badge */}
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCompleted
                          ? "bg-emerald-600 text-white"
                          : isInProgress
                          ? "bg-amber-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={15} /> : stage.stepNumber}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-gray-900">{stage.title}</h3>
                        {stage.estimatedWeeks && (
                          <span className="text-[11px] text-gray-400 font-mono">
                            {stage.estimatedWeeks}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                        {stage.description}
                      </p>

                      {/* Key skills pills */}
                      {stage.keySkills && stage.keySkills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {stage.keySkills.map((k) => (
                            <span
                              key={k}
                              className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-medium"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Interactive Status Selector */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => onStatusChange(stage.id, cycleStatus(stage.status))}
                      className="cursor-pointer hover:opacity-85 transition-opacity"
                      title="Click to cycle status (Demo)"
                    >
                      {getStatusBadge(stage.status)}
                    </button>

                    <select
                      value={stage.status}
                      onChange={(e) =>
                        onStatusChange(stage.id, e.target.value as RoadmapStageStatus)
                      }
                      className="text-[11px] text-gray-600 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      aria-label={`Change status for stage ${stage.stepNumber}`}
                    >
                      <option value="not_started">Not started</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Roadmap Action */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {inProgressStages > 0
              ? `${inProgressStages} milestone${inProgressStages > 1 ? "s" : ""} actively in progress`
              : "All stages up to date"}
          </span>
          <Button variant="primary" size="sm" asChild>
            <Link href="/career-roadmap" className="inline-flex items-center gap-1.5">
              <span>View Full Roadmap</span>
              <ArrowRight size={13} />
            </Link>
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
