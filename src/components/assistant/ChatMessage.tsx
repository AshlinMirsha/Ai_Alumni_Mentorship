"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Copy, Check, ExternalLink, Bot } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { AssistantMessage } from "@/types";

interface ChatMessageProps {
  message: AssistantMessage;
  studentName?: string;
  onSelectSuggestion?: (suggestion: string) => void;
}

export function ChatMessage({
  message,
  studentName = "Ashlin",
  onSelectSuggestion,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 max-w-3xl ml-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="space-y-1 max-w-[85%] sm:max-w-[75%]">
          <div className="bg-[#0a66c2] text-white rounded-lg px-4 py-2.5 text-xs leading-relaxed shadow-xs">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="flex justify-end items-center gap-1.5 px-1 text-[10px] text-[#666666]">
            <span>{message.timestamp}</span>
            <span>·</span>
            <span>{studentName}</span>
          </div>
        </div>
        <Avatar name={studentName} size="sm" className="shrink-0 mt-0.5" />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 max-w-3xl mr-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
      <div className="h-7 w-7 rounded-lg bg-[#ebf3fb] border border-[#0a66c2]/20 flex items-center justify-center text-[#0a66c2] shrink-0 mt-0.5 shadow-xs">
        <Sparkles size={14} />
      </div>

      <div className="space-y-2.5 max-w-[90%] sm:max-w-[85%]">
        {/* Assistant Bubble */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 text-xs text-[#191919] leading-relaxed shadow-xs space-y-3">
          {/* Header row in bubble */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold text-[#191919]">
              <Bot size={13} className="text-[#0a66c2]" />
              <span>Career Assistant</span>
              <span className="text-[10px] font-medium text-[#0a66c2] bg-[#ebf3fb] border border-[#0a66c2]/20 px-2 py-0.2 rounded-full">
                Demo Engine
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#8c8c8c] text-[10px]">{message.timestamp}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-50 transition-colors"
                title="Copy response"
                aria-label="Copy response text"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Formatted Content */}
          <div className="prose prose-xs max-w-none text-[#191919] space-y-2 whitespace-pre-line leading-relaxed">
            {message.content}
          </div>

          {/* Action Links / Shortcuts */}
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
              {message.suggestedActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href || "#"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#ebf3fb] border border-gray-200 hover:border-[#0a66c2]/30 rounded-full text-xs font-semibold text-[#191919] hover:text-[#0a66c2] transition-colors shadow-xs"
                >
                  <span>{action.label}</span>
                  <ExternalLink size={11} className="text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {message.suggestions && message.suggestions.length > 0 && onSelectSuggestion && (
          <div className="space-y-1.5 pl-1">
            <p className="text-[11px] font-semibold text-[#666666]">Suggested follow-ups:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="text-[11px] font-medium text-[#191919] bg-white hover:bg-[#ebf3fb] border border-gray-200 hover:border-[#0a66c2]/40 rounded-full px-3 py-1 transition-colors text-left shadow-xs"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
