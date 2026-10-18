"use client";

import Link from "next/link";
import { Users, Sparkles, FileText, Map, ArrowRight, Zap, Compass, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";

export function QuickActions() {
  const actions = [
    {
      title: "Discover Alumni",
      description: "Browse verified alumni mentors by company, tech stack, and role.",
      href: "/alumni",
      icon: Users,
      badgeText: "Directory",
      colorClass: "bg-blue-50 text-blue-600 border-blue-200 group-hover:bg-blue-600 group-hover:text-white",
    },
    {
      title: "Ask AI Career Assistant",
      description: "Get instant guidance on interview prep, technical roadmaps, and career pivots.",
      href: "/career-assistant",
      icon: Sparkles,
      badgeText: "AI Tool",
      colorClass: "bg-indigo-50 text-indigo-600 border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white",
    },
    {
      title: "My Mentorships",
      description: "Review pending inquiries, accept mentees, and manage your active connections.",
      href: "/mentorship",
      icon: Compass,
      badgeText: "Network",
      colorClass: "bg-purple-50 text-purple-600 border-purple-200 group-hover:bg-purple-600 group-hover:text-white",
    },
    {
      title: "Direct Messages",
      description: "Exchange direct career guidance with your accepted alumni mentors.",
      href: "/messages",
      icon: MessageSquare,
      badgeText: "Chat",
      colorClass: "bg-sky-50 text-sky-600 border-sky-200 group-hover:bg-sky-600 group-hover:text-white",
    },
    {
      title: "Review My Resume",
      description: "Get detailed critique on ATS keywords, quantifiable impact, and formatting.",
      href: "/resume-review",
      icon: FileText,
      badgeText: "Feedback",
      colorClass: "bg-emerald-50 text-emerald-600 border-emerald-200 group-hover:bg-emerald-600 group-hover:text-white",
    },
    {
      title: "View Career Roadmap",
      description: "Track stage-by-stage milestones toward your Full-Stack Engineer goals.",
      href: "/career-roadmap",
      icon: Map,
      badgeText: "Milestones",
      colorClass: "bg-amber-50 text-amber-600 border-amber-200 group-hover:bg-amber-600 group-hover:text-white",
    },
  ];

  return (
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-3 mb-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900">Quick Actions</h2>
        </div>
        <span className="text-xs text-gray-500 font-medium">Tools & Services</span>
      </CardHeader>

      <CardBody>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.href}
                href={act.href}
                className="group p-3.5 rounded-lg border border-gray-200/90 bg-white hover:border-blue-300 hover:shadow-xs transition-all duration-150 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors border ${act.colorClass}`}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {act.badgeText}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
                    <span>{act.title}</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                    {act.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between text-[11px] font-semibold text-blue-600 group-hover:text-blue-700">
                  <span>Launch Tool</span>
                  <ArrowRight
                    size={12}
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
