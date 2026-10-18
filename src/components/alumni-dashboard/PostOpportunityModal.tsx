"use client";

import { useState } from "react";
import {
  X,
  Plus,
  Briefcase,
  Sparkles,
  Check,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  addOpportunity,
  updateOpportunity,
  loadAlumniProfile,
} from "@/lib/dashboard-storage";
import { enhanceOpportunityDescription } from "@/services/ai-writing-assistant";
import type { Opportunity, OpportunityType, WorkArrangement } from "@/types";

interface PostOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (title: string, isEdit?: boolean) => void;
  initialData?: Opportunity | null;
}

export function PostOpportunityModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: PostOpportunityModalProps) {
  if (!isOpen) return null;

  return (
    <PostOpportunityModalForm
      key={initialData?.id || "new-opportunity"}
      onClose={onClose}
      onSuccess={onSuccess}
      initialData={initialData}
    />
  );
}

function PostOpportunityModalForm({
  onClose,
  onSuccess,
  initialData,
}: {
  onClose: () => void;
  onSuccess: (title: string, isEdit?: boolean) => void;
  initialData?: Opportunity | null;
}) {
  const currentAlumni = loadAlumniProfile();

  const [title, setTitle] = useState(initialData?.title || "");
  const [company, setCompany] = useState(initialData?.company || currentAlumni.company || "");
  const [location, setLocation] = useState(initialData?.location || "San Francisco, CA");
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement>(
    initialData?.workArrangement || "hybrid"
  );
  const [type, setType] = useState<OpportunityType>(initialData?.type || "internship");
  const [description, setDescription] = useState(initialData?.description || "");
  const [requirementsText, setRequirementsText] = useState(
    initialData?.requirements ? initialData.requirements.join("\n") : ""
  );
  const [skillsText, setSkillsText] = useState(
    initialData?.skills ? initialData.skills.join(", ") : ""
  );
  const [eligibility, setEligibility] = useState(initialData?.eligibility || "");
  const [applyUrl, setApplyUrl] = useState(initialData?.applyUrl || "");
  const [contactInstructions, setContactInstructions] = useState(
    initialData?.contactInstructions || ""
  );
  const [deadline, setDeadline] = useState(initialData?.deadline || "2026-11-30");

  // State for AI Enhancement
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedPreview, setEnhancedPreview] = useState<{
    text: string;
    improvements: string[];
  } | null>(null);

  // Form Validation & submission
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);


  const isEditing = Boolean(initialData);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!title.trim()) {
      errors.title = "Opportunity title is required.";
    }
    if (!company.trim()) {
      errors.company = "Company or organizing institution is required.";
    }
    if (!location.trim()) {
      errors.location = "Location is required.";
    }
    if (!description.trim()) {
      errors.description = "Role overview / description is required.";
    }

    if (applyUrl.trim()) {
      try {
        const parsed = new URL(applyUrl.trim());
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          errors.applyUrl = "Application URL must start with http:// or https://";
        }
      } catch {
        errors.applyUrl = "Please provide a valid web address (e.g. https://company.com/jobs).";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEnhanceWithAI = async () => {
    if (!description.trim()) {
      setValidationErrors((prev) => ({
        ...prev,
        description: "Please write an initial draft description first before enhancing with AI.",
      }));
      return;
    }

    setIsEnhancing(true);
    try {
      const res = await enhanceOpportunityDescription(description, title, company);
      setEnhancedPreview({
        text: res.enhancedText,
        improvements: res.improvements,
      });
    } catch {
      // fallback
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleApplyAIEnhancement = () => {
    if (enhancedPreview) {
      setDescription(enhancedPreview.text);
      setEnhancedPreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    const requirements = requirementsText
      .split("\n")
      .map((r) => r.trim())
      .filter(Boolean);

    const skills = skillsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (isEditing && initialData) {
      updateOpportunity(initialData.id, {
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        workArrangement,
        type,
        deadline: deadline || undefined,
        description: description.trim(),
        requirements: requirements.length > 0 ? requirements : ["Relevant technical curiosity"],
        skills: skills.length > 0 ? skills : ["Problem Solving", "Engineering"],
        eligibility: eligibility.trim() || undefined,
        applyUrl: applyUrl.trim() || undefined,
        contactInstructions: contactInstructions.trim() || undefined,
      });

      setSubmitting(false);
      onSuccess(title.trim(), true);
      onClose();
    } else {
      const newOpp: Opportunity = {
        id: `opp-${Date.now()}`,
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        workArrangement,
        status: "active",
        type,
        postedByAlumniId: currentAlumni.id,
        postedByAlumniName: currentAlumni.name,
        postedByAlumniRole: currentAlumni.role,
        postedDate: new Date().toISOString().split("T")[0],
        deadline: deadline || undefined,
        description: description.trim(),
        requirements: requirements.length > 0 ? requirements : ["Relevant technical curiosity and coursework"],
        skills: skills.length > 0 ? skills : ["Problem Solving", "Engineering"],
        eligibility: eligibility.trim() || undefined,
        applyUrl: applyUrl.trim() || undefined,
        contactInstructions: contactInstructions.trim() || undefined,
        contactEmail: `${currentAlumni.name.toLowerCase().replace(/\s+/g, ".")}@alumnipath.demo`,
        applicantsCount: 0,
      };

      addOpportunity(newOpp);
      setSubmitting(false);
      onSuccess(newOpp.title, false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 z-10 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Briefcase size={16} className="text-[#0a66c2]" />
              <span>{isEditing ? "Edit Career Opportunity" : "Post New Career Opportunity"}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share internships, full-time roles, referrals, workshops, or hackathons directly with verified students.
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Opportunity Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineering Intern — Systems or Backend Engineer Referral"
              className={`w-full text-xs bg-white border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] ${
                validationErrors.title ? "border-red-400" : "border-gray-200"
              }`}
            />
            {validationErrors.title && (
              <p className="text-[11px] text-red-600 mt-1">{validationErrors.title}</p>
            )}
          </div>

          {/* Company & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Company or Organizing Institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Datadog or University Tech Hub"
                className={`w-full text-xs bg-white border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] ${
                  validationErrors.company ? "border-red-400" : "border-gray-200"
                }`}
              />
              {validationErrors.company && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.company}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Opportunity Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as OpportunityType)}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              >
                <option value="internship">Internship</option>
                <option value="full_time">Full-Time Job (Entry/Junior)</option>
                <option value="referral">Internal Referral</option>
                <option value="workshop">Workshop</option>
                <option value="hackathon">Hackathon</option>
                <option value="event">Technical Event / Tech Talk</option>
                <option value="research">Research Mentorship</option>
                <option value="shadowing">Shadowing Cohort</option>
              </select>
            </div>
          </div>

          {/* Work Arrangement & Location & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Work Arrangement
              </label>
              <select
                value={workArrangement}
                onChange={(e) => setWorkArrangement(e.target.value as WorkArrangement)}
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              >
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="on_site">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className={`w-full text-xs bg-white border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] ${
                  validationErrors.location ? "border-red-400" : "border-gray-200"
                }`}
              />
              {validationErrors.location && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.location}</p>
              )}
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

          {/* Description & AI Writing Assistant Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-700">
                Role Overview &amp; Description <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                disabled={isEnhancing}
                onClick={handleEnhanceWithAI}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0a66c2] hover:text-[#004182] hover:underline"
              >
                <Sparkles size={12} className="text-amber-500" />
                <span>{isEnhancing ? "Enhancing draft..." : "Enhance with AI Assistant"}</span>
              </button>
            </div>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the student will work on, team mission, and learning opportunities..."
              className={`w-full text-xs bg-white border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] ${
                validationErrors.description ? "border-red-400" : "border-gray-200"
              }`}
            />
            {validationErrors.description && (
              <p className="text-[11px] text-red-600 mt-1">{validationErrors.description}</p>
            )}

            {/* AI Writing Assistant Review Panel */}
            {enhancedPreview && (
              <div className="mt-2.5 p-3.5 bg-blue-50/70 border border-blue-200 rounded-md animate-in fade-in">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Sparkles size={13} className="text-amber-500 shrink-0" />
                    <span>AI Writing Assistant Suggestion (Review Required)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEnhancedPreview(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="mt-2 p-2.5 bg-white border border-blue-100 rounded text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                  {enhancedPreview.text}
                </div>

                <div className="mt-2 text-[11px] text-blue-800">
                  <span className="font-semibold block mb-0.5">Improvements Applied:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {enhancedPreview.improvements.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-blue-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEnhancedPreview(null)}
                    className="text-xs text-gray-600"
                  >
                    Keep My Original
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleApplyAIEnhancement}
                    className="text-xs bg-[#0a66c2] hover:bg-[#004182]"
                  >
                    <Check size={12} className="mr-1" />
                    <span>Apply to Draft</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Eligibility Requirements */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Eligibility Requirements (Optional)
            </label>
            <input
              type="text"
              value={eligibility}
              onChange={(e) => setEligibility(e.target.value)}
              placeholder="e.g. Enrolled undergraduate students graduating in 2026/2027"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          {/* Key Requirements (one per line) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Key Role Requirements (one per line)
            </label>
            <textarea
              rows={2}
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              placeholder="Pursuing BS/MS in Computer Science&#10;Proficiency in Go or Python&#10;Solid understanding of data structures"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          {/* Required Skills */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Required Skills (comma-separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="Go, Python, Docker, PostgreSQL, Distributed Systems"
              className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
            />
          </div>

          {/* Application URL & Contact Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                <LinkIcon size={12} className="text-gray-400" />
                <span>Application URL (Optional)</span>
              </label>
              <input
                type="url"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="https://company.com/careers/job-123"
                className={`w-full text-xs bg-white border rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2] ${
                  validationErrors.applyUrl ? "border-red-400" : "border-gray-200"
                }`}
              />
              {validationErrors.applyUrl && (
                <p className="text-[11px] text-red-600 mt-1">{validationErrors.applyUrl}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Contact or Submission Instructions (Optional)
              </label>
              <input
                type="text"
                value={contactInstructions}
                onChange={(e) => setContactInstructions(e.target.value)}
                placeholder="e.g. Message through AlumniPath with your resume and project link"
                className="w-full text-xs bg-white border border-gray-200 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#0a66c2]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
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
              disabled={submitting}
              className="text-xs bg-[#0a66c2] hover:bg-[#004182] flex items-center gap-1.5"
            >
              <Plus size={13} />
              <span>
                {submitting
                  ? isEditing
                    ? "Updating..."
                    : "Publishing..."
                  : isEditing
                  ? "Save Changes"
                  : "Publish Opportunity"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
