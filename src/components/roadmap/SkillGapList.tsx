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

interface SkillGapListProps {
  student: Student;
  targetRole: string;
}

export function SkillGapList({ student, targetRole }: SkillGapListProps) {
  // Standard benchmark skills expected for the role
  const benchmarkSkills = [
    { name: "Python", category: "Backend Language", benchmarkLevel: "Advanced" },
    { name: "JavaScript / TypeScript", category: "Frontend Language", benchmarkLevel: "Advanced" },
    { name: "React", category: "Frontend Framework", benchmarkLevel: "Intermediate" },
    { name: "Django / FastAPI", category: "Backend Framework", benchmarkLevel: "Advanced" },
    { name: "PostgreSQL & SQL", category: "Relational Database", benchmarkLevel: "Advanced" },
    { name: "Docker & Containers", category: "DevOps & Cloud", benchmarkLevel: "Intermediate" },
    { name: "Redis Caching", category: "Performance & In-Memory", benchmarkLevel: "Intermediate" },
    { name: "CI/CD & Testing (pytest)", category: "Engineering Rigor", benchmarkLevel: "Intermediate" },
  ];

  // Map student's current skills
  const studentSkillNames = new Set(student.skills.map((s) => s.name.toLowerCase()));

  // Identified gaps
  const skillsToDevelop = [
    {
      skill: "TypeScript",
      priority: "high" as const,
      reason: "Standard industry expectation for type-safe React and full-stack codebases.",
      suggestedNextStep: "Refactor a core React feature with TypeScript interfaces and strict null checks.",
      resources: ["TypeScript Handbook (Official)", "Execute Program TypeScript Course"],
    },
    {
      skill: "Docker & Containerization",
      priority: "high" as const,
      reason: "Crucial for consistent local dev environments and microservices deployments.",
      suggestedNextStep: "Write a multi-stage Dockerfile for your Django app and spin up PostgreSQL via Docker Compose.",
      resources: ["Docker for Developers Guide", "Play with Docker Labs"],
    },
    {
      skill: "PostgreSQL Query Optimization",
      priority: "medium" as const,
      reason: "Moving beyond basic ORM queries to database indexing and EXPLAIN analysis.",
      suggestedNextStep: "Analyze query execution plans on a 10K-row dataset and benchmark B-tree indexes.",
      resources: ["Use The Index, Luke!", "PostgreSQL Official Documentation"],
    },
    {
      skill: "Redis Caching",
      priority: "medium" as const,
      reason: "In-memory caching is required to reduce relational DB pressure in production.",
      suggestedNextStep: "Implement cache-aside pattern on high-latency API responses in Django.",
      resources: ["Redis University (Free)", "Caching Strategies Overview"],
    },
  ];

  const suggestedAssistantQuery = encodeURIComponent(
    `How can I bridge my skill gaps in TypeScript, Docker, and advanced PostgreSQL for ${targetRole} positions?`
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-600 shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Skill-Gap Analysis for {targetRole}
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Rule-based comparison comparing your self-reported profile skills with typical industry benchmarks.
          </p>
        </div>

        <Link
          href={`/career-assistant?q=${suggestedAssistantQuery}`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
        >
          <Sparkles size={13} />
          Ask AI About My Skill Gaps
        </Link>
      </div>

      {/* 3-Column Skills Comparison Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Current Profile Skills */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">Your Current Skills</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
              {student.skills.length} on profile
            </span>
          </div>

          <div className="space-y-2">
            {student.skills.map((skill) => (
              <div
                key={skill.id || skill.name}
                className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 text-xs shadow-2xs"
              >
                <span className="font-semibold text-gray-800">{skill.name}</span>
                <span className="text-[10px] font-medium text-gray-500 capitalize bg-gray-100 px-1.5 py-0.5 rounded">
                  {skill.level || "intermediate"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Target Role Benchmark */}
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">Target Role Benchmark</span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              Industry Standard
            </span>
          </div>

          <div className="space-y-2">
            {benchmarkSkills.map((bench, idx) => {
              const hasSkill = studentSkillNames.has(bench.name.toLowerCase().split(" ")[0]);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {hasSkill ? (
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                    )}
                    <span className="font-medium text-gray-800 truncate">{bench.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{bench.benchmarkLevel}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Recommended Development Priorities */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">Skills to Develop</span>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              Priority Focus
            </span>
          </div>

          <div className="space-y-2">
            {skillsToDevelop.map((gap, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-white border border-blue-100 text-xs shadow-2xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{gap.skill}</span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      gap.priority === "high"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {gap.priority}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 leading-snug">{gap.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actionable Next Steps & Resources */}
      <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
          <BookOpen size={15} className="text-blue-600" />
          <span>Curated Learning Steps to Close Gaps</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {skillsToDevelop.map((item, idx) => (
            <div key={idx} className="p-3 bg-white rounded-lg border border-gray-200 space-y-1.5">
              <span className="font-bold text-gray-900">{item.skill} Action:</span>
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.suggestedNextStep}</p>
              <div className="pt-1 flex flex-wrap gap-2 text-[10px] text-blue-600">
                {item.resources.map((res, rIdx) => (
                  <span key={rIdx} className="underline cursor-pointer hover:text-blue-800">
                    {res}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Disclaimer Banner */}
      <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
        <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong>Transparency Notice:</strong> Skill-gap comparisons are generated using transparent rule-based matching between your student profile and entry-level benchmark expectations for this role. The platform does not claim to have objectively evaluated your technical proficiency via live testing.
        </p>
      </div>
    </div>
  );
}
