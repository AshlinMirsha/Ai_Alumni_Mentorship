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
      icon: CheckCircle2,
      borderClass: "border-[#090909]",
      badgeClass: "bg-[#090909] text-white",
    },
    in_progress: {
      label: "In Progress",
      icon: Clock,
      borderClass: "border-[#090909] ring-1 ring-[#090909]",
      badgeClass: "bg-[#F4F4F4] text-[#090909] border border-[#090909]",
    },
    not_started: {
      label: "Planned",
      icon: CircleDashed,
      borderClass: "border-[#E7E7E7]",
      badgeClass: "bg-[#F4F4F4] text-[#737373] border border-[#E7E7E7]",
    },
  }[stage.status];

  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-2xl border transition-all duration-150 overflow-hidden shadow-xs bg-white ${statusConfig.borderClass}`}
    >
      {/* Header Bar */}
      <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          className="flex items-start gap-3.5 flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
              stage.status === "completed"
                ? "bg-[#090909] text-white"
                : stage.status === "in_progress"
                ? "bg-[#090909] text-white ring-2 ring-[#E7E7E7]"
                : "bg-[#F4F4F4] text-[#737373] border border-[#E7E7E7]"
            }`}
          >
            {stage.stepNumber}
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-[#090909] hover:text-[#454545] transition-colors">
                {stage.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusConfig.badgeClass}`}
              >
                <StatusIcon size={11} />
                {statusConfig.label}
              </span>
              {stage.estimatedWeeks && (
                <span className="text-[11px] text-[#737373] flex items-center gap-1">
                  <Calendar size={11} />
                  {stage.estimatedWeeks}
                </span>
              )}
            </div>
            <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
              {stage.description}
            </p>
          </div>
        </div>

        {/* Status Selector & Expand Button */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E7E7] justify-between sm:justify-end shrink-0">
          <div className="flex items-center gap-1 bg-[#F4F4F4] p-0.5 rounded-full border border-[#E7E7E7]">
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "not_started")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                stage.status === "not_started"
                  ? "bg-white text-[#090909] shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              Planned
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "in_progress")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                stage.status === "in_progress"
                  ? "bg-[#090909] text-white shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              In Progress
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(stage.id, "completed")}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                stage.status === "completed"
                  ? "bg-[#090909] text-white shadow-xs"
                  : "text-[#737373] hover:text-[#090909]"
              }`}
            >
              Completed
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-[#737373] hover:text-[#090909] hover:bg-[#F4F4F4] transition-colors"
            aria-label={isExpanded ? "Collapse stage details" : "Expand stage details"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Expanded Stage Details */}
      {isExpanded && (
        <div className="p-5 bg-[#FAFAFA] border-t border-[#E7E7E7] space-y-4">
          {/* Key Skills */}
          {stage.keySkills && stage.keySkills.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#090909]">
                <Code2 size={13} className="text-[#090909]" />
                <span>Relevant Technical Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {stage.keySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#242424] border border-[#E7E7E7]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Activities */}
          {stage.suggestedActivities && stage.suggestedActivities.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#090909]">
                <ListChecks size={13} className="text-[#090909]" />
                <span>Suggested Learning Activities</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {stage.suggestedActivities.map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-[#555555] leading-relaxed">
                    <span className="text-[#090909] font-bold">•</span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Milestone Project */}
          {stage.project && (
            <div className="p-4 bg-white rounded-xl border border-[#E7E7E7] shadow-xs space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#090909]">
                  <FolderGit2 size={14} className="text-[#090909]" />
                  <span>Capstone Project: {stage.project.title}</span>
                </div>
                <span className="text-[10px] font-semibold text-[#090909] bg-[#F4F4F4] border border-[#E7E7E7] px-2 py-0.5 rounded-full">
                  Portfolio Asset
                </span>
              </div>

              <p className="text-xs text-[#555555] leading-relaxed">
                {stage.project.description}
              </p>

              {stage.project.techStack && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {stage.project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-medium text-[#454545] bg-[#F4F4F4] border border-[#E7E7E7] px-2 py-0.5 rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
