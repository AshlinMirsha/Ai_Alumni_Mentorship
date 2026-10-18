"use client";

import { useState, useMemo, useSyncExternalStore, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, Sparkles, ShieldCheck } from "lucide-react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { ConversationList } from "@/components/messages/ConversationList";
import { ConversationView } from "@/components/messages/ConversationView";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadConversations,
  sendConversationMessage,
  markConversationAsRead,
} from "@/lib/dashboard-storage";
import { currentStudent, initialMentorshipActivity } from "@/lib/mock-data";

function MessagesQueryHandler({
  onSelectConversation,
  conversations,
}: {
  onSelectConversation: (id: string) => void;
  conversations: { id: string; participantId: string }[];
}) {
  const searchParams = useSearchParams();
  const convId = searchParams.get("conversationId");
  const partId = searchParams.get("participantId");
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;

    if (convId) {
      const match = conversations.find((c) => c.id === convId);
      if (match) {
        handledRef.current = true;
        onSelectConversation(match.id);
      }
    } else if (partId) {
      const match = conversations.find((c) => c.participantId === partId);
      if (match) {
        handledRef.current = true;
        onSelectConversation(match.id);
      }
    }
  }, [convId, partId, conversations, onSelectConversation]);

  return null;
}

export default function MessagesPage() {
  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const conversations = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadConversations,
    () => initialMentorshipActivity.recentConversations
  );

  const [selectedConvId, setSelectedConvId] = useState<string | null>(
    conversations[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === selectedConvId) || conversations[0] || null;
  }, [conversations, selectedConvId]);

  const handleSelect = (id: string) => {
    setSelectedConvId(id);
    setShowMobileChat(true);
    markConversationAsRead(id);
  };

  const handleSendMessage = (conversationId: string, content: string) => {
    sendConversationMessage(conversationId, content);
  };

  return (
    <div className="min-h-screen bg-[#f3f5f7] flex flex-col antialiased">
      <DashboardNav studentName={student.name} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
        {/* Compact Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-md bg-[#0a66c2] flex items-center justify-center text-white shrink-0 shadow-xs">
                <MessageSquare size={15} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                Messages
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                <ShieldCheck size={11} className="text-[#057642]" />
                Mentorship Verified
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Direct communication with your accepted alumni mentors and student connections.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/mentorship"
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold transition-colors inline-flex items-center gap-1"
            >
              <span>Manage Requests</span>
            </Link>
            <Link
              href="/alumni"
              className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-blue-600 font-semibold transition-colors inline-flex items-center gap-1"
            >
              <Users size={12} />
              <span>Browse Mentors</span>
            </Link>
          </div>
        </div>

        {/* Access Rules & Notice */}
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md mb-4 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-[#0a66c2] shrink-0" />
            <span>
              <strong>Access Policy:</strong> Direct messaging is unlocked once a mentorship connection is accepted.
            </span>
          </div>
        </div>

        {/* Messaging Layout: 2-Column Desktop, Stacked Mobile */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs flex-1 flex overflow-hidden min-h-[580px] max-h-[780px]">
          {/* Left Column: Conversation List */}
          <div
            className={`w-full lg:w-80 shrink-0 ${
              showMobileChat ? "hidden lg:flex" : "flex"
            } flex-col`}
          >
            <ConversationList
              conversations={conversations}
              selectedId={activeConversation?.id || null}
              onSelect={handleSelect}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          </div>

          {/* Right Column: Active Conversation */}
          <div
            className={`flex-1 ${
              showMobileChat ? "flex" : "hidden lg:flex"
            } flex-col`}
          >
            <ConversationView
              conversation={activeConversation}
              currentUserId={student.id}
              onSendMessage={handleSendMessage}
              onBackMobile={() => setShowMobileChat(false)}
            />
          </div>
        </div>

        <Suspense fallback={null}>
          <MessagesQueryHandler
            onSelectConversation={handleSelect}
            conversations={conversations}
          />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© 2026 AlumniPath · AI-Powered Alumni Networking &amp; Career Mentorship</p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
              Student Dashboard
            </Link>
            <Link href="/mentorship" className="hover:text-gray-900 transition-colors">
              Mentorships
            </Link>
            <Link href="/career-roadmap" className="hover:text-gray-900 transition-colors">
              Career Roadmap
            </Link>
            <Link href="/alumni" className="hover:text-gray-900 transition-colors">
              Alumni Directory
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
