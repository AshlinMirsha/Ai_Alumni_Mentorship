"use client";

import { useState, useEffect, useRef } from "react";
import {
  X,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Building2,
  Briefcase,
  MapPin,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Award,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  GraduationCap,
  Globe,
  Tag,
  Users,
  Target,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import {
  calculateInternshipDuration,
  uploadAlumniAvatar,
} from "@/lib/alumni-profile-service";
import type {
  Alumni,
  AlumniWorkExperienceRecord,
  AlumniInternshipRecord,
  AlumniDetailedSkill,
  AlumniCareerMilestone,
  AlumniCurrentEmployment,
  AlumniMentorshipDetails,
  AlumniCertification,
  AlumniEducationRecord,
  AlumniSpecializationDetails,
  ProfessionalLinkItem,
  InternshipStatus,
} from "@/types";

// ============================================================================
// 1. EDIT BASIC INFORMATION MODAL
// ============================================================================

interface EditBasicInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumni: Alumni;
  onSave: (updated: Partial<Alumni>) => void;
}

export function EditBasicInfoModal({
  isOpen,
  onClose,
  alumni,
  onSave,
}: EditBasicInfoModalProps) {
  const [name, setName] = useState(alumni.name || "");
  const [headline, setHeadline] = useState(alumni.headline || "");
  const [bio, setBio] = useState(alumni.bio || "");
  const [graduationYear, setGraduationYear] = useState(alumni.graduationYear || new Date().getFullYear());
  const [degree, setDegree] = useState(alumni.degree || "");
  const [department, setDepartment] = useState(alumni.department || "");
  const [university, setUniversity] = useState(alumni.university || alumni.institution || "Karunya University");
  const [city, setCity] = useState(alumni.city || alumni.location || "");
  const [linkedinUrl, setLinkedinUrl] = useState(alumni.linkedinUrl || "");
  const [githubUrl, setGithubUrl] = useState(alumni.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(alumni.portfolioUrl || "");
  const [avatarUrl, setAvatarUrl] = useState(alumni.avatarUrl || alumni.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(alumni.name || "");
      setHeadline(alumni.headline || "");
      setBio(alumni.bio || "");
      setGraduationYear(alumni.graduationYear || new Date().getFullYear());
      setDegree(alumni.degree || "");
      setDepartment(alumni.department || "");
      setUniversity(alumni.university || alumni.institution || "Karunya University");
      setCity(alumni.city || alumni.location || "");
      setLinkedinUrl(alumni.linkedinUrl || "");
      setGithubUrl(alumni.githubUrl || "");
      setPortfolioUrl(alumni.portfolioUrl || "");
      setAvatarUrl(alumni.avatarUrl || alumni.avatar || "");
      setUploadError(null);
    }
  }, [isOpen, alumni]);

  if (!isOpen) return null;

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const url = await uploadAlumniAvatar(file);
      setAvatarUrl(url);
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      graduationYear: Number(graduationYear) || new Date().getFullYear(),
      degree: degree.trim(),
      department: department.trim(),
      university: university.trim(),
      institution: university.trim(),
      city: city.trim(),
      location: city.trim(),
      linkedinUrl: linkedinUrl.trim(),
      githubUrl: githubUrl.trim(),
      portfolioUrl: portfolioUrl.trim(),
      avatarUrl: avatarUrl.trim(),
      avatar: avatarUrl.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">Edit Basic Information</h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Update your primary professional identity, education background, and contact links.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-4 bg-[#F9F9F9] border border-[#E7E7E7] rounded-xl">
            <div className="relative">
              <Avatar src={avatarUrl} name={name || "Alumni"} size="lg" />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                  ...
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#090909] block">
                Profile Picture
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-xs flex items-center gap-1.5"
                >
                  <Upload size={13} />
                  <span>{isUploading ? "Uploading..." : "Upload New Photo"}</span>
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setAvatarUrl("")}
                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                )}
              </div>
              {uploadError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle size={12} /> {uploadError}
                </p>
              )}
              <p className="text-[11px] text-[#737373]">
                JPG, PNG, or WebP. Max 5MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Full Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ashlin Mirsha"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Professional Headline *
              </label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Staff Systems Architect | Distributed Cloud | Mentor"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Short Professional Biography
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Brief summary of your professional journey, technical leadership, and domain expertise..."
              className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909] focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                College or University
              </label>
              <Input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g. Karunya University"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Degree & Department
              </label>
              <Input
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Graduation Year
              </label>
              <Input
                type="number"
                value={graduationYear || ""}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                placeholder="e.g. 2021"
                min={1970}
                max={2035}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Current Location or City
            </label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3.5 top-3 text-gray-400" />
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. San Francisco, CA or Bangalore, India"
                className="pl-9"
              />
            </div>
          </div>

          {/* Professional URLs */}
          <div className="space-y-3 pt-2 border-t border-[#E7E7E7]">
            <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
              Primary Professional Links
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  LinkedIn Profile
                </label>
                <Input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  GitHub Profile
                </label>
                <Input
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">
                  Personal Portfolio / Website
                </label>
                <Input
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://yourportfolio.dev"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
            >
              Save Basic Information
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. EDIT CURRENT EMPLOYMENT MODAL
// ============================================================================

