"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  ChevronDown,
  ChevronUp,
  FolderGit2,
  ListChecks,
  Code2,
  Calendar,
} from "lucide-react";
import type { RoadmapStage, RoadmapStageStatus } from "@/types";

interface RoadmapStageCardProps {
  stage: RoadmapStage;
  onStatusChange: (stageId: string, status: RoadmapStageStatus) => void;
  defaultExpanded?: boolean;
}

export function RoadmapStageCard({
  stage,
  onStatusChange,
  defaultExpanded = false,
}: RoadmapStageCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || stage.status === "in_progress");

  const statusConfig = {
    completed: {
      label: "Completed",
      variant: "green" as const,
      icon: CheckCircle2,
      dotClass: "bg-emerald-500",
      borderClass: "border-emerald-200 bg-emerald-50/20",
      badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    in_progress: {
      label: "In Progress",
      variant: "blue" as const,
      icon: Clock,
      dotClass: "bg-blue-500",
      borderClass: "border-blue-200 bg-blue-50/20",
      badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    },
    not_started: {
      label: "Not Started",
      variant: "gray" as const,
      icon: CircleDashed,
      dotClass: "bg-gray-400",
      borderClass: "border-gray-200 bg-white",
      badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    },
  }[stage.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-xl border transition-all duration-150 overflow-hidden shadow-2xs ${
        isExpanded ? "ring-1 ring-blue-500/10" : ""
      } ${statusConfig.borderClass}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-start gap-3.5 flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="h-9 w-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-800 shrink-0 mt-0.5">
            {stage.stepNumber}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors">
                {stage.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${statusConfig.badgeClass}`}
              >
                <StatusIcon size={11} />
                {statusConfig.label}
              </span>
              {stage.estimatedWeeks && (
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Calendar size={11} />
                  {stage.estimatedWeeks}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Status Selector & Expand Button */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-between sm:justify-end shrink-0">
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "not_started")}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                stage.status === "not_started"
                  ? "bg-white text-gray-800 shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Not Started
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "in_progress")}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                stage.status === "in_progress"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "completed")}
              className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                stage.status === "completed"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Completed
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? "Collapse stage details" : "Expand stage details"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Stage Details */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-gray-50/60 border-t border-gray-200 space-y-4 animate-in fade-in duration-150">
          {/* Key Skills */}
          {stage.keySkills && stage.keySkills.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <Code2 size={13} className="text-blue-600" />
                <span>Relevant Technical Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stage.keySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-white text-gray-700 border border-gray-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Learning Activities */}
          {stage.suggestedActivities && stage.suggestedActivities.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                <ListChecks size={13} className="text-blue-600" />
                <span>Suggested Learning Activities</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {stage.suggestedActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 leading-relaxed">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Milestone Project */}
          {stage.project && (
            <div className="p-3.5 bg-white rounded-xl border border-blue-100 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <FolderGit2 size={14} className="text-blue-600" />
                  <span>Stage Capstone Project: {stage.project.title}</span>
                </div>
                <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  Portfolio Asset
                </span>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed">
                {stage.project.description}
              </p>

              {stage.project.techStack && stage.project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {stage.project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-gray-600 bg-gray-50 border border-gray-200 px-1.5 py-0.2 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {stage.project.deliverables && (
                <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                  <strong className="text-gray-700">Deliverable:</strong> {stage.project.deliverables}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
