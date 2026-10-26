"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  GraduationCap,
  Target,
  Code,
  FolderGit2,
  Award,
  Sparkles,
  Globe,
  MapPin,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Edit3,
  Calendar,
  Layers,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { EditProfileModal, TabKey } from "@/components/dashboard/EditProfileModal";
import {
  subscribeToDashboardStorage,
  loadStudentProfile,
  saveStudentProfile,
  resetStudentProfile,
} from "@/lib/dashboard-storage";
import {
  loadDynamicStudentProfile,
  saveDynamicStudentProfile,
} from "@/lib/profile-service";
import { calculateProfileCompletion } from "@/lib/mock-data";
import type { Student, StudentProjectDetail } from "@/types";

export default function StudentProfilePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<TabKey>("general");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Safe hydration strategy:
  // Browser-only data from localStorage is deferred until after initial client mount,
  // preventing any server/client hydration mismatch.
  const [isHydrated, setIsHydrated] = useState(false);
  const [student, setStudent] = useState<Student>(loadStudentProfile);

  useEffect(() => {
    setIsHydrated(true);
    setStudent(loadStudentProfile());

    const unsubscribe = subscribeToDashboardStorage(() => {
      setStudent(loadStudentProfile());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Sync with live Supabase profile on mount
  useEffect(() => {
    let isMounted = true;
    loadDynamicStudentProfile().then((live) => {
      if (!isMounted || !live) return;
      const current = loadStudentProfile();
      if (live.fullName || live.department || (live.projects && live.projects.length > 0)) {
        saveStudentProfile({
          ...current,
          name: live.fullName || current.name,
          email: live.email || current.email,
          department: live.department || current.department,
          degree: live.degree || current.degree,
          academicYear: live.academicYear || current.academicYear,
          careerGoal: live.desiredRole || current.careerGoal,
          careerGoals: live.careerGoals && live.careerGoals.length > 0 ? live.careerGoals : current.careerGoals,
          bio: live.bio || current.bio,
          avatar: live.avatarUrl || current.avatar,
          avatarUrl: live.avatarUrl || current.avatarUrl,
          currentActivities: live.currentActivities && live.currentActivities.length > 0 ? live.currentActivities : current.currentActivities,
          githubUrl: live.githubUrl || current.githubUrl,
          linkedinUrl: live.linkedinUrl || current.linkedinUrl,
          portfolioUrl: live.portfolioUrl || current.portfolioUrl,
          leetcodeUrl: live.leetcodeUrl || current.leetcodeUrl,
          targetCompanies: live.targetCompanies && live.targetCompanies.length > 0 ? live.targetCompanies : current.targetCompanies,
          achievements: live.achievements && live.achievements.length > 0 ? live.achievements.map((a) => a.title) : current.achievements,
          preferredLocation: live.preferredLocation || current.preferredLocation,
          internshipInterest: live.internshipInterest || current.internshipInterest,
          detailedProjects: live.projects && live.projects.length > 0 ? live.projects.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            techStack: p.technologies || [],
            githubUrl: p.repositoryUrl,
            demoUrl: p.demoUrl,
            role: p.role,
            status: p.status,
          })) : current.detailedProjects,
        });
        if (isMounted) {
          setStudent(loadStudentProfile());
        }
      }
    }).catch(() => null);

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveProfile = async (updatedStudent: Student) => {
    saveStudentProfile(updatedStudent);
    setStudent(loadStudentProfile());

    // Sync to Supabase public.profiles via dynamic profile service
    await saveDynamicStudentProfile({
      id: updatedStudent.id,
      email: updatedStudent.email || "",
      fullName: updatedStudent.name,
      role: "student",
      avatarUrl: updatedStudent.avatarUrl || updatedStudent.avatar,
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
      interests: (updatedStudent.interests || []).map((i) => (typeof i === "string" ? i : i.name)),
      githubUrl: updatedStudent.githubUrl,
      linkedinUrl: updatedStudent.linkedinUrl,
      portfolioUrl: updatedStudent.portfolioUrl,
      leetcodeUrl: updatedStudent.leetcodeUrl,
      otherLinks: updatedStudent.otherLinks || [],
      projects: (updatedStudent.detailedProjects || []).map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        technologies: p.techStack,
        repositoryUrl: p.githubUrl,
        demoUrl: p.demoUrl,
        role: p.role,
        status: p.status || "Completed",
      })),
      targetCompanies: updatedStudent.targetCompanies || [],
      careerGoals: updatedStudent.careerGoals || [],
      achievements: (updatedStudent.achievements || []).map((a, idx) =>
        typeof a === "string" ? { id: `ach-${idx}`, title: a } : a
      ),
    });

    showToast("Profile changes saved and synced successfully!");
  };

  const handleResetProfile = () => {
    resetStudentProfile();
    setStudent(loadStudentProfile());
    showToast("Profile reset to clean starting state.");
  };

  const openEditorWithTab = (tab: TabKey) => {
    setModalInitialTab(tab);
    setIsEditModalOpen(true);
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex antialiased text-[#090909]">
        <AppSidebar className="hidden lg:flex" />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            title="Student Profile"
            subtitle="Manage your public collegiate portfolio, developer links, and mentorship aspirations"
          />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
            <div className="bg-white border border-[#E7E7E7] rounded-3xl overflow-hidden shadow-xs">
              <div className="h-28 sm:h-32 bg-[#090909] p-4 sm:p-6" />
              <div className="px-6 pb-6 pt-0 -mt-12 flex items-end gap-4">
                <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-md bg-[#EBEBEB] animate-pulse" />
                <div className="space-y-2 pb-2">
                  <div className="h-6 w-44 bg-[#EBEBEB] rounded-lg animate-pulse" />
                  <div className="h-4 w-60 bg-[#F4F4F4] rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="h-32 bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs animate-pulse" />
                <div className="h-44 bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs animate-pulse" />
              </div>
              <div className="lg:col-span-4 space-y-6">
                <div className="h-40 bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs animate-pulse" />
                <div className="h-32 bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs animate-pulse" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const completion = calculateProfileCompletion(student);
  const displayName = student.name && student.name.trim().length > 0 ? student.name : (student.email || "Student");
  const academicYear = student.academicYear || "";
  const careerGoal = student.careerGoal || student.careerGoals?.[0] || "";

  const detailedProjects: StudentProjectDetail[] = student.detailedProjects || [];
  const targetCompanies = student.targetCompanies || [];
  const currentActivities = student.currentActivities || [];
  const achievements = student.achievements || [];
  const skills = student.skills || [];
  const interests = student.interests || [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex antialiased text-[#090909]">
      {/* App Sidebar (Desktop) */}
      <AppSidebar className="hidden lg:flex" />

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex lg:hidden">
          <div className="relative w-64 h-full bg-white">
            <AppSidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
          title="Student Profile"
          subtitle="Manage your public collegiate portfolio, developer links, and mentorship aspirations"
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#090909] text-white text-xs shadow-lg border border-[#242424] animate-in fade-in duration-150"
          >
            <CheckCircle2 size={14} className="text-white shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-16">
          {/* Breadcrumb / Return to Dashboard */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#090909] transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>

            <span className="text-[11px] font-semibold text-[#737373] hidden sm:inline">
              Verified University Enrollee · Class of {student.graduationYear || 2027}
            </span>
          </div>

          {/* Hero Header Card */}
          <div className="bg-white border border-[#E7E7E7] rounded-3xl overflow-hidden shadow-xs">
            {/* Dark Cover Ribbon */}
            <div className="h-28 sm:h-32 bg-[#090909] relative p-4 sm:p-6 flex items-start justify-between">
              <div className="inline-flex items-center gap-1.5 text-xs text-white/90 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs font-medium">
                <Globe size={13} />
                <span>Enrolled Student Profile · Verified University Directory</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditorWithTab("general")}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#090909] text-xs font-semibold shadow-xs hover:bg-[#F4F4F4] transition-colors cursor-pointer"
                >
                  <Edit3 size={12} />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Profile Info Strip */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="-mt-12 mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-white shrink-0">
                    <Avatar
                      name={displayName}
                      src={student.avatarUrl || student.avatar}
                      size="xl"
                      className="w-full h-full text-2xl"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("general")}
                    className="absolute inset-0 rounded-2xl bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change profile picture"
                  >
                    <Edit3 size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditorWithTab("activities")}
                    className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                  >
                    <Sparkles size={12} className="mr-1.5" />
                    <span>Update Current Focus</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => openEditorWithTab("skills_projects")}
                    className="bg-[#090909] hover:bg-[#242424] text-white rounded-full text-xs"
                  >
                    <FolderGit2 size={12} className="mr-1.5" />
                    <span>Manage Projects</span>
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#090909]">
                    {displayName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#090909] bg-[#F4F4F4] px-2.5 py-0.5 rounded-full border border-[#E7E7E7]">
                    <ShieldCheck size={12} /> Verified Student
                  </span>
                  {student.degree && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#737373] bg-[#FAFAFA] px-2.5 py-0.5 rounded-full border border-[#E7E7E7]">
                      <GraduationCap size={12} /> {student.degree}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-[#555555] font-medium mt-1">
                  {student.headline || (student.department ? `${student.department} Student` : "Enrolled Student")}
                </p>

                <div className="mt-3 flex items-center gap-3 text-xs text-[#737373] flex-wrap">
                  <span className="flex items-center gap-1 font-semibold text-[#090909]">
                    <GraduationCap size={14} />
                    {student.university || "Karunya University"}
                  </span>
                  {student.department && (
                    <>
                      <span>·</span>
                      <span>{student.department}</span>
                    </>
                  )}
                  {academicYear && (
                    <>
                      <span>·</span>
                      <span className="font-medium text-[#090909]">
                        {academicYear} {student.graduationYear ? `(Class of ${student.graduationYear})` : ""}
                      </span>
                    </>
                  )}
                  {student.preferredLocation && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#090909]">
                        <MapPin size={12} />
                        {student.preferredLocation}
                      </span>
                    </>
                  )}
                  {student.internshipInterest && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#090909]">
                        <Briefcase size={12} />
                        {student.internshipInterest}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Developer Links Strip */}
              <div className="mt-5 pt-4 border-t border-[#E7E7E7] flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-semibold text-[#737373] uppercase tracking-wider mr-1">
                  Developer Links:
                </span>

                {student.githubUrl ? (
                  <a
                    href={student.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] hover:bg-[#090909] text-[#090909] hover:text-white border border-[#E7E7E7] text-xs font-semibold transition-all shadow-xs"
                  >
                    <Code size={13} />
                    <span>GitHub</span>
                    <ExternalLink size={10} className="opacity-70" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("activities")}
                    className="text-xs text-[#737373] hover:text-[#090909] hover:underline cursor-pointer"
                  >
                    + Add GitHub
                  </button>
                )}

                {student.linkedinUrl ? (
                  <a
                    href={student.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] hover:bg-[#090909] text-[#090909] hover:text-white border border-[#E7E7E7] text-xs font-semibold transition-all shadow-xs"
                  >
                    <Globe size={13} />
                    <span>LinkedIn</span>
                    <ExternalLink size={10} className="opacity-70" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("activities")}
                    className="text-xs text-[#737373] hover:text-[#090909] hover:underline cursor-pointer"
                  >
                    + Add LinkedIn
                  </button>
                )}

                {student.portfolioUrl ? (
                  <a
                    href={student.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] hover:bg-[#090909] text-[#090909] hover:text-white border border-[#E7E7E7] text-xs font-semibold transition-all shadow-xs"
                  >
                    <Globe size={13} />
                    <span>Portfolio</span>
                    <ExternalLink size={10} className="opacity-70" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("activities")}
                    className="text-xs text-[#737373] hover:text-[#090909] hover:underline cursor-pointer"
                  >
                    + Add Portfolio
                  </button>
                )}

                {student.leetcodeUrl ? (
                  <a
                    href={student.leetcodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAFAFA] hover:bg-[#090909] text-[#090909] hover:text-white border border-[#E7E7E7] text-xs font-semibold transition-all shadow-xs"
                  >
                    <Code size={13} />
                    <span>LeetCode</span>
                    <ExternalLink size={10} className="opacity-70" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("activities")}
                    className="text-xs text-[#737373] hover:text-[#090909] hover:underline cursor-pointer"
                  >
                    + Add LeetCode
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Section 1: About & Bio */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7]">
                  <h2 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    About &amp; Background
                  </h2>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("general")}
                    className="text-xs font-semibold text-[#090909] hover:underline cursor-pointer"
                  >
                    {student.bio ? "Edit Bio" : "+ Add Bio"}
                  </button>
                </div>
                {student.bio ? (
                  <p className="text-xs sm:text-sm text-[#555555] leading-relaxed bg-[#FAFAFA] p-4 rounded-2xl border border-[#E7E7E7]">
                    {student.bio}
                  </p>
                ) : (
                  <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-dashed border-[#E7E7E7] text-center space-y-2">
                    <p className="text-xs text-[#737373]">
                      No bio added yet. Tell mentors and peers about your background, interests, and aspirations.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditorWithTab("general")}
                      className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                    >
                      + Add Bio
                    </Button>
                  </div>
                )}
              </div>

              {/* Section 2: Current Activities */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#090909]" />
                    <h2 className="text-sm font-bold text-[#090909]">
                      Current Activities &amp; Focus
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("activities")}
                    className="text-xs font-semibold text-[#090909] hover:underline cursor-pointer"
                  >
                    + Add Activity
                  </button>
                </div>

                {currentActivities.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {currentActivities.map((act, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E7E7E7] flex items-center gap-3 text-xs text-[#090909]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#090909] shrink-0" />
                        <span className="font-medium">{act}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-dashed border-[#E7E7E7] text-center space-y-2">
                    <p className="text-xs text-[#737373]">
                      No current activities listed yet. Share what you are currently building, studying, or preparing for.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditorWithTab("activities")}
                      className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                    >
                      + Add Current Focus
                    </Button>
                  </div>
                )}
              </div>

              {/* Section 3: Technical Skills & Interests */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7]">
                  <div className="flex items-center gap-2">
                    <Code size={16} className="text-[#090909]" />
                    <h2 className="text-sm font-bold text-[#090909]">
                      Technical Skills &amp; Stack
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("skills_projects")}
                    className="text-xs font-semibold text-[#090909] hover:underline cursor-pointer"
                  >
                    Manage Skills
                  </button>
                </div>

                {skills.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {skills.map((skill) => {
                      const skillName = typeof skill === "string" ? skill : skill.name;
                      const level = typeof skill === "object" ? skill.level : undefined;

                      return (
                        <div
                          key={skillName}
                          className="p-3 rounded-2xl border border-[#E7E7E7] bg-[#FAFAFA] flex items-center justify-between"
                        >
                          <span className="text-xs font-semibold text-[#090909]">{skillName}</span>
                          {level && (
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                level === "expert"
                                  ? "bg-[#090909] text-white"
                                  : level === "advanced"
                                  ? "bg-[#EBEBEB] text-[#090909]"
                                  : "bg-white text-[#737373] border border-[#E7E7E7]"
                              }`}
                            >
                              {level}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-dashed border-[#E7E7E7] text-center space-y-2">
                    <p className="text-xs text-[#737373]">
                      No technical skills listed yet. Add languages, frameworks, databases, and cloud tools you use.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditorWithTab("skills_projects")}
                      className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                    >
                      + Add Technical Skills
                    </Button>
                  </div>
                )}

                {/* Interests */}
                <div className="pt-3 border-t border-[#E7E7E7]">
                  <span className="text-[11px] font-bold text-[#737373] uppercase tracking-wider block mb-2">
                    Domains &amp; Career Interests
                  </span>
                  {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {interests.map((int) => {
                        const name = typeof int === "string" ? int : int.name;
                        return (
                          <span
                            key={name}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-[#FAFAFA] border border-[#E7E7E7] text-[#090909]"
                          >
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-dashed border-[#E7E7E7] text-center space-y-2">
                      <p className="text-xs text-[#737373]">
                        No career domains or interests listed yet.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditorWithTab("skills_projects")}
                        className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                      >
                        + Add Interests
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Project Portfolio */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7]">
                  <div className="flex items-center gap-2">
                    <FolderGit2 size={16} className="text-[#090909]" />
                    <h2 className="text-sm font-bold text-[#090909]">
                      Project Portfolio &amp; Showcases
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("skills_projects")}
                    className="text-xs font-semibold text-[#090909] hover:underline cursor-pointer"
                  >
                    + Add Project
                  </button>
                </div>

                {detailedProjects.length > 0 ? (
                  <div className="space-y-4">
                    {detailedProjects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-5 rounded-2xl border border-[#E7E7E7] bg-white hover:border-[#090909] transition-all space-y-3 shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-[#090909]">{proj.title}</h3>
                            {proj.role && (
                              <span className="text-[10px] font-semibold text-[#737373] bg-[#F4F4F4] px-2 py-0.5 rounded-full">
                                {proj.role}
                              </span>
                            )}
                            {proj.status && (
                              <span className="text-[10px] font-medium text-[#090909] bg-[#EBEBEB] px-2 py-0.5 rounded-full">
                                {proj.status}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-[#090909] hover:underline flex items-center gap-1"
                              >
                                <span>Repository</span>
                                <ExternalLink size={11} />
                              </a>
                            )}
                            {proj.demoUrl && (
                              <a
                                href={proj.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-[#090909] hover:underline flex items-center gap-1 font-semibold"
                              >
                                <span>Live Demo</span>
                                <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                        </div>

                        {proj.description && (
                          <p className="text-xs text-[#555555] leading-relaxed">
                            {proj.description}
                          </p>
                        )}

                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {proj.techStack.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FAFAFA] border border-[#E7E7E7] text-[#090909]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAFAFA] p-8 rounded-2xl border border-dashed border-[#E7E7E7] text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[#EBEBEB] text-[#090909] flex items-center justify-center mx-auto">
                      <FolderGit2 size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#090909]">No projects added yet</h4>
                      <p className="text-xs text-[#737373] max-w-md mx-auto">
                        Showcase your apps, repositories, and open-source contributions to stand out to alumni mentors.
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openEditorWithTab("skills_projects")}
                      className="bg-[#090909] hover:bg-[#242424] text-white rounded-full text-xs"
                    >
                      + Add Your First Project
                    </Button>
                  </div>
                )}
              </div>

              {/* Section 5: Achievements & Honors */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E7]">
                  <div className="flex items-center gap-2">
                    <Award size={16} className="text-[#090909]" />
                    <h2 className="text-sm font-bold text-[#090909]">
                      Academic &amp; Extracurricular Achievements
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("goals_achievements")}
                    className="text-xs font-semibold text-[#090909] hover:underline cursor-pointer"
                  >
                    + Add Achievement
                  </button>
                </div>

                {achievements.length > 0 ? (
                  <div className="space-y-2.5">
                    {achievements.map((ach, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAFAFA] border border-[#E7E7E7] text-xs text-[#090909]"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#090909] text-white flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                          ✓
                        </div>
                        <span className="font-medium leading-relaxed">{ach}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAFAFA] p-6 rounded-2xl border border-dashed border-[#E7E7E7] text-center space-y-2">
                    <p className="text-xs text-[#737373]">
                      No achievements, hackathons, or certifications listed yet.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditorWithTab("goals_achievements")}
                      className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                    >
                      + Add Achievement
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Strength Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#090909] uppercase tracking-wider">
                    Profile Strength
                  </h3>
                  <span className="text-sm font-bold text-[#090909]">{completion.percent}%</span>
                </div>

                <div className="w-full bg-[#EBEBEB] rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#090909] transition-all duration-300"
                    style={{ width: `${completion.percent}%` }}
                  />
                </div>

                <p className="text-xs text-[#737373] leading-relaxed">
                  {completion.percent === 100
                    ? "Your student profile is comprehensive and verified for collegiate mentorship matching."
                    : `${completion.missingCount} recommended areas can be enriched to boost mentor discovery.`}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditorWithTab("general")}
                  className="w-full rounded-full text-xs border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                >
                  Enhance Profile Fields
                </Button>
              </div>

              {/* Target Employers Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
                  <div className="flex items-center gap-1.5">
                    <Building2 size={14} className="text-[#090909]" />
                    <h3 className="text-xs font-bold text-[#090909]">Target Companies</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("goals_achievements")}
                    className="text-[11px] font-semibold text-[#090909] hover:underline"
                  >
                    {targetCompanies.length > 0 ? "Edit" : "+ Add"}
                  </button>
                </div>

                {targetCompanies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {targetCompanies.map((comp) => (
                      <span
                        key={comp}
                        className="px-3 py-1 rounded-full bg-[#FAFAFA] border border-[#E7E7E7] text-xs font-semibold text-[#090909]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-dashed border-[#E7E7E7] text-center space-y-2">
                    <p className="text-xs text-[#737373]">No target companies added yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditorWithTab("goals_achievements")}
                      className="text-xs rounded-full border-[#E7E7E7] hover:border-[#090909] text-[#090909]"
                    >
                      + Add Companies
                    </Button>
                  </div>
                )}
              </div>

              {/* Career Goals Card */}
              <div className="bg-white border border-[#E7E7E7] rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E7E7E7]">
                  <div className="flex items-center gap-1.5">
                    <Target size={14} className="text-[#090909]" />
                    <h3 className="text-xs font-bold text-[#090909]">Career Aspirations</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => openEditorWithTab("goals_achievements")}
                    className="text-[11px] font-semibold text-[#090909] hover:underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block">
                      Target Role
                    </span>
                    {careerGoal ? (
                      <p className="font-bold text-[#090909] mt-0.5">{careerGoal}</p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openEditorWithTab("general")}
                        className="text-xs text-[#737373] hover:text-[#090909] hover:underline mt-0.5 cursor-pointer"
                      >
                        + Set Primary Target Role
                      </button>
                    )}
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-[#737373] uppercase tracking-wider block mb-1.5">
                      Key Milestones
                    </span>
                    {student.careerGoals && student.careerGoals.length > 0 ? (
                      <ul className="space-y-1.5 text-xs text-[#555555]">
                        {student.careerGoals.map((g, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-[#090909] font-bold">·</span>
                            <span>{g}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-[#737373] italic">
                        No career milestones added yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-[#090909] text-white rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-bold tracking-wider uppercase text-white/80">
                  Ready to Connect?
                </h3>
                <p className="text-xs text-white/70 leading-relaxed">
                  Browse verified alumni working at your target companies and request 1-on-1 career guidance.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  asChild
                  className="w-full bg-white text-[#090909] hover:bg-neutral-100 rounded-full text-xs font-semibold"
                >
                  <Link href="/alumni" className="flex items-center justify-center gap-1.5">
                    <span>Discover Alumni Mentors</span>
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal Dialog */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        student={student}
        onSave={handleSaveProfile}
        onReset={handleResetProfile}
        initialTab={modalInitialTab}
      />
    </div>
  );
}
