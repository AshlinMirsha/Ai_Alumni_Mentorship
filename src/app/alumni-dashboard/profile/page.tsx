"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Briefcase,
  Layers,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
  Edit3,
  Trash2,
  Calendar,
  Globe,
  Link as LinkIcon,
  HelpCircle,
  FileCheck2,
  Users,
  Compass,
  Code,
  Tag,
  Target,
  MessageSquare,
  BookOpen,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  subscribeToDashboardStorage,
  loadAlumniProfile,
} from "@/lib/dashboard-storage";
import {
  loadDynamicAlumniProfile,
  saveDynamicAlumniProfile,
  calculateInternshipMetrics,
  calculateInternshipDuration,
} from "@/lib/alumni-profile-service";
import {
  EditBasicInfoModal,
  EditCurrentEmploymentModal,
  EditSpecializationModal,
  AddEditWorkExperienceModal,
  AddEditInternshipModal,
  AddEditDetailedSkillModal,
  AddEditEducationModal,
  AddEditCertificationModal,
  AddEditOtherLinkModal,
  EditMentorshipInterestsModal,
} from "@/components/alumni-dashboard/AlumniProfileModals";
import type {
  Alumni,
  AlumniWorkExperienceRecord,
  AlumniInternshipRecord,
  AlumniDetailedSkill,
  AlumniCareerMilestone,
  AlumniEducationRecord,
  AlumniCertification,
  AlumniSpecializationDetails,
  ProfessionalLinkItem,
} from "@/types";

const SUGGESTED_SPECIALIZATIONS = [
  "Distributed Cloud Systems",
  "Site Reliability & DevOps",
  "Artificial Intelligence & LLMs",
  "Full-Stack Web Architecture",
  "Data Engineering & Kafka",
  "Cybersecurity & Zero Trust",
  "Product Engineering",
  "Embedded & IoT Systems",
  "High-Performance Microservices",
  "Mobile Engineering (iOS / Android)",
];

