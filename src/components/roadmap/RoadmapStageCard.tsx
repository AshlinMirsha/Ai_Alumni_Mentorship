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
      badgeClass: "bg-[#eef8f1] text-[#057642] border-[#057642]/20",
    },
    in_progress: {
      label: "In Progress",
      variant: "blue" as const,
      icon: Clock,
      dotClass: "bg-[#0a66c2]",
      borderClass: "border-[#0a66c2]/30 bg-[#ebf3fb]/20",
      badgeClass: "bg-[#ebf3fb] text-[#0a66c2] border-[#0a66c2]/20",
    },
    not_started: {
      label: "Not Started",
      variant: "gray" as const,
      icon: CircleDashed,
      dotClass: "bg-gray-400",
      borderClass: "border-gray-200 bg-white",
      badgeClass: "bg-gray-100 text-[#666666] border-gray-200",
    },
  }[stage.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-lg border transition-all duration-150 overflow-hidden shadow-xs ${
        isExpanded ? "ring-1 ring-[#0a66c2]/20" : ""
      } ${statusConfig.borderClass}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="flex items-start gap-3.5 flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="h-8 w-8 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-[#191919] shrink-0 mt-0.5">
            {stage.stepNumber}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#191919] hover:text-[#0a66c2] transition-colors">
                {stage.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.badgeClass}`}
              >
                <StatusIcon size={11} />
                {statusConfig.label}
              </span>
              {stage.estimatedWeeks && (
                <span className="text-[11px] text-[#666666] flex items-center gap-1">
                  <Calendar size={11} />
                  {stage.estimatedWeeks}
                </span>
              )}
            </div>
            <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Status Selector & Expand Button */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 justify-between sm:justify-end shrink-0">
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-full border border-gray-200">
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "not_started")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                stage.status === "not_started"
                  ? "bg-white text-[#191919] shadow-xs"
                  : "text-[#666666] hover:text-[#191919]"
              }`}
            >
              Not Started
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "in_progress")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                stage.status === "in_progress"
                  ? "bg-[#0a66c2] text-white shadow-xs"
                  : "text-[#666666] hover:text-[#191919]"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "completed")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                stage.status === "completed"
                  ? "bg-[#057642] text-white shadow-xs"
                  : "text-[#666666] hover:text-[#191919]"
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
        <div className="p-4 sm:p-5 bg-gray-50/70 border-t border-gray-200 space-y-4 animate-in fade-in duration-150">
          {/* Key Skills */}
          {stage.keySkills && stage.keySkills.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#191919]">
                <Code2 size={13} className="text-[#0a66c2]" />
                <span>Relevant Technical Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stage.keySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#191919] border border-gray-200 shadow-xs"
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
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#191919]">
                <ListChecks size={13} className="text-[#0a66c2]" />
                <span>Suggested Learning Activities</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {stage.suggestedActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#666666] leading-relaxed">
                    <span className="text-[#0a66c2] font-bold">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Milestone Project */}
          {stage.project && (
            <div className="p-3.5 bg-white rounded-lg border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#191919]">
                  <FolderGit2 size={14} className="text-[#0a66c2]" />
                  <span>Stage Capstone Project: {stage.project.title}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#0a66c2] bg-[#ebf3fb] border border-[#0a66c2]/20 px-2 py-0.5 rounded-full">
                  Portfolio Asset
                </span>
              </div>

              <p className="text-xs text-[#666666] leading-relaxed">
                {stage.project.description}
              </p>

              {stage.project.techStack && stage.project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {stage.project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-[#666666] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              {stage.project.deliverables && (
                <div className="pt-2 border-t border-gray-100 text-[11px] text-[#666666]">
                  <strong className="text-[#191919]">Deliverable:</strong> {stage.project.deliverables}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
