"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { offerMentorshipToStudent } from "@/lib/dashboard-storage";
import type { DiscoverStudent } from "@/types";

interface OfferMentorshipModalProps {
  student: DiscoverStudent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (studentName: string) => void;
}

const COMMON_TOPICS = [
  "Backend Engineering & System Design",
  "Technical Interview & LeetCode Strategy",
  "Resume & Portfolio Architecture Review",
  "Career Transition & Industry Navigation",
  "Distributed Systems & Production Observability",
];

export function OfferMentorshipModal({
  student,
  isOpen,
  onClose,
  onSuccess,
}: OfferMentorshipModalProps) {
  const [topic, setTopic] = useState(COMMON_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !student) return null;

  const finalFocus = topic === "custom" ? customTopic.trim() : topic;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalFocus) return;

    setSubmitting(true);
    setTimeout(() => {
      offerMentorshipToStudent(student.id, finalFocus);
      setSubmitting(false);
      onSuccess(student.name);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Offer Mentorship</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Send a personalized mentorship invitation to help this student achieve their career goals.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Student Mini Preview */}
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center gap-3">
          <Avatar name={student.name} size="md" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-gray-900">{student.name}</h4>
            <p className="text-[11px] text-gray-600 truncate">
              {student.academicYear} · {student.department} @ {student.university}
            </p>
            <p className="text-[11px] text-[#0a66c2] font-medium mt-0.5">
              Target Goal: {student.careerGoal}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Mentorship Focus Area
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            >
              {COMMON_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
              <option value="custom">Other (Specify Custom Topic)</option>
            </select>
          </div>

          {topic === "custom" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Custom Focus Topic
              </label>
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Microservices in Go, Open Source Guidance..."
                required
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Personal Note / Welcome Message
            </label>
            <textarea
              rows={3}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              placeholder={`Hi ${student.name}, I'd be glad to mentor you on your journey towards becoming a ${student.careerGoal}. Let's connect!`}
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              The student will receive your invitation in their Mentorships portal and can accept or schedule an introductory session.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={submitting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={submitting || (topic === "custom" && !customTopic.trim())}
              className="text-xs bg-[#0a66c2] hover:bg-[#004182] flex items-center gap-1.5"
            >
              <Send size={12} />
              <span>{submitting ? "Sending Offer..." : "Send Mentorship Offer"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