export default function AlumniProfilePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [alumni, setAlumni] = useState<Alumni>(loadAlumniProfile);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isEmploymentModalOpen, setIsEmploymentModalOpen] = useState(false);
  const [isSpecializationModalOpen, setIsSpecializationModalOpen] = useState(false);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<AlumniWorkExperienceRecord | null>(null);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<AlumniInternshipRecord | null>(null);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<AlumniDetailedSkill | null>(null);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<AlumniEducationRecord | null>(null);
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<AlumniCertification | null>(null);
  const [isOtherLinkModalOpen, setIsOtherLinkModalOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ProfessionalLinkItem | null>(null);
  const [isMentorshipModalOpen, setIsMentorshipModalOpen] = useState(false);

  // Quick tag inputs
  const [specTagInput, setSpecTagInput] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  useEffect(() => {
    setIsHydrated(true);
    const initial = loadAlumniProfile();
    setAlumni(initial);

    loadDynamicAlumniProfile().then((data) => {
      if (data) setAlumni(data);
    });

    const unsubscribe = subscribeToDashboardStorage(() => {
      setAlumni(loadAlumniProfile());
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProfile = async (updated: Partial<Alumni>, message: string) => {
    const nextState: Alumni = {
      ...alumni,
      ...updated,
    };
    setAlumni(nextState);
    await saveDynamicAlumniProfile(nextState);
    showToast(message);
  };

  // Specialization Quick Tag
  const handleAddSpecTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    const current = alumni.specializations || [];
    if (!current.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...current, trimmed];
      handleSaveProfile({ specializations: updated }, `Specialization added: ${trimmed}`);
    }
    setSpecTagInput("");
  };

  const handleRemoveSpecTag = (tag: string) => {
    const current = alumni.specializations || [];
    const updated = current.filter((s) => s !== tag);
    handleSaveProfile({ specializations: updated }, `Specialization removed: ${tag}`);
  };

  // Work Experience Handlers
  const handleSaveExperience = (record: AlumniWorkExperienceRecord) => {
    const current = alumni.detailedWorkExperience || [];
    const exists = current.some((r) => r.id === record.id);
    let updated: AlumniWorkExperienceRecord[];
    if (exists) {
      updated = current.map((r) => (r.id === record.id ? record : r));
    } else {
      updated = [record, ...current];
    }
    const legacyWork = updated.map((r) => ({
      id: r.id,
      company: r.company,
      role: r.role,
      startYear: parseInt(r.startDate.split("-")[0], 10) || 2022,
      endYear: r.isCurrent ? null : r.endDate ? parseInt(r.endDate.split("-")[0], 10) : null,
      current: !!r.isCurrent,
      description: r.responsibilities,
    }));

    handleSaveProfile(
      {
        detailedWorkExperience: updated,
        workExperience: legacyWork,
      },
      exists ? "Experience record updated" : "Work experience recorded"
    );
  };

  const handleDeleteExperience = (id: string) => {
    const current = alumni.detailedWorkExperience || [];
    const updated = current.filter((r) => r.id !== id);
    handleSaveProfile({ detailedWorkExperience: updated }, "Experience record deleted");
  };

  // Internship Handlers
  const handleSaveInternship = (record: AlumniInternshipRecord) => {
    const current = alumni.internships || [];
    const exists = current.some((r) => r.id === record.id);
    let updated: AlumniInternshipRecord[];
    if (exists) {
      updated = current.map((r) => (r.id === record.id ? record : r));
    } else {
      updated = [record, ...current];
    }
    handleSaveProfile(
      { internships: updated },
      exists ? "Internship record updated" : "Internship record added"
    );
  };

  const handleDeleteInternship = (id: string) => {
    const current = alumni.internships || [];
    const updated = current.filter((r) => r.id !== id);
    handleSaveProfile({ internships: updated }, "Internship record deleted");
  };

  // Skills Handlers
  const handleSaveSkill = (skill: AlumniDetailedSkill) => {
    const current = alumni.detailedSkills || [];
    const exists = current.some((s) => s.id === skill.id);
    let updated: AlumniDetailedSkill[];
    if (exists) {
      updated = current.map((s) => (s.id === skill.id ? skill : s));
    } else {
      updated = [...current, skill];
    }
    const legacySkills = updated.map((s) => ({
      id: s.id,
      name: s.name,
      level: (s.level?.toLowerCase() || "advanced") as any,
    }));

    handleSaveProfile(
      { detailedSkills: updated, skills: legacySkills },
      exists ? "Skill updated" : "Skill added"
    );
  };

  const handleDeleteSkill = (id: string) => {
    const current = alumni.detailedSkills || [];
    const updated = current.filter((s) => s.id !== id);
    const legacySkills = updated.map((s) => ({
      id: s.id,
      name: s.name,
      level: (s.level?.toLowerCase() || "advanced") as any,
    }));
    handleSaveProfile({ detailedSkills: updated, skills: legacySkills }, "Skill removed");
  };

  // Education Handlers
  const handleSaveEducation = (record: AlumniEducationRecord) => {
    const current = alumni.detailedEducation || [];
    const exists = current.some((r) => r.id === record.id);
    let updated: AlumniEducationRecord[];
    if (exists) {
      updated = current.map((r) => (r.id === record.id ? record : r));
    } else {
      updated = [...current, record];
    }
    handleSaveProfile(
      { detailedEducation: updated },
      exists ? "Education record updated" : "Education record added"
    );
  };

  const handleDeleteEducation = (id: string) => {
    const current = alumni.detailedEducation || [];
    const updated = current.filter((r) => r.id !== id);
    handleSaveProfile({ detailedEducation: updated }, "Education record deleted");
  };

  // Certification Handlers
  const handleSaveCertification = (cert: AlumniCertification) => {
    const current = alumni.certifications || [];
    const exists = current.some((c) => c.id === cert.id);
    let updated: AlumniCertification[];
    if (exists) {
      updated = current.map((c) => (c.id === cert.id ? cert : c));
    } else {
      updated = [...current, cert];
    }
    handleSaveProfile(
      { certifications: updated },
      exists ? "Certification updated" : "Certification added"
    );
  };

  const handleDeleteCertification = (id: string) => {
    const current = alumni.certifications || [];
    const updated = current.filter((c) => c.id !== id);
    handleSaveProfile({ certifications: updated }, "Certification deleted");
  };

  // Other Link Handlers
  const handleSaveOtherLink = (link: ProfessionalLinkItem) => {
    const current = alumni.otherProfessionalLinks || [];
    const exists = current.some((l) => l.id === link.id);
    let updated: ProfessionalLinkItem[];
    if (exists) {
      updated = current.map((l) => (l.id === link.id ? link : l));
    } else {
      updated = [...current, link];
    }
    handleSaveProfile(
      { otherProfessionalLinks: updated },
      exists ? "Link updated" : "Professional link added"
    );
  };

  const handleDeleteOtherLink = (id: string) => {
    const current = alumni.otherProfessionalLinks || [];
    const updated = current.filter((l) => l.id !== id);
    handleSaveProfile({ otherProfessionalLinks: updated }, "Link removed");
  };

  // Derived Internship Metrics: STRICT requirement that completedCount ONLY includes status === "Completed"
  const internshipMetrics = calculateInternshipMetrics(alumni.internships || []);

  const currentEmployment = alumni.currentEmployment || {
    isCurrentlyEmployed: alumni.company ? true : false,
    status: alumni.company ? "Employed" : "Seeking opportunities",
    company: alumni.company || "",
    role: alumni.role || "",
    employmentType: "Full-time",
    workMode: "Hybrid",
    location: alumni.location || "",
    responsibilities: "",
  };

  const specDetails = alumni.specializationDetails || {
    primarySpecialization: (alumni.specializations || [])[0] || "",
    additionalSpecializations: (alumni.specializations || []).slice(1),
    technicalDomains: [],
    professionalExpertise: [],
    industryExperience: "",
    mentoringAreas: alumni.mentorshipAreas || [],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#090909] text-white text-xs px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 border border-neutral-800">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ====================================================================== */}
      {/* 1. PROFILE HEADER OVERVIEW CARD (BASIC INFORMATION) */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl overflow-hidden shadow-xs">
        {/* Banner */}
        <div className="h-32 bg-[#171717] border-b border-[#262626] relative" />

        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-14 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="relative group">
              <div className="h-28 w-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
                <Avatar
                  src={alumni.avatarUrl || alumni.avatar}
                  name={isHydrated ? alumni.name || "Alumni" : "Alumni"}
                  size="lg"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsBasicModalOpen(true)}
                className="absolute bottom-1 right-1 p-2 bg-[#090909] text-white rounded-full shadow-md hover:bg-[#242424] transition-colors cursor-pointer"
                title="Change Profile Picture"
              >
                <Edit3 size={13} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-neutral-900 bg-neutral-100 px-3.5 py-1.5 rounded-full font-semibold border border-neutral-200">
                <ShieldCheck size={14} className="text-emerald-600" />
                Verified Alumni Mentor
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsBasicModalOpen(true)}
                className="text-xs flex items-center gap-1.5 rounded-full px-4"
              >
                <Edit3 size={13} /> Edit Profile
              </Button>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {isHydrated ? alumni.name || "Alumni Mentor" : "Alumni Mentor"}
              </h1>
              {alumni.degree && (
                <span className="text-xs text-gray-500 font-medium">
                  ({alumni.degree})
                </span>
              )}
            </div>

            <p className="text-sm text-gray-700 mt-1 font-medium">
              {alumni.headline || "Alumni Mentor"}
            </p>

            {alumni.bio && (
              <p className="text-xs text-gray-600 mt-2 max-w-3xl leading-relaxed">
                {alumni.bio}
              </p>
            )}

            {/* Quick Metadata */}
            <div className="mt-3.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
              {alumni.company && (
                <span className="flex items-center gap-1.5 font-semibold text-gray-800">
                  <Building2 size={14} className="text-gray-400 shrink-0" />
                  {alumni.role ? `${alumni.role} at ${alumni.company}` : alumni.company}
                </span>
              )}
              {(alumni.city || alumni.location) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  {alumni.city || alumni.location}
                </span>
              )}
              {(alumni.university || alumni.institution) && (
                <span className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-gray-400 shrink-0" />
                  {alumni.university || alumni.institution}
                  {alumni.graduationYear ? ` (Class of ${alumni.graduationYear})` : ""}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* QUICK METRICS BAR */}
      {/* ====================================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-[#E7E7E7] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Internships Completed
          </p>
          <p className="text-2xl font-bold text-[#090909] mt-1">
            {internshipMetrics.completedCount}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {internshipMetrics.ongoingCount > 0
              ? `+${internshipMetrics.ongoingCount} ongoing`
              : "Derived from verified records"}
          </p>
        </div>

        <div className="bg-white border border-[#E7E7E7] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Work Experience
          </p>
          <p className="text-2xl font-bold text-[#090909] mt-1">
            {(alumni.detailedWorkExperience || []).length}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Positions recorded
          </p>
        </div>

        <div className="bg-white border border-[#E7E7E7] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Skills & Technologies
          </p>
          <p className="text-2xl font-bold text-[#090909] mt-1">
            {(alumni.detailedSkills || []).length}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Technical proficiencies
          </p>
        </div>

        <div className="bg-white border border-[#E7E7E7] rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Mentorship Status
          </p>
          <p className="text-sm font-bold text-[#090909] mt-2 capitalize flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                alumni.mentorshipAvailability === "available"
                  ? "bg-emerald-500"
                  : alumni.mentorshipAvailability === "limited"
                  ? "bg-amber-500"
                  : "bg-gray-400"
              }`}
            />
            {alumni.mentorshipAvailability || "Available"}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Max {alumni.mentorshipDetails?.maxMentees || 5} mentees
          </p>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 2. SECTION B: CURRENT EMPLOYMENT */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <Briefcase size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Current Employment</h2>
              <p className="text-xs text-[#737373]">
                Your present role, organization, work mode, and primary responsibilities.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEmploymentModalOpen(true)}
            className="text-xs flex items-center gap-1.5 rounded-full"
          >
            <Edit3 size={13} /> Edit Employment
          </Button>
        </div>

        {currentEmployment.company || currentEmployment.role ? (
          <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800 mb-1">
                  {currentEmployment.status}
                </span>
                <h3 className="text-sm font-bold text-[#090909]">
                  {currentEmployment.role}
                  {currentEmployment.company ? ` at ${currentEmployment.company}` : ""}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                {currentEmployment.employmentType && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                    {currentEmployment.employmentType}
                  </span>
                )}
                {(currentEmployment.workMode || currentEmployment.workArrangement) && (
                  <span className="bg-white px-2.5 py-0.5 rounded-full border border-gray-200">
                    Mode: {currentEmployment.workMode || currentEmployment.workArrangement}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
              {(currentEmployment.startMonthYear || currentEmployment.startDate) && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} className="text-gray-400" />
                  Started {currentEmployment.startMonthYear || currentEmployment.startDate}
                </span>
              )}
              {currentEmployment.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-gray-400" />
                  {currentEmployment.location}
                </span>
              )}
            </div>

            {currentEmployment.jobDescription && (
              <p className="text-xs text-gray-700 pt-2 border-t border-gray-200 leading-relaxed">
                <strong className="text-gray-900">Overview:</strong> {currentEmployment.jobDescription}
              </p>
            )}

            {currentEmployment.responsibilities && (
              <p className="text-xs text-gray-700 pt-2 border-t border-gray-200 leading-relaxed whitespace-pre-line">
                <strong className="text-gray-900">Responsibilities:</strong> {currentEmployment.responsibilities}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <Briefcase size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-800">No Current Employment Specified</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-3">
              Add your current organization, contract, or indicate if you are currently seeking opportunities, studying, or on a career break.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEmploymentModalOpen(true)}
              className="text-xs"
            >
              Add Current Employment
            </Button>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* 3. SECTION C: PROFESSIONAL SPECIALIZATION */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <Compass size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Professional Specialization</h2>
              <p className="text-xs text-[#737373]">
                Your primary technical domain, industry experience, and areas to mentor students.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsSpecializationModalOpen(true)}
            className="text-xs flex items-center gap-1.5 rounded-full"
          >
            <Edit3 size={13} /> Edit Specializations
          </Button>
        </div>

        {specDetails.primarySpecialization && (
          <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 block mb-0.5">
              Primary Specialization
            </span>
            <p className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-neutral-700" />
              {specDetails.primarySpecialization}
            </p>
          </div>
        )}

        {/* Dynamic Tag Input */}
        <div>
          <label className="block text-xs font-semibold text-[#090909] mb-1.5">
            Add Specialization Tag
          </label>
          <div className="flex items-center gap-2 max-w-md">
            <Input
              value={specTagInput}
              onChange={(e) => setSpecTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSpecTag(specTagInput);
                }
              }}
              placeholder="e.g. Distributed Consensus, Cloud Security, LLM Ops"
              className="text-xs"
            />
            <Button
              type="button"
              size="sm"
              variant="primary"
              onClick={() => handleAddSpecTag(specTagInput)}
              className="bg-[#090909] hover:bg-[#242424] text-white text-xs px-4 rounded-full"
            >
              Add
            </Button>
          </div>
        </div>

        {/* Active Specializations */}
        <div>
          <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider mb-2">
            Active Specializations ({(alumni.specializations || []).length})
          </h3>
          {(alumni.specializations || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(alumni.specializations || []).map((spec) => (
                <span
                  key={spec}
                  className="inline-flex items-center gap-1.5 bg-[#090909] text-white text-xs px-3 py-1 rounded-full font-medium shadow-2xs"
                >
                  <Tag size={12} className="text-neutral-400" />
                  {spec}
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecTag(spec)}
                    className="hover:text-red-400 transition-colors ml-1 cursor-pointer"
                    title={`Remove ${spec}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              No specializations added yet. Enter custom domains above or select from suggestions below.
            </p>
          )}
        </div>

        {/* Suggested Quick-Pills */}
        <div className="pt-3 border-t border-[#E7E7E7]">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Quick Suggestions (click to add):
          </p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_SPECIALIZATIONS.filter(
              (s) => !(alumni.specializations || []).includes(s)
            ).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleAddSpecTag(s)}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-full border border-gray-200 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus size={11} /> {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 4. SECTION D: SKILLS & TECHNOLOGIES */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Skills & Technologies</h2>
              <p className="text-xs text-[#737373]">
                Programming languages, frameworks, cloud stacks, and architectural proficiencies.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingSkill(null);
              setIsSkillModalOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 rounded-full"
          >
            <Plus size={13} /> Add Skill
          </Button>
        </div>

        {(alumni.detailedSkills || []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(alumni.detailedSkills || []).map((skill) => (
              <div
                key={skill.id}
                className="p-3.5 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl relative group hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-xs font-bold text-[#090909]">{skill.name}</h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSkill(skill);
                          setIsSkillModalOpen(true);
                        }}
                        className="text-gray-400 hover:text-gray-700 p-0.5 cursor-pointer"
                        title="Edit skill"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="text-gray-400 hover:text-red-600 p-0.5 cursor-pointer"
                        title="Delete skill"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                      {skill.level || "Advanced"}
                    </span>
                    {skill.yearsOfExperience && (
                      <span className="text-[10px] text-gray-500">
                        {skill.yearsOfExperience}
                      </span>
                    )}
                  </div>

                  {skill.description && (
                    <p className="text-[11px] text-gray-600 mt-2 line-clamp-2">
                      {skill.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <Layers size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-800">No Skills Added Yet</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-3">
              Add programming languages, databases, cloud tools, frameworks, and domain expertise.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingSkill(null);
                setIsSkillModalOpen(true);
              }}
              className="text-xs"
            >
              Add First Skill
            </Button>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* 5. SECTION E: WORK EXPERIENCE */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <Building2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Work Experience</h2>
              <p className="text-xs text-[#737373]">
                Chronological timeline of past and present positions in your career.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingExperience(null);
              setIsExperienceModalOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 rounded-full"
          >
            <Plus size={13} /> Add Experience
          </Button>
        </div>

        {(alumni.detailedWorkExperience || []).length > 0 ? (
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-gray-200">
            {(alumni.detailedWorkExperience || []).map((exp) => (
              <div key={exp.id} className="relative pl-8 group">
                <div className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#090909] shadow-xs" />
                <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl hover:border-gray-300 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#090909]">{exp.role}</h3>
                      <p className="text-xs font-semibold text-gray-700">
                        {exp.company} {exp.employmentType ? `· ${exp.employmentType}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right text-xs text-gray-500">
                        <span className="font-medium text-gray-800">
                          {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                        </span>
                        {exp.location && <p className="text-[11px] text-gray-400">{exp.location}</p>}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingExperience(exp);
                            setIsExperienceModalOpen(true);
                          }}
                          className="p-1 text-gray-400 hover:text-gray-700 rounded-md cursor-pointer"
                          title="Edit experience"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-md cursor-pointer"
                          title="Delete experience"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {exp.responsibilities && (
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed whitespace-pre-line">
                      {exp.responsibilities}
                    </p>
                  )}

                  {exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5 border-t border-gray-200">
                      {exp.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-white text-gray-700 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <Building2 size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-800">No Work Experience Recorded</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-3">
              Add previous employers, leadership promotions, and career milestones.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingExperience(null);
                setIsExperienceModalOpen(true);
              }}
              className="text-xs"
            >
              Add First Position
            </Button>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* 6. SECTION F: INTERNSHIP EXPERIENCE (WITH STRICT COUNT CALCULATION) */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <FileCheck2 size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Internship Experience</h2>
              <p className="text-xs text-[#737373]">
                Internships completed or in-progress, with auto-calculated duration and counts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingInternship(null);
                setIsInternshipModalOpen(true);
              }}
              className="text-xs flex items-center gap-1.5 rounded-full"
            >
              <Plus size={13} /> Add Internship
            </Button>
          </div>
        </div>

        {/* Dynamic Calculation Banner */}
        <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">Verified Calculation:</span>
              <p className="text-sm font-bold text-[#090909]">
                Internships Completed: {internshipMetrics.completedCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-gray-600">
              Ongoing: <strong className="text-blue-700">{internshipMetrics.ongoingCount}</strong>
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">
              Total Records: <strong className="text-[#090909]">{internshipMetrics.totalCount}</strong>
            </span>
          </div>
        </div>

        {/* Internship Records List */}
        {(alumni.internships || []).length > 0 ? (
          <div className="space-y-3">
            {(alumni.internships || []).map((item) => (
              <div
                key={item.id}
                className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl hover:border-gray-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#090909]">{item.role}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : item.status === "Ongoing"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 mt-0.5">
                      {item.company} {item.domain ? `· ${item.domain}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right text-xs text-gray-500">
                      <span className="font-semibold text-gray-800">
                        {calculateInternshipDuration(item.startDate, item.endDate, item.status)}
                      </span>
                      <p className="text-[10px] text-gray-400">
                        {item.startDate} to {item.status === "Ongoing" ? "Present" : item.endDate || "End"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingInternship(item);
                          setIsInternshipModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded-md cursor-pointer"
                        title="Edit internship"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteInternship(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded-md cursor-pointer"
                        title="Delete internship"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {item.description && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {item.description}
                  </p>
                )}

                <div className="mt-3 pt-2.5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {item.type && (
                      <span className="text-[10px] bg-white text-gray-700 px-2 py-0.5 rounded-full border border-gray-200">
                        {item.type}
                      </span>
                    )}
                    {(item.skillsLearned || []).map((s) => (
                      <span
                        key={s}
                        className="text-[10px] bg-white text-neutral-800 px-2 py-0.5 rounded-full border border-gray-200 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {item.proofUrl && (
                    <a
                      href={item.proofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      View Credential <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <FileCheck2 size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-xs font-semibold text-gray-800">No Internships Recorded</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-3">
              Add your completed and ongoing internships. Completed records will automatically update your verified count.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingInternship(null);
                setIsInternshipModalOpen(true);
              }}
              className="text-xs"
            >
              Add Internship
            </Button>
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* 7. SECTION G: EDUCATION AND CERTIFICATIONS */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <GraduationCap size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Education and Certifications</h2>
              <p className="text-xs text-[#737373]">
                Degrees, institutions, academic honors, and verified industry certifications.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingEducation(null);
                setIsEducationModalOpen(true);
              }}
              className="text-xs flex items-center gap-1 rounded-full"
            >
              <Plus size={13} /> Add Degree
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingCertification(null);
                setIsCertificationModalOpen(true);
              }}
              className="text-xs flex items-center gap-1 rounded-full"
            >
              <Plus size={13} /> Add Certificate
            </Button>
          </div>
        </div>

        {/* Education Sub-section */}
        <div>
          <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider mb-3">
            Academic Degrees
          </h3>
          {(alumni.detailedEducation || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(alumni.detailedEducation || []).map((edu) => (
                <div
                  key={edu.id}
                  className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl flex items-start justify-between gap-3 group"
                >
                  <div>
                    <h4 className="text-xs font-bold text-[#090909]">{edu.degree}</h4>
                    <p className="text-xs text-gray-700 font-medium mt-0.5">
                      {edu.institution} {edu.field ? `· ${edu.field}` : ""}
                    </p>
                    {edu.graduationYear && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        Class of {edu.graduationYear}
                      </p>
                    )}
                    {edu.additionalQualifications && (
                      <p className="text-[11px] text-gray-600 mt-1 italic">
                        {edu.additionalQualifications}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingEducation(edu);
                        setIsEducationModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-gray-50/70 border border-dashed border-gray-200 rounded-xl text-center">
              <p className="text-xs text-gray-500">
                Primary university: <strong>{alumni.university || alumni.institution || "Karunya University"}</strong> ({alumni.degree || "Degree specified in basic info"})
              </p>
            </div>
          )}
        </div>

        {/* Certifications Sub-section */}
        <div className="pt-3 border-t border-[#E7E7E7]">
          <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider mb-3">
            Certifications & Licenses
          </h3>
          {(alumni.certifications || []).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(alumni.certifications || []).map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl flex items-start justify-between gap-3 group"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                      {cert.issuer}
                    </span>
                    <h4 className="text-xs font-bold text-[#090909] mt-1.5">{cert.title}</h4>
                    {cert.issueDate && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Issued: {cert.issueDate}
                      </p>
                    )}
                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-blue-600 hover:underline inline-flex items-center gap-1 font-medium mt-1.5"
                      >
                        Verify Credential <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCertification(cert);
                        setIsCertificationModalOpen(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCertification(cert.id)}
                      className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No certifications added yet. Click &quot;Add Certificate&quot; to include credentials.</p>
          )}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 8. SECTION H: PROFESSIONAL LINKS */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Professional Links</h2>
              <p className="text-xs text-[#737373]">
                Your public profiles, engineering blogs, developer portfolios, and research pages.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingLink(null);
              setIsOtherLinkModalOpen(true);
            }}
            className="text-xs flex items-center gap-1.5 rounded-full"
          >
            <Plus size={13} /> Add Custom Link
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Primary Links */}
          {alumni.linkedinUrl && (
            <a
              href={alumni.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-blue-600" />
                <span className="text-xs font-bold text-[#090909]">LinkedIn</span>
              </div>
              <ExternalLink size={12} className="text-gray-400" />
            </a>
          )}

          {alumni.githubUrl && (
            <a
              href={alumni.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Code size={14} className="text-neutral-800" />
                <span className="text-xs font-bold text-[#090909]">GitHub</span>
              </div>
              <ExternalLink size={12} className="text-gray-400" />
            </a>
          )}

          {alumni.portfolioUrl && (
            <a
              href={alumni.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl hover:border-gray-300 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <LinkIcon size={14} className="text-purple-600" />
                <span className="text-xs font-bold text-[#090909]">Portfolio / Site</span>
              </div>
              <ExternalLink size={12} className="text-gray-400" />
            </a>
          )}

          {/* Custom Other Links */}
          {(alumni.otherProfessionalLinks || []).map((link) => (
            <div
              key={link.id}
              className="p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl flex items-center justify-between group hover:border-gray-300 transition-colors"
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-bold text-[#090909] hover:text-blue-600"
              >
                <LinkIcon size={14} className="text-gray-500" />
                <span>{link.title}</span>
                <ExternalLink size={11} className="text-gray-400" />
              </a>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => {
                    setEditingLink(link);
                    setIsOtherLinkModalOpen(true);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <Edit3 size={11} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteOtherLink(link.id)}
                  className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====================================================================== */}
      {/* 9. SECTION I: MENTORSHIP INTERESTS */}
      {/* ====================================================================== */}
      <div className="bg-white border border-[#E7E7E7] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E7E7E7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-neutral-100 rounded-xl text-neutral-800">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#090909]">Mentorship Interests</h2>
              <p className="text-xs text-[#737373]">
                Your availability to mentor students, discussion domains, and preferred engagement formats.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMentorshipModalOpen(true)}
            className="text-xs flex items-center gap-1.5 rounded-full"
          >
            <Edit3 size={13} /> Edit Mentorship
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Domains & Guidance */}
          <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
              Mentoring Domains & Target Roles
            </h3>

            <div>
              <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                Technical Domains Can Mentor In:
              </span>
              {(alumni.mentorshipDetails?.technicalDomains || alumni.mentorshipDetails?.domains || []).length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {(alumni.mentorshipDetails?.technicalDomains || alumni.mentorshipDetails?.domains || []).map((d) => (
                    <span
                      key={d}
                      className="text-xs bg-white text-gray-800 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No specific domains entered yet.</p>
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                Job Roles Can Guide Students Toward:
              </span>
              {(alumni.mentorshipDetails?.targetJobRoles || []).length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {(alumni.mentorshipDetails?.targetJobRoles || []).map((r) => (
                    <span
                      key={r}
                      className="text-xs bg-white text-neutral-800 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No target roles listed.</p>
              )}
            </div>

            <div>
              <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                Career Topics:
              </span>
              {(alumni.mentorshipDetails?.careerTopics || alumni.mentorshipDetails?.topics || []).length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {(alumni.mentorshipDetails?.careerTopics || alumni.mentorshipDetails?.topics || []).map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-white text-gray-800 px-2.5 py-0.5 rounded-full border border-gray-200 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">No career topics entered.</p>
              )}
            </div>
          </div>

          {/* Formats & Advice */}
          <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl space-y-3">
            <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
              Preferred Mentorship Formats
            </h3>

            {(alumni.mentorshipDetails?.preferredFormats || []).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {(alumni.mentorshipDetails?.preferredFormats || []).map((fmt) => (
                  <span
                    key={fmt}
                    className="text-xs bg-neutral-900 text-white px-3 py-1 rounded-full font-medium"
                  >
                    ✓ {fmt}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No formats selected yet.</p>
            )}

            {alumni.mentorshipDetails?.notes && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Advice for Mentees:
                </span>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  &ldquo;{alumni.mentorshipDetails.notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* ALL MODALS */}
      {/* ====================================================================== */}
      <EditBasicInfoModal
        isOpen={isBasicModalOpen}
        onClose={() => setIsBasicModalOpen(false)}
        alumni={alumni}
        onSave={(updated) => handleSaveProfile(updated, "Basic information saved successfully")}
      />

      <EditCurrentEmploymentModal
        isOpen={isEmploymentModalOpen}
        onClose={() => setIsEmploymentModalOpen(false)}
        currentEmployment={alumni.currentEmployment}
        currentCompany={alumni.company}
        currentRole={alumni.role}
        location={alumni.location}
        onSave={({ currentEmployment, company, role }) =>
          handleSaveProfile(
            { currentEmployment, company, role },
            "Current employment saved successfully"
          )
        }
      />

      <EditSpecializationModal
        isOpen={isSpecializationModalOpen}
        onClose={() => setIsSpecializationModalOpen(false)}
        details={alumni.specializationDetails}
        specializations={alumni.specializations}
        onSave={(details, flatList) =>
          handleSaveProfile(
            { specializationDetails: details, specializations: flatList },
            "Professional specializations updated"
          )
        }
      />

      <AddEditWorkExperienceModal
        isOpen={isExperienceModalOpen}
        onClose={() => setIsExperienceModalOpen(false)}
        record={editingExperience}
        onSave={handleSaveExperience}
        onDelete={handleDeleteExperience}
      />

      <AddEditInternshipModal
        isOpen={isInternshipModalOpen}
        onClose={() => setIsInternshipModalOpen(false)}
        record={editingInternship}
        onSave={handleSaveInternship}
        onDelete={handleDeleteInternship}
      />

      <AddEditDetailedSkillModal
        isOpen={isSkillModalOpen}
        onClose={() => setIsSkillModalOpen(false)}
        skill={editingSkill}
        onSave={handleSaveSkill}
        onDelete={handleDeleteSkill}
      />

      <AddEditEducationModal
        isOpen={isEducationModalOpen}
        onClose={() => setIsEducationModalOpen(false)}
        record={editingEducation}
        onSave={handleSaveEducation}
        onDelete={handleDeleteEducation}
      />

      <AddEditCertificationModal
        isOpen={isCertificationModalOpen}
        onClose={() => setIsCertificationModalOpen(false)}
        record={editingCertification}
        onSave={handleSaveCertification}
        onDelete={handleDeleteCertification}
      />

      <AddEditOtherLinkModal
        isOpen={isOtherLinkModalOpen}
        onClose={() => setIsOtherLinkModalOpen(false)}
        link={editingLink}
        onSave={handleSaveOtherLink}
        onDelete={handleDeleteOtherLink}
      />

      <EditMentorshipInterestsModal
        isOpen={isMentorshipModalOpen}
        onClose={() => setIsMentorshipModalOpen(false)}
        details={alumni.mentorshipDetails}
        availability={alumni.mentorshipAvailability}
        onSave={({ mentorshipDetails, mentorshipAvailability }) =>
          handleSaveProfile(
            { mentorshipDetails, mentorshipAvailability },
            "Mentorship preferences updated"
          )
        }
      />
    </div>
  );
}
