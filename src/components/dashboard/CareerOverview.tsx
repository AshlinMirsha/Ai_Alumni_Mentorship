"use client";

import Link from "next/link";
import { Target, Compass, Sparkles, ArrowRight, Lightbulb, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { careerOverviewData } from "@/lib/mock-data";

interface CareerOverviewProps {
  targetRole?: string;
  currentSkills?: string[];
}

export function CareerOverview({
  targetRole = careerOverviewData.targetRole,
  currentSkills = careerOverviewData.currentSkills,
}: CareerOverviewProps) {
  const { suggestedSkills, recommendedNextStep } = careerOverviewData;

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-[12px] p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA] mb-3.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[6px] bg-[#F0F5FA] text-[#2166A5] flex items-center justify-center border border-[#D0E0EF]">
            <Compass size={14} />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#191919]">Career Focus</h2>
        </div>
        <span className="text-[11px] font-semibold text-[#2166A5] bg-[#F0F5FA] px-2 py-0.5 rounded border border-[#D0E0EF]">
          Active Trajectory
        </span>
      </div>

      <div className="space-y-3.5">
        {/* Current Target Role */}
        <div className="p-2.5 rounded-[8px] bg-[#F8FAFC] border border-[#E1E5EA]">
          <span className="text-[10px] font-semibold text-[#626262] uppercase tracking-wider block">
            Target Career Role
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-[#191919] mt-0.5 flex items-center gap-1.5">
            <Target size={13} className="text-[#2166A5]" />
            {targetRole}
          </h3>
        </div>

        {/* Current Skill Set */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-[#191919]">Verified Technical Skills</span>
            <span className="text-[11px] text-[#8C8C8C]">{currentSkills.length}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {currentSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-xs font-medium bg-[#F5F7FA] text-[#374151] border border-[#E1E5EA]"
              >
                <CheckCircle2 size={11} className="text-[#057642]" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Suggested Skills to Investigate */}
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="font-semibold text-[#191919] flex items-center gap-1">
              <Sparkles size={12} className="text-[#2166A5]" />
              Recommended Skills to Learn
            </span>
            <span className="text-[11px] text-[#8C8C8C]">Analysis</span>
          </div>

          <div className="space-y-1.5">
            {suggestedSkills.map((item) => (
              <div
                key={item.name}
                className="p-2 rounded-[6px] border border-[#E1E5EA] bg-white hover:border-[#C5C9CE] transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#191919]">{item.name}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                      item.priority === "high"
                        ? "bg-[#FFF8EA] text-[#915907] border-[#FDE5B2]"
                        : "bg-[#F3F4F6] text-[#626262] border-[#E5E7EB]"
                    }`}
                  >
                    {item.priority === "high" ? "High Priority" : "Suggested"}
                  </span>
                </div>
                <p className="text-[11px] text-[#626262] mt-0.5 leading-snug">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Next Step */}
        <div className="p-3 rounded-[8px] border border-[#E1E5EA] bg-[#F8FAFC]">
          <div className="flex items-start gap-2.5">
            <div className="h-6 w-6 rounded-[4px] bg-[#F0F5FA] text-[#2166A5] flex items-center justify-center shrink-0 mt-0.5 border border-[#D0E0EF]">
              <Lightbulb size={13} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#626262] block">
                Next Recommendation
              </span>
              <h4 className="text-xs font-bold text-[#191919] mt-0.5">
                {recommendedNextStep.title}
              </h4>
              <p className="text-xs text-[#4B5563] mt-0.5 leading-relaxed">
                {recommendedNextStep.description}
              </p>
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-[28px] text-[11px] font-medium px-2.5 rounded-[6px] text-[#2166A5] border-[#2166A5] hover:bg-[#F0F5FA]"
                >
                  <Link href={recommendedNextStep.href} className="inline-flex items-center gap-1">
                    <span>{recommendedNextStep.actionLabel}</span>
                    <ArrowRight size={11} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
