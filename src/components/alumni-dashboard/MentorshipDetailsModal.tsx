"use client";

import { useState } from "react";
import Link from "next/link";
import {
  X,
  Target,
  Calendar,
  Lock,

  Plus,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Award,
  Video,
  Clock,
  User,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  toggleMentorshipMilestone,
  addMentorshipMilestone,
  addMentorshipPrivateNote,
  addMentorshipResource,
  loadUpcomingSessions,
} from "@/lib/dashboard-storage";
import type { Mentorship } from "@/types";

interface MentorshipDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentorship: Mentorship | null;
  onScheduleSession?: (mentee: Mentorship) => void;
  onEndMentorship?: (mentee: Mentorship) => void;
  onViewStudentProfile?: (studentId: string) => void;
  onOpenAIAssistant?: (mentee: Mentorship) => void;
}

export function MentorshipDetailsModal({
  isOpen,
  onClose,
  mentorship,
  onScheduleSession,
  onEndMentorship,
  onViewStudentProfile,
  onOpenAIAssistant,
}: MentorshipDetailsModalProps) {
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDueDate, setNewMilestoneDueDate] = useState("");
  const [newPrivateNote, setNewPrivateNote] = useState("");
  const [newResourceTitle, setNewResourceTitle] = useState("");
  const [newResourceUrl, setNewResourceUrl] = useState("");
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [activeTab, setActiveTab] = useState<"milestones" | "sessions" | "notes" | "resources">("milestones");

  if (!isOpen || !mentorship) return null;

  const studentName = mentorship.student?.name || "Student";
  const studentId = mentorship.studentId || mentorship.student?.id || "";
  const isActive = mentorship.status === "active";
  const isCompleted = mentorship.status === "completed";

  // Milestones & progress calculation
  const milestones = mentorship.milestones || [];
  const completedCount = milestones.filter((m) => m.completed).length;
  const totalMilestones = milestones.length;
  const progressPercent =
    mentorship.progressPercent !== undefined
      ? mentorship.progressPercent
      : totalMilestones > 0
      ? Math.round((completedCount / totalMilestones) * 100)
      : 0;

  // Filter sessions for this mentee
  const allSessions = loadUpcomingSessions();
  const menteeSessions = allSessions.filter(
    (s) => s.studentId === studentId || s.studentName.toLowerCase() === studentName.toLowerCase()
  );

  const handleToggleMilestone = (milestoneId: string) => {
    toggleMentorshipMilestone(mentorship.id, milestoneId);
  };

  const handleAddMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;
    addMentorshipMilestone(mentorship.id, newMilestoneTitle.trim(), newMilestoneDueDate);
    setNewMilestoneTitle("");
    setNewMilestoneDueDate("");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrivateNote.trim()) return;
    addMentorshipPrivateNote(mentorship.id, newPrivateNote.trim());
    setNewPrivateNote("");
  };

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
    addMentorshipResource(mentorship.id, newResourceTitle.trim(), newResourceUrl.trim());
    setNewResourceTitle("");
    setNewResourceUrl("");
    setIsAddingResource(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between bg-gray-50/70">
          <div className="flex items-start gap-3.5 min-w-0">
            <Avatar name={studentName} size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 truncate">{studentName}</h2>
                {isActive && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#eef8f1] text-[#057642] border border-[#bfe3c9]">
                    Active Mentee
                  </span>
                )}
                {isCompleted && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-[#0a66c2] border border-blue-200">
                    Completed Track
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5 truncate">
                {mentorship.student?.department || "Computer Science"} · {mentorship.student?.academicYear || "Undergraduate"}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-[#0a66c2] font-semibold">
                <Target size={13} className="shrink-0" />
                <span className="truncate">Focus: {mentorship.focus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenAIAssistant && isActive && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenAIAssistant(mentorship)}
                className="text-xs text-[#0a66c2] border-[#b2d5f8] hover:bg-blue-50 flex items-center gap-1.5"
              >
                <Sparkles size={12} />
                <span className="hidden sm:inline">AI Assistant</span>
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-2.5 bg-white border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3 text-gray-500">
            <span>Started: <strong className="text-gray-800">{mentorship.startDate || "N/A"}</strong></span>
            <span>Sessions: <strong className="text-gray-800">{mentorship.sessionCount} logged</strong></span>
          </div>

          <div className="flex items-center gap-2">
            {studentId && onViewStudentProfile && (
              <button
                type="button"
                onClick={() => onViewStudentProfile(studentId)}
                className="font-semibold text-[#0a66c2] hover:underline flex items-center gap-1 py-1 px-2 rounded hover:bg-blue-50 transition-colors"
              >
                <User size={13} />
                <span>View Profile</span>
              </button>
            )}

            <Link
              href={`/messages?participantId=${studentId}`}
              className="font-semibold text-gray-700 hover:text-[#0a66c2] hover:underline flex items-center gap-1 py-1 px-2 rounded hover:bg-gray-100 transition-colors"
            >
              <MessageSquare size={13} />
              <span>Message</span>
            </Link>

            {isActive && onScheduleSession && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onScheduleSession(mentorship)}
                className="text-xs bg-[#0a66c2] hover:bg-[#004182] py-1 px-2.5 h-auto"
              >
                <Calendar size={12} className="mr-1" />
                <span>Schedule Session</span>
              </Button>
            )}
          </div>
        </div>

        {/* Progress Strip */}
        <div className="px-5 py-3 bg-blue-50/40 border-b border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-700 mb-1.5">
            <span className="font-semibold flex items-center gap-1.5 text-gray-900">
              <Award size={14} className="text-[#0a66c2]" />
              <span>Mentorship Milestone Progress</span>
            </span>
            <span className="font-bold text-[#0a66c2]">
              {completedCount} of {totalMilestones} Completed ({progressPercent}%)
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full bg-[#0a66c2] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-5 border-b border-gray-200 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("milestones")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "milestones"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>Goals &amp; Milestones</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 text-gray-700">
              {milestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sessions")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "sessions"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>Sessions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 text-gray-700">
              {menteeSessions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "notes"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>Private Notes</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
              🔒 Private ({mentorship.privateNotes?.length || 0})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("resources")}
            className={`py-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "resources"
                ? "border-[#0a66c2] text-[#0a66c2]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <span>Resources</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-gray-100 text-gray-700">
              {mentorship.resources?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: Milestones */}
          {activeTab === "milestones" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Track key learning goals and interview readiness steps together. Check off items as they are achieved.
                </p>
              </div>

              {milestones.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                  No milestones added yet. Add the first goal below.
                </div>
              ) : (
                <div className="space-y-2">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      className={`p-3 rounded-md border text-xs flex items-start gap-3 transition-colors ${
                        m.completed
                          ? "bg-gray-50 border-gray-200 text-gray-500"
                          : "bg-white border-gray-200 text-gray-900 hover:border-[#b2d5f8]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={m.completed}
                        onChange={() => handleToggleMilestone(m.id)}
                        className="mt-0.5 rounded text-[#0a66c2] focus:ring-[#0a66c2] cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`font-medium block leading-snug ${
                            m.completed ? "line-through text-gray-400" : "text-gray-900"
                          }`}
                        >
                          {m.title}
                        </span>
                        {m.dueDate && (
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Target due: {m.dueDate}
                          </span>
                        )}
                      </div>
                      {m.completed && (
                        <span className="text-[10px] font-bold text-[#057642] bg-emerald-50 px-2 py-0.5 rounded">
                          Achieved
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Milestone Form */}
              <form onSubmit={handleAddMilestone} className="p-3 bg-gray-50 rounded-md border border-gray-200 space-y-2">
                <span className="text-xs font-semibold text-gray-800 block">Add New Goal / Milestone</span>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="e.g. Complete concurrency project & benchmark throughput"
                    className="flex-1 text-xs bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                  />
                  <input
                    type="date"
                    value={newMilestoneDueDate}
                    onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                    className="text-xs bg-white border border-gray-200 rounded px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs bg-[#0a66c2] hover:bg-[#004182] py-1.5 px-3 shrink-0"
                  >
                    <Plus size={12} className="mr-1" />
                    <span>Add</span>
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: Sessions */}
          {activeTab === "sessions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Scheduled 1:1 sessions and upcoming meetings with {studentName}.
                </p>
                {isActive && onScheduleSession && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onScheduleSession(mentorship)}
                    className="text-xs text-[#0a66c2]"
                  >
                    <Plus size={12} className="mr-1" />
                    <span>Schedule Session</span>
                  </Button>
                )}
              </div>

              {menteeSessions.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                  No upcoming sessions currently scheduled for {studentName}.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {menteeSessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-3 bg-white border border-gray-200 rounded-md text-xs hover:border-[#b2d5f8] transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{sess.topic}</span>
                            <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-[#057642] border border-emerald-200">
                              {sess.status}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-3 text-[11px] text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              <span>{sess.date}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{sess.time}</span>
                            </span>
                          </div>
                        </div>

                        {sess.meetUrl && (
                          <a
                            href={sess.meetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0a66c2] text-white font-semibold text-xs hover:bg-[#004182] transition-colors shrink-0"
                          >
                            <Video size={13} />
                            <span>Join Meeting</span>
                          </a>
                        )}
                      </div>

                      {sess.agenda && (
                        <div className="mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-gray-600 bg-gray-50 p-2 rounded">
                          <span className="font-semibold text-gray-700 block mb-0.5">Agenda / Discussion Points:</span>
                          <span>{sess.agenda}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Private Notes */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              {/* Privacy Warning Banner */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-md text-xs text-amber-900 flex items-start gap-2.5">
                <Lock size={15} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong className="font-bold block">🔒 Strict Mentor-Only Privacy Guarantee</strong>
                  <span>
                    These notes and evaluations are strictly private to you (Marcus Vance). They are NEVER exposed, shared, or visible to students or other users.
                  </span>
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700">
                  Add Private Mentor Note
                </label>
                <textarea
                  rows={2}
                  value={newPrivateNote}
                  onChange={(e) => setNewPrivateNote(e.target.value)}
                  placeholder="e.g. Needs deeper practice on PostgreSQL locking mechanics. Recommend reviewing the Raft paper before next session."
                  className="w-full text-xs bg-white border border-gray-200 rounded-md p-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                  >
                    Save Private Note
                  </Button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-700 block">Saved Notes History</span>
                {(!mentorship.privateNotes || mentorship.privateNotes.length === 0) ? (
                  <p className="text-xs text-gray-400 italic">No notes recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {mentorship.privateNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-800 leading-relaxed"
                      >
                        <p>{note.content}</p>
                        <span className="text-[10px] text-gray-400 block mt-1.5 font-medium">
                          Recorded: {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Resources */}
          {activeTab === "resources" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Recommended reading, reference architectures, or repositories shared for this mentorship.
                </p>
                {!isAddingResource && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddingResource(true)}
                    className="text-xs text-[#0a66c2]"
                  >
                    <Plus size={12} className="mr-1" />
                    <span>Add Resource</span>
                  </Button>
                )}
              </div>

              {isAddingResource && (
                <form onSubmit={handleAddResource} className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-2 text-xs">
                  <span className="font-bold text-gray-900 block">Add Recommended Resource</span>
                  <div>
                    <input
                      type="text"
                      value={newResourceTitle}
                      onChange={(e) => setNewResourceTitle(e.target.value)}
                      placeholder="Resource Title (e.g. Designing Data-Intensive Applications Study Guide)"
                      className="w-full text-xs bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={newResourceUrl}
                      onChange={(e) => setNewResourceUrl(e.target.value)}
                      placeholder="URL (e.g. https://dataintensive.net or github repo)"
                      className="w-full text-xs bg-white border border-gray-200 rounded px-3 py-1.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddingResource(false)}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                    >
                      Save Resource
                    </Button>
                  </div>
                </form>
              )}

              {(!mentorship.resources || mentorship.resources.length === 0) ? (
                <div className="p-6 text-center border border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                  No study resources or links shared yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {mentorship.resources.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 bg-white border border-gray-200 rounded-md text-xs flex items-center justify-between gap-3 hover:border-[#b2d5f8] transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <BookOpen size={16} className="text-[#0a66c2] shrink-0" />
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-900 block truncate">{res.title}</span>
                          <span className="text-[10px] text-gray-400 block truncate">
                            Added {res.addedDate}
                          </span>
                        </div>
                      </div>

                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#0a66c2] hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Open Link</span>
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs">
          <div>
            {isActive && onEndMentorship && (
              <button
                type="button"
                onClick={() => onEndMentorship(mentorship)}
                className="text-xs text-red-600 hover:text-red-700 hover:underline font-semibold"
              >
                Conclude Mentorship Track
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
