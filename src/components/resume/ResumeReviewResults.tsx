"use client";

import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  TrendingUp,
  Award,
  ArrowRight,
  Code2,
  ListPlus,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ResumeReviewResult } from "@/types";

interface ResumeReviewResultsProps {
  results: ResumeReviewResult;
  onReviewAgain: () => void;
}

export function ResumeReviewResults({
  results,
  onReviewAgain,
}: ResumeReviewResultsProps) {
  const assistantQuestion = encodeURIComponent(
    `I ran a resume review for a ${results.targetRole} role. My feedback highlighted: "${results.areasToImprove[0]?.title}". How can I best address this?`
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Banner & Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                Resume Audit Complete
              </span>
              <span className="text-gray-300">·</span>
              <span className="text-xs font-normal text-[#666666]">
                Target Role: <strong className="text-[#191919]">{results.targetRole}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#191919] tracking-tight">
              Evaluation &amp; Enhancement Report
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Source file: <strong className="text-[#191919]">{results.fileName}</strong> ({results.fileSize})
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onReviewAgain}
              className="text-xs inline-flex items-center gap-1.5 rounded-full"
            >
              <RotateCcw size={12} />
              Review Again
            </Button>

            <Link
              href={`/career-assistant?q=${assistantQuestion}`}
              className="text-xs font-semibold text-white bg-[#0a66c2] hover:bg-[#004182] px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles size={13} />
              Ask AI About This Feedback
            </Link>
          </div>
        </div>

        {/* Demo Score Cards (Explicitly labeled as Illustrative Demo Scores) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#191919]">Role Alignment Score</span>
              <p className="text-[11px] text-[#666666]">Match against {results.targetRole} benchmarks</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#0a66c2]">{results.overallScore}</span>
              <span className="text-xs text-[#8c8c8c]">/100</span>
              <span className="block text-[9px] font-semibold text-[#8c8c8c] uppercase">
                Demo Score*
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#191919]">Estimated ATS Parsability</span>
              <p className="text-[11px] text-[#666666]">Format structure &amp; keyword density</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#057642]">{results.atsScore}</span>
              <span className="text-xs text-[#8c8c8c]">/100</span>
              <span className="block text-[9px] font-semibold text-[#8c8c8c] uppercase">
                Demo Score*
              </span>
            </div>
          </div>
        </div>

        {/* 1. Overall Review Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#191919] uppercase tracking-wider">
            1. Executive Review Summary
          </h3>
          <p className="text-xs text-[#191919] leading-relaxed bg-[#ebf3fb]/40 p-4 rounded-lg border border-[#0a66c2]/20 font-normal">
            {results.summary}
          </p>
        </div>
      </div>

      {/* 2. Skills Identified */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-[#0a66c2]" />
          <h3 className="text-sm font-bold text-[#191919]">2. Skills Identified from Resume</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-[#191919] block">Technical Proficiencies</span>
            <div className="flex flex-wrap gap-1.5">
              {results.skillsIdentified.technical.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#191919] border border-gray-200 shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-gray-50 border border-gray-200 space-y-2">
            <span className="text-xs font-bold text-[#191919] block">Demonstrated Strengths</span>
            <div className="flex flex-wrap gap-1.5">
              {results.skillsIdentified.soft.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#191919] border border-gray-200 shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#fff8ea]/40 border border-[#915907]/20 space-y-2">
            <span className="text-xs font-bold text-[#915907] block">Target Role Keywords to Add</span>
            <div className="flex flex-wrap gap-1.5">
              {results.skillsIdentified.missingForRole.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#915907] border border-[#915907]/20 shadow-xs"
                >
                  + {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3 & 4. Strengths and Areas to Improve */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 3. Strengths */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#057642]" />
            <h3 className="text-sm font-bold text-[#191919]">3. Key Strengths</h3>
          </div>

          <ul className="space-y-2.5 text-xs text-[#191919]">
            {results.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-[#057642] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Areas to Improve */}
        <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#915907]" />
            <h3 className="text-sm font-bold text-[#191919]">4. Areas to Improve</h3>
          </div>

          <div className="space-y-2.5">
            {results.areasToImprove.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-gray-200 bg-gray-50/50 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#191919]">{item.title}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.2 rounded-full border ${
                      item.severity === "critical"
                        ? "bg-[#feeff0] text-[#cc1016] border-[#cc1016]/20"
                        : "bg-[#fff8ea] text-[#915907] border-[#915907]/20"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#666666] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Project-Description Suggestions (Before vs After) */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#0a66c2]" />
            <h3 className="text-sm font-bold text-[#191919]">
              5. Project Bullet-Point Optimization (Google XYZ Formula)
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-[#0a66c2] bg-[#ebf3fb] border border-[#0a66c2]/20 px-2 py-0.5 rounded-full">
            Before vs After
          </span>
        </div>

        <div className="space-y-3.5">
          {results.projectSuggestions.map((proj, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg border border-gray-200 bg-gray-50/40 space-y-2.5 text-xs"
            >
              <span className="font-bold text-[#191919] block">{proj.projectName}</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-md bg-[#feeff0]/40 border border-[#cc1016]/20 space-y-1">
                  <span className="text-[10px] font-bold text-[#cc1016] uppercase tracking-wider block">
                    Original Bullet (Task-Oriented)
                  </span>
                  <p className="text-xs text-[#666666] italic leading-relaxed">
                    &quot;{proj.originalBullet}&quot;
                  </p>
                </div>

                <div className="p-3 rounded-md bg-[#eef8f1] border border-[#057642]/20 space-y-1">
                  <span className="text-[10px] font-bold text-[#057642] uppercase tracking-wider block">
                    Recommended Bullet (Quantified Impact)
                  </span>
                  <p className="text-xs text-[#191919] font-medium leading-relaxed">
                    &quot;{proj.suggestedBullet}&quot;
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[#666666] pt-1">
                <strong className="text-[#191919]">Why this works better:</strong> {proj.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Missing or Unclear Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-[#0a66c2]" />
          <h3 className="text-sm font-bold text-[#191919]">6. Missing or Unclear Information</h3>
        </div>

        <ul className="space-y-2 text-xs text-[#666666]">
          {results.missingOrUnclearInfo.map((info, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#915907] font-bold">•</span>
              <span className="leading-relaxed">{info}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Recommended Next Steps */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ListPlus size={16} className="text-[#0a66c2]" />
          <h3 className="text-sm font-bold text-[#191919]">7. Recommended Next Steps</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.recommendedNextSteps.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-3 text-xs"
            >
              <div className="space-y-1.5">
                <span className="inline-flex h-6 w-6 rounded-md bg-[#0a66c2] text-white font-bold items-center justify-center text-xs">
                  {step.step}
                </span>
                <h4 className="font-bold text-[#191919]">{step.title}</h4>
                <p className="text-[11px] text-[#666666] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {step.actionLabel && step.actionHref && (
                <Link
                  href={step.actionHref}
                  className="pt-2 text-[11px] font-semibold text-[#0a66c2] hover:text-[#004182] inline-flex items-center gap-1"
                >
                  {step.actionLabel}
                  <ArrowRight size={11} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-3.5 bg-white border border-gray-200 rounded-lg flex items-start gap-2 text-xs text-[#666666] shadow-xs">
        <Info size={14} className="shrink-0 text-[#0a66c2] mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          * Scores and evaluations in demo mode are illustrative simulations modeled on industry hiring patterns. In production, this service will connect to a verified enterprise resume evaluation pipeline.
        </span>
      </div>
    </div>
  );
}
