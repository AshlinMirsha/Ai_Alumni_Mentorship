"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import type { ProfileCompletionResult } from "@/lib/mock-data";

interface ProfileCompletionProps {
  completion: ProfileCompletionResult;
  onOpenEditProfile?: () => void;
  compact?: boolean;
}

export function ProfileCompletion({
  completion,
  onOpenEditProfile,
  compact = false,
}: ProfileCompletionProps) {
  const [showDetails, setShowDetails] = useState(false);
  const { percent, completedCount, totalCount, items } = completion;

  const getProgressColor = (pct: number) => {
    if (pct >= 85) return "bg-[#057642]";
    if (pct >= 60) return "bg-[#0a66c2]";
    return "bg-[#915907]";
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
      {/* Top summary header */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-900">Profile Strength</span>
          <span className="text-[11px] text-gray-500">
            ({completedCount}/{totalCount})
          </span>
        </div>
        <span className="text-xs font-bold text-gray-900">{percent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getProgressColor(percent)}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Subtext and toggle */}
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span className="truncate pr-1">
          {percent === 100
            ? "Profile fully complete"
            : `${completion.missingCount} field${completion.missingCount > 1 ? "s" : ""} left to optimize`}
        </span>

        {!compact && (
          <button
            type="button"
            onClick={() => setShowDetails((p) => !p)}
            className="inline-flex items-center gap-0.5 text-[#0a66c2] hover:text-[#004182] font-semibold shrink-0 cursor-pointer"
          >
            <span>{showDetails ? "Hide" : "Details"}</span>
            {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}
      </div>

      {/* Detailed checklist */}
      {showDetails && !compact && (
        <div className="mt-2.5 pt-2.5 border-t border-gray-200 space-y-1.5">
          <p className="text-[11px] font-semibold text-gray-700 mb-1">
            Required Profile Fields:
          </p>
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-0.5 px-1 rounded hover:bg-white"
              >
                <div className="flex items-center gap-1.5">
                  {item.completed ? (
                    <CheckCircle2 size={13} className="text-[#057642] shrink-0" />
                  ) : (
                    <Circle size={13} className="text-gray-300 shrink-0" />
                  )}
                  <span className={item.completed ? "text-gray-800" : "text-gray-500 text-[11px]"}>
                    {item.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono ${
                    item.completed ? "text-[#057642] font-medium" : "text-gray-400"
                  }`}
                >
                  +{item.points}%
                </span>
              </div>
            ))}
          </div>

          {percent < 100 && onOpenEditProfile && (
            <button
              type="button"
              onClick={onOpenEditProfile}
              className="mt-1.5 text-xs text-[#0a66c2] hover:underline font-semibold block"
            >
              Complete fields in Edit Profile &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
