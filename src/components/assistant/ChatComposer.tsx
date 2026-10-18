"use client";

import { useState, useRef, type KeyboardEvent, type FormEvent } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ChatComposerProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  placeholder?: string;
  initialValue?: string;
}

export function ChatComposer({
  onSendMessage,
  isLoading,
  placeholder = "Ask about skills, projects, internships, or interview preparation...",
  initialValue = "",
}: ChatComposerProps) {
  const [content, setContent] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isLoading) return;
    onSendMessage(content.trim());
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative bg-white border border-gray-300 rounded-lg shadow-xs focus-within:ring-1 focus-within:ring-[#0a66c2] focus-within:border-[#0a66c2] transition-all p-2 sm:p-2.5">
      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          rows={1}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={isLoading}
          className="w-full resize-none bg-transparent text-xs text-[#191919] placeholder-[#8c8c8c] p-2 focus:outline-none max-h-36 overflow-y-auto leading-relaxed"
        />

        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim() || isLoading}
            className="h-8 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin text-white" />
                <span className="hidden sm:inline">Thinking...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 pt-1.5 border-t border-gray-100 text-[10px] text-[#8c8c8c]">
        <span className="hidden sm:inline">
          Press <strong>Enter ↵</strong> to send, <strong>Shift + Enter</strong> for a new line
        </span>
        <span className="sm:hidden">
          Tap Send to submit
        </span>
        <span className="flex items-center gap-1 text-[#666666]">
          <Sparkles size={11} className="text-[#0a66c2]" />
          Demo Career Provider
        </span>
      </div>
    </form>
  );
}
