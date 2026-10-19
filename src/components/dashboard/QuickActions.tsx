"use client";

import Link from "next/link";
import { MessageSquare, Sparkles, FileText, Users, ChevronRight } from "lucide-react";

export function QuickActions() {
  const links = [
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      title: "AI Career Assistant",
      href: "/career-assistant",
      icon: Sparkles,
    },
    {
      title: "Resume Review",
      href: "/resume-review",
      icon: FileText,
    },
    {
      title: "Discover Alumni",
      href: "/alumni",
      icon: Users,
    },
  ];

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs">
      <h3 className="text-sm font-bold text-[#111827] pb-3 border-b border-[#F3F4F6] mb-2">
        Quick Access
      </h3>

      <div className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between p-2.5 -mx-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={15}
                  className="text-[#6B7280] group-hover:text-[#1E40AF] transition-colors shrink-0"
                />
                <span className="text-xs font-medium text-[#374151] group-hover:text-[#111827] transition-colors">
                  {item.title}
                </span>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
