"use client";

import Link from "next/link";
import { MessageSquare, Sparkles, FileText, Users, ChevronRight } from "lucide-react";

export function QuickActions() {
  const links = [
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
      badge: "1",
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
    <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
      <h3 className="text-sm font-bold text-[#090909] pb-3 border-b border-[#E7E7E7] mb-2">
        Quick Access
      </h3>

      <div className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between p-2.5 -mx-1.5 rounded-xl hover:bg-[#F4F4F4] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={15}
                  className="text-[#737373] group-hover:text-[#090909] transition-colors shrink-0"
                />
                <span className="text-xs font-medium text-[#242424] group-hover:text-[#090909] transition-colors">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#090909] text-white">
                    {item.badge}
                  </span>
                )}
                <ChevronRight
                  size={14}
                  className="text-[#A8A8A8] group-hover:text-[#090909] group-hover:translate-x-0.5 transition-all shrink-0"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
