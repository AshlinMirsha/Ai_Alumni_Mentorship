"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Clock,
  CheckCircle2,
  MessageCircle,
  Calendar,
  ArrowRight,
  Users,
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
    <Card padding="md" className="border-gray-200 shadow-xs">
      <CardHeader className="border-b border-gray-100 pb-3 mb-4 flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass size={16} className="text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-gray-900">Mentorship Activity</h2>
            <p className="text-xs text-gray-500">
              Active connections, pending outreach, and ongoing conversations
            </p>
          </div>
        </div>

        {/* Demo Controls: Toggle empty state / restore */}
        <div className="flex items-center gap-2 text-xs">
          {isEmpty ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onResetActivity}
              className="h-7 text-xs"
            >
              <RotateCcw size={12} className="mr-1" />
              Restore Demo Activity
            </Button>
          ) : (
            <button
              type="button"
              onClick={onClearActivity}
              className="text-[11px] text-gray-400 hover:text-red-600 transition-colors"
              title="Test empty state behavior"
            >
              Simulate Empty State
            </button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-4">
        {/* Navigation Tabs */}
        {!isEmpty && (
          <div className="flex items-center gap-1 border-b border-gray-100 pb-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                activeTab === "all"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Activity ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("accepted")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                activeTab === "accepted"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Accepted Mentorships ({acceptedMentorships.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                activeTab === "pending"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Pending Requests ({pendingRequests.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("conversations")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors shrink-0 ${
                activeTab === "conversations"
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Conversations ({recentConversations.length})
            </button>
          </div>
        )}

        {/* Global Empty State */}
        {isEmpty && (
          <EmptyState
            icon={<Users size={22} />}
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
          <div className="space-y-4">
            {/* Accepted Mentorships */}
            {(activeTab === "all" || activeTab === "accepted") && (
              <div>
                {activeTab === "all" && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    Accepted Mentorships ({acceptedMentorships.length})
                  </h3>
                )}

                {acceptedMentorships.length === 0 ? (
                  <div className="p-4 rounded-lg bg-gray-50 text-center text-xs text-gray-500">
                    No active mentorships in this tab.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {acceptedMentorships.map((m: Mentorship) => (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar name={m.alumni.name} size="md" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900">{m.alumni.name}</h4>
                              <Badge variant="green" size="sm">
                                Active Mentorship
                              </Badge>
                            </div>
                            <p className="text-[11px] text-gray-600">
                              {m.alumni.role} at {m.alumni.company}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              <strong>Focus: </strong>
                              {m.focus}
                            </p>
                            {m.nextSession && (
                              <p className="text-[11px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
                                <Calendar size={12} />
                                Next Session: {formatDate(m.nextSession)} ({m.sessionCount} sessions completed)
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <Button variant="secondary" size="sm" asChild className="h-7 text-xs">
                            <Link href="/mentorship">View Details</Link>
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
                {activeTab === "all" && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 mt-3">
                    <Clock size={13} className="text-amber-600" />
                    Pending Requests ({pendingRequests.length})
                  </h3>
                )}

                {pendingRequests.length === 0 ? (
                  <div className="p-4 rounded-lg bg-gray-50 text-center text-xs text-gray-500">
                    No pending requests at this time.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {pendingRequests.map((req: Mentorship) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-lg border border-amber-200/80 bg-amber-50/20 hover:bg-amber-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar name={req.alumni.name} size="md" />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900">{req.alumni.name}</h4>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                                <Clock size={10} />
                                Pending Alumni Review
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600">
                              {req.alumni.role} at {req.alumni.company}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              <strong>Request Topic: </strong>
                              {req.focus}
                            </p>
                            {req.notes && (
                              <p className="text-[11px] text-gray-500 mt-0.5 italic">
                                {req.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                          <span className="text-[11px] text-gray-400">
                            Sent {req.startDate ? formatDate(req.startDate) : "recently"}
                          </span>
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
                {activeTab === "all" && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 mt-3">
                    <MessageCircle size={13} className="text-blue-600" />
                    Recent Conversations ({recentConversations.length})
                  </h3>
                )}

                {recentConversations.length === 0 ? (
                  <div className="p-4 rounded-lg bg-gray-50 text-center text-xs text-gray-500">
                    No recent conversations.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentConversations.map((conv: Conversation) => (
                      <div
                        key={conv.id}
                        className="p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50/80 transition-colors flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar name={conv.participantName} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900 truncate">
                                {conv.participantName}
                              </h4>
                              <span className="text-[10px] text-gray-400 shrink-0">
                                {conv.participantRole} · {conv.participantCompany}
                              </span>
                              {conv.unreadCount > 0 && (
                                <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                              &ldquo;{conv.lastMessage}&rdquo;
                            </p>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm" asChild className="h-7 text-xs shrink-0">
                          <Link href={`/messages?conversationId=${conv.id}`}>Open</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* View all mentorships link */}
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
          <span className="text-gray-500">Need more mentorship guidance?</span>
          <Link
            href="/mentorship"
            className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
          >
            <span>Manage All Mentorships</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
