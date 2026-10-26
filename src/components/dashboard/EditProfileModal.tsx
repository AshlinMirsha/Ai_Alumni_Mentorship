"use client";

import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent, type ChangeEvent } from "react";
import {
  X,
  Plus,
  Check,
  RotateCcw,
  AlertCircle,
  Upload,
  Trash2,
  Camera,
  Globe,
  Code,
  Target,
  Award,
  Sparkles,
  FolderGit2,
  ExternalLink,
  Briefcase,
  Layers,
  MapPin,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import type { Student, Skill, Interest, StudentProjectDetail } from "@/types";
import { saveDynamicStudentProfile } from "@/lib/profile-service";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
  onSave: (updated: Student) => void;
  onReset: () => void;
  initialTab?: TabKey;
}

export type TabKey = "general" | "activities" | "skills_projects" | "goals_achievements";

const ACADEMIC_YEAR_OPTIONS = [
  "First Year",
  "Second Year",
  "Third Year",
  "Fourth Year",
  "Graduate Student",
];

const PRESET_SKILLS = [
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Go",
  "PostgreSQL",
  "Docker",
  "AWS",
  "GraphQL",
  "Redis",
  "Tailwind CSS",
  "Git",
];

const PRESET_COMPANIES = [
  "Google",
  "Datadog",
  "Airbnb",
  "Stripe",
  "Microsoft",
  "Apple",
  "Meta",
  "Amazon",
  "Netflix",
  "Uber",
];

interface FormContentProps {
  student: Student;
  onSave: (updated: Student) => void;
  onClose: () => void;
  onReset: () => void;
  initialTab?: TabKey;
}

