"use client";

import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
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

  // Color coding based on calculated percentage
  const getProgressColor = (pct: number) => {
    if (pct >= 85) return "bg-emerald-500";
    if (pct >= 60) return "bg-blue-600";
    return "bg-amber-500";
  };

  return (
    <div className="bg-gray-50/70 border border-gray-200/80 rounded-lg p-3.5 sm:p-4">
      {/* Top summary header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-900">Profile Strength</span>
          <span className="text-[11px] text-gray-500">
            ({completedCount}/{totalCount} completed)
          </span>
        </div>
        <span className="text-xs font-bold text-gray-900">{percent}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-2.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percent)}`}
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Subtext and toggle */}
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span>
          {percent === 100
            ? "Your profile is fully complete!"
            : `${completion.missingCount} field${completion.missingCount > 1 ? "s" : ""} left to optimize matches`}
        </span>

        {!compact && (
          <button
            type="button"
            onClick={() => setShowDetails((p) => !p)}
            className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            <span>{showDetails ? "Hide breakdown" : "View breakdown"}</span>
            {showDetails ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        )}
      </div>

      {/* Detailed checklist derived from actual fields */}
      {showDetails && !compact && (
        <div className="mt-3.5 pt-3 border-t border-gray-200 space-y-2">
          <p className="text-[11px] font-medium text-gray-700 flex items-center gap-1 mb-2">
            <Sparkles size={12} className="text-blue-500" />
            Field-by-field profile verification:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-white transition-colors"
              >
                <div className="flex items-center gap-2">
                  {item.completed ? (
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={14} className="text-gray-300 shrink-0" />
                  )}
                  <span className={item.completed ? "text-gray-800" : "text-gray-500"}>
                    {item.label}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono ${
                    item.completed ? "text-emerald-700 font-medium" : "text-gray-400"
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
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium underline block"
            >
              Update fields in Edit Profile &rarr;
            </button>
          )}
        </div>
      )}
    </div>
  );
}
