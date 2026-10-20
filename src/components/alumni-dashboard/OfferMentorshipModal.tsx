"use client";

import { useState } from "react";
import { X, Send, AlertCircle, ShieldCheck } from "lucide-react";
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
  "Distributed Systems & Production Telemetry",
  "Technical Interview & Algorithmic Problem Solving",
  "Resume, GitHub & Portfolio Architecture Review",
  "Database Query Optimization & PostgreSQL",
  "Career Transition & Tech Industry Navigation",
  "Kubernetes & Cloud Infrastructure Best Practices",
];

const EXPERTISE_OPTIONS = [
  "Senior Backend Engineer at Datadog (Go, Python, Systems)",
  "Database Performance Tuning & PostgreSQL Architecture",
  "Distributed Systems, Observability & Microservices",
  "Technical Interview Preparation & System Design Loops",
  "Engineering Career Growth & Tech Leadership",
];

export function OfferMentorshipModal({
  student,
  isOpen,
  onClose,
  onSuccess,
}: OfferMentorshipModalProps) {
  const [topic, setTopic] = useState(COMMON_TOPICS[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [expertise, setExpertise] = useState(EXPERTISE_OPTIONS[0]);
  const [customExpertise, setCustomExpertise] = useState("");
  const [personalNote, setPersonalNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !student) return null;

  const isDuplicate = Boolean(student.hasPendingRequest);
  const finalFocus = topic === "custom" ? customTopic.trim() : topic;
  const finalExpertise = expertise === "custom" ? customExpertise.trim() : expertise;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalFocus) return;
    if (isDuplicate) {
      setErrorMessage("An invitation has already been sent to this student.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = offerMentorshipToStudent(
        student.id,
        finalFocus,
        personalNote,
        finalExpertise
      );

      setSubmitting(false);
      if (result.success) {
        onSuccess(student.name);
        onClose();
      } else {
        setErrorMessage(result.reason || "Failed to submit invitation.");
      }
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Invite Student to Mentorship</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#057642] bg-[#eef8f1] px-2 py-0.5 rounded-full border border-[#bfe3c9]">
                <ShieldCheck size={11} /> Verified Mentor
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Send a personalized invitation with your proposed discussion topic and relevant expertise.
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
        <div className="mt-4 p-3.5 bg-neutral-50 border border-[#E7E7E7] rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={student.name} size="md" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-gray-900 truncate">{student.name}</h4>
                <span className="text-[10px] text-neutral-800 bg-white border border-neutral-200 px-2 py-0.5 rounded-full shrink-0">
                  {student.academicYear}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 truncate mt-0.5">
                {student.department} · {student.university}
              </p>
              <p className="text-[11px] text-neutral-700 font-medium mt-0.5 truncate">
                Target Role: {student.careerGoal}
              </p>
            </div>
          </div>

          {student.matchScore && (
            <span className="text-[10px] font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2.5 py-0.5 rounded-full shrink-0">
              {student.matchScore}% Match
            </span>
          )}
        </div>

        {/* Duplicate Warning */}
        {isDuplicate && (
          <div className="mt-3 p-3 bg-neutral-100 border border-neutral-200 rounded-xl flex items-start gap-2.5 text-xs text-neutral-800">
            <AlertCircle size={15} className="shrink-0 mt-0.5 text-neutral-900" />
            <div>
              <p className="font-semibold">Mentorship Invitation Already Sent</p>
              <p className="text-[11px] text-neutral-700 mt-0.5">
                You already have an active pending invitation with {student.name}. You can review pending statuses in your{" "}
                <a href="/alumni-dashboard/requests" className="underline font-semibold text-black">
                  Mentorship Requests
                </a>{" "}
                dashboard.
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* 1. Suggested Discussion Topic */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Suggested Discussion Topic</span>
              <span className="text-[10px] font-normal text-gray-400">Required</span>
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isDuplicate || submitting}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
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
                placeholder="e.g. Profiling Go Services & Distributed Telemetry"
                required
                disabled={isDuplicate || submitting}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          )}

          {/* 2. Relevant Expertise */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Your Relevant Expertise to Highlight</span>
              <span className="text-[10px] font-normal text-gray-400">Helps student prepare</span>
            </label>
            <select
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              disabled={isDuplicate || submitting}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            >
              {EXPERTISE_OPTIONS.map((exp) => (
                <option key={exp} value={exp}>
                  {exp}
                </option>
              ))}
              <option value="custom">Other (Specify Custom Expertise)</option>
            </select>
          </div>

          {expertise === "custom" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Specify Your Expertise
              </label>
              <input
                type="text"
                value={customExpertise}
                onChange={(e) => setCustomExpertise(e.target.value)}
                placeholder="e.g. 6+ years building microservices and cloud telemetry"
                required
                disabled={isDuplicate || submitting}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          )}

          {/* 3. Personal Message / Invitation Note */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center justify-between">
              <span>Personalized Invitation Message</span>
              <span className="text-[10px] font-normal text-gray-400">Optional note</span>
            </label>
            <textarea
              rows={3}
              value={personalNote}
              onChange={(e) => setPersonalNote(e.target.value)}
              disabled={isDuplicate || submitting}
              placeholder={`Hi ${student.name}! I noticed your interest in ${student.careerGoal} and your projects at ${student.university}. I'd be glad to share feedback on ${finalFocus} and help you prepare for technical interviews.`}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              The student will receive your mentorship offer with your proposed topic and can schedule an introductory session.
            </p>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              {isDuplicate ? "Status: Pending Student Review" : "Status: Ready to send"}
            </span>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={submitting}
                className="text-xs rounded-full border-neutral-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={
                  submitting ||
                  isDuplicate ||
                  (topic === "custom" && !customTopic.trim()) ||
                  (expertise === "custom" && !customExpertise.trim())
                }
                className="text-xs bg-[#090909] hover:bg-[#242424] text-white rounded-full px-4 flex items-center gap-1.5"
              >
                <Send size={12} />
                <span>
                  {submitting
                    ? "Sending Invitation..."
                    : isDuplicate
                    ? "Invitation Pending"
                    : "Send Mentorship Invitation"}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
