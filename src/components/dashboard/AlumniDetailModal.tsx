"use client";

import Link from "next/link";
import { useEffect } from "react";
import { X, MapPin, Briefcase, GraduationCap, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { RecommendedAlumni } from "@/types";

interface AlumniDetailModalProps {
  alumni: RecommendedAlumni | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestMentorship?: (alumni: RecommendedAlumni) => void;
}

export function AlumniDetailModal({
  alumni,
  isOpen,
  onClose,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alumni-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-200 flex items-start justify-between bg-white shrink-0">
          <div className="flex items-start gap-3.5">
            <Avatar name={alumni.name} size="xl" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="alumni-modal-title" className="text-base font-bold text-gray-900">
                  {alumni.name}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#ebf3fb] text-[#0a66c2] border border-[#b2d5f8]">
                  {alumni.matchScore}% Match
                </span>
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">
                {alumni.role} at {alumni.company}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <MapPin size={11} className="text-gray-400" />
                  {alumni.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={11} className="text-gray-400" />
                  Response: {alumni.averageResponseTime}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs text-gray-700">
          {/* Match Rationale Callout */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-xs leading-relaxed text-gray-700">
            <strong className="font-semibold text-gray-900 block mb-0.5">Why matched with your profile:</strong>
            {alumni.matchExplanation}
          </div>

          {/* Bio */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              About
            </h4>
            <p className="text-xs text-gray-700 leading-relaxed">{alumni.bio}</p>
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Key Skills &amp; Tech Stack
            </h4>
            <div className="flex flex-wrap gap-1">
              {alumni.skills.map((s) => (
                <Badge key={s.id} variant="default" size="sm">
                  {s.name} ({s.level})
                </Badge>
              ))}
            </div>
          </div>

          {/* Expertise & Focus Areas */}
          {alumni.mentorshipAreas.length > 0 && (
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Primary Expertise &amp; Focus Areas
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {alumni.mentorshipAreas.map((area, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-200">
                    <CheckCircle size={13} className="text-[#057642] shrink-0" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Experience */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Work Experience
            </h4>
            <div className="space-y-2.5">
              {alumni.workExperience.map((exp) => (
                <div key={exp.id} className="flex items-start gap-2.5 text-xs">
                  <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-600 mt-0.5 border border-gray-200">
                    <Briefcase size={12} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {exp.role} · {exp.company}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      {exp.startYear} – {exp.current ? "Present" : exp.endYear}
                    </p>
                    {exp.description && <p className="text-gray-600 mt-0.5 leading-relaxed">{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Education
            </h4>
            <div className="space-y-2">
              {alumni.education.map((edu) => (
                <div key={edu.id} className="flex items-center gap-2.5 text-xs">
                  <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-600 border border-gray-200">
                    <GraduationCap size={13} />
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
        <div className="p-3.5 border-t border-gray-200 bg-gray-50/70 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-gray-500">
            {alumni.company} · {alumni.location}
          </span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              asChild
            >
              <Link
                href={`/alumni/${alumni.id}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5"
              >
                <span>View Full Profile</span>
                <ArrowRight size={13} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
