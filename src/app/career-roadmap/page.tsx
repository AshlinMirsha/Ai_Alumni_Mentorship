"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Map,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Edit3,
  Filter,
  Quote,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { RoadmapStageCard } from "@/components/roadmap/RoadmapStageCard";
import { SkillGapList } from "@/components/roadmap/SkillGapList";
import { EditRoleModal } from "@/components/roadmap/EditRoleModal";
import { Avatar } from "@/components/ui/Avatar";
import {
  currentStudent,
  initialRoadmapStages,
  alumniData,
} from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  saveStudentProfile,
  loadRoadmapStages,
  saveRoadmapStages,
  resetRoadmapStages,
} from "@/lib/dashboard-storage";
import { getCurriculumTrack } from "@/lib/curriculum-tracks";
import type { RoadmapStage, RoadmapStageStatus, Student } from "@/types";

export default function CareerRoadmapPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );
  const stages = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadRoadmapStages,
    () => initialRoadmapStages
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = (stageId: string, newStatus: RoadmapStageStatus) => {
    const updated = stages.map((s) => (s.id === stageId ? { ...s, status: newStatus } : s));
    saveRoadmapStages(updated);
    showToast(`Milestone updated to "${newStatus.replace("_", " ")}".`);
  };

  const targetRole = student.careerGoal?.trim() || "";

  const handleResetProgress = () => {
    const track = getCurriculumTrack(targetRole || "Full-Stack Software Engineer");
    const freshStages = track.stages.map((s) => ({ ...s, status: "not_started" as const }));
    saveRoadmapStages(freshStages);
    setShowResetConfirm(false);
    showToast(freshStages.length > 0 ? "Roadmap milestones reset to planned state." : "Roadmap cleared.");
  };

  const handleSaveRole = (newRole: string) => {
    const updatedStudent: Student = {
      ...student,
      careerGoal: newRole,
      careerGoals: [newRole, ...(student.careerGoals?.filter((g) => g !== newRole) || [])],
    };
    saveStudentProfile(updatedStudent);

    // If predefined track, load its stages; if custom track, start empty with 'No path found' prompt
    const track = getCurriculumTrack(newRole);
    saveRoadmapStages(track.stages);
    if (track.stages.length > 0) {
      showToast(`Roadmap loaded for "${newRole}".`);
    } else {
      showToast(`Role set to "${newRole}". Click Generate to create your roadmap.`);
    }
  };

  const handleRegenerateRoadmap = async () => {
    setIsRegenerating(true);
    const activeRole = targetRole || "Full-Stack Software Engineer";

    try {
      // Call backend AI chat endpoint to retrieve customized, fresh stage activities
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Generate 5 structured, progressive milestones for becoming a ${activeRole}. Output only a JSON array of objects with keys: id, stepNumber, title, description, estimatedWeeks, keySkills (array of strings), suggestedActivities (array of 3 strings), and project (object with title, description, techStack array, deliverables string). Do not wrap in markdown or backticks, just raw JSON.`,
          model: "minimaxai/minimax-m3.1-flash",
          studentContext: {
            studentName: student.name,
            targetRole: activeRole,
            academicLevel: student.academicYear,
            currentFocus: student.department,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data.content || data.text || "";
        const jsonMatch = rawText.match(/\[[\s\S]*\]/);
        const cleanJson = jsonMatch ? jsonMatch[0] : rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          const formattedStages = parsed.map((item, idx) => ({
            id: item.id || `stage-${Date.now()}-${idx + 1}`,
            stepNumber: idx + 1,
            title: item.title,
            description: item.description,
            status: idx === 0 ? ("in_progress" as const) : ("not_started" as const),
            estimatedWeeks: item.estimatedWeeks || `Weeks ${idx * 4 + 1}–${idx * 4 + 4}`,
            keySkills: Array.isArray(item.keySkills) ? item.keySkills : [activeRole, "Core Skills"],
            suggestedActivities: Array.isArray(item.suggestedActivities) ? item.suggestedActivities : [item.description],
            project: item.project || {
              title: `${item.title} Capstone`,
              description: `Hands-on project applying ${item.title} concepts.`,
              techStack: item.keySkills || [activeRole],
              deliverables: "Working application with source code.",
            },
          }));
          saveRoadmapStages(formattedStages);
          setIsRegenerating(false);
          showToast(`Roadmap dynamically created for "${activeRole}"!`);
          return;
        }
      }
    } catch (e) {
      console.warn("AI generation fallback to tailored curriculum:", e);
    }

    // Role-specific fallback for custom role
    const track = getCurriculumTrack(activeRole);
    const fallbackStages: RoadmapStage[] = track.stages.length > 0
      ? track.stages.map((s, idx) => ({
          ...s,
          id: `${s.id}-gen-${Date.now()}`,
          status: idx === 0 ? ("in_progress" as const) : ("not_started" as const),
        }))
      : [
          {
            id: `custom-1-${Date.now()}`,
            stepNumber: 1,
            title: `${activeRole} Core Foundations`,
            description: `Master core principles, modern toolsets, and foundational theory for ${activeRole}.`,
            status: "in_progress" as const,
            estimatedWeeks: "Weeks 1–4",
            keySkills: [activeRole, "Foundations", "Tooling"],
            suggestedActivities: [
              `Read foundational documentation and industry standards for ${activeRole}`,
              `Setup local development, sandbox, or research environment for ${activeRole}`,
              `Build initial hands-on proof-of-concept project`,
            ],
            project: {
              title: `${activeRole} Starter System`,
              description: `Practical implementation demonstrating core skills for ${activeRole}.`,
              techStack: [activeRole, "Core Tools"],
              deliverables: "Working repository and design document.",
            },
          },
          {
            id: `custom-2-${Date.now()}`,
            stepNumber: 2,
            title: `Advanced Architecture & Systems for ${activeRole}`,
            description: `Deepen expertise in advanced tooling, production workflows, and real-world architectures.`,
            status: "not_started" as const,
            estimatedWeeks: "Weeks 5–8",
            keySkills: ["Architecture", "Production Systems", "Optimization"],
            suggestedActivities: [
              `Analyze production architectures used by top companies for ${activeRole}`,
              `Implement automated testing and validation workflows`,
              `Optimize performance and reliability bottlenecks`,
            ],
            project: {
              title: `${activeRole} Advanced System`,
              description: `Production-grade project solving complex domain problems.`,
              techStack: [activeRole, "Testing", "CI/CD"],
              deliverables: "Validated implementation with metrics and documentation.",
            },
          },
          {
            id: `custom-3-${Date.now()}`,
            stepNumber: 3,
            title: `Industry Readiness & Portfolio Capstone`,
            description: `Complete capstone demonstration, interview prep, and portfolio polish for ${activeRole}.`,
            status: "not_started" as const,
            estimatedWeeks: "Weeks 9–12",
            keySkills: ["Interview Prep", "System Design", "Portfolio"],
            suggestedActivities: [
              `Complete comprehensive capstone project with public demo`,
              `Conduct mock technical interviews for ${activeRole} hiring bars`,
              `Connect with alumni mentors working as ${activeRole}`,
            ],
            project: {
              title: `${activeRole} Production Capstone`,
              description: `End-to-end portfolio project ready for technical recruiters and hiring managers.`,
              techStack: [activeRole, "Production Deploy"],
              deliverables: "Live demo, source code, and case study presentation.",
            },
          },
        ];

    saveRoadmapStages(fallbackStages);
    setIsRegenerating(false);
    showToast(`Roadmap dynamically created for "${activeRole}"!`);
  };

  const totalStages = stages.length;
  const completedStages = stages.filter((s) => s.status === "completed").length;
  const inProgressStages = stages.filter((s) => s.status === "in_progress").length;
  const completionPercentage = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;

  const filteredStages = useMemo(() => {
    if (statusFilter === "all") return stages;
    return stages.filter((s) => s.status === statusFilter);
  }, [stages, statusFilter]);

  // Dynamic mentor recommendations based on current target role (Strict & Honest matching)
  const recommendedMentors = useMemo(() => {
    if (!targetRole.trim()) return [];
    const lowerRole = targetRole.toLowerCase();
    const matched = alumniData.filter((a) => {
      const roleMatch = a.role.toLowerCase().includes(lowerRole) || lowerRole.includes(a.role.toLowerCase());
      const headlineMatch = a.headline?.toLowerCase().includes(lowerRole);
      const expertiseMatch = a.areasOfExpertise?.some((e) => lowerRole.includes(e.toLowerCase()) || e.toLowerCase().includes(lowerRole));
      return roleMatch || headlineMatch || expertiseMatch;
    });
    // Return only genuinely matched mentors — never fall back to unrelated software engineers!
    return matched.slice(0, 3);
  }, [targetRole]);

  // Dynamic advice/tip based on role
  const roleTip = useMemo(() => {
    const lower = targetRole.toLowerCase();

    // 1. Academia, Professor, Biology, Science, Research, Education
    if (
      lower.includes("biology") ||
      lower.includes("professor") ||
      lower.includes("academic") ||
      lower.includes("faculty") ||
      lower.includes("researcher") ||
      lower.includes("lecturer") ||
      lower.includes("education") ||
      lower.includes("scholar")
    ) {
      return {
        quote:
          "Prioritize peer-reviewed scholarship, demonstrated pedagogy, and grant-writing acumen. In collegiate faculty appointments, showing genuine passion for student mentorship alongside experimental rigor sets candidates apart.",
        author: "Academic Advisory Panel",
        role: `Higher Education · ${targetRole}`,
      };
    }

    // 2. Healthcare, Clinical, Doctor, Medicine, Nursing
    if (
      lower.includes("doctor") ||
      lower.includes("clinical") ||
      lower.includes("medicine") ||
      lower.includes("physician") ||
      lower.includes("health") ||
      lower.includes("nurse")
    ) {
      return {
        quote:
          "Board credentials and clinical hours are foundational. Supplement clinical practice with patient advocacy, interdisciplinary healthcare leadership, and continuing medical education.",
        author: "Clinical Advisory Board",
        role: "Healthcare Practice Leadership",
      };
    }

    // 3. AI / Machine Learning
    if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("data science")) {
      return {
        quote:
          "Don't just call model APIs. Show that you understand embeddings, evaluation benchmarks, token budgets, and fine-tuning trade-offs in your projects.",
        author: "Devin Zhao",
        role: "AI Research Engineer · Anthropic",
      };
    }

    // 4. Backend / Systems
    if (lower.includes("backend") || lower.includes("systems") || lower.includes("distributed")) {
      return {
        quote:
          "Focus deeply on building one complex distributed system rather than 5 generic clones. Hiring managers look for understanding of edge cases, database indexing, and async failures.",
        author: "Marcus Vance",
        role: "Senior Backend Engineer · Datadog",
      };
    }

    // 5. Frontend / UI
    if (lower.includes("frontend") || lower.includes("ui") || lower.includes("web design")) {
      return {
        quote:
          "Master component lifecycle, web vitals, accessibility, and state machines. Top companies prioritize engineers who can profile and fix rendering bottlenecks.",
        author: "Sarah Lin",
        role: "Lead Design Technologist · Stripe",
      };
    }

    // 6. Cloud / DevOps / Security
    if (lower.includes("cloud") || lower.includes("devops") || lower.includes("architect") || lower.includes("security")) {
      return {
        quote:
          "Infrastructure as Code and observability are king. Demonstrate how you design for high availability, zero-downtime rollouts, and proactive defense.",
        author: "Amina Diallo",
        role: "Principal Cloud Architect · AWS",
      };
    }

    // 7. Product, Strategy, Marketing, Business, Finance
    if (
      lower.includes("product") ||
      lower.includes("finance") ||
      lower.includes("marketing") ||
      lower.includes("business") ||
      lower.includes("consult")
    ) {
      return {
        quote:
          "Anchor your accomplishments in measurable metrics—revenue impact, retention lift, or operational efficiencies. Demonstrating stakeholder cross-alignment gets you hired.",
        author: "Product & Strategy Panel",
        role: "Executive Mentorship Council",
      };
    }

    // Default professional tip for any custom role
    return {
      quote: `Focus on mastering the documented deliverables and real-world methodologies of ${targetRole || "your field"}. Concrete case studies that showcase end-to-end execution always distinguish top candidates.`,
      author: "Alumni Advisory Network",
      role: `Verified ${targetRole || "Career"} Benchmark`,
    };
  }, [targetRole]);

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
          title="Your Career Roadmap"
          subtitle={`Target: ${targetRole} · Mastered: ${completedStages} of ${totalStages} milestones`}
        />

        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#090909] text-white text-xs shadow-lg border border-[#242424] animate-in fade-in duration-150"
          >
            <CheckCircle2 size={14} className="text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Header Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E7E7E7]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]">
                  <Map size={13} />
                  Curriculum Track
                </span>
                <span className="text-xs text-[#737373]">·</span>
                <span className="text-xs font-medium text-[#737373]">
                  {stages.length} Milestones
                </span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#090909]">
                {targetRole ? `Career Roadmap: ${targetRole}` : "Choose Your Career Roadmap"}
              </h1>
              <p className="text-xs sm:text-sm text-[#555555] mt-1">
                {targetRole
                  ? (stages.length === 0
                      ? `No roadmap generated yet for ${targetRole}. Click "Generate Path" to synthesize an AI-powered curriculum.`
                      : (/software|developer|engineer|full-stack|frontend|backend|cloud|devops|data|ai|machine learning/i.test(targetRole)
                          ? `A structured milestone path benchmarked against modern industry hiring bars for ${targetRole}.`
                          : `A structured milestone path benchmarked against professional standards for ${targetRole}.`))
                  : "Select an industry-curated career track below or define your custom dream role to get started."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant={stages.length === 0 ? "secondary" : "primary"}
                size="sm"
                onClick={() => setIsEditRoleOpen(true)}
                className={`text-xs rounded-full h-8 px-3.5 ${
                  stages.length === 0 ? "" : "bg-[#090909] text-white"
                }`}
              >
                <Edit3 size={13} className="mr-1.5" />
                {targetRole ? "Switch Track" : "Choose Track"}
              </Button>

              <Button
                variant={stages.length === 0 ? "primary" : "secondary"}
                size="sm"
                disabled={isRegenerating || !targetRole}
                onClick={handleRegenerateRoadmap}
                className={`text-xs rounded-full h-8 px-3.5 ${
                  stages.length === 0 ? "bg-[#090909] text-white hover:bg-[#242424]" : ""
                }`}
              >
                <Sparkles size={13} className="mr-1.5" />
                {isRegenerating
                  ? "Generating..."
                  : stages.length === 0
                  ? "Generate Path"
                  : "Regenerate Path"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-[#737373] hover:text-[#090909] rounded-full h-8 px-3"
              >
                <RotateCcw size={12} className="mr-1" />
                Reset
              </Button>
            </div>
          </div>

          {/* Quick Track Switcher Bar */}
          <div className="bg-white border border-[#E7E7E7] rounded-2xl p-4 sm:p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-[#F0F0F0]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                Popular Career Tracks
              </span>
              <span className="text-xs text-[#737373]">
                Click any track to instantly load its curriculum and milestones
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Full-Stack Software Engineer",
                "Backend Developer",
                "AI Engineer",
                "Frontend Platform Engineer",
                "Cloud Solutions Architect",
                "Software Engineer Intern",
              ].map((roleOption) => {
                const isActive = targetRole.toLowerCase() === roleOption.toLowerCase() && stages.length > 0;
                return (
                  <button
                    key={roleOption}
                    type="button"
                    onClick={() => handleSaveRole(roleOption)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                      isActive
                        ? "bg-[#090909] text-white border-[#090909] shadow-xs"
                        : "bg-[#FAFAFA] text-[#555555] border-[#E7E7E7] hover:border-[#090909] hover:text-[#090909]"
                    }`}
                  >
                    {isActive ? `✓ ${roleOption}` : roleOption}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Two-Column Layout (Matching Reference 3 bottom half) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (8 cols): Milestones & Skill-Gap */}
            <div className="lg:col-span-8 space-y-8">
              {/* Filter Tabs */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#090909]">
                  Milestone Progression
                </h2>

                {stages.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs">
                    <Filter size={13} className="text-[#737373]" />
                    <div className="flex items-center gap-1 bg-white border border-[#E7E7E7] p-0.5 rounded-full shadow-2xs">
                      {[
                        { id: "all", label: "All" },
                        { id: "not_started", label: "Planned" },
                        { id: "in_progress", label: "In Progress" },
                        { id: "completed", label: "Completed" },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setStatusFilter(tab.id)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            statusFilter === tab.id
                              ? "bg-[#090909] text-white shadow-xs"
                              : "text-[#737373] hover:text-[#090909]"
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Milestones Vertical Rail or Empty State */}
              {stages.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-[#E7E7E7] rounded-2xl p-8 sm:p-12 text-center space-y-4 shadow-2xs">
                  <div className="w-14 h-14 mx-auto rounded-full bg-[#F4F4F4] border border-[#E7E7E7] flex items-center justify-center text-[#090909]">
                    <Map size={24} className="text-[#090909]" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-[#090909]">
                      {targetRole ? `No path found for ${targetRole}` : "No career path chosen"}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                      No path found for this role. Click{" "}
                      <strong className="text-[#090909]">Generate</strong> to create an AI-powered curriculum tailored to your background and industry benchmarks.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Button
                      variant="primary"
                      onClick={handleRegenerateRoadmap}
                      disabled={isRegenerating || !targetRole}
                      className="rounded-full px-6 py-2.5 bg-[#090909] text-white text-xs font-semibold hover:bg-[#242424] shadow-xs inline-flex items-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      {isRegenerating ? "Generating Path..." : "Generate Path"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setIsEditRoleOpen(true)}
                      className="rounded-full px-5 py-2.5 text-xs font-semibold"
                    >
                      Choose Predefined Track
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStages.length === 0 ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-[#E7E7E7] text-xs text-[#737373]">
                      No milestones match filter &ldquo;{statusFilter}&rdquo;.
                    </div>
                  ) : (
                    filteredStages.map((stage) => (
                      <RoadmapStageCard
                        key={stage.id}
                        stage={stage}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              )}

              {/* Skill-Gap Analysis */}
              <SkillGapList student={student} targetRole={targetRole} />
            </div>

            {/* Right Column (4 cols): Side Cards (Matching Reference 3) */}
            <div className="lg:col-span-4 space-y-6">
              {/* 1. Current Progress Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                    Current Progress
                  </h3>
                  <span className="text-base font-extrabold text-[#090909]">
                    {completionPercentage}%
                  </span>
                </div>

                <div className="w-full bg-[#EBEBEB] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#090909] rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#737373]">
                  {totalStages > 0 ? (
                    <>
                      <span>
                        <strong className="text-[#090909]">{completedStages}</strong> of {totalStages} completed
                      </span>
                      <span>
                        <strong className="text-[#090909]">{inProgressStages}</strong> in progress
                      </span>
                    </>
                  ) : (
                    <span>No path active · Click &ldquo;Generate Path&rdquo; to begin</span>
                  )}
                </div>
              </div>

              {/* 2. Tip from Alumni Card (Matching Reference 3) */}
              <div className="bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Quote size={16} className="text-[#090909]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                    Tip for {targetRole || "Your Career"}
                  </span>
                </div>

                {stages.length === 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-[#737373] leading-relaxed">
                      Generate your career roadmap to unlock verified advice, milestone benchmarks, and alumni insights tailored to your journey as a <strong>{targetRole || "candidate"}</strong>.
                    </p>
                    <div className="pt-2 border-t border-[#E7E7E7]">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleRegenerateRoadmap}
                        disabled={isRegenerating || !targetRole}
                        className="w-full text-xs rounded-full bg-[#090909] text-white"
                      >
                        <Sparkles size={12} className="mr-1.5" />
                        {isRegenerating ? "Generating..." : "Generate Path"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <blockquote className="text-xs sm:text-[13px] text-[#454545] leading-relaxed italic">
                      &ldquo;{roleTip.quote}&rdquo;
                    </blockquote>

                    <div className="pt-2 border-t border-[#E7E7E7] flex items-center gap-3">
                      <Avatar name={roleTip.author} size="sm" />
                      <div>
                        <p className="text-xs font-bold text-[#090909]">{roleTip.author}</p>
                        <p className="text-[11px] text-[#737373]">{roleTip.role}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* 3. Recommended Mentors for this Role */}
              <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#090909]">
                    Recommended Mentors
                  </h3>
                  <span className="text-[11px] font-semibold text-[#737373] truncate max-w-[130px]">
                    {targetRole || "Target Field"}
                  </span>
                </div>

                {stages.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-[#E7E7E7] bg-[#FAFAFA] text-center space-y-2">
                    <p className="text-xs text-[#090909] font-semibold">
                      Generate your path to match mentors
                    </p>
                    <p className="text-[11px] text-[#737373] leading-relaxed">
                      Once your milestones are generated, our matching engine connects you with verified alumni in {targetRole || "your field"}.
                    </p>
                    <Link
                      href="/alumni"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#090909] hover:underline pt-1"
                    >
                      Browse All Mentors →
                    </Link>
                  </div>
                ) : recommendedMentors.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedMentors.map((alumnus) => (
                      <div
                        key={alumnus.id}
                        className="p-3.5 rounded-xl border border-[#E7E7E7] bg-[#FAFAFA] flex items-center justify-between gap-3 hover:border-[#090909]/30 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar name={alumnus.name} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#090909] truncate">{alumnus.name}</p>
                            <p className="text-[11px] text-[#737373] truncate">{alumnus.role} · {alumnus.company}</p>
                          </div>
                        </div>
                        <Link
                          href={`/alumni/${alumnus.id}`}
                          className="text-xs font-semibold text-[#090909] hover:underline shrink-0"
                        >
                          Profile →
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border border-dashed border-[#E7E7E7] bg-[#FAFAFA] text-center space-y-2">
                    <p className="text-xs text-[#090909] font-semibold">
                      No alumni mentors found for &ldquo;{targetRole}&rdquo; yet
                    </p>
                    <p className="text-[11px] text-[#737373] leading-relaxed">
                      Our verified network currently does not have active mentors registered under this specific title. Explore our general directory or connect with mentors in adjacent domains.
                    </p>
                    <Link
                      href="/alumni"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#090909] bg-white border border-[#E7E7E7] px-3.5 py-1.5 rounded-full hover:bg-[#F4F4F4] transition-colors shadow-2xs mt-1"
                    >
                      Browse All Alumni Mentors →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Role Modal */}
      <EditRoleModal
        currentRole={targetRole}
        isOpen={isEditRoleOpen}
        onClose={() => setIsEditRoleOpen(false)}
        onSaveRole={handleSaveRole}
      />

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-[#E7E7E7] max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-[#090909]">
              Reset Roadmap Progress?
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              This will restore all milestones to the default demo state. Any custom status toggles will be reset.
            </p>
            <div className="pt-2 flex justify-end gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowResetConfirm(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetProgress}
                className="rounded-full bg-[#090909] text-white"
              >
                Yes, Reset Progress
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
