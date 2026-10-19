"use client";

import { Activity, UserCheck, Sparkles, Map, Send, Info } from "lucide-react";
import { demoRecentActivities } from "@/lib/mock-data";
import type { DemoActivity } from "@/types";

interface RecentActivityProps {
  activities?: DemoActivity[];
}

export function RecentActivity({ activities = demoRecentActivities }: RecentActivityProps) {
  const visibleActivities = activities.filter((item) => item.type !== "mentorship").slice(0, 3);

  const getIcon = (type: DemoActivity["type"]) => {
    switch (type) {
      case "profile":
        return <UserCheck size={12} className="text-[#2166A5]" />;
      case "match":
        return <Sparkles size={12} className="text-[#915907]" />;
      case "roadmap":
        return <Map size={12} className="text-[#2166A5]" />;
      case "mentorship":
        return <Send size={12} className="text-[#057642]" />;
    }
  };

  const getTagColor = (type: DemoActivity["type"]) => {
    switch (type) {
      case "profile":
        return "bg-[#F0F5FA] text-[#2166A5] border-[#D0E0EF]";
      case "match":
        return "bg-[#FFF8EA] text-[#915907] border-[#FDE5B2]";
      case "roadmap":
        return "bg-[#F5F7FA] text-[#374151] border-[#E1E5EA]";
      case "mentorship":
        return "bg-[#EEF8F1] text-[#057642] border-[#BFE3C9]";
    }
  };

  return (
    <div className="bg-white border border-[#E1E5EA] rounded-[12px] p-4 sm:p-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E1E5EA] mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[6px] bg-[#F0F5FA] text-[#2166A5] flex items-center justify-center border border-[#D0E0EF]">
            <Activity size={14} />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#191919]">Recent Activity</h2>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F5F7FA] text-[#626262] border border-[#E1E5EA]">
          <Info size={10} className="text-[#8C8C8C]" />
          Demo Log
        </span>
      </div>

      <div className="space-y-2">
        {visibleActivities.map((item) => (
          <div
            key={item.id}
            className="p-2.5 rounded-[8px] border border-[#E1E5EA] bg-white hover:border-[#C5C9CE] transition-colors flex items-start gap-2.5"
          >
            <div className="h-6 w-6 rounded-full bg-[#F5F7FA] border border-[#E1E5EA] flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-[#191919] truncate">{item.title}</h3>
                <span className="text-[10px] text-[#8C8C8C] shrink-0 font-medium">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-[#626262] mt-0.5 leading-snug line-clamp-2">{item.description}</p>
              {item.tag && (
                <span
                  className={`inline-block mt-1.5 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getTagColor(
                    item.type
                  )}`}
                >
                  {item.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
