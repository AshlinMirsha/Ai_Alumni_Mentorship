"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Map,
  FileText,
  Briefcase,
  RotateCcw,
  Info,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Student } from "@/types";

interface AssistantSidebarProps {
  student: Student;
  onSelectPrompt: (prompt: string) => void;
  onClearConversation: () => void;
  messageCount: number;
}

export function AssistantSidebar({
  student,
  onSelectPrompt,
  onClearConversation,
  messageCount,
}: AssistantSidebarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const promptCategories = [
    {
      label: "Career Roadmap",
      icon: Map,
      prompts: [
        "Build my career roadmap",
        "What are the best backend frameworks to learn next?",
        "How should I structure my projects for Stage 3?",
      ],
    },
    {
      label: "Skills & Preparation",
      icon: Briefcase,
      prompts: [
        "Identify my skill gaps",
        "Prepare for a software engineering interview",
        "How can I master Docker and PostgreSQL indexing?",
      ],
    },
    {
      label: "Resume & Applications",
      icon: FileText,
      prompts: [
        "Improve my resume",
        "How do I quantify impact using Google's XYZ formula?",
        "What ATS keywords should I add for Full-Stack roles?",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Student Profile Context Card */}
      <div className="bg-white rounded-xl border border-[#E7E7E7] p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
          <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
            Your Career Context
          </span>
          <Link
            href="/dashboard"
            className="text-[11px] font-semibold text-[#090909] hover:underline transition-colors inline-flex items-center gap-0.5"
          >
            Edit
            <ChevronRight size={12} />
          </Link>
        </div>

        <div className="space-y-2 text-xs">
          <div>
            <span className="text-[#737373] block text-[10px] font-medium">Target Role</span>
            <span className="font-semibold text-[#090909]">{student.careerGoal || "Full-Stack Software Engineer"}</span>
          </div>

          <div>
            <span className="text-[#737373] block text-[10px] font-medium">Academic Year</span>
            <span className="text-[#737373] font-normal">{student.academicYear || "Second Year"} · {student.department}</span>
          </div>

          <div>
            <span className="text-[#737373] block text-[10px] font-medium mb-1">Current Skills</span>
            <div className="flex flex-wrap gap-1">
              {student.skills.slice(0, 5).map((s) => (
                <span
                  key={s.id || s.name}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Topics / Prompts */}
      <div className="bg-white rounded-xl border border-[#E7E7E7] p-4 shadow-xs space-y-3.5">
        <p className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
          Suggested Topics
        </p>

        <div className="space-y-3">
          {promptCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#090909]">
                  <Icon size={13} className="text-[#090909]" />
                  <span>{cat.label}</span>
                </div>
                <div className="space-y-1 pl-4">
                  {cat.prompts.map((p, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => onSelectPrompt(p)}
                      className="w-full text-left text-[11px] text-[#737373] hover:text-[#090909] hover:underline transition-colors truncate block"
                    >
                      • {p}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Notice */}
      <div className="p-3.5 bg-white border border-[#E7E7E7] rounded-xl text-xs space-y-1.5 shadow-xs">
        <div className="flex items-center gap-1.5 text-[#090909] font-semibold text-[11px]">
          <Info size={13} className="text-[#090909] shrink-0" />
          <span>Curated Response Engine</span>
        </div>
        <p className="text-[11px] text-[#737373] leading-relaxed">
          The Career Assistant uses structured advisory templates tailored to student profile data. No external AI keys or private data are sent over public APIs.
        </p>
      </div>

      {/* Clear Conversation Action */}
      {messageCount > 0 && (
        <div className="pt-1">
          {showClearConfirm ? (
            <div className="p-3 bg-[#F4F4F4] border border-[#E7E7E7] rounded-xl space-y-2">
              <p className="text-[11px] font-semibold text-[#090909]">
                Clear all conversation history?
              </p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClearConversation();
                    setShowClearConfirm(false);
                  }}
                  className="bg-[#090909] text-white text-[11px] py-1 h-7 rounded-full"
                >
                  Yes, Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                  className="text-[11px] py-1 h-7 rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="w-full text-center py-2 text-xs font-semibold text-[#737373] hover:text-[#090909] transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={12} />
              Reset Conversation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
