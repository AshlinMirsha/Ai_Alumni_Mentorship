"use client";

import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Info,
} from "lucide-react";
import type { Student } from "@/types";
import { getCurriculumTrack } from "@/lib/curriculum-tracks";

interface SkillGapListProps {
  student: Student;
  targetRole: string;
}

export function SkillGapList({ student, targetRole }: SkillGapListProps) {
  const track = getCurriculumTrack(targetRole);
  const benchmarkSkills = track.benchmarkSkills;
  const skillsToDevelop = track.skillsToDevelop;

  const studentSkillNames = new Set(
    (student.skills || []).map((s) => (typeof s === "string" ? s : s.name).toLowerCase())
  );

  const suggestedAssistantQuery = encodeURIComponent(
    `How can I bridge my skill gaps for ${targetRole} positions?`
  );

  return (
    <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E7E7]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#090909] shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-[#090909]">
              Skill-Gap Analysis for {targetRole}
            </h2>
          </div>
          <p className="text-xs text-[#737373] mt-0.5">
            Transparent comparison between your self-reported skills and collegiate industry benchmarks.
          </p>
        </div>

        <Link
          href={`/career-assistant?q=${suggestedAssistantQuery}`}
          className="text-xs font-semibold text-[#090909] bg-white hover:bg-[#F4F4F4] border border-[#090909] px-3.5 py-1.5 rounded-full transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto shadow-xs"
        >
          <Sparkles size={13} />
          Ask AI About Skill Gaps
        </Link>
      </div>

      {/* 3-Column Skills Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Current Profile Skills */}
        <div className="p-4 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#090909]">Your Current Skills</span>
            <span className="text-[10px] font-semibold text-[#090909] bg-white border border-[#E7E7E7] px-2 py-0.5 rounded-full">
              {student.skills.length} on profile
            </span>
          </div>

          <div className="space-y-2">
            {student.skills.map((skill) => (
              <div
                key={skill.id || skill.name}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E7E7E7] text-xs shadow-xs"
              >
                <span className="font-semibold text-[#090909]">{skill.name}</span>
                <span className="text-[10px] font-medium text-[#737373] capitalize bg-[#F4F4F4] px-2 py-0.5 rounded-full border border-[#E7E7E7]">
                  {skill.level || "intermediate"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Target Role Benchmark */}
        <div className="p-4 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#090909]">Target Role Benchmark</span>
            <span className="text-[10px] font-semibold text-[#090909] bg-white border border-[#E7E7E7] px-2 py-0.5 rounded-full">
              Tier-1 SWE Standard
            </span>
          </div>

          <div className="space-y-2">
            {benchmarkSkills.length > 0 ? (
              benchmarkSkills.map((bench, idx) => {
                const hasSkill = studentSkillNames.has(bench.name.toLowerCase().split(" ")[0]);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#E7E7E7] text-xs shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {hasSkill ? (
                        <CheckCircle2 size={13} className="text-[#090909] shrink-0" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#A8A8A8] shrink-0" />
                      )}
                      <span className="font-medium text-[#090909] truncate">{bench.name}</span>
                    </div>
                    <span className="text-[10px] text-[#737373] shrink-0">{bench.benchmarkLevel}</span>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-[#737373] bg-white rounded-lg border border-[#E7E7E7]">
                Benchmark criteria will populate upon roadmap generation or selecting a predefined track.
              </div>
            )}
          </div>
        </div>

        {/* 3. Recommended Development Priorities */}
        <div className="p-4 rounded-xl border border-[#E7E7E7] bg-white space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#090909]">Skills to Develop</span>
            <span className="text-[10px] font-semibold text-[#090909] bg-[#F4F4F4] border border-[#E7E7E7] px-2 py-0.5 rounded-full">
              Priority Focus
            </span>
          </div>

          <div className="space-y-2">
            {skillsToDevelop.length > 0 ? (
              skillsToDevelop.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E7E7E7] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#090909]">{gap.skill}</span>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        gap.priority === "high"
                          ? "bg-[#090909] text-white border-[#090909]"
                          : "bg-white text-[#454545] border-[#E7E7E7]"
                      }`}
                    >
                      {gap.priority}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555555] leading-snug">{gap.reason}</p>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-[#737373] bg-[#FAFAFA] rounded-lg border border-[#E7E7E7]">
                Skill priorities will appear once your roadmap path is generated.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actionable Next Steps & Resources */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#FAFAFA] border border-[#E7E7E7] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#090909]">
          <BookOpen size={15} className="text-[#090909]" />
          <span>Curated Learning Steps to Close Gaps</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {skillsToDevelop.length > 0 ? (
            skillsToDevelop.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-xl border border-[#E7E7E7] space-y-1.5 shadow-xs">
                <span className="font-bold text-[#090909]">{item.skill} Action:</span>
                <p className="text-[11px] text-[#555555] leading-relaxed">{item.suggestedNextStep}</p>
                <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-[#090909]">
                  {item.resources.map((res, rIdx) => (
                    <span key={rIdx} className="hover:underline cursor-pointer font-medium">
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="sm:col-span-2 p-3 text-center text-xs text-[#737373] bg-white rounded-xl border border-[#E7E7E7]">
              Generate your career path or ask AI Career Assistant to receive personalized learning actions.
            </div>
          )}
        </div>
      </div>

      {/* Honest Transparency Notice */}
      <div className="p-3.5 bg-white border border-[#E7E7E7] rounded-xl flex items-start gap-2.5 text-xs text-[#737373] shadow-xs">
        <Info size={16} className="text-[#090909] shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-[#090909]">Transparency Notice:</strong> Skill-gap comparisons are generated using transparent rule-based matching between your student profile and entry-level benchmark expectations for this role.
        </p>
      </div>
    </div>
  );
}
