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
import { DashboardNav } from "@/components/dashboard/DashboardNav";
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
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      <DashboardNav studentName={student.name} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                <FileText size={13} />
                Career Portfolio
              </span>
              <span className="text-xs text-gray-400">·</span>
              <span className="text-xs font-medium text-gray-500">
                ATS &amp; Recruiter Audit
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              Resume Review
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Review your resume against your career goals and identify opportunities to improve it.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/career-assistant?q=How%20can%20I%20improve%20my%20resume%20for%20software%20engineering%20roles%3F"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
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
            <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900">1. Select Resume Document</h2>
                <span className="text-[11px] text-gray-400">Local evaluation mode</span>
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
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <Target size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">2. Target Position Role</h3>
                </div>

                <div className="space-y-2">
                  <label htmlFor="target-role-select" className="text-xs font-semibold text-gray-700">
                    Match Against Benchmark Role
                  </label>
                  <select
                    id="target-role-select"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white text-xs text-gray-900 px-3 py-2.5 h-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label htmlFor="custom-role-input" className="text-xs font-semibold text-gray-700">
                      Specify Custom Title
                    </label>
                    <input
                      id="custom-role-input"
                      type="text"
                      placeholder="e.g. Site Reliability Engineer"
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white text-xs text-gray-900 px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <p className="text-[11px] text-gray-400 leading-normal">
                  Our evaluation rules compare your resume against common industry expectations, keywords, and technical stacks for this target position.
                </p>
              </div>

              {/* Analysis Options Controls */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                  <SlidersHorizontal size={16} className="text-blue-600" />
                  <h3 className="text-sm font-bold text-gray-900">3. Review Criteria</h3>
                </div>

                <div className="space-y-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.skillsAnalysis}
                      onChange={(e) =>
                        setOptions({ ...options, skillsAnalysis: e.target.checked })
                      }
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800">Skills Identification &amp; Gap Audit</span>
                      <p className="text-[11px] text-gray-400">Identify tech stack keywords and missing role essentials.</p>
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
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800">Project Description Suggestions</span>
                      <p className="text-[11px] text-gray-400">Transform task descriptions with Google&apos;s XYZ formula.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.structureReview}
                      onChange={(e) =>
                        setOptions({ ...options, structureReview: e.target.checked })
                      }
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800">Resume Structure &amp; Formatting</span>
                      <p className="text-[11px] text-gray-400">Scan date consistency, section clarity, and ATS readability.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={options.targetRoleAlignment}
                      onChange={(e) =>
                        setOptions({ ...options, targetRoleAlignment: e.target.checked })
                      }
                      className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-gray-800">Target Role Alignment</span>
                      <p className="text-[11px] text-gray-400">Evaluate overall fit and keyword resonance for recruiters.</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-gray-500">
                {selectedFile ? (
                  <span>
                    Ready to audit: <strong>{selectedFile.name}</strong> for{" "}
                    <strong>{targetRole}</strong>
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
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2 shadow-2xs"
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

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/career-assistant" className="hover:text-gray-900 transition-colors">
              AI Career Assistant
            </Link>
            <Link href="/career-roadmap" className="hover:text-gray-900 transition-colors">
              Career Roadmap
            </Link>
            <Link href="/alumni" className="hover:text-gray-900 transition-colors">
              Alumni Directory
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
