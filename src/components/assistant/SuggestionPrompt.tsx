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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#090909] hover:text-white bg-white hover:bg-[#090909] border border-[#E7E7E7] hover:border-[#090909] rounded-full transition-all text-left shadow-xs"
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
      className="group p-3.5 bg-white hover:bg-[#FAFAFA] border border-[#E7E7E7] hover:border-[#090909] rounded-xl transition-all duration-150 text-left flex items-start justify-between gap-3 shadow-xs w-full"
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7] shrink-0 group-hover:bg-[#090909] group-hover:text-white transition-colors">
            {icon}
          </div>
        )}
        <div className="space-y-0.5">
          <p className="text-xs font-semibold text-[#090909] transition-colors">
            {title}
          </p>
          {description && (
            <p className="text-[11px] text-[#737373] leading-normal line-clamp-2">
              {description}
            </p>
          )}
        </div>
      </div>
      <ArrowRight
        size={14}
        className="text-[#737373] group-hover:text-[#090909] group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
      />
    </button>
  );
}