function EditProfileForm({ student, onSave, onClose, onReset, initialTab = "general" }: FormContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // 1. General & Photo
  const [name, setName] = useState(student.name || "");
  const [department, setDepartment] = useState(student.department || "");
  const [degree, setDegree] = useState(student.degree || "");
  const [academicYear, setAcademicYear] = useState(student.academicYear || "Second Year");
  const [careerGoal, setCareerGoal] = useState(
    student.careerGoal || student.careerGoals?.[0] || ""
  );
  const [bio, setBio] = useState(student.bio || "");
  const [avatarUrl, setAvatarUrl] = useState<string>(student.avatarUrl || student.avatar || "");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Current Activities & Links
  const [currentActivities, setCurrentActivities] = useState<string[]>(
    student.currentActivities || []
  );
  const [newActivity, setNewActivity] = useState("");
  const [githubUrl, setGithubUrl] = useState(student.githubUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(student.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(student.portfolioUrl || "");
  const [leetcodeUrl, setLeetcodeUrl] = useState(student.leetcodeUrl || "");

  // 3. Skills, Interests & Projects
  const [skills, setSkills] = useState<Skill[]>(
    (student.skills || []).map((s, idx) =>
      typeof s === "string" ? { id: `sk-${idx}`, name: s, level: "intermediate" } : s
    )
  );
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">("intermediate");

  const [interests, setInterests] = useState<string[]>(
    (student.interests || []).map((i) => (typeof i === "string" ? i : i.name))
  );
  const [newInterest, setNewInterest] = useState("");

  const [detailedProjects, setDetailedProjects] = useState<StudentProjectDetail[]>(
    student.detailedProjects || []
  );

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectTechStack, setProjectTechStack] = useState("");
  const [projectGithub, setProjectGithub] = useState("");
  const [projectDemo, setProjectDemo] = useState("");
  const [projectRole, setProjectRole] = useState("Full-Stack Developer");
  const [projectStatus, setProjectStatus] = useState("Completed");

  // 4. Target Companies, Career Goals & Achievements
  const [targetCompanies, setTargetCompanies] = useState<string[]>(
    student.targetCompanies || []
  );
  const [newCompany, setNewCompany] = useState("");

  const [preferredLocation, setPreferredLocation] = useState(student.preferredLocation || "");
  const [internshipInterest, setInternshipInterest] = useState(student.internshipInterest || "");

  const [careerGoalsList, setCareerGoalsList] = useState<string[]>(
    student.careerGoals && student.careerGoals.length > 0
      ? student.careerGoals
      : careerGoal
      ? [careerGoal]
      : []
  );
  const [newGoal, setNewGoal] = useState("");

  const [achievements, setAchievements] = useState<string[]>(
    student.achievements || []
  );
  const [newAchievement, setNewAchievement] = useState("");

  // States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Avatar Upload Handler
  const handleAvatarFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit. Please select a smaller photo.");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await fetch("/api/auth/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.avatarUrl) {
        setAvatarUrl(data.avatarUrl);
      } else {
        // Fallback to local base64 reader
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            setAvatarUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      // Local fallback
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Skill Handlers
  const handleAddSkill = () => {
    const trimmed = newSkillName.trim();
    if (trimmed && !skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSkills((prev) => [
        ...prev,
        { id: `sk-${Date.now()}`, name: trimmed, level: newSkillLevel },
      ]);
      setNewSkillName("");
    }
  };

  const handleRemoveSkill = (skillId: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  // Interest Handlers
  const handleAddInterest = () => {
    const trimmed = newInterest.trim();
    if (trimmed && !interests.includes(trimmed)) {
      setInterests((prev) => [...prev, trimmed]);
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests((prev) => prev.filter((i) => i !== interestToRemove));
  };

  // Activity Handlers
  const handleAddActivity = () => {
    const trimmed = newActivity.trim();
    if (trimmed && !currentActivities.includes(trimmed)) {
      setCurrentActivities((prev) => [...prev, trimmed]);
      setNewActivity("");
    }
  };

  const handleRemoveActivity = (idx: number) => {
    setCurrentActivities((prev) => prev.filter((_, i) => i !== idx));
  };

  // Target Company Handlers
  const handleAddCompany = (compName?: string) => {
    const target = (compName || newCompany).trim();
    if (target && !targetCompanies.includes(target)) {
      setTargetCompanies((prev) => [...prev, target]);
      if (!compName) setNewCompany("");
    }
  };

  const handleRemoveCompany = (company: string) => {
    setTargetCompanies((prev) => prev.filter((c) => c !== company));
  };

  // Career Goal Handlers
  const handleAddGoal = () => {
    const trimmed = newGoal.trim();
    if (trimmed && !careerGoalsList.includes(trimmed)) {
      setCareerGoalsList((prev) => [...prev, trimmed]);
      setNewGoal("");
    }
  };

  const handleRemoveGoal = (idx: number) => {
    setCareerGoalsList((prev) => prev.filter((_, i) => i !== idx));
  };

  // Achievement Handlers
  const handleAddAchievement = () => {
    const trimmed = newAchievement.trim();
    if (trimmed && !achievements.includes(trimmed)) {
      setAchievements((prev) => [...prev, trimmed]);
      setNewAchievement("");
    }
  };

  const handleRemoveAchievement = (idx: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== idx));
  };

  // Project Handlers
  const handleSaveNewProject = () => {
    if (!projectTitle.trim()) {
      alert("Please provide a project title.");
      return;
    }

    const techArray = projectTechStack
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const newProj: StudentProjectDetail = {
      id: `proj-${Date.now()}`,
      title: projectTitle.trim(),
      description: projectDesc.trim(),
      techStack: techArray,
      githubUrl: projectGithub.trim() || undefined,
      demoUrl: projectDemo.trim() || undefined,
      role: projectRole.trim() || "Full-Stack Developer",
      status: projectStatus,
    };

    setDetailedProjects((prev) => [newProj, ...prev]);
    setProjectTitle("");
    setProjectDesc("");
    setProjectTechStack("");
    setProjectGithub("");
    setProjectDemo("");
    setProjectRole("Full-Stack Developer");
    setProjectStatus("Completed");
    setIsAddingProject(false);
  };

  const handleRemoveProject = (projId: string) => {
    setDetailedProjects((prev) => prev.filter((p) => p.id !== projId));
  };

  // Form Submit Handler (Allows partial profile saves!)
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!name.trim()) {
      errs.name = "Please enter your name.";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setActiveTab("general");
      return;
    }

    const updatedInterests: Interest[] = interests.map((i, idx) => ({
      id: `int-${idx}`,
      name: i,
    }));

    const simpleProjectTitles = detailedProjects.map((p) => p.title);

    const updatedStudent: Student = {
      ...student,
      name: name.trim(),
      department: department.trim(),
      degree: degree.trim() || undefined,
      academicYear: academicYear,
      careerGoal: careerGoal.trim(),
      careerGoals: careerGoalsList.length > 0 ? careerGoalsList : (careerGoal.trim() ? [careerGoal.trim()] : []),
      skills: skills,
      interests: updatedInterests,
      projects: simpleProjectTitles,
      bio: bio.trim(),
      avatar: avatarUrl || undefined,
      avatarUrl: avatarUrl || undefined,
      currentActivities: currentActivities,
      githubUrl: githubUrl.trim() || undefined,
      linkedinUrl: linkedinUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      leetcodeUrl: leetcodeUrl.trim() || undefined,
      detailedProjects: detailedProjects,
      targetCompanies: targetCompanies,
      achievements: achievements,
      preferredLocation: preferredLocation.trim() || undefined,
      internshipInterest: internshipInterest.trim() || undefined,
      headline: `${academicYear ? `${academicYear} ` : ""}${department.trim() ? `${department.trim()} student` : "Student"}${careerGoal.trim() ? ` · Aspiring ${careerGoal.trim()}` : ""}`,
    };

    onSave(updatedStudent);

    // Dynamic Profile sync to Supabase public.profiles
    saveDynamicStudentProfile({
      id: updatedStudent.id,
      email: updatedStudent.email || "",
      fullName: updatedStudent.name,
      role: "student",
      avatarUrl: updatedStudent.avatarUrl,
      bio: updatedStudent.bio,
      department: updatedStudent.department,
      degree: updatedStudent.degree,
      academicYear: updatedStudent.academicYear,
      graduationYear: updatedStudent.graduationYear,
      desiredRole: updatedStudent.careerGoal,
      preferredLocation: updatedStudent.preferredLocation,
      internshipInterest: updatedStudent.internshipInterest,
      currentActivities: updatedStudent.currentActivities || [],
      skills: updatedStudent.skills || [],
      interests: updatedStudent.interests.map((i) => (typeof i === "string" ? i : i.name)),
      githubUrl: updatedStudent.githubUrl,
      linkedinUrl: updatedStudent.linkedinUrl,
      portfolioUrl: updatedStudent.portfolioUrl,
      leetcodeUrl: updatedStudent.leetcodeUrl,
      otherLinks: updatedStudent.otherLinks || [],
      projects: updatedStudent.detailedProjects?.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        technologies: p.techStack,
        repositoryUrl: p.githubUrl,
        demoUrl: p.demoUrl,
        role: p.role,
        status: p.status || "Completed",
      })) || [],
      targetCompanies: updatedStudent.targetCompanies || [],
      careerGoals: updatedStudent.careerGoals || [],
      achievements: (updatedStudent.achievements || []).map((a, idx) =>
        typeof a === "string" ? { id: `ach-${idx}`, title: a } : a
      ),
    }).catch((err) => {
      console.warn("[EditProfileModal] Dynamic profile sync notice:", err);
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 450);
  };

  return (
    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#E7E7E7] overflow-hidden my-6 max-h-[92vh] flex flex-col antialiased text-[#090909]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#E7E7E7] flex items-center justify-between bg-white shrink-0">
        <div>
          <h3 id="edit-profile-modal-title" className="text-base font-bold text-[#090909]">
            Edit Student Profile
          </h3>
          <p className="text-xs text-[#737373]">
            Update your academic portfolio, skills, projects, and target employers
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#737373] hover:text-[#090909] p-1.5 rounded-lg hover:bg-[#F4F4F4] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="px-6 py-2.5 border-b border-[#E7E7E7] bg-[#FAFAFA] flex items-center gap-2 overflow-x-auto shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("general")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === "general"
              ? "bg-[#090909] text-white shadow-xs"
              : "text-[#737373] hover:text-[#090909] hover:bg-[#EBEBEB]"
          }`}
        >
          General &amp; Photo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("activities")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === "activities"
              ? "bg-[#090909] text-white shadow-xs"
              : "text-[#737373] hover:text-[#090909] hover:bg-[#EBEBEB]"
          }`}
        >
          Activities &amp; Links ({currentActivities.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("skills_projects")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === "skills_projects"
              ? "bg-[#090909] text-white shadow-xs"
              : "text-[#737373] hover:text-[#090909] hover:bg-[#EBEBEB]"
          }`}
        >
          Skills &amp; Projects ({skills.length} · {detailedProjects.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("goals_achievements")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 ${
            activeTab === "goals_achievements"
              ? "bg-[#090909] text-white shadow-xs"
              : "text-[#737373] hover:text-[#090909] hover:bg-[#EBEBEB]"
          }`}
        >
          Goals &amp; Honors ({targetCompanies.length} · {achievements.length})
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
        {savedSuccess && (
          <div className="p-3 bg-[#F4F4F4] border border-[#090909] rounded-xl text-[#090909] text-xs flex items-center gap-2">
            <Check size={16} />
            <span className="font-semibold">Profile updated successfully! Recalculating completion score...</span>
          </div>
        )}

        {/* ─── TAB 1: General & Photo ────────────────────────────────────────── */}
        {activeTab === "general" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Profile Picture Upload Section */}
            <div className="p-4 bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <Avatar
                  name={name || "Student"}
                  src={avatarUrl}
                  size="xl"
                  className="w-20 h-20 text-xl border-2 border-white shadow-md shrink-0"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Upload new avatar"
                >
                  <Camera size={20} />
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h4 className="text-xs font-bold text-[#090909]">Profile Picture</h4>
                <p className="text-[11px] text-[#737373]">
                  Upload a headshot or clear picture. PNG, JPG or WebP up to 5MB.
                </p>
                <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isUploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                  >
                    <Upload size={12} className="mr-1.5" />
                    <span>{isUploadingAvatar ? "Uploading..." : "Upload New Photo"}</span>
                  </Button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-xs text-[#737373] hover:text-[#090909] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Name & Academic Department */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ashlin Mirsha"
                error={errors.name}
                required
              />

              <Input
                label="Academic Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
              />
            </div>

            {/* Degree & Academic Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Degree Program"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. B.Tech Computer Science"
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="academic-year-select" className="text-xs font-semibold text-[#090909]">
                  Academic Year
                </label>
                <select
                  id="academic-year-select"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] px-3.5 py-2.5 h-11 focus:outline-none focus:border-[#090909]"
                >
                  <option value="">Select study year...</option>
                  {ACADEMIC_YEAR_OPTIONS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary Career Goal */}
            <div className="space-y-1.5">
              <Input
                label="Primary Career Goal / Desired Role"
                value={careerGoal}
                onChange={(e) => setCareerGoal(e.target.value)}
                placeholder="e.g. Full-Stack Software Engineer, Machine Learning Researcher"
              />
            </div>

            {/* Personal Bio */}
            <div className="space-y-1.5">
              <label htmlFor="bio-textarea" className="text-xs font-semibold text-[#090909]">
                Personal Bio &amp; Mentorship Statement
              </label>
              <textarea
                id="bio-textarea"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Introduce yourself, your academic passions, and what you aim to learn through alumni mentorship..."
                className="w-full rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] p-3.5 focus:outline-none focus:border-[#090909] placeholder-[#A8A8A8]"
              />
            </div>
          </div>
        )}

        {/* ─── TAB 2: Activities & Links ────────────────────────────────────── */}
        {activeTab === "activities" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Current Activities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Current Activities &amp; Focus
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    What you are actively building, studying, or preparing for right now.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">
                  {currentActivities.length} listed
                </span>
              </div>

              <div className="space-y-2">
                {currentActivities.map((act, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl text-xs text-[#090909]"
                  >
                    <span className="truncate pr-3">{act}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(idx)}
                      className="text-[#737373] hover:text-[#090909] cursor-pointer"
                      title="Remove activity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {currentActivities.length === 0 && (
                  <p className="text-xs text-[#737373] italic py-2">
                    No current activities added yet. Type below to add your current focus.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddActivity();
                    }
                  }}
                  placeholder="e.g. Building an open-source distributed cache in Go"
                  className="flex-1 rounded-xl border border-[#E7E7E7] text-xs px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#090909]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddActivity}
                  className="rounded-full bg-[#090909] text-white hover:bg-[#242424] px-4 text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Developer & Professional Links */}
            <div className="space-y-3 pt-3 border-t border-[#E7E7E7]">
              <div>
                <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                  Developer &amp; Portfolio Links
                </h4>
                <p className="text-[11px] text-[#737373]">
                  Connect your GitHub, LinkedIn, portfolio website, and problem-solving profiles.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#090909] flex items-center gap-1.5">
                    <Code size={13} />
                    <span>GitHub Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#090909] flex items-center gap-1.5">
                    <Globe size={13} />
                    <span>LinkedIn Profile URL</span>
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#090909] flex items-center gap-1.5">
                    <Globe size={13} />
                    <span>Personal Portfolio / Website</span>
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#090909] flex items-center gap-1.5">
                    <Code size={13} />
                    <span>LeetCode / Competitive Coding Profile</span>
                  </label>
                  <input
                    type="url"
                    value={leetcodeUrl}
                    onChange={(e) => setLeetcodeUrl(e.target.value)}
                    placeholder="https://leetcode.com/u/username"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: Skills & Projects ─────────────────────────────────────── */}
        {activeTab === "skills_projects" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Technical Skills */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Technical Skills &amp; Proficiency
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    Type any programming language, framework, database, or cloud tool.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">
                  {skills.length} skills listed
                </span>
              </div>

              {/* Skills List */}
              <div className="flex flex-wrap gap-2 p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl min-h-[50px]">
                {skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#090909] text-xs font-medium border border-[#E7E7E7] shadow-xs"
                  >
                    <span>{s.name}</span>
                    {s.level && (
                      <span className="text-[10px] uppercase font-bold text-[#737373] bg-[#F4F4F4] px-1.5 py-0.2 rounded">
                        {s.level}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s.id)}
                      className="text-[#737373] hover:text-[#090909] ml-0.5 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {skills.length === 0 && (
                  <span className="text-xs text-[#737373] self-center">No skills added yet.</span>
                )}
              </div>

              {/* Add Skill Row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type any skill (e.g. Go, Docker, PyTorch, Supabase)"
                  className="flex-1 rounded-xl border border-[#E7E7E7] text-xs px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#090909]"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value as any)}
                  className="h-10 rounded-xl border border-[#E7E7E7] text-xs px-3 bg-white text-[#090909] focus:outline-none focus:border-[#090909]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddSkill}
                  className="rounded-full bg-[#090909] text-white hover:bg-[#242424] px-4 text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#737373]">Optional suggestions:</span>
                {PRESET_SKILLS.filter((s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase()))
                  .slice(0, 6)
                  .map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => setSkills((prev) => [...prev, { id: `sk-${Date.now()}-${ps}`, name: ps, level: "intermediate" }])}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F4F4F4] hover:bg-[#EBEBEB] text-[#090909] transition-colors cursor-pointer"
                    >
                      + {ps}
                    </button>
                  ))}
              </div>
            </div>

            {/* Career & Technical Interests */}
            <div className="space-y-2.5 pt-3 border-t border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Technical &amp; Career Interests
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    Type any domain or interest (e.g. Distributed Systems, AI Engineering, Fintech).
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">
                  {interests.length} listed
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl min-h-[44px]">
                {interests.map((int) => (
                  <span
                    key={int}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#090909] text-xs font-medium border border-[#E7E7E7]"
                  >
                    <span>{int}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveInterest(int)}
                      className="text-[#737373] hover:text-[#090909] cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {interests.length === 0 && (
                  <span className="text-xs text-[#737373] self-center">No interests added yet.</span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddInterest();
                    }
                  }}
                  placeholder="Add custom interest (e.g. Cloud Infrastructure, NLP, Cyber Defense)"
                  className="flex-1 rounded-xl border border-[#E7E7E7] text-xs px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#090909]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddInterest}
                  className="rounded-full bg-[#090909] text-white hover:bg-[#242424] px-4 text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Project Portfolio */}
            <div className="space-y-3 pt-3 border-t border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Project Portfolio &amp; Repositories
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    Add unlimited projects with tech stacks, repository code, and demo links.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingProject((p) => !p)}
                  className="rounded-full text-xs border-[#E7E7E7] hover:border-[#090909]"
                >
                  <Plus size={13} className="mr-1" />
                  <span>{isAddingProject ? "Cancel" : "Add Project"}</span>
                </Button>
              </div>

              {/* Add Project Inline Card */}
              {isAddingProject && (
                <div className="p-4 bg-[#FAFAFA] border border-[#090909] rounded-2xl space-y-3 animate-in fade-in duration-150">
                  <h5 className="text-xs font-bold text-[#090909]">Add New Portfolio Project</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Project Title *"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909]"
                    />
                    <input
                      type="text"
                      placeholder="Your Role (e.g. Lead Dev)"
                      value={projectRole}
                      onChange={(e) => setProjectRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909]"
                    />
                    <select
                      value={projectStatus}
                      onChange={(e) => setProjectStatus(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909]"
                    >
                      <option value="Completed">Completed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Active">Active</option>
                    </select>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Short description of technical architecture, performance highlights, or business impact..."
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="w-full p-3 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909]"
                  />

                  <input
                    type="text"
                    placeholder="Technologies comma-separated (e.g. Next.js, Go, PostgreSQL, Redis)"
                    value={projectTechStack}
                    onChange={(e) => setProjectTechStack(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909]"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="url"
                      placeholder="GitHub Repo URL (optional)"
                      value={projectGithub}
                      onChange={(e) => setProjectGithub(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909]"
                    />
                    <input
                      type="url"
                      placeholder="Live Demo URL (optional)"
                      value={projectDemo}
                      onChange={(e) => setProjectDemo(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] focus:outline-none focus:border-[#090909]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingProject(false)}
                      className="text-xs rounded-full"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNewProject}
                      className="text-xs rounded-full bg-[#090909] text-white hover:bg-[#242424]"
                    >
                      Save to Portfolio
                    </Button>
                  </div>
                </div>
              )}

              {/* Projects List */}
              <div className="space-y-3">
                {detailedProjects.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 bg-white border border-[#E7E7E7] rounded-2xl space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-xs font-bold text-[#090909]">{p.title}</h5>
                          {p.role && (
                            <span className="text-[10px] font-semibold text-[#737373] bg-[#F4F4F4] px-2 py-0.5 rounded-full">
                              {p.role}
                            </span>
                          )}
                          {p.status && (
                            <span className="text-[10px] font-medium text-[#090909] bg-[#EBEBEB] px-2 py-0.5 rounded-full">
                              {p.status}
                            </span>
                          )}
                        </div>
                        {p.description && (
                          <p className="text-xs text-[#555555] mt-1 leading-relaxed">
                            {p.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(p.id)}
                        className="text-[#737373] hover:text-[#090909] cursor-pointer"
                        title="Remove project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div className="flex flex-wrap gap-1">
                        {p.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[#E7E7E7] text-[#090909]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-[#737373]">
                        {p.githubUrl && (
                          <a
                            href={p.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#090909] hover:underline flex items-center gap-1"
                          >
                            <span>Code</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {p.demoUrl && (
                          <a
                            href={p.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[#090909] hover:underline flex items-center gap-1 font-semibold text-[#090909]"
                          >
                            <span>Demo</span>
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {detailedProjects.length === 0 && (
                  <p className="text-xs text-[#737373] italic py-2">
                    No portfolio projects added yet. Click &quot;Add Project&quot; to showcase your work.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: Goals & Achievements ─────────────────────────────────── */}
        {activeTab === "goals_achievements" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Target Companies */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Target Employers &amp; Companies
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    Type any company name where you aspire to work or intern.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">
                  {targetCompanies.length} selected
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 p-3 bg-[#FAFAFA] border border-[#E7E7E7] rounded-2xl min-h-[44px]">
                {targetCompanies.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#090909] text-xs font-medium border border-[#E7E7E7]"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCompany(c)}
                      className="text-[#737373] hover:text-[#090909] cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {targetCompanies.length === 0 && (
                  <span className="text-xs text-[#737373] self-center">No target companies added yet.</span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCompany();
                    }
                  }}
                  placeholder="Type any target company (e.g. OpenAI, Snowflake, Figma, Cisco)"
                  className="flex-1 rounded-xl border border-[#E7E7E7] text-xs px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#090909]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleAddCompany()}
                  className="rounded-full bg-[#090909] text-white hover:bg-[#242424] px-4 text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-[#737373]">Optional suggestions:</span>
                {PRESET_COMPANIES.filter((c) => !targetCompanies.includes(c))
                  .slice(0, 6)
                  .map((pc) => (
                    <button
                      key={pc}
                      type="button"
                      onClick={() => handleAddCompany(pc)}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#F4F4F4] hover:bg-[#EBEBEB] text-[#090909] transition-colors cursor-pointer"
                    >
                      + {pc}
                    </button>
                  ))}
              </div>
            </div>

            {/* Preferred Location & Internship Interest */}
            <div className="space-y-3 pt-3 border-t border-[#E7E7E7]">
              <div>
                <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                  Location &amp; Internship Preferences
                </h4>
                <p className="text-[11px] text-[#737373]">
                  Help alumni mentors understand your target geographic market and timing.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#090909] flex items-center gap-1.5">
                    <MapPin size={13} />
                    <span>Preferred Location</span>
                  </label>
                  <input
                    type="text"
                    value={preferredLocation}
                    onChange={(e) => setPreferredLocation(e.target.value)}
                    placeholder="e.g. Remote, Bengaluru, San Francisco"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#090909] flex items-center gap-1.5">
                    <Briefcase size={13} />
                    <span>Internship Interest</span>
                  </label>
                  <input
                    type="text"
                    value={internshipInterest}
                    onChange={(e) => setInternshipInterest(e.target.value)}
                    placeholder="e.g. Summer 2026 SWE Internship"
                    className="w-full h-10 px-3.5 rounded-xl border border-[#E7E7E7] bg-white text-xs text-[#090909] placeholder-[#A8A8A8] focus:outline-none focus:border-[#090909]"
                  />
                </div>
              </div>
            </div>

            {/* Career Goals */}
            <div className="space-y-2.5 pt-3 border-t border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Career Milestones &amp; Goals
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    Specific milestones you want your alumni mentors to help you achieve.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">
                  {careerGoalsList.length} milestones
                </span>
              </div>

              <div className="space-y-2">
                {careerGoalsList.map((goal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl text-xs text-[#090909]"
                  >
                    <span className="truncate pr-3">{goal}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(idx)}
                      className="text-[#737373] hover:text-[#090909] cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {careerGoalsList.length === 0 && (
                  <p className="text-xs text-[#737373] italic py-2">
                    No milestones added yet. Add custom career goals below.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddGoal();
                    }
                  }}
                  placeholder="e.g. Master distributed system fundamentals and pass technical interviews"
                  className="flex-1 rounded-xl border border-[#E7E7E7] text-xs px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#090909]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddGoal}
                  className="rounded-full bg-[#090909] text-white hover:bg-[#242424] px-4 text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
            </div>

            {/* Achievements & Honors */}
            <div className="space-y-2.5 pt-3 border-t border-[#E7E7E7]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Academic &amp; Extracurricular Achievements
                  </h4>
                  <p className="text-[11px] text-[#737373]">
                    Honors, hackathons, certifications, or leadership appointments.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#737373]">
                  {achievements.length} listed
                </span>
              </div>

              <div className="space-y-2">
                {achievements.map((ach, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 bg-[#FAFAFA] border border-[#E7E7E7] rounded-xl text-xs text-[#090909]"
                  >
                    <span className="truncate pr-3">{ach}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(idx)}
                      className="text-[#737373] hover:text-[#090909] cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {achievements.length === 0 && (
                  <p className="text-xs text-[#737373] italic py-2">
                    No achievements or certifications added yet.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAchievement}
                  onChange={(e) => setNewAchievement(e.target.value)}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddAchievement();
                    }
                  }}
                  placeholder="e.g. Dean's Honor List Fall 2025 · AWS Certified Cloud Practitioner"
                  className="flex-1 rounded-xl border border-[#E7E7E7] text-xs px-3.5 py-2.5 bg-white focus:outline-none focus:border-[#090909]"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddAchievement}
                  className="rounded-full bg-[#090909] text-white hover:bg-[#242424] px-4 text-xs"
                >
                  <Plus size={14} className="mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-[#E7E7E7] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset student profile to clean starting state?")) {
                onReset();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#090909] cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Profile Fields</span>
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-xs rounded-full text-[#737373] hover:text-[#090909]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="text-xs rounded-full bg-[#090909] hover:bg-[#242424] text-white px-5 py-2"
            >
              Save Profile Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function EditProfileModal({
  isOpen,
  onClose,
  student,
  onSave,
  onReset,
  initialTab = "general",
}: EditProfileModalProps) {
  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-modal-title"
    >
      <EditProfileForm
        key={`${student.name}-${student.department}-${student.careerGoal}-${student.skills?.length}-${student.projects?.length}-${initialTab}`}
        student={student}
        onSave={onSave}
        onClose={onClose}
        onReset={onReset}
        initialTab={initialTab}
      />
    </div>
  );
}
