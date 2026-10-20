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
    <div className="flex flex-col h-full bg-white border-r border-[#E7E7E7]">
      {/* Search Bar */}
      <div className="p-3 border-b border-[#E7E7E7]">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#F4F4F4] border border-transparent rounded-full text-xs text-[#090909] placeholder-[#737373] focus:outline-none focus:bg-white focus:border-[#090909] transition-all"
          />
        </div>
      </div>

      {/* Conversations Scrollable List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#E7E7E7]">
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
                className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#F4F4F4] border-l-4 border-l-[#090909]"
                    : "hover:bg-[#FAFAFA]"
                }`}
              >
                <div className="relative shrink-0">
                  <Avatar name={conv.participantName} size="md" />
                  {hasUnread && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#090909] rounded-full ring-2 ring-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p
                      className={`text-xs truncate ${
                        hasUnread ? "font-bold text-[#090909]" : "font-semibold text-[#242424]"
                      }`}
                    >
                      {conv.participantName}
                    </p>
                    <span className="text-[10px] text-[#737373] shrink-0">{dateStr}</span>
                  </div>

                  <p className="text-[11px] text-[#737373] truncate mb-0.5">
                    {conv.participantRole} · {conv.participantCompany}
                  </p>

                  <p
                    className={`text-xs truncate leading-snug ${
                      hasUnread ? "font-semibold text-[#090909]" : "text-[#555555]"
                    }`}
                  >
                    {conv.lastMessage || "No messages yet."}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-[#737373] space-y-1">
            <p className="font-semibold text-[#090909]">No conversations found</p>
            <p className="text-[11px]">
              {searchQuery ? "Try a different search query" : "Active mentorships will appear here."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
