"use client";

import { Activity, UserCheck, Sparkles, Map, Send, Info } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { demoRecentActivities } from "@/lib/mock-data";
import type { DemoActivity } from "@/types";

interface RecentActivityProps {
  activities?: DemoActivity[];
}

export function RecentActivity({ activities = demoRecentActivities }: RecentActivityProps) {
  const getIcon = (type: DemoActivity["type"]) => {
    switch (type) {
      case "profile":
        return <UserCheck size={13} className="text-blue-600" />;
      case "match":
        return <Sparkles size={13} className="text-amber-600" />;
      case "roadmap":
        return <Map size={13} className="text-indigo-600" />;
      case "mentorship":
        return <Send size={13} className="text-emerald-600" />;
    }
  };

  const getTagColor = (type: DemoActivity["type"]) => {
    switch (type) {
      case "profile":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "match":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "roadmap":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "mentorship":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  return (
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-3 mb-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900">Recent Activity</h2>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
          <Info size={11} className="text-gray-400" />
          Demo Records
        </span>
      </CardHeader>

      <CardBody className="space-y-3">
        <div className="space-y-2.5">
          {activities.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-lg border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors flex items-start gap-3"
            >
              <div className="h-7 w-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                {getIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs font-bold text-gray-900">{item.title}</h3>
                  <span className="text-[10px] text-gray-400 font-medium shrink-0">
                    {item.timestamp}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5 leading-snug">{item.description}</p>
                {item.tag && (
                  <span
                    className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium border ${getTagColor(
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

        {/* Clear disclaimer */}
        <p className="text-[11px] text-gray-400 pt-1 leading-normal italic">
          Note: This list contains illustrative demo activity logs for platform preview.
        </p>
      </CardBody>
    </Card>
  );
}
