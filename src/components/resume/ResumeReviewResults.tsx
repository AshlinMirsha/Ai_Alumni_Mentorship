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
      <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E7E7]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-[#737373] uppercase tracking-wider">
                Resume Audit Complete
              </span>
              <span className="text-[#E7E7E7]">·</span>
              <span className="text-xs font-normal text-[#737373]">
                Target Role: <strong className="text-[#090909]">{results.targetRole}</strong>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#090909] tracking-tight">
              Evaluation &amp; Enhancement Report
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Source file: <strong className="text-[#090909]">{results.fileName}</strong> ({results.fileSize})
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
              className="text-xs font-semibold text-white bg-[#090909] hover:bg-[#242424] px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <Sparkles size={13} />
              Ask AI About This Feedback
            </Link>
          </div>
        </div>

        {/* Demo Score Cards (Explicitly labeled as Illustrative Demo Scores) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E7E7E7] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#090909]">Role Alignment Score</span>
              <p className="text-[11px] text-[#737373]">Match against {results.targetRole} benchmarks</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#090909]">{results.overallScore}</span>
              <span className="text-xs text-[#737373]">/100</span>
              <span className="block text-[9px] font-semibold text-[#737373] uppercase">
                Demo Score*
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E7E7E7] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#090909]">Estimated ATS Parsability</span>
              <p className="text-[11px] text-[#737373]">Format structure &amp; keyword density</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#090909]">{results.atsScore}</span>
              <span className="text-xs text-[#737373]">/100</span>
              <span className="block text-[9px] font-semibold text-[#737373] uppercase">
                Demo Score*
              </span>
            </div>
          </div>
        </div>

        {/* 1. Overall Review Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
            1. Executive Review Summary
          </h3>
          <p className="text-xs text-[#090909] leading-relaxed bg-[#F4F4F4] p-4 rounded-xl border border-[#E7E7E7] font-normal">
            {results.summary}
          </p>
        </div>
      </div>

      {/* 2. Skills Identified */}
      <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-[#090909]" />
          <h3 className="text-sm font-bold text-[#090909]">2. Skills Identified from Resume</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E7E7E7] space-y-2">
            <span className="text-xs font-bold text-[#090909] block">Technical Proficiencies</span>
            <div className="flex flex-wrap gap-1.5">
              {results.skillsIdentified.technical.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#090909] border border-[#E7E7E7] shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E7E7E7] space-y-2">
            <span className="text-xs font-bold text-[#090909] block">Demonstrated Strengths</span>
            <div className="flex flex-wrap gap-1.5">
              {results.skillsIdentified.soft.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#090909] border border-[#E7E7E7] shadow-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F4F4F4] border border-[#E7E7E7] space-y-2">
            <span className="text-xs font-bold text-[#090909] block">Target Role Keywords to Add</span>
            <div className="flex flex-wrap gap-1.5">
              {results.skillsIdentified.missingForRole.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#090909] border border-[#090909] shadow-xs"
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
        <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-[#090909]" />
            <h3 className="text-sm font-bold text-[#090909]">3. Key Strengths</h3>
          </div>

          <ul className="space-y-2.5 text-xs text-[#090909]">
            {results.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 size={14} className="text-[#090909] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 4. Areas to Improve */}
        <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#090909]" />
            <h3 className="text-sm font-bold text-[#090909]">4. Areas to Improve</h3>
          </div>

          <div className="space-y-2.5">
            {results.areasToImprove.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#090909]">{item.title}</span>
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                      item.severity === "critical"
                        ? "bg-[#090909] text-white border-[#090909]"
                        : "bg-[#F4F4F4] text-[#737373] border-[#E7E7E7]"
                    }`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-[11px] text-[#737373] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Project-Description Suggestions (Before vs After) */}
      <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#090909]" />
            <h3 className="text-sm font-bold text-[#090909]">
              5. Project Bullet-Point Optimization (Google XYZ Formula)
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-[#090909] bg-[#F4F4F4] border border-[#E7E7E7] px-2.5 py-0.5 rounded-full">
            Before vs After
          </span>
        </div>

        <div className="space-y-3.5">
          {results.projectSuggestions.map((proj, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] space-y-2.5 text-xs"
            >
              <span className="font-bold text-[#090909] block">{proj.projectName}</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#F4F4F4] border border-[#E7E7E7] space-y-1">
                  <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block">
                    Original Bullet (Task-Oriented)
                  </span>
                  <p className="text-xs text-[#737373] italic leading-relaxed">
                    &quot;{proj.originalBullet}&quot;
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#090909] space-y-1">
                  <span className="text-[10px] font-bold text-[#090909] uppercase tracking-wider block">
                    Recommended Bullet (Quantified Impact)
                  </span>
                  <p className="text-xs text-[#090909] font-medium leading-relaxed">
                    &quot;{proj.suggestedBullet}&quot;
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-[#737373] pt-1">
                <strong className="text-[#090909]">Why this works better:</strong> {proj.reason}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Missing or Unclear Information */}
      <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-[#090909]" />
          <h3 className="text-sm font-bold text-[#090909]">6. Missing or Unclear Information</h3>
        </div>

        <ul className="space-y-2 text-xs text-[#737373]">
          {results.missingOrUnclearInfo.map((info, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-[#090909] font-bold">•</span>
              <span className="leading-relaxed">{info}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 7. Recommended Next Steps */}
      <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ListPlus size={16} className="text-[#090909]" />
          <h3 className="text-sm font-bold text-[#090909]">7. Recommended Next Steps</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.recommendedNextSteps.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] flex flex-col justify-between space-y-3 text-xs"
            >
              <div className="space-y-1.5">
                <span className="inline-flex h-6 w-6 rounded-full bg-[#090909] text-white font-bold items-center justify-center text-xs">
                  {step.step}
                </span>
                <h4 className="font-bold text-[#090909]">{step.title}</h4>
                <p className="text-[11px] text-[#737373] leading-relaxed">
                  {step.description}
                </p>
              </div>

              {step.actionLabel && step.actionHref && (
                <Link
                  href={step.actionHref}
                  className="pt-2 text-[11px] font-semibold text-[#090909] hover:underline inline-flex items-center gap-1"
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
      <div className="p-3.5 bg-white border border-[#E7E7E7] rounded-xl flex items-start gap-2 text-xs text-[#737373] shadow-xs">
        <Info size={14} className="shrink-0 text-[#090909] mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          * Scores and evaluations in demo mode are illustrative simulations modeled on industry hiring patterns. In production, this service connects to a verified enterprise resume evaluation pipeline.
        </span>
      </div>
    </div>
  );
}
