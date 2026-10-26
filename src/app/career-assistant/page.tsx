"use client";

import { useState, useRef, useEffect, useCallback, useSyncExternalStore, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Map,
  FileText,
  Briefcase,
  GraduationCap,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  Brain,
  Target,
} from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { ChatMessage } from "@/components/assistant/ChatMessage";
import { ChatComposer } from "@/components/assistant/ChatComposer";
import { SuggestionPrompt } from "@/components/assistant/SuggestionPrompt";
import { AssistantSidebar } from "@/components/assistant/AssistantSidebar";
import { careerAssistantService } from "@/services/career-assistant";
import { currentStudent } from "@/lib/mock-data";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
} from "@/lib/dashboard-storage";
import type { AssistantMessage } from "@/types";

function QueryPrefillHandler({
  onPrefill,
}: {
  onPrefill: (query: string) => void;
}) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const querySubmittedRef = useRef(false);

  useEffect(() => {
    if (initialQuery && !querySubmittedRef.current) {
      querySubmittedRef.current = true;
      onPrefill(initialQuery);
    }
  }, [initialQuery, onPrefill]);

  return null;
}

export default function CareerAssistantPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [thinkingTimer, setThinkingTimer] = useState(0);
  const [thinkingPhase, setThinkingPhase] = useState("Analyzing context...");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setThinkingTimer(1);
      const phases = [
        `Synthesizing profile context for ${student.careerGoal || "target role"}...`,
        "Cross-referencing verified alumni benchmarks & domain standards...",
        "Evaluating high-leverage skill gaps & milestone expectations...",
        "Formulating structured recommendations & action points...",
      ];
      let step = 0;
      setThinkingPhase(phases[0]);
      interval = setInterval(() => {
        setThinkingTimer((t) => t + 1);
        step = (step + 1) % phases.length;
        setThinkingPhase(phases[step]);
      }, 1600);
    } else {
      setThinkingTimer(0);
    }
    return () => clearInterval(interval);
  }, [isLoading, student.careerGoal]);

  const handleSendMessage = useCallback(
    async (text: string, images?: string[]) => {
      if ((!text.trim() && (!images || images.length === 0)) || isLoading) return;

      setErrorMessage(null);
      const userMessage: AssistantMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        images,
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // Infer role from query/prompt if specified (e.g., "for X roles?")
      const roleMatch = text.match(/for\s+([^?]+?)(?:\s+roles?)?(?:\?|$)/i);
      const activeRole = roleMatch
        ? roleMatch[1].trim()
        : student.careerGoal?.trim() || "Professional";

      try {
        const response = await careerAssistantService.sendMessage({
          prompt: text.trim(),
          images,
          messages: [...messages, userMessage],
          studentContext: {
            studentName: student.name,
            targetRole: activeRole,
            currentSkills: student.skills.map((s) => s.name),
            academicYear: student.academicYear,
            academicLevel: student.academicYear,
          },
        });

        setMessages((prev) => [...prev, response.message]);
      } catch {
        setErrorMessage(
          "Unable to generate career guidance at this time. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, student, messages]
  );

  const handleClearConversation = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const currentRoleGoal = student.careerGoal?.trim() || "your target career";

  const welcomePrompts = [
    {
      title: "Build my career roadmap",
      description: `Structured milestone progression tailored for ${currentRoleGoal}`,
      prompt: `Build my career roadmap for ${currentRoleGoal}`,
      icon: <Map size={16} />,
    },
    {
      title: "Identify my skill gaps",
      description: `Analyze current capabilities against ${currentRoleGoal} expectations`,
      prompt: `Identify my skill gaps for ${currentRoleGoal}`,
      icon: <Briefcase size={16} />,
    },
    {
      title: "Improve my resume",
      description: `Actionable impact formulas and ATS keywords for ${currentRoleGoal}`,
      prompt: `How can I improve my resume for ${currentRoleGoal}?`,
      icon: <FileText size={16} />,
    },
    {
      title: `Prepare for a ${currentRoleGoal} interview`,
      description: "Targeted domain questions, case scenarios, and STAR method stories",
      prompt: `Prepare for a ${currentRoleGoal} interview`,
      icon: <GraduationCap size={16} />,
    },
  ];

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
          title="AI Career Assistant"
          subtitle={`Advisory Intelligence · Personalized for ${student.careerGoal || "Full-Stack Software Engineer"}`}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col space-y-6">
          {/* Header Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E7E7E7]">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]">
                <Sparkles size={13} />
                Network Intelligence Model
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-[#737373] border border-[#E7E7E7]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#090909] animate-pulse" />
                Active Session
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearConversation}
                  className="px-4 py-1.5 rounded-full border border-[#E7E7E7] bg-white text-[#737373] hover:text-[#090909] hover:bg-[#F4F4F4] transition-colors inline-flex items-center gap-1.5 font-medium shadow-xs"
                >
                  <RotateCcw size={12} />
                  <span>Clear Chat</span>
                </button>
              )}
              <Link
                href="/career-roadmap"
                className="px-4 py-1.5 rounded-full bg-[#090909] text-white hover:bg-[#242424] font-medium transition-colors inline-flex items-center gap-1.5 shadow-xs"
              >
                <Map size={13} />
                <span>Roadmap View</span>
              </Link>
            </div>
          </div>

          {/* Main Grid: Chat Area + Contextual Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
            {/* Conversation Main Container (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-[#E7E7E7] shadow-xs min-h-[580px] max-h-[780px] overflow-hidden">
              {/* Context-Based Chatting Header Bar */}
              <div className="px-4 py-2.5 bg-[#FAFAFA] border-b border-[#E7E7E7] flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Active Context Synchronized" />
                  <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider">Context:</span>
                  <span className="font-bold text-[#090909] truncate">{student.name}</span>
                  <span className="text-[#D4D4D4]">·</span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white border border-[#E7E7E7] text-[#090909] truncate shadow-2xs">
                    <Target size={11} className="text-[#090909]" />
                    {student.careerGoal || "Custom Goal"}
                  </span>
                  <span className="text-[#D4D4D4] hidden sm:inline">·</span>
                  <span className="text-[11px] text-[#737373] hidden sm:inline">
                    {student.academicYear}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/career-roadmap"
                    className="text-[11px] font-semibold text-[#090909] hover:bg-[#F4F4F4] bg-white border border-[#E7E7E7] px-3 py-1 rounded-full transition-colors inline-flex items-center gap-1 shadow-2xs"
                  >
                    <Map size={11} />
                    <span>Roadmap</span>
                  </Link>
                  {messages.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearConversation}
                      className="text-[11px] font-semibold text-[#737373] hover:text-[#090909] hover:bg-[#F4F4F4] bg-white border border-[#E7E7E7] px-3 py-1 rounded-full transition-colors inline-flex items-center gap-1 shadow-2xs"
                    >
                      <RotateCcw size={11} />
                      <span>New Chat</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.length === 0 ? (
                  /* Mini-ChatGPT WELCOME STATE */
                  <div className="py-8 sm:py-12 max-w-xl mx-auto space-y-6 text-center animate-in fade-in duration-200">
                    <div className="h-12 w-12 rounded-2xl bg-[#090909] text-white flex items-center justify-center mx-auto shadow-sm">
                      <Sparkles size={22} />
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold text-[#090909] tracking-tight">
                        How can I accelerate your career today?
                      </h2>
                      <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
                        Omni-modal mentor intelligence powered by NVIDIA Nemotron 30B reasoning. Ask about domain roadmaps, resume audits, or interview scenarios.
                      </p>
                    </div>

                    {/* 4 Suggestion Cards in 2x2 grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                      {welcomePrompts.map((item, idx) => (
                        <SuggestionPrompt
                          key={idx}
                          icon={item.icon}
                          title={item.title}
                          description={item.description}
                          onClick={() => handleSendMessage(item.prompt)}
                        />
                      ))}
                    </div>

                    <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-center gap-2 text-[11px] text-[#737373]">
                      <HelpCircle size={13} className="text-[#090909]" />
                      <span>
                        Context locked to:{" "}
                        <strong className="text-[#090909]">
                          {student.careerGoal || "Target Role"}
                        </strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Conversation Stream */
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        message={msg}
                        studentName={student.name}
                        onSelectSuggestion={(sug) => handleSendMessage(sug)}
                      />
                    ))}

                    {/* Claude-like Dynamic Thinking Indicator */}
                    {isLoading && (
                      <div className="flex items-start gap-3 max-w-3xl mr-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="h-7 w-7 rounded-lg bg-[#090909] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                          <Sparkles size={13} className="animate-spin text-white [animation-duration:3s]" />
                        </div>
                        <div className="space-y-2 max-w-[85%] sm:max-w-[75%] w-full">
                          <div className="border border-[#E7E7E7] bg-white rounded-2xl rounded-tl-sm p-4 shadow-xs space-y-2.5">
                            <div className="flex items-center justify-between pb-1.5 border-b border-[#E7E7E7] text-[11px]">
                              <div className="flex items-center gap-1.5 font-semibold text-[#090909]">
                                <Brain size={13} className="text-[#090909] animate-pulse" />
                                <span>Thinking</span>
                                <span className="text-[10px] font-mono text-[#737373] bg-[#F4F4F4] border border-[#E7E7E7] px-2 py-0.5 rounded-full">
                                  {thinkingTimer}s
                                </span>
                              </div>
                              <span className="text-[10px] text-[#737373]">NVIDIA Nemotron 30B</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#737373] font-mono">
                              <span className="h-2 w-2 rounded-full bg-[#090909] animate-ping shrink-0" />
                              <span className="truncate">{thinkingPhase}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {errorMessage && (
                      <div className="p-3 bg-[#F4F4F4] border border-[#E7E7E7] rounded-xl flex items-center gap-2 text-xs text-[#090909]">
                        <AlertCircle size={15} className="shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Composer Footer */}
              <div className="p-3 sm:p-4 bg-[#FAFAFA] border-t border-[#E7E7E7]">
                <ChatComposer
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Contextual Sidebar (Desktop) */}
            <div className="hidden lg:block">
              <AssistantSidebar
                student={student}
                onSelectPrompt={(prompt) => handleSendMessage(prompt)}
                onClearConversation={handleClearConversation}
                messageCount={messages.length}
              />
            </div>
            <Suspense fallback={null}>
              <QueryPrefillHandler onPrefill={handleSendMessage} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
