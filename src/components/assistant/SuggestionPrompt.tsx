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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#191919] hover:text-[#0a66c2] bg-white hover:bg-[#ebf3fb] border border-gray-200 hover:border-[#0a66c2]/40 rounded-full transition-colors text-left shadow-xs"
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
      className="group p-3.5 bg-white hover:bg-[#ebf3fb]/20 border border-gray-200 hover:border-[#0a66c2] rounded-lg transition-all duration-150 text-left flex items-start justify-between gap-3 shadow-xs w-full"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-[#ebf3fb] text-[#0a66c2] border border-[#0a66c2]/20 shrink-0 group-hover:bg-[#0a66c2] group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[#191919] group-hover:text-[#0a66c2] transition-colors">
            {title}
          </p>
          {description && (
            <p className="text-[11px] text-[#666666] leading-normal line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
      <ArrowRight
        size={14}
        className="text-[#8c8c8c] group-hover:text-[#0a66c2] group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
      />
    </button>
  );
}
