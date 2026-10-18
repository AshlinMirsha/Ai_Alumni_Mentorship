"use client";

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Building2,
  Sparkles,
  ExternalLink,
  CheckCheck,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Conversation, Message } from "@/types";

interface ConversationViewProps {
  conversation: Conversation | null;
  currentUserId: string;
  onSendMessage: (conversationId: string, content: string) => void;
  onBackMobile?: () => void;
}

export function ConversationView({
  conversation,
  currentUserId,
  onSendMessage,
  onBackMobile,
}: ConversationViewProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#f3f5f7] text-center">
        <div className="h-12 w-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-400 mb-3 shadow-xs">
          <Sparkles size={20} className="text-[#0a66c2]" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1">
          Select a Conversation
        </h3>
        <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
          Choose a conversation from the left to read messages or send a reply.
        </p>
      </div>
    );
  }

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(conversation.id, inputText.trim());
    setInputText("");
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
        120
      )}px`;
    }
  };

  const isAlumni = !conversation.participantId.startsWith("s-");
  const profileUrl = isAlumni ? `/alumni/${conversation.participantId}` : undefined;

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header Bar */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between gap-3 bg-white shrink-0">
        <div className="flex items-center gap-2.5">
          {onBackMobile && (
            <button
              type="button"
              onClick={onBackMobile}
              className="lg:hidden p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              aria-label="Back to conversations list"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <Avatar name={conversation.participantName} size="md" />

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-bold text-gray-900">
                {conversation.participantName}
              </h2>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#057642]" />
                Connected
              </span>
            </div>
            <p className="text-[11px] text-gray-500 flex items-center gap-1">
              <span>{conversation.participantRole}</span>
              <span className="text-gray-300">·</span>
              <span className="inline-flex items-center gap-1 text-gray-500">
                <Building2 size={10} className="text-gray-400" />
                {conversation.participantCompany}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {profileUrl && (
            <Link
              href={profileUrl}
              className="px-2.5 py-1 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Profile</span>
              <ExternalLink size={10} className="text-gray-400" />
            </Link>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f3f5f7]/60">
        {conversation.messages.length > 0 ? (
          conversation.messages.map((msg: Message) => {
            const isMe = msg.senderId === currentUserId;
            const isSystem = msg.senderId === "system";

            if (isSystem) {
              return (
                <div key={msg.id} className="py-1 text-center">
                  <span className="inline-block px-2.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[11px] text-gray-600 font-medium">
                    {msg.content}
                  </span>
                </div>
              );
            }

            const timeStr = msg.timestamp
              ? new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Just now";

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                  {!isMe && (
                    <Avatar
                      name={msg.senderName}
                      size="sm"
                      className="shrink-0 mb-1"
                    />
                  )}

                  <div
                    className={`rounded-lg px-3.5 py-2 text-xs leading-relaxed ${
                      isMe
                        ? "bg-[#0a66c2] text-white shadow-xs"
                        : "bg-white text-gray-900 border border-gray-200 shadow-xs"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-1 mt-0.5 text-[10px] text-gray-400">
                  <span>{timeStr}</span>
                  {isMe && (
                    <span title="Delivered">
                      <CheckCheck size={11} className="text-[#0a66c2]" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center text-xs text-gray-400">
            No messages yet. Send an opening message below!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Composer Footer */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder={`Write a message to ${conversation.participantName.split(" ")[0]}...`}
            className="flex-1 resize-none bg-white border border-gray-300 rounded-md px-3 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] max-h-32 transition-all leading-relaxed"
          />

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!inputText.trim()}
            className="h-8 px-3.5 text-xs font-semibold inline-flex items-center gap-1.5 shrink-0"
          >
            <Send size={12} />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </form>

        <div className="flex items-center justify-between pt-1.5 px-1 text-[10px] text-gray-400">
          <span className="hidden sm:inline">
            Press <strong>Enter ↵</strong> to send, <strong>Shift + Enter</strong> for newline
          </span>
          <span className="sm:hidden">Tap Send to submit</span>
          <span className="text-gray-400">Direct Mentorship Chat</span>
        </div>
      </div>
    </div>
  );
}
