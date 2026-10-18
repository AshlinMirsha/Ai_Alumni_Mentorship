"use client";

import Link from "next/link";
import { Users, Sparkles, FileText, Map, ArrowRight, Compass, MessageSquare, Briefcase } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export function QuickActions() {
  const actions = [
    {
      title: "Discover Alumni",
      description: "Search verified alumni mentors by company, skills, and industry.",
      href: "/alumni",
      icon: Users,
      badgeText: "Directory",
    },
    {
      title: "My Mentorships",
      description: "Review pending requests, accepted connections, and mentee inquiries.",
      href: "/mentorship",
      icon: Compass,
      badgeText: "Connections",
    },
    {
      title: "Direct Messages",
      description: "Exchange direct career guidance with your alumni mentors.",
      href: "/messages",
      icon: MessageSquare,
      badgeText: "Messages",
    },
    {
      title: "Career Roadmap",
      description: "Track milestones and skill gaps for full-stack engineering roles.",
      href: "/career-roadmap",
      icon: Map,
      badgeText: "Roadmap",
    },
    {
      title: "AI Career Assistant",
      description: "Get structured advice on interview prep, skill pathways, and resume tips.",
      href: "/career-assistant",
      icon: Sparkles,
      badgeText: "Advisory",
    },
    {
      title: "Resume Review",
      description: "Run ATS rubric checks for impact metrics, formatting, and keyword density.",
      href: "/resume-review",
      icon: FileText,
      badgeText: "ATS Audit",
    },
  ];

  return (
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-2.5 mb-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase size={15} className="text-[#0a66c2]" />
          <h2 className="text-sm font-bold text-gray-900">Career Tools &amp; Actions</h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Quick Access</span>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.href}
                href={act.href}
                className="group p-3 rounded-md border border-gray-200 bg-white hover:border-[#0a66c2] hover:bg-[#fafcff] transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-7 w-7 rounded bg-gray-100 text-gray-700 flex items-center justify-center border border-gray-200 group-hover:bg-[#ebf3fb] group-hover:text-[#0a66c2] group-hover:border-[#b2d5f8] transition-colors">
                      <Icon size={14} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                      {act.badgeText}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-gray-900 group-hover:text-[#0a66c2] transition-colors">
                    {act.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-[#0a66c2]">
                  <span>Open</span>
                  <ArrowRight
                    size={11}
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
