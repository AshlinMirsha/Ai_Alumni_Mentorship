"use client";

import { X, Target, Code, Sparkles, Send } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import type { DiscoverStudent } from "@/types";

interface StudentDetailModalProps {
  student: DiscoverStudent | null;
  isOpen: boolean;
  onClose: () => void;
  onOfferMentorship: (student: DiscoverStudent) => void;
}

export function StudentDetailModal({
  student,
  isOpen,
  onClose,
  onOfferMentorship,
}: StudentDetailModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95">
        {/* Header / Banner */}
        <div className="h-20 bg-linear-to-r from-blue-700 to-indigo-800 relative p-4 flex items-start justify-end">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Profile Info Strip */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-10 mb-3 flex items-end justify-between gap-4">
            <div className="h-20 w-20 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
              <Avatar name={student.name} size="lg" />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onOfferMentorship(student);
                }}
                disabled={student.hasPendingRequest}
                className="bg-[#0a66c2] hover:bg-[#004182] text-xs flex items-center gap-1.5"
              >
                <Send size={12} />
                <span>{student.hasPendingRequest ? "Offer Pending" : "Offer Mentorship"}</span>
              </Button>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">{student.name}</h2>
              {student.matchScore && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]">
                  {student.matchScore}% Domain Match
                </span>
              )}
            </div>

            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              {student.academicYear} · {student.department} at{" "}
              <strong className="text-gray-900">{student.university}</strong>
            </p>

            {student.gpa && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                GPA: {student.gpa} / 4.0
              </p>
            )}
          </div>

          {/* Bio */}
          {student.bio && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-1">About the Student</h4>
              <p className="text-xs text-gray-600 leading-relaxed">{student.bio}</p>
            </div>
          )}

          {/* Career Goal */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
              <Target size={14} className="text-[#0a66c2]" />
              <span>Career Goal &amp; Aspirations</span>
            </h4>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-xs text-gray-800">
              Target Role: <strong className="text-gray-900">{student.careerGoal}</strong>
            </div>
          </div>

          {/* Mentorship Focus Requested */}
          {student.seekingMentorshipIn && student.seekingMentorshipIn.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#0a66c2]" />
                <span>Seeking Guidance In</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {student.seekingMentorshipIn.map((topic) => (
                  <span
                    key={topic}
                    className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-[#0a66c2] border border-blue-100 font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {student.skills && student.skills.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                <Code size={14} className="text-gray-500" />
                <span>Technical Skills &amp; Stack</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {student.skills.map((skill) => {
                  const skillName = typeof skill === "string" ? skill : skill.name;
                  return (
                    <span
                      key={skillName}
                      className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700 font-medium"
                    >
                      {skillName}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects */}
          {student.projects && student.projects.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-900 mb-2">Featured Projects</h4>
              <div className="space-y-2">
                {student.projects.map((proj, idx) => {
                  const projTitle = typeof proj === "string" ? proj : (proj as { title?: string }).title || "Project";
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-md border border-gray-200 bg-gray-50/50 flex items-center justify-between"
                    >
                      <span className="text-xs font-semibold text-gray-900">
                        {projTitle}
                      </span>
                      <span className="text-[10px] text-gray-400">Portfolio Project</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
