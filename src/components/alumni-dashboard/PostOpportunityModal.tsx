"use client";

import { useState } from "react";
import { X, Plus, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addOpportunity, loadAlumniProfile } from "@/lib/dashboard-storage";
import type { Opportunity, OpportunityType } from "@/types";

interface PostOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string) => void;
}

export function PostOpportunityModal({
  isOpen,
  onClose,
  onSuccess,
}: PostOpportunityModalProps) {
  const currentAlumni = loadAlumniProfile();

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(currentAlumni.company || "");
  const [location, setLocation] = useState("San Francisco, CA (Hybrid)");
  const [type, setType] = useState<OpportunityType>("internship");
  const [description, setDescription] = useState("");
  const [requirementsText, setRequirementsText] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [deadline, setDeadline] = useState("2026-11-30");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !company.trim() || !description.trim()) return;

    setSubmitting(true);

    const requirements = requirementsText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const newOpp: Opportunity = {
      id: `opp-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      location: location.trim(),
      type,
      postedByAlumniId: currentAlumni.id,
      postedByAlumniName: currentAlumni.name,
      postedByAlumniRole: currentAlumni.role,
      postedDate: new Date().toISOString().split("T")[0],
      deadline: deadline || "2026-12-31",
      description: description.trim(),
      requirements: requirements.length > 0 ? requirements : ["Relevant technical curiosity and coursework"],
      skills: skills.length > 0 ? skills : ["Problem Solving", "Engineering"],
      applyUrl: applyUrl.trim() || undefined,
      contactEmail: `${currentAlumni.name.toLowerCase().replace(/\s+/g, ".")}@alumnipath.demo`,
      applicantsCount: 0,
    };

    setTimeout(() => {
      addOpportunity(newOpp);
      setSubmitting(false);
      onSuccess(newOpp.title);
      onClose();
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
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={16} className="text-[#0a66c2]" />
              <span>Post New Career Opportunity</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share internships, full-time junior openings, or referral slots directly with verified students.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Role / Position Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer Intern — Systems"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Datadog"
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Opportunity Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityType)}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              >
                <option value="internship">Internship</option>
                <option value="full_time">Full-Time (Entry-Level)</option>
                <option value="referral">Internal Referral</option>
                <option value="shadowing">Shadowing Cohort</option>
                <option value="research">Research Mentorship</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA / Remote"
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Role Overview &amp; Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the student will work on, team mission, and learning opportunities..."
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Requirements (one per line)
            </label>
            <textarea
              rows={2}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Pursuing BS/MS in Computer Science&#10;Proficiency in Python or Go&#10;Familiarity with data structures"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Target Skills (comma-separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Python, Go, PostgreSQL, Docker, Distributed Systems"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Official Application URL (optional)
            </label>
            <input
              type="url"
              value={applyUrl}
              onChange={(e) => setApplyUrl(e.target.value)}
              placeholder="https://company.com/careers/job-id"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
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
              disabled={submitting || !title.trim() || !company.trim() || !description.trim()}
              className="text-xs bg-[#0a66c2] hover:bg-[#004182] flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>{submitting ? "Publishing..." : "Publish Opportunity"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