interface EditCurrentEmploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployment?: AlumniCurrentEmployment;
  currentCompany?: string;
  currentRole?: string;
  location?: string;
  onSave: (updated: {
    currentEmployment: AlumniCurrentEmployment;
    company: string;
    role: string;
  }) => void;
}

export function EditCurrentEmploymentModal({
  isOpen,
  onClose,
  currentEmployment,
  currentCompany,
  currentRole,
  location,
  onSave,
}: EditCurrentEmploymentModalProps) {
  const [isCurrentlyEmployed, setIsCurrentlyEmployed] = useState<boolean>(
    currentEmployment?.isCurrentlyEmployed !== undefined
      ? currentEmployment.isCurrentlyEmployed
      : currentEmployment?.status === "Employed" || !!currentEmployment?.company
  );
  const [status, setStatus] = useState<string>(currentEmployment?.status || "Employed");
  const [company, setCompany] = useState(currentEmployment?.company || currentCompany || "");
  const [role, setRole] = useState(currentEmployment?.role || currentRole || "");
  const [employmentType, setEmploymentType] = useState(currentEmployment?.employmentType || "Full-time");
  const [startMonthYear, setStartMonthYear] = useState(
    currentEmployment?.startMonthYear || currentEmployment?.startDate || ""
  );
  const [workLocation, setWorkLocation] = useState(currentEmployment?.location || location || "");
  const [workMode, setWorkMode] = useState(
    currentEmployment?.workMode || currentEmployment?.workArrangement || "Hybrid"
  );
  const [jobDescription, setJobDescription] = useState(currentEmployment?.jobDescription || "");
  const [responsibilities, setResponsibilities] = useState(currentEmployment?.responsibilities || "");

  useEffect(() => {
    if (isOpen) {
      const isEmp =
        currentEmployment?.isCurrentlyEmployed !== undefined
          ? currentEmployment.isCurrentlyEmployed
          : currentEmployment?.status === "Employed" || !!currentEmployment?.company;
      setIsCurrentlyEmployed(isEmp);
      setStatus(currentEmployment?.status || (isEmp ? "Employed" : "Seeking opportunities"));
      setCompany(currentEmployment?.company || currentCompany || "");
      setRole(currentEmployment?.role || currentRole || "");
      setEmploymentType(currentEmployment?.employmentType || "Full-time");
      setStartMonthYear(currentEmployment?.startMonthYear || currentEmployment?.startDate || "");
      setWorkLocation(currentEmployment?.location || location || "");
      setWorkMode(currentEmployment?.workMode || currentEmployment?.workArrangement || "Hybrid");
      setJobDescription(currentEmployment?.jobDescription || "");
      setResponsibilities(currentEmployment?.responsibilities || "");
    }
  }, [isOpen, currentEmployment, currentCompany, currentRole, location]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCompany = isCurrentlyEmployed ? company.trim() : "";
    const cleanRole = isCurrentlyEmployed ? role.trim() : status;

    onSave({
      currentEmployment: {
        isCurrentlyEmployed,
        status: isCurrentlyEmployed ? "Employed" : status,
        company: cleanCompany,
        role: cleanRole,
        employmentType: isCurrentlyEmployed ? employmentType : undefined,
        startMonthYear: isCurrentlyEmployed ? startMonthYear : undefined,
        startDate: isCurrentlyEmployed ? startMonthYear : undefined,
        location: workLocation.trim(),
        workMode: isCurrentlyEmployed ? workMode : undefined,
        workArrangement: isCurrentlyEmployed ? workMode : undefined,
        jobDescription: jobDescription.trim(),
        responsibilities: responsibilities.trim(),
      },
      company: cleanCompany,
      role: cleanRole,
    });
    onClose();
  };

  const handleClear = () => {
    setIsCurrentlyEmployed(false);
    setStatus("Seeking opportunities");
    setCompany("");
    setRole("");
    setStartMonthYear("");
    setJobDescription("");
    setResponsibilities("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">Current Employment</h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Specify your employment situation, current organization, and job responsibilities.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Employment Status Indicator */}
          <div className="p-3.5 bg-neutral-50 border border-[#E7E7E7] rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#090909] block">
                Are you currently employed?
              </span>
              <p className="text-[11px] text-gray-500">
                Toggle off if you are seeking opportunities, on a career break, or studying.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrentlyEmployed}
                onChange={(e) => {
                  setIsCurrentlyEmployed(e.target.checked);
                  if (e.target.checked) setStatus("Employed");
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#090909]"></div>
            </label>
          </div>

          {!isCurrentlyEmployed ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                  Current Situation
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    "Seeking opportunities",
                    "Career break",
                    "Studying further",
                    "Working independently",
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`text-xs px-3 py-2 rounded-xl border text-center font-medium transition-all ${
                        status === st
                          ? "bg-[#090909] text-white border-[#090909] shadow-xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                  Status Notes or What You Are Exploring
                </label>
                <textarea
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  rows={3}
                  placeholder="Describe target roles, independent learning, personal research, or upcoming goals..."
                  className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                    Current Company Name *
                  </label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Datadog, Stripe, Google, or Startup"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                    Current Job Title *
                  </label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Principal Systems Architect"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                    Employment Type
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#090909]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Self-employed">Self-employed</option>
                    <option value="Freelance">Freelance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                    Start Month & Year
                  </label>
                  <Input
                    type="month"
                    value={startMonthYear}
                    onChange={(e) => setStartMonthYear(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                    Work Mode
                  </label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#090909]"
                  >
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                  Current Work Location
                </label>
                <Input
                  value={workLocation}
                  onChange={(e) => setWorkLocation(e.target.value)}
                  placeholder="e.g. New York, NY or Remote"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                  Job Description & Overview
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={2}
                  placeholder="High-level overview of your department, mission, or group..."
                  className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                  Current Responsibilities & Scope
                </label>
                <textarea
                  value={responsibilities}
                  onChange={(e) => setResponsibilities(e.target.value)}
                  rows={3}
                  placeholder="Key technical systems led, engineering mentorship, high-impact deliverables, or architecture..."
                  className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
                />
              </div>
            </>
          )}

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-red-600 font-medium cursor-pointer"
            >
              Clear Current Employment
            </button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
              >
                Save Employment
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 3. EDIT PROFESSIONAL SPECIALIZATION MODAL
// ============================================================================

interface EditSpecializationModalProps {
  isOpen: boolean;
  onClose: () => void;
  details?: AlumniSpecializationDetails;
  specializations?: string[];
  onSave: (details: AlumniSpecializationDetails, flatList: string[]) => void;
}

export function EditSpecializationModal({
  isOpen,
  onClose,
  details,
  specializations = [],
  onSave,
}: EditSpecializationModalProps) {
  const [primary, setPrimary] = useState(details?.primarySpecialization || specializations[0] || "");
  const [additional, setAdditional] = useState<string[]>(
    details?.additionalSpecializations || specializations.slice(1) || []
  );
  const [addInput, setAddInput] = useState("");
  const [domains, setDomains] = useState<string[]>(details?.technicalDomains || []);
  const [domainInput, setDomainInput] = useState("");
  const [expertise, setExpertise] = useState<string[]>(details?.professionalExpertise || []);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [industryExperience, setIndustryExperience] = useState(details?.industryExperience || "");
  const [mentoringAreas, setMentoringAreas] = useState<string[]>(details?.mentoringAreas || []);
  const [mentorInput, setMentorInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPrimary(details?.primarySpecialization || specializations[0] || "");
      setAdditional(details?.additionalSpecializations || specializations.slice(1) || []);
      setDomains(details?.technicalDomains || []);
      setExpertise(details?.professionalExpertise || []);
      setIndustryExperience(details?.industryExperience || "");
      setMentoringAreas(details?.mentoringAreas || []);
    }
  }, [isOpen, details, specializations]);

  if (!isOpen) return null;

  const handleAddAdditional = () => {
    const t = addInput.trim();
    if (t && !additional.includes(t)) {
      setAdditional([...additional, t]);
      setAddInput("");
    }
  };

  const handleAddDomain = () => {
    const t = domainInput.trim();
    if (t && !domains.includes(t)) {
      setDomains([...domains, t]);
      setDomainInput("");
    }
  };

  const handleAddExpertise = () => {
    const t = expertiseInput.trim();
    if (t && !expertise.includes(t)) {
      setExpertise([...expertise, t]);
      setExpertiseInput("");
    }
  };

  const handleAddMentoringArea = () => {
    const t = mentorInput.trim();
    if (t && !mentoringAreas.includes(t)) {
      setMentoringAreas([...mentoringAreas, t]);
      setMentorInput("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const flatList = [
      ...(primary ? [primary.trim()] : []),
      ...additional,
    ];
    onSave(
      {
        primarySpecialization: primary.trim(),
        additionalSpecializations: additional,
        technicalDomains: domains,
        professionalExpertise: expertise,
        industryExperience: industryExperience.trim(),
        mentoringAreas,
      },
      Array.from(new Set(flatList))
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">Professional Specialization</h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Specify your primary specialization, technical domains, and areas to guide students.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Primary Specialization *
            </label>
            <Input
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              placeholder="e.g. Distributed Cloud Systems"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Additional Specializations
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={addInput}
                onChange={(e) => setAddInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAdditional();
                  }
                }}
                placeholder="e.g. DevOps, Site Reliability, LLM Inference"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddAdditional}>
                Add
              </Button>
            </div>
            {additional.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {additional.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => setAdditional(additional.filter((x) => x !== s))}
                      className="hover:text-red-600"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Technical Domains & Architectures
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDomain();
                  }
                }}
                placeholder="e.g. Event-Driven Systems, Kubernetes Operators, FinTech"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddDomain}>
                Add
              </Button>
            </div>
            {domains.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {domains.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => setDomains(domains.filter((x) => x !== d))}
                      className="hover:text-red-600"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Industry Experience Overview
            </label>
            <Input
              value={industryExperience}
              onChange={(e) => setIndustryExperience(e.target.value)}
              placeholder="e.g. 7+ years in Cloud Infrastructure & Enterprise SaaS"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Areas You Can Guide Students In
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={mentorInput}
                onChange={(e) => setMentorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddMentoringArea();
                  }
                }}
                placeholder="e.g. System Design, Code Reviews, Early-Career Roadmap"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddMentoringArea}>
                Add
              </Button>
            </div>
            {mentoringAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {mentoringAreas.map((m) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {m}
                    <button
                      type="button"
                      onClick={() => setMentoringAreas(mentoringAreas.filter((x) => x !== m))}
                      className="hover:text-red-600"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
            >
              Save Specializations
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 4. ADD / EDIT WORK EXPERIENCE MODAL
// ============================================================================

interface AddEditWorkExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: AlumniWorkExperienceRecord | null;
  onSave: (record: AlumniWorkExperienceRecord) => void;
  onDelete?: (id: string) => void;
}

export function AddEditWorkExperienceModal({
  isOpen,
  onClose,
  record,
  onSave,
  onDelete,
}: AddEditWorkExperienceModalProps) {
  const isEditing = !!record;
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [workLocation, setWorkLocation] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setCompany(record.company || "");
        setRole(record.role || "");
        setEmploymentType(record.employmentType || "Full-time");
        setStartDate(record.startDate || "");
        setEndDate(record.endDate || "");
        setIsCurrent(!!record.isCurrent);
        setWorkLocation(record.location || "");
        setResponsibilities(record.responsibilities || "");
        setSkills(record.skills || []);
      } else {
        setCompany("");
        setRole("");
        setEmploymentType("Full-time");
        setStartDate("");
        setEndDate("");
        setIsCurrent(false);
        setWorkLocation("");
        setResponsibilities("");
        setSkills([]);
      }
      setSkillInput("");
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !startDate.trim()) return;

    onSave({
      id: record?.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      company: company.trim(),
      role: role.trim(),
      employmentType,
      startDate: startDate.trim(),
      endDate: isCurrent ? undefined : endDate.trim(),
      isCurrent,
      location: workLocation.trim(),
      responsibilities: responsibilities.trim(),
      skills,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">
              {isEditing ? "Edit Work Experience" : "Add Work Experience"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Record past or present positions in your career timeline.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Company Name *
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. AWS, Microsoft, Airbnb"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Job Title / Role *
              </label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#090909]"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
                <option value="Self-employed">Self-employed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Location
              </label>
              <Input
                value={workLocation}
                onChange={(e) => setWorkLocation(e.target.value)}
                placeholder="e.g. Seattle, WA or Remote"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Start Date *
              </label>
              <Input
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                End Date {isCurrent ? "(Currently Working)" : "*"}
              </label>
              <Input
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isCurrent}
                required={!isCurrent}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isCurrentExp"
              checked={isCurrent}
              onChange={(e) => {
                setIsCurrent(e.target.checked);
                if (e.target.checked) setEndDate("");
              }}
              className="h-4 w-4 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
            />
            <label htmlFor="isCurrentExp" className="text-xs font-medium text-gray-700 cursor-pointer">
              I currently work in this role
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Responsibilities & Description
            </label>
            <textarea
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={3}
              placeholder="Architected high-throughput services, reduced p99 latency by 40%, mentored 4 junior engineers..."
              className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Skills & Technologies Used
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Go, Kubernetes, Kafka, gRPC"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this experience record?")) {
                    onDelete(record!.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 size={13} /> Delete Record
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
              >
                {isEditing ? "Update Experience" : "Add Experience"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 5. ADD / EDIT INTERNSHIP MODAL (WITH LIVE CALCULATED DURATION)
// ============================================================================

interface AddEditInternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: AlumniInternshipRecord | null;
  onSave: (record: AlumniInternshipRecord) => void;
  onDelete?: (id: string) => void;
}

export function AddEditInternshipModal({
  isOpen,
  onClose,
  record,
  onSave,
  onDelete,
}: AddEditInternshipModalProps) {
  const isEditing = !!record;
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [domain, setDomain] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<string>("On-site");
  const [status, setStatus] = useState<InternshipStatus>("Completed");
  const [skillsLearned, setSkillsLearned] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [description, setDescription] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setCompany(record.company || "");
        setRole(record.role || "");
        setDomain(record.domain || "");
        setStartDate(record.startDate || "");
        setEndDate(record.endDate || "");
        setType(record.type || "On-site");
        setStatus(record.status || "Completed");
        setSkillsLearned(record.skillsLearned || []);
        setDescription(record.description || "");
        setProofUrl(record.proofUrl || "");
      } else {
        setCompany("");
        setRole("");
        setDomain("");
        setStartDate("");
        setEndDate("");
        setType("On-site");
        setStatus("Completed");
        setSkillsLearned([]);
        setDescription("");
        setProofUrl("");
      }
      setSkillInput("");
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  // Live Calculated Duration
  const liveDuration = calculateInternshipDuration(startDate, endDate, status);

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skillsLearned.includes(trimmed)) {
      setSkillsLearned([...skillsLearned, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkillsLearned(skillsLearned.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim() || !startDate.trim()) return;

    onSave({
      id: record?.id || `int-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      company: company.trim(),
      role: role.trim(),
      domain: domain.trim(),
      startDate: startDate.trim(),
      endDate: status === "Ongoing" ? undefined : endDate.trim(),
      duration: liveDuration,
      type,
      status,
      skillsLearned,
      description: description.trim(),
      proofUrl: proofUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">
              {isEditing ? "Edit Internship" : "Add Internship"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Record internship details, duration, technologies learned, and completion status.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Internship Status *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Completed", "Ongoing", "Not Completed"] as InternshipStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  className={`text-xs px-3 py-2 rounded-xl border text-center font-medium transition-all cursor-pointer ${
                    status === st
                      ? st === "Completed"
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : st === "Ongoing"
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-neutral-800 text-white border-neutral-800 shadow-xs"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              {status === "Completed"
                ? "✓ Contributes to your verified 'Internships Completed' count."
                : status === "Ongoing"
                ? "ℹ Marked in-progress. Will NOT be added to completed count until marked Completed."
                : "ℹ Not completed. Will not be counted as completed."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Company / Organization Name *
              </label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Cisco, Intel, Red Hat"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Internship Role / Designation *
              </label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Cloud Engineering Intern"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Domain / Specialization
              </label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. DevOps, Machine Learning, Web Dev"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Internship Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#090909]"
              >
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>

          {/* Dates & Auto-Calculated Duration */}
          <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#090909] mb-1">
                  Start Date *
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#090909] mb-1">
                  End Date {status === "Ongoing" ? "(In Progress)" : "*"}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={status === "Ongoing"}
                  required={status !== "Ongoing"}
                />
              </div>
            </div>

            {/* Calculated Duration Indicator */}
            <div className="flex items-center justify-between text-xs pt-2 border-t border-gray-200">
              <span className="text-gray-600 flex items-center gap-1.5 font-medium">
                <Clock size={13} className="text-neutral-500" />
                Calculated Duration:
              </span>
              <span className="font-bold text-[#090909] bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                {liveDuration}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Skills / Technologies Learned
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Docker, Python, PyTorch, CI/CD"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            {skillsLearned.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skillsLearned.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="hover:text-red-600 cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Description of Responsibilities
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Built telemetry data pipelines, authored internal API docs, completed final internship presentation..."
              className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Certificate or Verification URL (Optional)
            </label>
            <Input
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://credential.net/..."
            />
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Delete this internship record?")) {
                    onDelete(record!.id);
                    onClose();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 size={13} /> Delete Record
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
              >
                {isEditing ? "Update Internship" : "Add Internship"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 6. ADD / EDIT DETAILED SKILL MODAL
// ============================================================================

interface AddEditDetailedSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill?: AlumniDetailedSkill | null;
  onSave: (skill: AlumniDetailedSkill) => void;
  onDelete?: (id: string) => void;
}

export function AddEditDetailedSkillModal({
  isOpen,
  onClose,
  skill,
  onSave,
  onDelete,
}: AddEditDetailedSkillModalProps) {
  const isEditing = !!skill;
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Advanced");
  const [years, setYears] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (skill) {
        setName(skill.name || "");
        setLevel(skill.level || "Advanced");
        setYears(skill.yearsOfExperience ? String(skill.yearsOfExperience) : "");
        setDescription(skill.description || "");
      } else {
        setName("");
        setLevel("Advanced");
        setYears("");
        setDescription("");
      }
    }
  }, [isOpen, skill]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: skill?.id || `sk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim(),
      level,
      yearsOfExperience: years.trim() ? years.trim() : undefined,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">
              {isEditing ? "Edit Skill & Technology" : "Add Skill"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Add technical skills, tools, or leadership proficiencies.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Skill Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Distributed Systems, Next.js, Rust"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Proficiency Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#090909]"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Years of Experience
              </label>
              <Input
                value={years}
                onChange={(e) => setYears(e.target.value)}
                placeholder="e.g. 5+ years"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Description / Application (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Used daily to scale microservices and Kafka event brokers..."
              className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
            />
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(skill!.id);
                  onClose();
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
              >
                {isEditing ? "Update Skill" : "Add Skill"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 7. ADD / EDIT EDUCATION MODAL
// ============================================================================

interface AddEditEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: AlumniEducationRecord | null;
  onSave: (record: AlumniEducationRecord) => void;
  onDelete?: (id: string) => void;
}

export function AddEditEducationModal({
  isOpen,
  onClose,
  record,
  onSave,
  onDelete,
}: AddEditEducationModalProps) {
  const isEditing = !!record;
  const [degree, setDegree] = useState("");
  const [institution, setInstitution] = useState("");
  const [field, setField] = useState("");
  const [graduationYear, setGraduationYear] = useState<number | "">("");
  const [additionalQualifications, setAdditionalQualifications] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setDegree(record.degree || "");
        setInstitution(record.institution || "");
        setField(record.field || "");
        setGraduationYear(record.graduationYear || "");
        setAdditionalQualifications(record.additionalQualifications || "");
      } else {
        setDegree("");
        setInstitution("");
        setField("");
        setGraduationYear("");
        setAdditionalQualifications("");
      }
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!degree.trim() || !institution.trim()) return;

    onSave({
      id: record?.id || `edu-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      degree: degree.trim(),
      institution: institution.trim(),
      field: field.trim() || undefined,
      graduationYear: graduationYear ? Number(graduationYear) : undefined,
      additionalQualifications: additionalQualifications.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">
              {isEditing ? "Edit Education Record" : "Add Education Record"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Degrees, universities, fields of study, and academic honors.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Degree *
            </label>
            <Input
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. B.Tech or Master of Science"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              College or University *
            </label>
            <Input
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="e.g. Karunya University or Stanford"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Field of Study
              </label>
              <Input
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="e.g. Computer Science"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#090909] mb-1.5">
                Graduation Year
              </label>
              <Input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value ? Number(e.target.value) : "")}
                placeholder="e.g. 2021"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Additional Qualifications / Honors
            </label>
            <textarea
              value={additionalQualifications}
              onChange={(e) => setAdditionalQualifications(e.target.value)}
              rows={2}
              placeholder="e.g. Dean's Honors List, Magna Cum Laude, Research Fellowship"
              className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
            />
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(record!.id);
                  onClose();
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
              >
                {isEditing ? "Update Education" : "Add Education"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 8. ADD / EDIT CERTIFICATION MODAL
// ============================================================================

interface AddEditCertificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record?: AlumniCertification | null;
  onSave: (record: AlumniCertification) => void;
  onDelete?: (id: string) => void;
}

export function AddEditCertificationModal({
  isOpen,
  onClose,
  record,
  onSave,
  onDelete,
}: AddEditCertificationModalProps) {
  const isEditing = !!record;
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [credentialUrl, setCredentialUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (record) {
        setTitle(record.title || "");
        setIssuer(record.issuer || "");
        setIssueDate(record.issueDate || "");
        setCredentialUrl(record.credentialUrl || "");
      } else {
        setTitle("");
        setIssuer("");
        setIssueDate("");
        setCredentialUrl("");
      }
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !issuer.trim()) return;

    onSave({
      id: record?.id || `cert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      issuer: issuer.trim(),
      issueDate: issueDate.trim() || undefined,
      credentialUrl: credentialUrl.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">
              {isEditing ? "Edit Certification" : "Add Certification"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Professional credentials, cloud badges, and specialized licenses.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Certification Name *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AWS Certified Solutions Architect - Professional"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Certification Issuer *
            </label>
            <Input
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="e.g. Amazon Web Services, Google Cloud, Cisco"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Issue Date
            </label>
            <Input
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              placeholder="e.g. Oct 2024"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Credential URL (Optional)
            </label>
            <Input
              value={credentialUrl}
              onChange={(e) => setCredentialUrl(e.target.value)}
              placeholder="https://credly.com/badges/..."
            />
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(record!.id);
                  onClose();
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
              >
                {isEditing ? "Update Certification" : "Add Certification"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 9. ADD / EDIT OTHER PROFESSIONAL LINK MODAL
// ============================================================================

interface AddEditOtherLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  link?: ProfessionalLinkItem | null;
  onSave: (link: ProfessionalLinkItem) => void;
  onDelete?: (id: string) => void;
}

export function AddEditOtherLinkModal({
  isOpen,
  onClose,
  link,
  onSave,
  onDelete,
}: AddEditOtherLinkModalProps) {
  const isEditing = !!link;
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (link) {
        setTitle(link.title || "");
        setUrl(link.url || "");
      } else {
        setTitle("");
        setUrl("");
      }
    }
  }, [isOpen, link]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    let cleanUrl = url.trim();
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`;
    }

    onSave({
      id: link?.id || `link-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title: title.trim(),
      url: cleanUrl,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-md max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">
              {isEditing ? "Edit Link" : "Add Professional Link"}
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Portfolio, blog, research profile, or developer link.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Link Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Substack Engineering Blog, Kaggle, LeetCode"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              URL *
            </label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-between">
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(link!.id);
                  onClose();
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 font-medium cursor-pointer"
              >
                <Trash2 size={13} /> Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
              >
                {isEditing ? "Update Link" : "Add Link"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 10. EDIT MENTORSHIP INTERESTS MODAL
// ============================================================================

interface EditMentorshipInterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  details?: AlumniMentorshipDetails;
  availability?: "available" | "limited" | "unavailable";
  onSave: (updated: {
    mentorshipDetails: AlumniMentorshipDetails;
    mentorshipAvailability: "available" | "limited" | "unavailable";
  }) => void;
}

export function EditMentorshipInterestsModal({
  isOpen,
  onClose,
  details,
  availability,
  onSave,
}: EditMentorshipInterestsModalProps) {
  const [avail, setAvail] = useState<"available" | "limited" | "unavailable">(
    availability || "available"
  );
  const [maxMentees, setMaxMentees] = useState(details?.maxMentees || 5);
  const [technicalDomains, setTechnicalDomains] = useState<string[]>(
    details?.technicalDomains || details?.domains || []
  );
  const [domainInput, setDomainInput] = useState("");
  const [targetJobRoles, setTargetJobRoles] = useState<string[]>(
    details?.targetJobRoles || []
  );
  const [roleInput, setRoleInput] = useState("");
  const [careerTopics, setCareerTopics] = useState<string[]>(
    details?.careerTopics || details?.topics || []
  );
  const [topicInput, setTopicInput] = useState("");
  const [skills, setSkills] = useState<string[]>(details?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [preferredFormats, setPreferredFormats] = useState<string[]>(
    details?.preferredFormats || ["1-on-1 Mentorship Sessions", "Resume Reviews"]
  );
  const [notes, setNotes] = useState(details?.notes || "");

  useEffect(() => {
    if (isOpen) {
      setAvail(availability || "available");
      setMaxMentees(details?.maxMentees || 5);
      setTechnicalDomains(details?.technicalDomains || details?.domains || []);
      setTargetJobRoles(details?.targetJobRoles || []);
      setCareerTopics(details?.careerTopics || details?.topics || []);
      setSkills(details?.skills || []);
      setPreferredFormats(
        details?.preferredFormats || ["1-on-1 Mentorship Sessions", "Resume Reviews"]
      );
      setNotes(details?.notes || "");
    }
  }, [isOpen, details, availability]);

  if (!isOpen) return null;

  const handleAddDomain = () => {
    const t = domainInput.trim();
    if (t && !technicalDomains.includes(t)) {
      setTechnicalDomains([...technicalDomains, t]);
      setDomainInput("");
    }
  };

  const handleAddRole = () => {
    const t = roleInput.trim();
    if (t && !targetJobRoles.includes(t)) {
      setTargetJobRoles([...targetJobRoles, t]);
      setRoleInput("");
    }
  };

  const handleAddTopic = () => {
    const t = topicInput.trim();
    if (t && !careerTopics.includes(t)) {
      setCareerTopics([...careerTopics, t]);
      setTopicInput("");
    }
  };

  const handleAddSkill = () => {
    const t = skillInput.trim();
    if (t && !skills.includes(t)) {
      setSkills([...skills, t]);
      setSkillInput("");
    }
  };

  const toggleFormat = (fmt: string) => {
    if (preferredFormats.includes(fmt)) {
      setPreferredFormats(preferredFormats.filter((f) => f !== fmt));
    } else {
      setPreferredFormats([...preferredFormats, fmt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      mentorshipAvailability: avail,
      mentorshipDetails: {
        available: avail !== "unavailable",
        technicalDomains,
        domains: technicalDomains,
        targetJobRoles,
        careerTopics,
        topics: careerTopics,
        skills,
        preferredFormats,
        maxMentees: Number(maxMentees) || 5,
        notes: notes.trim(),
      },
    });
    onClose();
  };

  const FORMAT_OPTIONS = [
    "1-on-1 Mentorship Sessions",
    "Resume Reviews",
    "Mock Technical Interviews",
    "Portfolio & Code Reviews",
    "Asynchronous Q&A Messaging",
    "Career Transition Guidance",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E7E7E7] rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-[#FAFAFA]">
          <div>
            <h2 className="text-base font-bold text-[#090909]">Mentorship Interests</h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Specify your availability, guidance domains, target job roles, and preferred formats.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Mentorship Availability
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: "available", label: "Available", desc: "Open to new mentees" },
                { val: "limited", label: "Limited", desc: "Select slots only" },
                { val: "unavailable", label: "Unavailable", desc: "Currently paused" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setAvail(opt.val as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    avail === opt.val
                      ? "border-[#090909] bg-[#090909] text-white shadow-xs"
                      : "border-gray-200 bg-white hover:bg-gray-50 text-gray-800"
                  }`}
                >
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[10px] mt-0.5 ${avail === opt.val ? "text-gray-300" : "text-gray-500"}`}>
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Maximum Concurrent Mentees
            </label>
            <Input
              type="number"
              min={1}
              max={30}
              value={maxMentees}
              onChange={(e) => setMaxMentees(Number(e.target.value))}
              className="w-32"
            />
          </div>

          {/* Technical Domains */}
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Technical Domains You Can Mentor In
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddDomain();
                  }
                }}
                placeholder="e.g. Backend Architecture, Cloud Infra, Data Engineering"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddDomain}>
                Add
              </Button>
            </div>
            {technicalDomains.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {technicalDomains.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => setTechnicalDomains(technicalDomains.filter((x) => x !== d))}
                      className="hover:text-red-600"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Target Job Roles */}
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Job Roles You Can Guide Students Toward
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRole();
                  }
                }}
                placeholder="e.g. Senior Backend Engineer, SRE, Tech Lead"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddRole}>
                Add
              </Button>
            </div>
            {targetJobRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {targetJobRoles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {r}
                    <button
                      type="button"
                      onClick={() => setTargetJobRoles(targetJobRoles.filter((x) => x !== r))}
                      className="hover:text-red-600"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Career Topics */}
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Career Topics You Can Discuss
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddTopic();
                  }
                }}
                placeholder="e.g. System Design Prep, Big Tech vs Startups, Promotions"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddTopic}>
                Add
              </Button>
            </div>
            {careerTopics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {careerTopics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setCareerTopics(careerTopics.filter((x) => x !== t))}
                      className="hover:text-red-600"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Skills You Can Help Students Develop
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="e.g. Golang Concurrency, Clean Code, Public Speaking"
                className="text-xs"
              />
              <Button type="button" size="sm" variant="outline" onClick={handleAddSkill}>
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-[11px] bg-neutral-100 text-neutral-800 px-2.5 py-0.5 rounded-full border border-neutral-200"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((x) => x !== s))}
                      className="hover:text-red-600"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preferred Formats */}
          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-2">
              Preferred Mentoring Formats
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {FORMAT_OPTIONS.map((fmt) => {
                const checked = preferredFormats.includes(fmt);
                return (
                  <label
                    key={fmt}
                    onClick={() => toggleFormat(fmt)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                      checked
                        ? "bg-neutral-50 border-neutral-400 font-medium text-neutral-900"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      readOnly
                      className="h-3.5 w-3.5 rounded border-gray-300 text-neutral-900 focus:ring-neutral-900"
                    />
                    <span>{fmt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#090909] mb-1.5">
              Advice or Expectations for Prospective Mentees
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Come prepared with specific questions or project code you want to review..."
              className="w-full text-xs rounded-xl border border-[#E7E7E7] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#090909]"
            />
          </div>

          <div className="pt-4 border-t border-[#E7E7E7] flex items-center justify-end gap-2.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#090909] hover:bg-[#242424] text-white px-5 rounded-full"
            >
              Save Mentorship Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
