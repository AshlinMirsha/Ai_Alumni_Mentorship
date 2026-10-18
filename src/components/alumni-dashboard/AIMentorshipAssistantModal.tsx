"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  BookOpen,
  Compass,
  Map,
  Users,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  Plus,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { aiMentorshipAssistantService } from "@/services/ai-mentorship-assistant";
import {
  addMentorshipMilestone,
  addMentorshipPrivateNote,
  loadStudentsList,
} from "@/lib/dashboard-storage";
import type {
  Mentorship,
  SessionPreparationResult,
  CareerGuidanceResult,
  LearningRoadmapResult,
  StudentMatchingResult,
  SessionSummaryResult,
} from "@/types";

type AssistantTab = "session_prep" | "career_guidance" | "roadmap" | "student_matching" | "summary";

interface AIMentorshipAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMentees?: Mentorship[];
  preselectedMentee?: Mentorship | null;
  initialTab?: AssistantTab;
  onInsertAgenda?: (agenda: string) => void;
}

export function AIMentorshipAssistantModal({
  isOpen,
  onClose,
  activeMentees = [],
  preselectedMentee,
  initialTab = "session_prep",
  onInsertAgenda,
}: AIMentorshipAssistantModalProps) {
  const [activeTab, setActiveTab] = useState<AssistantTab>(initialTab);
  const [selectedMenteeId, setSelectedMenteeId] = useState<string>(
    preselectedMentee?.id || activeMentees[0]?.id || ""
  );

  // Form inputs
  const [prepTopic, setPrepTopic] = useState("PostgreSQL Indexing & Query Tuning");
  const [guidanceRole, setGuidanceRole] = useState("Distributed Systems Engineer");
  const [guidanceLevel, setGuidanceLevel] = useState("Undergraduate Senior");
  const [roadmapSkills, setRoadmapSkills] = useState("Distributed Systems, Redis, Docker, CI/CD");
  const [rawNotes, setRawNotes] = useState(
    "Walked through database schema. Ashlin showed composite indexes for search queries. Needs more practice on connection pool timeouts and explain analyze. Set milestone for next week."
  );

  // Loading & results
  const [isLoading, setIsLoading] = useState(false);
  const [prepResult, setPrepResult] = useState<SessionPreparationResult | null>(null);
  const [guidanceResult, setGuidanceResult] = useState<CareerGuidanceResult | null>(null);
  const [roadmapResult, setRoadmapResult] = useState<LearningRoadmapResult | null>(null);
  const [matchingResult, setMatchingResult] = useState<StudentMatchingResult | null>(null);
  const [summaryResult, setSummaryResult] = useState<SessionSummaryResult | null>(null);

  // Editable review states
  const [editedAgenda, setEditedAgenda] = useState("");
  const [editedNotes, setEditedNotes] = useState("");

  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentMentee =
    activeMentees.find((m) => m.id === selectedMenteeId) || preselectedMentee || activeMentees[0];
  const menteeName = currentMentee?.student?.name || "Student";
  const menteeGoal = currentMentee?.student?.careerGoal || currentMentee?.focus || "Software Engineer";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Generation Handlers
  const handleGeneratePrep = async () => {
    setIsLoading(true);
    try {
      const res = await aiMentorshipAssistantService.generateSessionPreparation({
        menteeName,
        careerGoal: menteeGoal,
        topic: prepTopic,
      });
      setPrepResult(res);
      setEditedAgenda(res.draftAgenda);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateGuidance = async () => {
    setIsLoading(true);
    try {
      const res = await aiMentorshipAssistantService.generateCareerGuidance({
        targetRole: guidanceRole,
        academicLevel: guidanceLevel,
      });
      setGuidanceResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    setIsLoading(true);
    try {
      const skillsArray = roadmapSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await aiMentorshipAssistantService.generateLearningRoadmap({
        menteeName,
        targetRole: menteeGoal,
        skillsToDevelop: skillsArray,
      });
      setRoadmapResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMatching = async () => {
    setIsLoading(true);
    try {
      const allStudents = loadStudentsList();
      const res = await aiMentorshipAssistantService.generateStudentMatching({
        expertiseAreas: ["Distributed Systems", "Backend Architecture", "PostgreSQL", "Cloud DevOps"],
        availableStudents: allStudents,
      });
      setMatchingResult(res);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const res = await aiMentorshipAssistantService.generateSessionSummary({
        menteeName,
        topic: prepTopic,
        rawNotes,
      });
      setSummaryResult(res);
      setEditedNotes(res.formattedNotes);
    } finally {
      setIsLoading(false);
    }
  };

  // Action Save Handlers
  const handleApplyAgenda = () => {
    if (onInsertAgenda && editedAgenda) {
      onInsertAgenda(editedAgenda);
      showStatus("Draft agenda inserted into session preparation.");
      setTimeout(() => onClose(), 600);
    }
  };

  const handleSaveRoadmapMilestones = () => {
    if (!currentMentee || !roadmapResult) return;
    let addedCount = 0;
    roadmapResult.phases.forEach((phase) => {
      phase.milestones.forEach((m) => {
        addMentorshipMilestone(currentMentee.id, `${phase.weeks}: ${m.title}`);
        addedCount++;
      });
    });
    showStatus(`Added ${addedCount} roadmap milestones to ${menteeName}'s track!`);
  };

  const handleSaveSummaryNotes = () => {
    if (!currentMentee || !editedNotes) return;
    addMentorshipPrivateNote(currentMentee.id, editedNotes);
    showStatus(`Saved structured summary to ${menteeName}'s private notes.`);
  };

  const tabs = [
    { id: "session_prep" as AssistantTab, label: "Session Prep", icon: BookOpen },
    { id: "career_guidance" as AssistantTab, label: "Career Guidance", icon: Compass },
    { id: "roadmap" as AssistantTab, label: "Learning Roadmap", icon: Map },
    { id: "student_matching" as AssistantTab, label: "Student Matching", icon: Users },
    { id: "summary" as AssistantTab, label: "Session Summary", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col z-10 animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#ebf3fb] text-[#0a66c2] flex items-center justify-center shrink-0">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-gray-900">AI Mentorship Assistant</h2>
                <span className="text-[10px] font-semibold bg-emerald-50 text-[#057642] px-2 py-0.5 rounded-full border border-emerald-200">
                  Demo Service
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                Curriculum guidance, customized discussion prompts, and structured learning roadmaps.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 pt-3 bg-white border-b border-gray-100 flex items-center gap-1 overflow-x-auto shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-[#0a66c2] text-[#0a66c2]"
                    : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-200"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Status Toast */}
          {statusMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs text-[#057642] flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Demo Disclaimer Banner */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg flex items-start gap-2.5 text-xs text-gray-600">
            <Info size={15} className="text-[#0a66c2] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-semibold text-gray-900">Demo Environment:</span> AI responses are generated via local domain heuristics and role templates. No external third-party API keys are exposed. Recommendations serve as structured guidance and do not guarantee specific employment outcomes.
            </div>
          </div>

          {/* TAB 1: SESSION PREPARATION */}
          {activeTab === "session_prep" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeMentees.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Target Mentee
                    </label>
                    <select
                      value={selectedMenteeId}
                      onChange={(e) => setSelectedMenteeId(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    >
                      {activeMentees.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.student?.name || "Student"} — {m.focus}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={activeMentees.length > 0 ? "" : "sm:col-span-2"}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Session Topic
                  </label>
                  <input
                    type="text"
                    value={prepTopic}
                    onChange={(e) => setPrepTopic(e.target.value)}
                    placeholder="e.g. Distributed Caching & Redis Eviction"
                    className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGeneratePrep}
                disabled={isLoading}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>{isLoading ? "Analyzing Profile & Generating..." : "Generate Session Discussion Points"}</span>
              </Button>

              {prepResult && (
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  {/* Objectives */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">Session Objectives</h4>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {prepResult.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#0a66c2] font-bold">•</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Discussion Prompts */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">Tailored Discussion Prompts</h4>
                    <div className="space-y-1.5">
                      {prepResult.discussionPrompts.map((prompt, i) => (
                        <div key={i} className="p-2.5 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-800">
                          {prompt}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Technical Exercises */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">Technical Exercises &amp; Drills</h4>
                    <div className="space-y-1.5">
                      {prepResult.technicalExercises.map((drill, i) => (
                        <div key={i} className="p-2.5 bg-blue-50/40 rounded-md border border-blue-100 text-xs text-blue-900">
                          {drill}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviewable Draft Agenda */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-bold text-gray-900">
                        Review &amp; Edit Draft Agenda
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCopy(editedAgenda)}
                        className="text-[11px] text-[#0a66c2] hover:underline flex items-center gap-1"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copied ? "Copied" : "Copy Agenda"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={4}
                      value={editedAgenda}
                      onChange={(e) => setEditedAgenda(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    />
                  </div>

                  {onInsertAgenda && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleApplyAgenda}
                        className="bg-[#0a66c2] hover:bg-[#004182] text-xs"
                      >
                        Insert into Session Agenda
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CAREER GUIDANCE */}
          {activeTab === "career_guidance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Technical Role
                  </label>
                  <input
                    type="text"
                    value={guidanceRole}
                    onChange={(e) => setGuidanceRole(e.target.value)}
                    placeholder="e.g. Distributed Systems Engineer"
                    className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Student Academic Level
                  </label>
                  <input
                    type="text"
                    value={guidanceLevel}
                    onChange={(e) => setGuidanceLevel(e.target.value)}
                    placeholder="e.g. Undergraduate Junior / Senior"
                    className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerateGuidance}
                disabled={isLoading}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>{isLoading ? "Compiling Competencies..." : "Generate Career Guidance Topics"}</span>
              </Button>

              {guidanceResult && (
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  {/* Competencies */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">
                      Core Industry Competencies (2026 Bar)
                    </h4>
                    <div className="space-y-1.5">
                      {guidanceResult.keyCompetencies.map((comp, i) => (
                        <div key={i} className="p-2.5 bg-gray-50 rounded-md border border-gray-200 text-xs text-gray-800">
                          {comp}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Discussion Topics */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">
                      High-Impact Mentorship Discussion Topics
                    </h4>
                    <div className="space-y-2">
                      {guidanceResult.discussionTopics.map((topic, i) => (
                        <div key={i} className="p-3 bg-white border border-gray-200 rounded-md text-xs">
                          <span className="font-bold text-gray-900 block">{topic.title}</span>
                          <p className="text-gray-600 mt-1 leading-relaxed">{topic.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Projects */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">
                      Recommended Capstone / Portfolio Projects
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {guidanceResult.recommendedProjects.map((p, i) => (
                        <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs flex flex-col justify-between">
                          <div>
                            <span className="font-bold text-gray-900 block mb-1">{p.title}</span>
                            <p className="text-gray-600 text-[11px] leading-relaxed mb-2">{p.description}</p>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {p.techStack.map((tech) => (
                              <span key={tech} className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-600 font-mono">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Advice */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1.5">Strategic Mentor Advice</h4>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {guidanceResult.strategicAdvice.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">✓</span>
                          <span>{adv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LEARNING ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeMentees.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mentee
                    </label>
                    <select
                      value={selectedMenteeId}
                      onChange={(e) => setSelectedMenteeId(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    >
                      {activeMentees.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.student?.name || "Student"} — {m.focus}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={activeMentees.length > 0 ? "" : "sm:col-span-2"}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Skills to Focus On
                  </label>
                  <input
                    type="text"
                    value={roadmapSkills}
                    onChange={(e) => setRoadmapSkills(e.target.value)}
                    placeholder="e.g. PostgreSQL, Redis, Docker, CI/CD"
                    className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerateRoadmap}
                disabled={isLoading}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>{isLoading ? "Synthesizing Roadmap..." : "Draft Structured 8-Week Roadmap"}</span>
              </Button>

              {roadmapResult && (
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200 leading-relaxed">
                    {roadmapResult.overview}
                  </p>

                  <div className="space-y-3">
                    {roadmapResult.phases.map((phase, i) => (
                      <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{phase.title}</span>
                          <span className="text-[10px] font-semibold text-[#0a66c2] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {phase.weeks}
                          </span>
                        </div>
                        <p className="text-gray-500 text-[11px]">{phase.description}</p>
                        <div className="space-y-1 pt-1 border-t border-gray-100">
                          {phase.milestones.map((m, j) => (
                            <div key={j} className="flex items-center justify-between text-[11px] text-gray-700">
                              <span>• {m.title}</span>
                              <span className="text-gray-400 font-mono text-[10px]">{m.targetWeeks}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {currentMentee && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSaveRoadmapMilestones}
                        className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
                      >
                        <Plus size={13} />
                        <span>Add Milestones to {menteeName}&apos;s Mentorship Track</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STUDENT MATCHING */}
          {activeTab === "student_matching" && (
            <div className="space-y-4">
              <p className="text-xs text-gray-600">
                Matches active students from the directory against your verified skills in Distributed Systems, Backend Architecture, and PostgreSQL.
              </p>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerateMatching}
                disabled={isLoading}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>{isLoading ? "Evaluating Student Directory..." : "Analyze Student Recommendations"}</span>
              </Button>

              {matchingResult && (
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-200">
                    {matchingResult.summary}
                  </p>

                  <div className="space-y-3">
                    {matchingResult.recommendations.map((rec) => (
                      <div key={rec.studentId} className="p-3.5 bg-white border border-gray-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-gray-900 text-sm">{rec.studentName}</span>
                            <p className="text-[11px] text-gray-500">{rec.academicYear} · {rec.department}</p>
                            <p className="text-[11px] font-semibold text-gray-700 mt-0.5">Target: {rec.careerGoal}</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#057642] border border-emerald-200">
                            {rec.matchScore}% Match
                          </span>
                        </div>

                        <div className="space-y-1 pt-1.5 border-t border-gray-100 text-[11px]">
                          <span className="font-semibold text-gray-700 block">Match Drivers:</span>
                          {rec.matchReasons.map((reason, i) => (
                            <div key={i} className="text-gray-600 flex items-center gap-1.5">
                              <span className="text-[#0a66c2]">•</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SESSION SUMMARY */}
          {activeTab === "summary" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeMentees.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Mentee
                    </label>
                    <select
                      value={selectedMenteeId}
                      onChange={(e) => setSelectedMenteeId(e.target.value)}
                      className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    >
                      {activeMentees.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.student?.name || "Student"} — {m.focus}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className={activeMentees.length > 0 ? "" : "sm:col-span-2"}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Session Topic
                  </label>
                  <input
                    type="text"
                    value={prepTopic}
                    onChange={(e) => setPrepTopic(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Raw Session Notes / Observations
                </label>
                <textarea
                  rows={3}
                  value={rawNotes}
                  onChange={(e) => setRawNotes(e.target.value)}
                  placeholder="Paste rough bullet points or feedback discussed during the meeting..."
                  className="w-full text-xs bg-white border border-gray-200 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={isLoading}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                <span>{isLoading ? "Summarizing Notes..." : "Synthesize Executive Summary"}</span>
              </Button>

              {summaryResult && (
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs">
                    <span className="font-bold text-gray-900 block mb-1">Executive Recap</span>
                    <p className="text-gray-700 leading-relaxed">{summaryResult.executiveSummary}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-1">Student Deliverables</h4>
                    <ul className="space-y-1 text-xs text-gray-700">
                      {summaryResult.studentActionItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[#0a66c2] font-bold">□</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-bold text-gray-900">
                        Review &amp; Edit Formatted Notes
                      </h4>
                      <button
                        type="button"
                        onClick={() => handleCopy(editedNotes)}
                        className="text-[11px] text-[#0a66c2] hover:underline flex items-center gap-1"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copied ? "Copied" : "Copy Notes"}</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      className="w-full text-xs font-mono bg-white border border-gray-200 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    />
                  </div>

                  {currentMentee && (
                    <div className="pt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={handleSaveSummaryNotes}
                        className="bg-[#0a66c2] hover:bg-[#004182] text-xs"
                      >
                        Save to {menteeName}&apos;s Private Mentorship Notes
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-gray-500">
            AI responses require human review before saving.
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
