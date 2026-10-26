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
        return <UserCheck size={12} className="text-[#090909]" />;
      case "match":
        return <Sparkles size={12} className="text-[#090909]" />;
      case "roadmap":
        return <Map size={12} className="text-[#090909]" />;
      case "mentorship":
        return <Send size={12} className="text-[#090909]" />;
    }
  };

  const getTagColor = (_type: DemoActivity["type"]) => {
    return "bg-neutral-100 text-neutral-800 border-neutral-200";
  };

  return (
    <div className="bg-white border border-[#E7E7E7] rounded-2xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7] mb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-[#090909] text-white flex items-center justify-center">
            <Activity size={14} className="text-white" />
          </div>
          <h2 className="text-sm sm:text-base font-bold text-[#090909]">Recent Activity</h2>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
          <Info size={10} className="text-neutral-400" />
          Demo Log
        </span>
      </div>

      <div className="space-y-2">
        {visibleActivities.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl border border-[#E7E7E7] bg-white hover:border-black transition-colors flex items-start gap-3"
          >
            <div className="h-6 w-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(item.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold text-[#090909] truncate">{item.title}</h3>
                <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                  {item.timestamp}
                </span>
              </div>
              <p className="text-xs text-[#737373] mt-0.5 leading-snug line-clamp-2">{item.description}</p>
              {item.tag && (
                <span
                  className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getTagColor(
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
