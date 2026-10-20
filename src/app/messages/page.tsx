"use client";

import { useState, useMemo, useSyncExternalStore, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Users, ShieldCheck } from "lucide-react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { ConversationList } from "@/components/messages/ConversationList";
import { ConversationView } from "@/components/messages/ConversationView";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  loadAlumniProfile,
  loadAuthSession,
  loadConversations,
  sendConversationMessage,
  markConversationAsRead,
  defaultStudentSession,
} from "@/lib/dashboard-storage";
import { currentStudent, defaultAlumniUser, initialMentorshipActivity } from "@/lib/mock-data";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authSession = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAuthSession,
    () => defaultStudentSession
  );
  const isAlumni = authSession.role === "alumni";

  const student = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadStudentProfile,
    () => currentStudent
  );

  const alumni = useSyncExternalStore(
    subscribeToDashboardStorage,
    loadAlumniProfile,
    () => defaultAlumniUser
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
    <div className="min-h-screen bg-[#FAFAFA] flex antialiased text-[#090909]">
      {/* App Sidebar (Desktop) */}
      <AppSidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
          <div className="relative w-64 h-full bg-white">
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title="Direct Advisory Messages"
          subtitle="Real-time collegiate mentorship with active alumni and mentees"
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-[#E7E7E7]">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F4F4F4] text-[#090909] border border-[#E7E7E7]">
                <ShieldCheck size={12} className="text-[#090909]" />
                Institutional Verification Active
              </span>
              <span className="text-xs text-[#737373]">·</span>
              <span className="text-xs font-medium text-[#737373]">
                {conversations.length} Active Conversations
              </span>
            </div>

            <Link
              href="/alumni"
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#E7E7E7] hover:bg-[#F4F4F4] text-xs font-semibold text-[#090909] inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-xs"
            >
              <Users size={12} />
              <span>Discover Mentors</span>
            </Link>
          </div>

          {/* Split Pane Container (Matching Reference 2 bottom half) */}
          <div className="bg-white rounded-2xl border border-[#E7E7E7] shadow-xs flex-1 flex overflow-hidden min-h-[580px] max-h-[780px]">
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
                currentUserId={isAlumni ? alumni.id : student.id}
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
      </div>
    </div>
  );
}
