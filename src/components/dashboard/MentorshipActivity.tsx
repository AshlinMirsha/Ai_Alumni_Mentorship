"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Clock,
  CheckCircle2,
  MessageCircle,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import type { MentorshipActivityData, Mentorship, Conversation } from "@/types";
import { formatDate } from "@/lib/utils";

interface MentorshipActivityProps {
  activityData: MentorshipActivityData;
  onClearActivity?: () => void;
  onResetActivity?: () => void;
}

type TabType = "all" | "pending" | "accepted" | "conversations";

export function MentorshipActivity({
  activityData,
  onClearActivity,
  onResetActivity,
}: MentorshipActivityProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const { pendingRequests, acceptedMentorships, recentConversations } = activityData;

  const totalCount =
    pendingRequests.length + acceptedMentorships.length + recentConversations.length;

  const isEmpty = totalCount === 0;

  return (
    <Card padding="md" className="border-[#E7E7E7] rounded-2xl shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-2.5 mb-3 flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-neutral-900" />
          <div>
            <h2 className="text-sm font-bold text-gray-900">Mentorship Activity</h2>
            <p className="text-xs text-gray-500">
              Active connections, pending requests, and messages
            </p>
          </div>
        </div>

        {/* Demo Controls */}
        <div className="flex items-center gap-2 text-xs">
          {isEmpty ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetActivity}
              className="h-7 text-xs rounded-full border-neutral-200"
            >
              <RotateCcw size={11} className="mr-1" />
              Restore Demo Activity
            </Button>
          ) : (
            <button
              type="button"
              onClick={onClearActivity}
              className="text-[11px] text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
              title="Test empty state behavior"
            >
              Simulate Empty
            </button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-3.5">
        {/* Navigation Tabs */}
        {!isEmpty && (
          <div className="flex items-center gap-1 border-b border-gray-100 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                activeTab === "all"
                  ? "bg-[#090909] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("accepted")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                activeTab === "accepted"
                  ? "bg-[#090909] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Accepted ({acceptedMentorships.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                activeTab === "pending"
                  ? "bg-[#090909] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Pending ({pendingRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("conversations")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                activeTab === "conversations"
                  ? "bg-[#090909] text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Messages ({recentConversations.length})
            </button>
          </div>
        )}

        {/* Global Empty State */}
        {isEmpty && (
          <EmptyState
            title="No Mentorship Activity Yet"
            description="You don't have any active mentorships or pending requests right now. Discover alumni in your target field and reach out for career advice."
            actionLabel="Discover Alumni"
            actionHref="/alumni"
            secondaryActionLabel={onResetActivity ? "Restore Sample Data" : undefined}
            onSecondaryAction={onResetActivity}
          />
        )}

        {/* Content sections when not empty */}
        {!isEmpty && (
          <div className="space-y-3">
            {/* Accepted Mentorships */}
            {(activeTab === "all" || activeTab === "accepted") && (
              <div>
                {activeTab === "all" && acceptedMentorships.length > 0 && (
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-[#057642]" />
                    Active Mentorships ({acceptedMentorships.length})
                  </h3>
                )}

                {acceptedMentorships.length === 0 && activeTab === "accepted" ? (
                  <div className="p-4 rounded-md bg-gray-50 text-center text-xs text-gray-500 border border-gray-200">
                    No active mentorships in this tab.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {acceptedMentorships.map((m: Mentorship) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-md border border-gray-200 bg-white hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar name={m.alumni.name} size="md" className="shrink-0" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900 truncate">{m.alumni.name}</h4>
                              <Badge variant="green" size="sm">
                                Active Mentorship
                              </Badge>
                            </div>
                            <p className="text-[11px] text-gray-600 truncate">
                              {m.alumni.role} at {m.alumni.company}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              <span className="font-semibold text-gray-800">Focus: </span>
                              {m.focus}
                            </p>
                            {m.nextSession && (
                              <p className="text-[11px] text-[#057642] font-medium mt-1 flex items-center gap-1">
                                <Calendar size={11} />
                                Next Session: {formatDate(m.nextSession)} ({m.sessionCount} sessions completed)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <Button variant="outline" size="sm" asChild className="h-7 text-xs">
                            <Link href="/messages">Message</Link>
                          </Button>
                          <Button variant="secondary" size="sm" asChild className="h-7 text-xs">
                            <Link href="/mentorship">Details</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pending Requests */}
            {(activeTab === "all" || activeTab === "pending") && (
              <div>
                {activeTab === "all" && pendingRequests.length > 0 && (
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 mt-2.5">
                    <Clock size={12} className="text-[#915907]" />
                    Pending Outreach ({pendingRequests.length})
                  </h3>
                )}

                {pendingRequests.length === 0 && activeTab === "pending" ? (
                  <div className="p-4 rounded-md bg-gray-50 text-center text-xs text-gray-500 border border-gray-200">
                    No pending requests at this time.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingRequests.map((req: Mentorship) => (
                      <div
                        key={req.id}
                        className="p-3 rounded-md border border-gray-200 bg-white hover:border-gray-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar name={req.alumni.name} size="md" className="shrink-0" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900 truncate">{req.alumni.name}</h4>
                              <Badge variant="amber" size="sm">
                                Pending Approval
                              </Badge>
                            </div>
                            <p className="text-[11px] text-gray-600 truncate">
                              {req.alumni.role} at {req.alumni.company}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              <span className="font-semibold text-gray-800">Topic: </span>
                              {req.focus}
                            </p>
                            {req.notes && (
                              <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1 italic">
                                {req.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <Button variant="secondary" size="sm" asChild className="h-7 text-xs">
                            <Link href="/mentorship">Manage</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recent Conversations */}
            {(activeTab === "all" || activeTab === "conversations") && (
              <div>
                {activeTab === "all" && recentConversations.length > 0 && (
                  <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 mt-2.5">
                    <MessageCircle size={12} className="text-neutral-700" />
                    Recent Messages ({recentConversations.length})
                  </h3>
                )}

                {recentConversations.length === 0 && activeTab === "conversations" ? (
                  <div className="p-4 rounded-xl bg-[#FAFAFA] text-center text-xs text-gray-500 border border-[#E7E7E7]">
                    No active conversation threads.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentConversations.map((conv: Conversation) => (
                      <Link
                        key={conv.id}
                        href="/messages"
                        className="p-3 rounded-xl border border-[#E7E7E7] bg-white hover:border-neutral-400 hover:bg-[#FAFAFA] transition-all flex items-center justify-between gap-3 block"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar name={conv.participantName} src={conv.participantAvatar} size="md" className="shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900 truncate">{conv.participantName}</h4>
                              <span className="text-[10px] text-gray-400">
                                {formatDate(conv.lastMessageAt)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-0.5">
                              {conv.lastMessage}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {conv.unreadCount > 0 && (
                            <span className="h-2 w-2 rounded-full bg-neutral-900" />
                          )}
                          <span className="text-xs font-medium text-neutral-900">Reply &rarr;</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
