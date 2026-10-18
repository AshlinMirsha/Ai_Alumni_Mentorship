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
import { DashboardNav } from "@/components/dashboard/DashboardNav";
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
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="min-h-screen bg-gray-50/60 flex flex-col antialiased">
      <DashboardNav studentName={student.name} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs">
                <Sparkles size={15} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                AI Career Assistant
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo Engine Active
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Personalized guidance for your next career step.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearConversation}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw size={12} />
                <span>Clear Chat</span>
              </button>
            )}
            <Link
              href="/career-roadmap"
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-blue-600 font-semibold transition-colors inline-flex items-center gap-1"
            >
              <Map size={12} />
              <span>Career Roadmap</span>
            </Link>
          </div>
        </div>

        {/* Main Grid: Chat Area + Contextual Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-start">
          {/* Conversation Main Container (3 Cols) */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-2xs min-h-[580px] max-h-[780px] overflow-hidden">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {messages.length === 0 ? (
                /* WELCOME STATE */
                <div className="py-6 sm:py-10 max-w-xl mx-auto space-y-6 text-center animate-in fade-in duration-200">
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto shadow-2xs">
                    <Sparkles size={28} />
                  </div>

                  <div className="space-y-1.5">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                      Where would you like to take your career?
                    </h2>
                    <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                      Ask about skills, projects, internships, interview preparation, or your career roadmap.
                    </p>
                  </div>

                  {/* 4 Required Suggestion Buttons */}
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

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[11px] text-gray-400">
                    <HelpCircle size={13} className="text-gray-400" />
                    <span>
                      Guidance is tailored to your target role:{" "}
                      <strong className="text-gray-700">
                        {student.careerGoal || "Full-Stack Software Engineer"}
                      </strong>
                    </span>
                  </div>
                </div>
              ) : (
                /* Conversation Stream */
                <div className="space-y-5">
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
                    <div className="flex items-center gap-3 text-xs text-gray-400 pl-2">
                      <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
                        <Sparkles size={13} />
                      </div>
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="text-[11px] font-medium text-gray-500 ml-1">
                          Analyzing career options...
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {errorMessage && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
                      <AlertCircle size={15} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Composer Footer */}
            <div className="p-3 sm:p-4 bg-gray-50/80 border-t border-gray-200">
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

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/career-roadmap" className="hover:text-gray-900 transition-colors">
              Career Roadmap
            </Link>
            <Link href="/resume-review" className="hover:text-gray-900 transition-colors">
              Resume Review
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
