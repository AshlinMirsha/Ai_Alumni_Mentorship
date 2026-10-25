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
  const [contextData, setContextData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    careerAssistantService.fetchContextualTopics().then((res) => {
      if (isMounted && res?.success) {
        setContextData(res);
      }
    });

    careerAssistantService.fetchConversationHistory().then((history) => {
      if (isMounted && history.length > 0) {
        setMessages(history);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      setErrorMessage(null);
      const userMessage: AssistantMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: "Just now",
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await careerAssistantService.sendMessage({
          prompt: text.trim(),
          studentContext: {
            studentName: student.name,
            targetRole: student.careerGoal || "Full-Stack Software Engineer",
            currentSkills: student.skills.map((s) => s.name),
            academicYear: student.academicYear,
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
    [isLoading, student]
  );

  const handleClearConversation = () => {
    setMessages([]);
    setErrorMessage(null);
  };

  const welcomePrompts = [
    {
      title: "Build my career roadmap",
      description: `Structured 7-stage plan for ${student.careerGoal || "Full-Stack Software Engineer"}`,
      prompt: "Build my career roadmap",
      icon: <Map size={16} />,
    },
    {
      title: "Identify my skill gaps",
      description: "Analyze current skills against industry hiring requirements",
      prompt: "Identify my skill gaps",
      icon: <Briefcase size={16} />,
    },
    {
      title: "Improve my resume",
      description: "Actionable tips using Google's XYZ formula and ATS keywords",
      prompt: "Improve my resume",
      icon: <FileText size={16} />,
    },
    {
      title: "Prepare for a software engineering interview",
      description: "High-yield LeetCode patterns, system design, and STAR stories",
      prompt: "Prepare for a software engineering interview",
      icon: <GraduationCap size={16} />,
    },
  ];

  const activePrompts =
    contextData?.suggestedPrompts && contextData.suggestedPrompts.length >= 4
      ? contextData.suggestedPrompts.slice(0, 4).map((p: any, idx: number) => ({
          title: p.title,
          description: p.description,
          prompt: p.prompt,
          icon:
            idx === 0 ? (
              <Map size={16} />
            ) : idx === 1 ? (
              <Briefcase size={16} />
            ) : idx === 2 ? (
              <FileText size={16} />
            ) : (
              <GraduationCap size={16} />
            ),
        }))
      : welcomePrompts;

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

          {/* Profile Completion Guidance Banner (if profile has missing fields) */}
          {contextData?.profileContext?.missingFields &&
            contextData.profileContext.missingFields.length > 0 && (
              <div className="p-3 bg-neutral-100/80 border border-[#E7E7E7] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 text-neutral-800">
                  <AlertCircle size={15} className="text-[#090909] shrink-0" />
                  <span>
                    To get the most accurate advice, add your{" "}
                    <strong className="text-[#090909]">
                      {contextData.profileContext.missingFields.join(", ")}
                    </strong>{" "}
                    to your profile.
                  </span>
                </div>
                <Link
                  href="/profile"
                  className="font-bold text-[#090909] underline hover:no-underline shrink-0"
                >
                  Complete Profile →
                </Link>
              </div>
            )}

          {/* Main Grid: Chat Area + Contextual Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
            {/* Conversation Main Container (3 Cols) */}
            <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-[#E7E7E7] shadow-xs min-h-[580px] max-h-[780px] overflow-hidden">
              {/* Messages Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {messages.length === 0 ? (
                  /* WELCOME STATE */
                  <div className="py-8 sm:py-12 max-w-xl mx-auto space-y-6 text-center animate-in fade-in duration-200">
                    <div className="h-12 w-12 rounded-2xl bg-[#090909] text-white flex items-center justify-center mx-auto shadow-sm">
                      <Sparkles size={22} />
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="text-xl font-bold text-[#090909] tracking-tight">
                        Where would you like to take your career?
                      </h2>
                      <p className="text-xs text-[#737373] max-w-md mx-auto leading-relaxed">
                        Inquire about high-leverage skills, benchmark projects, alumni hiring standards, or interview strategies.
                      </p>
                    </div>

                    {/* 4 Required Suggestion Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                      {activePrompts.map((item: any, idx: number) => (
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
                        Guidance is tailored to your target milestone:{" "}
                        <strong className="text-[#090909]">
                          {student.careerGoal || "Full-Stack Software Engineer"}
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

                    {/* Loading Typing Indicator */}
                    {isLoading && (
                      <div className="flex items-center gap-3 text-xs text-[#737373] pl-2">
                        <div className="h-7 w-7 rounded-lg bg-[#090909] text-white flex items-center justify-center shrink-0">
                          <Sparkles size={13} />
                        </div>
                        <div className="flex items-center gap-1.5 bg-[#F4F4F4] border border-[#E7E7E7] rounded-full px-3 py-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#090909] animate-bounce" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#090909] animate-bounce [animation-delay:0.2s]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-[#090909] animate-bounce [animation-delay:0.4s]" />
                          <span className="text-[11px] font-medium text-[#737373] ml-1">
                            Analyzing career trajectory...
                          </span>
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
