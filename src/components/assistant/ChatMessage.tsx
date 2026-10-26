"use client";

import { useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Bot,
  Brain,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
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
  const [showReasoning, setShowReasoning] = useState(false);
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
        <div className="space-y-1.5 max-w-[85%] sm:max-w-[75%]">
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 mb-1.5">
              {message.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-[#E7E7E7] bg-white shadow-2xs max-w-[200px] max-h-[160px]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Attached upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="bg-[#090909] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-xs leading-relaxed shadow-xs">
            <p className="whitespace-pre-wrap text-white !text-white">{message.content}</p>
          </div>
          <div className="flex justify-end items-center gap-1.5 px-1 text-[10px] text-[#737373]">
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
      <div className="h-7 w-7 rounded-lg bg-[#090909] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
        <Sparkles size={14} />
      </div>

      <div className="space-y-2.5 max-w-[90%] sm:max-w-[85%]">
        {/* Assistant Bubble */}
        <div className="bg-white border border-[#E7E7E7] rounded-2xl rounded-tl-sm p-4 sm:p-5 text-xs text-[#090909] leading-relaxed shadow-xs space-y-3">
          {/* Header row in bubble */}
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7] text-[11px]">
            <div className="flex items-center gap-1.5 font-semibold text-[#090909]">
              <Bot size={13} className="text-[#090909]" />
              <span>Career Assistant</span>
              <span className="text-[10px] font-medium text-[#737373] bg-[#F4F4F4] border border-[#E7E7E7] px-2 py-0.5 rounded-full">
                Alumni Intelligence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#737373] text-[10px]">{message.timestamp}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-[#737373] hover:text-[#090909] rounded hover:bg-[#F4F4F4] transition-colors"
                title="Copy response"
                aria-label="Copy response text"
              >
                {copied ? <Check size={12} className="text-[#090909]" /> : <Copy size={12} />}
              </button>
            </div>
          </div>

          {/* Claude-like Dynamic Thinking Accordion */}
          {message.reasoning && (
            <div className="border border-[#E7E7E7] bg-[#FAFAFA] rounded-xl overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setShowReasoning(!showReasoning)}
                className="w-full flex items-center justify-between px-3 py-2 text-[#737373] hover:text-[#090909] hover:bg-[#F0F0F0] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Brain size={13} className="text-[#090909] shrink-0" />
                  <span className="font-semibold text-[11px] text-[#090909]">
                    {message.thinkingDurationSeconds
                      ? `Thought for ${message.thinkingDurationSeconds}s`
                      : "Reasoning Process"}
                  </span>
                </div>
                {showReasoning ? (
                  <ChevronDown size={13} className="shrink-0" />
                ) : (
                  <ChevronRight size={13} className="shrink-0" />
                )}
              </button>
              {showReasoning && (
                <div className="px-3 pb-3 pt-1.5 border-t border-[#E7E7E7] text-[11px] text-[#555555] font-mono whitespace-pre-wrap leading-relaxed bg-white">
                  {message.reasoning}
                </div>
              )}
            </div>
          )}

          {/* Formatted Rich Markdown Content */}
          <div className="text-xs text-[#090909] leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-base font-bold text-[#090909] mt-3.5 mb-1.5 pb-1 border-b border-[#E7E7E7]">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-sm font-bold text-[#090909] mt-3 mb-1 text-inherit">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xs font-bold text-[#090909] mt-2.5 mb-1 text-inherit">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-[11px] font-bold text-[#090909] mt-2 mb-0.5 text-inherit">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="my-1.5 leading-relaxed text-[#090909]">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-4 space-y-1 my-2 text-[#090909]">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-4 space-y-1 my-2 text-[#090909]">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="leading-relaxed text-[#090909]">{children}</li>
                ),
                strong: ({ children }) => (
                  <strong className="font-bold text-[#090909]">{children}</strong>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-[#090909] pl-3 py-1 my-2.5 italic text-[#454545] bg-[#FAFAFA] rounded-r-md">
                    {children}
                  </blockquote>
                ),
                code: ({ className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  const isInline = !match && !String(children).includes("\n");
                  return isInline ? (
                    <code
                      className="bg-[#F4F4F4] text-[#090909] px-1.5 py-0.5 rounded text-[11px] font-mono border border-[#E7E7E7]"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre className="bg-[#18181B] text-[#FAFAFA] p-3 rounded-xl overflow-x-auto text-[11px] font-mono my-2.5 border border-[#27272A] leading-relaxed">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-2.5 rounded-lg border border-[#E7E7E7]">
                    <table className="w-full text-left border-collapse text-xs">
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children }) => (
                  <th className="border-b border-[#E7E7E7] bg-[#F4F4F4] px-3 py-1.5 font-bold text-[#090909]">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="border-b border-[#E7E7E7] px-3 py-1.5 text-[#090909]">
                    {children}
                  </td>
                ),
                hr: () => <hr className="my-3 border-[#E7E7E7]" />,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#090909] underline font-semibold hover:text-[#555555] transition-colors"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Action Links / Shortcuts */}
          {message.suggestedActions && message.suggestedActions.length > 0 && (
            <div className="pt-2 border-t border-[#E7E7E7] flex flex-wrap gap-2">
              {message.suggestedActions.map((action, idx) => (
                <Link
                  key={idx}
                  href={action.href || "#"}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F4F4F4] border border-[#E7E7E7] hover:border-[#090909] rounded-full text-xs font-semibold text-[#090909] transition-colors shadow-xs"
                >
                  <span>{action.label}</span>
                  <ExternalLink size={11} className="text-[#737373]" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        {message.suggestions && message.suggestions.length > 0 && onSelectSuggestion && (
          <div className="space-y-1.5 pl-1">
            <p className="text-[11px] font-semibold text-[#737373]">Suggested follow-ups:</p>
            <div className="flex flex-wrap gap-1.5">
              {message.suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="text-[11px] font-medium text-[#090909] bg-white hover:bg-[#F4F4F4] border border-[#E7E7E7] hover:border-[#090909] rounded-full px-3 py-1 transition-colors text-left shadow-xs"
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
