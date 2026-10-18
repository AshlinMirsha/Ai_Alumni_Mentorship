"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

interface SuggestionPromptProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  onClick: () => void;
  variant?: "card" | "chip";
}

export function SuggestionPrompt({
  icon,
  title,
  description,
  onClick,
  variant = "card",
}: SuggestionPromptProps) {
  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200/80 rounded-full transition-colors text-left"
      >
        {icon}
        <span>{title}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group p-4 bg-white hover:bg-blue-50/40 border border-gray-200 hover:border-blue-300 rounded-xl transition-all duration-150 text-left flex items-start justify-between gap-3 shadow-2xs hover:shadow-xs w-full"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 shrink-0 group-hover:bg-blue-100 transition-colors">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
            {title}
          </p>
          {description && (
            <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
      <ArrowRight
        size={14}
        className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-2"
      />
    </button>
  );
}
