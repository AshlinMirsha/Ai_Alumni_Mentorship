"use client";

import { Activity, UserCheck, Sparkles, Map, Send, Info } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { demoRecentActivities } from "@/lib/mock-data";
import type { DemoActivity } from "@/types";

interface RecentActivityProps {
  activities?: DemoActivity[];
}

export function RecentActivity({ activities = demoRecentActivities }: RecentActivityProps) {
  const visibleActivities = activities.filter((item) => item.type !== "mentorship");

  const getIcon = (type: DemoActivity["type"]) => {
    switch (type) {
      case "profile":
        return <UserCheck size={12} className="text-[#0a66c2]" />;
      case "match":
        return <Sparkles size={12} className="text-[#915907]" />;
      case "roadmap":
        return <Map size={12} className="text-[#0a66c2]" />;
      case "mentorship":
        return <Send size={12} className="text-[#057642]" />;
    }
  };

  const getTagColor = (type: DemoActivity["type"]) => {
    switch (type) {
      case "profile":
        return "bg-[#ebf3fb] text-[#0a66c2] border-[#b2d5f8]";
      case "match":
        return "bg-[#fff8ea] text-[#915907] border-[#fde5b2]";
      case "roadmap":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "mentorship":
        return "bg-[#eef8f1] text-[#057642] border-[#bfe3c9]";
    }
  };

  return (
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-2.5 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-[#0a66c2]" />
          <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
        </div>
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <Info size={10} className="text-gray-400" />
          Demo Log
        </span>
      </CardHeader>

      <CardBody className="space-y-2.5">
        <div className="space-y-2">
          {visibleActivities.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-md border border-gray-200 bg-white hover:border-gray-300 transition-colors flex items-start gap-2.5"
            >
              <div className="h-6 w-6 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-gray-900 truncate">{item.title}</h3>
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug">{item.description}</p>
                {item.tag && (
                  <span
                    className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${getTagColor(
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

        <p className="text-[11px] text-gray-400 pt-1 leading-normal italic">
          Sample audit trail for platform preview.
        </p>
      </CardBody>
    </Card>
  );
}
