"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  SlidersHorizontal,
  Target,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { ResumeReviewResults } from "@/components/resume/ResumeReviewResults";
import { resumeReviewService } from "@/services/resume-review";
import { currentStudent } from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
} from "@/lib/dashboard-storage";
import type {
  ResumeReviewResult,
  ResumeAnalysisOptions,
} from "@/types";

interface SelectedFileInfo {
  file: File;
  name: string;
  size: number;
  formattedSize: string;
  type: string;
}

export default function ResumeReviewPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const [selectedFile, setSelectedFile] = useState<SelectedFileInfo | null>(null);
  const [targetRole, setTargetRole] = useState(student.careerGoal || "Full-Stack Software Engineer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ResumeReviewResult | null>(null);

  // Analysis options checkboxes
  const [options, setOptions] = useState<ResumeAnalysisOptions>({
    skillsAnalysis: true,
    projectDescriptionFeedback: true,
    structureReview: true,
    targetRoleAlignment: true,
  });

  const targetRoleOptions = [
    "Full-Stack Developer",
    "Backend Developer",
    "Software Engineer Intern",
    "AI Engineer",
    "Data Analyst",
  ];

  const handleStartReview = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const reviewResults = await resumeReviewService.analyzeResume(
        { name: selectedFile.name, size: selectedFile.size },
        targetRole,
        options
      );
      setResults(reviewResults);
    } catch (err) {
      console.error("Resume analysis failed", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReviewAgain = () => {
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex antialiased text-[#090909]">
      {/* App Sidebar (Desktop) */}
      <AppSidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
          <div className="relative w-64 h-full bg-white">
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title="Resume Review & Audit"
          subtitle="Recruiter Alignment & Automated ATS Benchmark Evaluation"
        />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Header Sub-bar */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#E7E7E7]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]">
                  <FileText size={13} />
                  Career Portfolio
                </span>
                <span className="text-[#E7E7E7]">·</span>
                <span className="text-xs font-normal text-[#737373]">
                  ATS &amp; Recruiter Audit
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#090909]">
                Resume Review
              </h1>
              <p className="text-sm text-[#737373] mt-0.5">
                Review your resume against your target career goals and identify opportunities to improve it.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/career-assistant?q=How%20can%20I%20improve%20my%20resume%20for%20software%20engineering%20roles%3F"
                className="text-xs font-medium text-[#090909] hover:bg-[#F4F4F4] bg-white border border-[#E7E7E7] px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles size={13} />
                Resume Writing Tips
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* CONDITIONAL CONTENT: RESULTS vs UPLOAD & CONFIGURATION                     */}
          {/* ========================================================================= */}
          {results ? (
            <ResumeReviewResults
              results={results}
              onReviewAgain={handleReviewAgain}
            />
          ) : (
            <div className="space-y-6">
              {/* 1. Upload Section */}
              <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
                  <h2 className="text-sm font-bold text-[#090909]">1. Select Resume Document</h2>
                  <span className="text-[11px] text-[#737373]">Local browser evaluation</span>
                </div>

                <ResumeUploader
                  selectedFile={selectedFile}
                  onFileSelect={(file) => setSelectedFile(file)}
                  onFileRemove={() => setSelectedFile(null)}
                  isAnalyzing={isAnalyzing}
                />
              </div>

              {/* 2. Target Role & Analysis Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Target Role Selector */}
                <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E7E7E7]">
                    <Target size={16} className="text-[#090909]" />
                    <h3 className="text-sm font-bold text-[#090909]">2. Target Position Role</h3>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="target-role-select" className="text-xs font-semibold text-[#090909]">
                      Match Against Benchmark Role
                    </label>
                    <select
                      id="target-role-select"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3.5 py-2.5 h-10 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                    >
                      {targetRoleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                      <option value="Custom Role">Custom Position</option>
                    </select>
                  </div>

                  {targetRole === "Custom Role" && (
                    <div className="space-y-1.5 pt-1">
                      <label htmlFor="custom-role-input" className="text-xs font-semibold text-[#090909]">
                        Specify Custom Title
                      </label>
                      <input
                        id="custom-role-input"
                        type="text"
                        placeholder="e.g. Site Reliability Engineer"
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="w-full rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3.5 py-2.5 h-10 focus:outline-none focus:border-[#090909] focus:ring-1 focus:ring-[#090909]"
                      />
                    </div>
                  )}

                  <p className="text-[11px] text-[#737373] leading-normal">
                    Our evaluation rules compare your resume against common industry expectations, keywords, and technical stacks for this target position.
                  </p>
                </div>

                {/* Analysis Options Controls */}
                <div className="bg-white rounded-2xl border border-[#E7E7E7] p-5 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#E7E7E7]">
                    <SlidersHorizontal size={16} className="text-[#090909]" />
                    <h3 className="text-sm font-bold text-[#090909]">3. Review Criteria</h3>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.skillsAnalysis}
                        onChange={(e) =>
                          setOptions({ ...options, skillsAnalysis: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[#E7E7E7] accent-[#090909] focus:ring-[#090909]"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-[#090909]">Skills Identification &amp; Gap Audit</span>
                        <p className="text-[11px] text-[#737373]">Identify tech stack keywords and missing role essentials.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.projectDescriptionFeedback}
                        onChange={(e) =>
                          setOptions({
                            ...options,
                            projectDescriptionFeedback: e.target.checked,
                          })
                        }
                        className="mt-0.5 rounded border-[#E7E7E7] accent-[#090909] focus:ring-[#090909]"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-[#090909]">Project Description Suggestions</span>
                        <p className="text-[11px] text-[#737373]">Transform task descriptions with Google&apos;s XYZ formula.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.structureReview}
                        onChange={(e) =>
                          setOptions({ ...options, structureReview: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[#E7E7E7] accent-[#090909] focus:ring-[#090909]"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-[#090909]">Resume Structure &amp; Formatting</span>
                        <p className="text-[11px] text-[#737373]">Scan date consistency, section clarity, and ATS readability.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={options.targetRoleAlignment}
                        onChange={(e) =>
                          setOptions({ ...options, targetRoleAlignment: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[#E7E7E7] accent-[#090909] focus:ring-[#090909]"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-[#090909]">Target Role Alignment</span>
                        <p className="text-[11px] text-[#737373]">Evaluate overall fit and keyword resonance for recruiters.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E7E7E7] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#737373]">
                  {selectedFile ? (
                    <span>
                      Ready to audit: <strong className="text-[#090909]">{selectedFile.name}</strong> for{" "}
                      <strong className="text-[#090909]">{targetRole}</strong>
                    </span>
                  ) : (
                    <span>Please choose a resume file above to enable review.</span>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="md"
                  disabled={!selectedFile || isAnalyzing}
                  onClick={handleStartReview}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2 rounded-full shadow-xs"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Analyzing Resume Metrics...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>Analyze My Resume</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
