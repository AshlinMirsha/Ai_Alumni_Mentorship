"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { careerOverviewData } from "@/lib/mock-data";

interface CareerOverviewProps {
  targetRole?: string;
  currentSkills?: string[];
}

export function CareerOverview({
  targetRole = careerOverviewData.targetRole,
}: CareerOverviewProps) {
  // One recommended skill or learning action
  const topRecommendation =
    careerOverviewData.suggestedSkills[0] || {
      name: "Docker & Containerization",
      priority: "high",
      reason: "Standardize application environments and prepare for microservices deployment.",
    };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#F3F4F6] mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#111827]">Next Career Step</h3>
          <p className="text-[11px] text-[#6B7280] mt-0.5">{targetRole}</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#1E40AF] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
          Recommended
        </span>
      </div>

      <div className="space-y-3">
        {/* Recommended Skill or Action */}
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-sm font-bold text-[#111827] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#1E40AF]" />
              {topRecommendation.name}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                topRecommendation.priority === "high"
                  ? "bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]"
                  : "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {topRecommendation.priority === "high" ? "High Priority" : "Suggested"}
            </span>
          </div>

          <p className="text-xs text-[#4B5563] leading-relaxed mt-1.5">
            {topRecommendation.reason}
          </p>
        </div>

        {/* Link to relevant career roadmap section */}
        <div className="pt-2">
          <Link
            href="/career-roadmap"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1E40AF] hover:underline"
          >
            <span>View in Career Roadmap</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
