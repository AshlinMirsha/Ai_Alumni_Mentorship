"use client";

import { useState, useEffect, type FormEvent } from "react";
import {
  X,
  Send,
  MessageSquare,
  Lock,
  Sparkles,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { Alumni, Conversation } from "@/types";

interface SendMessageModalProps {
  alumni: Alumni & { experienceYears?: string };
  isOpen: boolean;
  onClose: () => void;
  isAccepted: boolean;
  isPending: boolean;
  onOpenMentorshipRequest: () => void;
  onSendMessage?: (conversation: Conversation) => void;
}

export function SendMessageModal({
  alumni,
  isOpen,
  onClose,
  isAccepted,
  isPending,
  onOpenMentorshipRequest,
  onSendMessage,
}: SendMessageModalProps) {
  const [messageText, setMessageText] = useState("");
  const [sentSuccess, setSentSuccess] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSend = (e: FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    if (onSendMessage) {
      const nowIso = new Date().toISOString();
      const convId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        participantId: alumni.id,
        participantName: alumni.name,
        participantAvatar: alumni.avatar,
        participantRole: alumni.role,
        participantCompany: alumni.company,
        lastMessage: messageText,
        lastMessageAt: nowIso,
        unreadCount: 0,
        messages: [
          {
            id: `msg-${Date.now()}`,
            conversationId: convId,
            senderId: "s-001",
            senderName: "Ashlin",
            content: messageText,
            timestamp: nowIso,
            read: true,
          },
        ],
      };
      onSendMessage(newConv);
    }

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setMessageText("");
      onClose();
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="message-modal-title"
    >
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-blue-600" />
            <h2 id="message-modal-title" className="text-base font-bold text-gray-900">
              {isAccepted ? `Message ${alumni.name}` : "Direct Messaging Restricted"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {isAccepted ? (
          /* Active Mentorship Conversation Flow */
          sentSuccess ? (
            <div className="p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Message Delivered!</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Your message has been sent to <strong>{alumni.name}</strong> as part of your active mentorship thread.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-emerald-50/70 border border-emerald-100 rounded-lg">
                <Avatar name={alumni.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900">{alumni.name}</p>
                  <p className="text-[11px] text-emerald-700 font-medium">
                    Active Mentorship Partner
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="mentor-message-text" className="text-xs font-semibold text-gray-700">
                  Your Message
                </label>
                <textarea
                  id="mentor-message-text"
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Write your message or question for ${alumni.name.split(" ")[0]}...`}
                  required
                  className="w-full rounded-md border border-gray-200 bg-white text-xs text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" className="inline-flex items-center gap-1.5">
                  <Send size={13} />
                  Send Message
                </Button>
              </div>
            </form>
          )
        ) : (
          /* Unlinked/Unauthorized Messaging Explanation */
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900">
              <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold">Mentorship Required for Direct Messaging</p>
                <p className="text-amber-800 leading-relaxed">
                  To protect alumni schedules and ensure meaningful mentorship relationships, direct messaging is enabled exclusively between accepted mentors and mentees.
                </p>
              </div>
            </div>

            <div className="text-xs text-gray-600 space-y-2">
              <p>
                {isPending ? (
                  <span className="flex items-center gap-1.5 text-amber-700 font-medium">
                    <Clock size={13} />
                    You have a pending mentorship request with {alumni.name}. Direct messaging will automatically unlock once accepted.
                  </span>
                ) : (
                  <span>
                    Submit a mentorship request to introduce yourself and establish an initial connection with {alumni.name}.
                  </span>
                )}
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
              {!isPending && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onClose();
                    onOpenMentorshipRequest();
                  }}
                  className="inline-flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  Request Mentorship
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
