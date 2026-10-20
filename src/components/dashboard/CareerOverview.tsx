"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { careerOverviewData } from "@/lib/mock-data";

interface CareerOverviewProps {
  targetRole?: string;
  currentSkills?: string[];
}

export function CareerOverview({
  targetRole = "Full-Stack Software Engineer",
}: CareerOverviewProps) {
  return (
    <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7] mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#090909]">Your Next Step</h3>
          <p className="text-[11px] text-[#737373] mt-0.5">{targetRole}</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#090909] bg-[#F4F4F4] px-2.5 py-0.5 rounded-full border border-[#E7E7E7]">
          Current Phase
        </span>
      </div>

      <div className="space-y-3.5">
        <div>
          <p className="text-xs font-bold text-[#090909]">
            TypeScript &amp; Production Architecture
          </p>
          <p className="text-[11px] text-[#555555] mt-1 leading-relaxed">
            Bridge academic algorithms into resilient serverless API design and distributed caching patterns.
          </p>
        </div>

        {/* Milestone Checklist */}
        <div className="space-y-2 pt-1 border-t border-[#E7E7E7]">
          <div className="flex items-center gap-2 text-xs text-[#090909]">
            <CheckCircle2 size={14} className="text-[#090909] shrink-0" />
            <span className="line-through text-[#737373]">Build 2 production full-stack projects</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#090909]">
            <Circle size={14} className="text-[#737373] shrink-0" />
            <span>Complete distributed caching module</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#090909]">
            <Circle size={14} className="text-[#737373] shrink-0" />
            <span>Mock system design interview with Marcus</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <Link
            href="/career-roadmap"
            className="w-full inline-flex items-center justify-center gap-2 h-9 px-4 rounded-full bg-[#090909] text-white text-xs font-semibold hover:bg-[#242424] transition-colors shadow-xs"
          >
            <span>View Career Roadmap</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
