"use client";

import Link from "next/link";
import { Users, Sparkles, FileText, Map, ArrowRight, Settings, MessageSquare, Briefcase } from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Discover Alumni",
      description: "Search verified alumni by company, skills, and industry",
      href: "/alumni",
      icon: Users,
    },
    {
      title: "Profile & Settings",
      description: "Manage privacy preferences, technical skills, and details",
      href: "/settings",
      icon: Settings,
    },
    {
      title: "Messages",
      description: "Direct messaging with alumni and career mentors",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Career Roadmap",
      description: "Milestones and skill pathways for full-stack engineering",
      href: "/career-roadmap",
      icon: Map,
    },
    {
      title: "AI Career Assistant",
      description: "Interactive guidance on interview prep and career roadmaps",
      href: "/career-assistant",
      icon: Sparkles,
    },
    {
      title: "Resume Review",
      description: "ATS rubric audit for impact metrics and keyword density",
      href: "/resume-review",
      icon: FileText,
    },
  ];

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-[12px] p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA] mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[6px] bg-[#F0F5FA] text-[#2166A5] flex items-center justify-center border border-[#D0E0EF]">
            <Briefcase size={14} />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#191919]">Career Tools</h2>
        </div>
        <span className="text-[11px] text-[#8C8C8C] font-medium">Quick Access</span>
      </div>

      {/* Stacked list of actions (one per row, no awkward multi-line text wrapping) */}
      <div className="space-y-1.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.href}
              href={act.href}
              className="group flex items-center justify-between p-2.5 rounded-[8px] border border-[#E1E5EA] bg-white hover:border-[#2166A5] hover:bg-[#F8FAFC] transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-[6px] bg-[#F0F5FA] text-[#2166A5] flex items-center justify-center border border-[#D0E0EF] group-hover:bg-[#2166A5] group-hover:text-white transition-colors shrink-0">
                  <Icon size={14} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-[#191919] group-hover:text-[#2166A5] transition-colors truncate">
                    {act.title}
                  </h3>
                  <p className="text-[11px] text-[#626262] truncate">
                    {act.description}
                  </p>
                </div>
              </div>
              <ArrowRight
                size={13}
                className="text-[#8C8C8C] group-hover:text-[#2166A5] group-hover:translate-x-0.5 transition-all shrink-0 ml-2"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
