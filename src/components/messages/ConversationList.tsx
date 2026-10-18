"use client";

import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Conversation } from "@/types";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: ConversationListProps) {
  const filtered = conversations.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.participantName.toLowerCase().includes(q) ||
      c.participantRole.toLowerCase().includes(q) ||
      c.participantCompany.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Search Bar */}
      <div className="p-3.5 border-b border-gray-200">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
        {filtered.length > 0 ? (
          filtered.map((conv) => {
            const isSelected = conv.id === selectedId;
            const hasUnread = conv.unreadCount > 0;
            const dateStr = conv.lastMessageAt
              ? new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })
              : "Recent";

            return (
              <button
                key={conv.id}
                type="button"
                onClick={() => onSelect(conv.id)}
                className={`w-full text-left p-3.5 sm:p-4 flex items-start gap-3 transition-colors ${
                  isSelected
                    ? "bg-blue-50/70 border-l-3 border-l-blue-600"
                    : "hover:bg-gray-50/80"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={conv.participantName} size="md" />
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-blue-600 rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                      className={`text-xs truncate ${
                        hasUnread ? "font-bold text-gray-900" : "font-semibold text-gray-800"
                      }`}
                    >
                      {conv.participantName}
                    </p>
                    <span className="text-[10px] text-gray-400 shrink-0">{dateStr}</span>
                  </div>

                  <p className="text-[11px] text-gray-500 truncate mb-1">
                    {conv.participantRole} · {conv.participantCompany}
                  </p>

                  <p
                    className={`text-xs truncate leading-snug ${
                      hasUnread ? "font-semibold text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {conv.lastMessage || "No messages yet."}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-700">No conversations found</p>
            <p className="text-[11px]">
              {searchQuery ? "Try a different search query" : "Active mentorships will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
