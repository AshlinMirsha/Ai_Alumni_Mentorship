"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { careerOverviewData } from "@/lib/mock-data";

interface CareerOverviewProps {
  targetRole?: string;
  currentSkills?: string[];
}

export function CareerOverview({
  targetRole,
  currentSkills = [],
}: CareerOverviewProps) {
  const isFresh = !targetRole || currentSkills.length === 0;
  const displayRole = targetRole || "Career Exploration";

  const freshSteps = [
    { title: "Complete your profile skills & interests", completed: false },
    { title: "Explore recommended career roadmaps", completed: false },
    { title: "Connect with verified university alumni", completed: false },
  ];

  const standardSteps = [
    { title: `Master fundamentals in ${currentSkills[0] || "core technical stack"}`, completed: true },
    { title: "Build 2 production portfolio projects", completed: false },
    { title: "Schedule an introductory alumni mentorship session", completed: false },
  ];

  const steps = isFresh ? freshSteps : standardSteps;

  return (
    <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7] mb-3">
        <div>
          <h3 className="text-sm font-bold text-[#090909]">Your Next Step</h3>
          <p className="text-[11px] text-[#737373] mt-0.5">{displayRole}</p>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#090909] bg-[#F4F4F4] px-2.5 py-0.5 rounded-full border border-[#E7E7E7]">
          {isFresh ? "Onboarding" : "Current Phase"}
        </span>
      </div>

      <div className="space-y-3.5">
        <div>
          <p className="text-xs font-bold text-[#090909]">
            {isFresh
              ? "Profile Setup & Academic Orientation"
              : `${displayRole} Foundation`}
          </p>
          <p className="text-[11px] text-[#555555] mt-1 leading-relaxed">
            {isFresh
              ? "Complete your collegiate profile and goals to unlock tailored mentor matching and structured career milestones."
              : "Develop hands-on technical competencies, build production-grade projects, and get feedback from alumni mentors."}
          </p>
        </div>

        {/* Milestone Checklist */}
        <div className="space-y-2 pt-1 border-t border-[#E7E7E7]">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-[#090909]">
              {step.completed ? (
                <>
                  <CheckCircle2 size={14} className="text-[#090909] shrink-0" />
                  <span className="line-through text-[#737373]">{step.title}</span>
                </>
              ) : (
                <>
                  <Circle size={14} className="text-[#737373] shrink-0" />
                  <span>{step.title}</span>
                </>
              )}
            </div>
          ))}
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
