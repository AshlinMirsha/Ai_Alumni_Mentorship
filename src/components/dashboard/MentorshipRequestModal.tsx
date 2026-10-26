"use client";

import { useState, useEffect, type FormEvent } from "react";
import { X, Send, Sparkles, CheckCircle2, AlertCircle, Info, ShieldAlert } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { loadStudentProfile } from "@/lib/dashboard-storage";
import type { Alumni, RecommendedAlumni, Mentorship } from "@/types";

export interface MentorshipRequestModalProps {
  alumni: (Alumni & { experienceYears?: string }) | RecommendedAlumni | null;
  studentName?: string;
  studentCareerGoal?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRequest: (request: Mentorship) => void;
  isAlreadyRequested?: boolean;
}

interface RequestFormContentProps {
  alumni: (Alumni & { experienceYears?: string }) | RecommendedAlumni;
  studentName?: string;
  studentCareerGoal?: string;
  onClose: () => void;
  onSubmitRequest: (request: Mentorship) => void;
  isAlreadyRequested?: boolean;
}

function MentorshipRequestForm({
  alumni,
  studentName = "Ashlin",
  studentCareerGoal = "Full-Stack Software Engineer",
  onClose,
  onSubmitRequest,
  isAlreadyRequested = false,
}: RequestFormContentProps) {
  const defaultFocus = alumni.mentorshipAreas?.[0] || "Career guidance and technical mentorship";
  const [focus, setFocus] = useState(defaultFocus);
  const [customReason, setCustomReason] = useState("");
  const [careerGoal, setCareerGoal] = useState(studentCareerGoal);
  const [message, setMessage] = useState(
    `Hi ${alumni.name.split(" ")[0]}, I am ${studentName}, a student aiming for a ${
      careerGoal || alumni.role
    } role. I noticed your work at ${
      alumni.company
    } and would value your perspective and career mentorship.`
  );
  const [cadence, setCadence] = useState("Bi-weekly 30-min sync");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isAlreadyRequested) {
      setError("You already have an active or pending mentorship request with this alumnus.");
      return;
    }
    if (!message.trim() || message.trim().length < 15) {
      setError("Please provide a meaningful message (at least 15 characters) explaining what you hope to learn.");
      return;
    }

    const selectedReason = focus === "Other" ? (customReason.trim() || "General Career Guidance") : focus;
    const nowIso = new Date().toISOString();
    const activeStudent = loadStudentProfile();

    const newRequest: Mentorship = {
      id: `req-${Date.now()}`,
      studentId: activeStudent.id || "student-active",
      alumniId: alumni.id,
      alumni: {
        id: alumni.id,
        name: alumni.name,
        avatar: alumni.avatar,
        role: alumni.role,
        company: alumni.company,
      },
      student: {
        id: activeStudent.id || "student-active",
        name: activeStudent.name || studentName || "Student",
        avatar: activeStudent.avatar,
        department: activeStudent.department,
        academicYear: activeStudent.academicYear,
        careerGoal: activeStudent.careerGoal || careerGoal,
      },
      status: "pending",
      sessionCount: 0,
      focus: selectedReason,
      notes: `${cadence} — Student Goal: ${careerGoal} — Note: "${message.slice(0, 120)}..."`,
      startDate: nowIso.split("T")[0],
    };

    setSubmitted(true);
    setTimeout(() => {
      onSubmitRequest(newRequest);
      onClose();
    }, 700);
  };

  return (
    <div className="relative w-full max-w-lg bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-600" />
          <h2 id="mentorship-request-modal-title" className="text-base font-bold text-gray-900">
            Request Mentorship
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

      {/* Form or Success State */}
      {submitted ? (
        <div className="p-8 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Mentorship Request Submitted!</h3>
          <p className="text-xs text-gray-600 max-w-sm mx-auto">
            Your request for <strong>{alumni.name}</strong> has been saved to your pending requests. You can monitor its status from your dashboard.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Alumni mini info card */}
          <div className="flex items-center gap-3 p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
            <Avatar name={alumni.name} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-bold text-gray-900 truncate">{alumni.name}</p>
                {alumni.isVerified && (
                  <span
                    className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800"
                    title="Verified Alumni Profile"
                  >
                    Verified
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-600 truncate">
                {alumni.role} at {alumni.company}
              </p>
            </div>
            {alumni.matchScore && (
              <span
                className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded shrink-0"
                title="Illustrative demo match score"
              >
                {alumni.matchScore}% Match (Demo)
              </span>
            )}
          </div>

          {/* Already requested warning if applicable */}
          {isAlreadyRequested && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800">
                <p className="font-semibold">Request Already Pending</p>
                <p className="text-[11px] mt-0.5">
                  You already submitted a mentorship request to {alumni.name}. To prevent duplicate inquiries, additional requests cannot be submitted while one is active or pending.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Career Goal */}
          <div className="space-y-1.5">
            <label htmlFor="student-goal-input" className="text-xs font-semibold text-gray-700">
              Your Target Career Goal
            </label>
            <input
              id="student-goal-input"
              type="text"
              value={careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              placeholder="e.g. Full-Stack Software Engineer, Machine Learning Engineer"
              required
              className="w-full rounded-md border border-gray-200 bg-white text-xs text-gray-900 px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-gray-400">
              Helps {alumni.name.split(" ")[0]} understand how their guidance can align with your aspirations.
            </p>
          </div>

          {/* Reason for Contacting / Mentorship Focus */}
          <div className="space-y-1.5">
            <label htmlFor="mentorship-focus-select" className="text-xs font-semibold text-gray-700">
              Reason for Contacting & Focus Area
            </label>
            <select
              id="mentorship-focus-select"
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white text-xs text-gray-900 px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {alumni.mentorshipAreas && alumni.mentorshipAreas.length > 0 ? (
                alumni.mentorshipAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))
              ) : (
                <option value="General Software Engineering Guidance">
                  General Career Guidance & Advice
                </option>
              )}
              <option value="Resume & Portfolio Critique">Resume & Portfolio Critique</option>
              <option value="Technical Interview & System Design Preparation">
                Technical Interview & System Design Preparation
              </option>
              <option value="Transitioning into Tech & Campus Recruitment">
                Transitioning into Tech & Campus Recruitment
              </option>
              <option value="Other">Other (custom topic)</option>
            </select>
            {focus === "Other" && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Specify your primary focus or reason..."
                className="w-full mt-2 rounded-md border border-gray-200 bg-white text-xs text-gray-900 px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}
          </div>

          {/* Cadence preference */}
          <div className="space-y-1.5">
            <label htmlFor="cadence-select" className="text-xs font-semibold text-gray-700">
              Preferred Engagement Cadence
            </label>
            <select
              id="cadence-select"
              value={cadence}
              onChange={(e) => setCadence(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-white text-xs text-gray-900 px-3 py-2 h-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Bi-weekly 30-min sync">Bi-weekly 30-min 1:1 session</option>
              <option value="Monthly check-in">Monthly check-in & milestone review</option>
              <option value="Asynchronous messaging">Asynchronous Q&A messaging</option>
              <option value="One-off guidance session">One-off 45-min strategy session</option>
            </select>
          </div>

          {/* Personal Message */}
          <div className="space-y-1.5">
            <label htmlFor="intro-message" className="text-xs font-semibold text-gray-700">
              Introductory Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="intro-message"
              rows={4}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (error) setError(null);
              }}
              required
              className="w-full rounded-md border border-gray-200 bg-white text-xs text-gray-900 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Be specific about what advice or projects you want to discuss.</span>
              <span>{message.length} chars</span>
            </div>
          </div>

          {/* Demo Mode Notice */}
          <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-md flex items-start gap-2 text-[11px] text-gray-500">
            <Info size={14} className="shrink-0 text-blue-500 mt-0.5" />
            <span>
              <strong>Demo Environment:</strong> Requests are saved locally in your browser state and reflected on your dashboard. No external emails are sent.
            </span>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2.5">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isAlreadyRequested}
              className="inline-flex items-center gap-1.5"
            >
              <Send size={13} />
              {isAlreadyRequested ? "Request Already Sent" : "Send Mentorship Request"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function MentorshipRequestModal({
  alumni,
  studentName = "Ashlin",
  studentCareerGoal = "Full-Stack Software Engineer",
  isOpen,
  onClose,
  onSubmitRequest,
  isAlreadyRequested = false,
}: MentorshipRequestModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !alumni) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mentorship-request-modal-title"
    >
      <MentorshipRequestForm
        key={alumni.id}
        alumni={alumni}
        studentName={studentName}
        studentCareerGoal={studentCareerGoal}
        onClose={onClose}
        onSubmitRequest={onSubmitRequest}
        isAlreadyRequested={isAlreadyRequested}
      />
    </div>
  );
}
