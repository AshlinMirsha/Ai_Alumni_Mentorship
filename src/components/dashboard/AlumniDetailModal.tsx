"use client";

import { useEffect } from "react";
import { X, MapPin, Briefcase, GraduationCap, CheckCircle, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { RecommendedAlumni } from "@/types";

interface AlumniDetailModalProps {
  alumni: RecommendedAlumni | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestMentorship: (alumni: RecommendedAlumni) => void;
}

export function AlumniDetailModal({
  alumni,
  isOpen,
  onClose,
  onRequestMentorship,
}: AlumniDetailModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alumni-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between bg-gray-50/60 shrink-0">
          <div className="flex items-start gap-4">
            <Avatar name={alumni.name} size="xl" className="ring-2 ring-blue-100" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="alumni-modal-title" className="text-lg font-bold text-gray-900">
                  {alumni.name}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                  {alumni.matchScore}% Match (Demo)
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 mt-0.5">
                {alumni.role} at {alumni.company}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {alumni.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  Response time: {alumni.averageResponseTime}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-gray-700">
          {/* Match Rationale Callout */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs leading-relaxed text-blue-900">
            <strong className="font-semibold block mb-1">Why this match was recommended:</strong>
            {alumni.matchExplanation}
            <span className="block mt-1 text-[11px] text-blue-700/80 italic">
              Note: Match score is an illustrative demo indicator based on shared skills and department.
            </span>
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              About
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">{alumni.bio}</p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Key Skills & Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {alumni.skills.map((s) => (
                <Badge key={s.id} variant="default" size="sm">
                  {s.name} ({s.level})
                </Badge>
              ))}
            </div>
          </div>

          {/* Mentorship Focus Areas */}
          {alumni.mentorshipAreas.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Mentorship Areas
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {alumni.mentorshipAreas.map((area, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-100">
                    <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Experience */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Career Experience
            </h4>
            <div className="space-y-3">
              {alumni.workExperience.map((exp) => (
                <div key={exp.id} className="flex items-start gap-3 text-xs">
                  <div className="h-7 w-7 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-600 mt-0.5">
                    <Briefcase size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {exp.role} · {exp.company}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      {exp.startYear} – {exp.current ? "Present" : exp.endYear}
                    </p>
                    {exp.description && <p className="text-gray-600 mt-1">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Alumni Education
            </h4>
            <div className="space-y-2">
              {alumni.education.map((edu) => (
                <div key={edu.id} className="flex items-center gap-3 text-xs">
                  <div className="h-7 w-7 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-600">
                    <GraduationCap size={14} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {edu.degree} in {edu.field}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      {edu.institution} · Class of {edu.graduationYear}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-gray-500">
            {alumni.totalMentees} students currently mentored
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onRequestMentorship(alumni);
              }}
            >
              Request Mentorship
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
