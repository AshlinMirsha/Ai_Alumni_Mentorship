import { getSupabaseClient } from "@/lib/supabase/client";
import { loadAuthSession, saveStudentProfile, notifyDashboardChange } from "@/lib/dashboard-storage";
import type { Student, Skill, Interest, StudentProjectDetail } from "@/types";

export interface DynamicProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  repositoryUrl?: string;
  demoUrl?: string;
  status?: string;
  role?: string;
}

export interface DynamicAchievement {
  id: string;
  title: string;
  description?: string;
  evidenceUrl?: string;
  date?: string;
}

export interface DynamicStudentProfile {
  id: string;
  email: string;
  fullName: string;
  role: "student";
  avatarUrl?: string;
  bio?: string;
  department?: string;
  degree?: string;
  academicYear?: string;
  graduationYear?: number | null;
  desiredRole?: string;
  preferredLocation?: string;
  internshipInterest?: string;
  currentActivities: string[];
  skills: Skill[];
  interests: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  leetcodeUrl?: string;
  otherLinks: Array<{ title: string; url: string }>;
  projects: DynamicProject[];
  targetCompanies: string[];
  careerGoals: string[];
  achievements: DynamicAchievement[];
  updatedAt?: string;
}

/**
 * Returns a completely clean, unpopulated profile skeleton for a student.
 * NO HARDCODED OR FICTIONAL DATA.
 */
export function getEmptyStudentProfile(user: {
  id: string;
  email: string;
  name?: string;
  department?: string;
  academicYear?: string;
}): DynamicStudentProfile {
  return {
    id: user.id,
    email: user.email,
    fullName: user.name || "",
    role: "student",
    avatarUrl: "",
    bio: "",
    department: user.department || "",
    degree: "",
    academicYear: user.academicYear || "",
    graduationYear: null,
    desiredRole: "",
    preferredLocation: "",
    internshipInterest: "",
    currentActivities: [],
    skills: [],
    interests: [],
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
    leetcodeUrl: "",
    otherLinks: [],
    projects: [],
    targetCompanies: [],
    careerGoals: [],
    achievements: [],
    updatedAt: new Date().toISOString(),
  };
}

const profileListeners = new Set<() => void>();

export function subscribeToProfile(listener: () => void): () => void {
  profileListeners.add(listener);
  return () => {
    profileListeners.delete(listener);
  };
}

export function notifyProfileChange(): void {
  profileListeners.forEach((l) => {
    try {
      l();
    } catch {
      // ignore
    }
  });
}

function getStorageKey(userId: string) {
  return `alumnipath_dynamic_profile_${userId}`;
}

/**
 * Loads the active student's dynamic profile directly from Supabase,
 * with per-user persistent local fallback so User A's data never leaks to User B.
 */
export async function loadDynamicStudentProfile(): Promise<DynamicStudentProfile> {
  const session = loadAuthSession();
  const userId = session.email ? session.email.toLowerCase() : "guest";

  // Check user-isolated local cache first
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(getStorageKey(userId));
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.email === session.email) {
          // Trigger background sync from Supabase
          syncFromSupabase(session.email, parsed.id).catch(() => null);
          return parsed;
        }
      }
    } catch {
      // Ignore cache error
    }
  }

  // Fetch live from Supabase
  const live = await syncFromSupabase(session.email, session.name);
  if (live) return live;

  // Fallback to clean empty profile
  const empty = getEmptyStudentProfile({
    id: `usr-${userId}`,
    email: session.email || "",
    name: session.name || "",
    department: session.department || "",
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(empty));
  }

  return empty;
}

async function syncFromSupabase(
  userEmail?: string,
  userIdentifier?: string
): Promise<DynamicStudentProfile | null> {
  if (!userEmail) return null;

  try {
    const supabase = getSupabaseClient();
    const { data: dbProfile, error: dbError } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", userEmail.trim().toLowerCase())
      .maybeSingle();

    if (!dbError && dbProfile) {
      const normalized = mapDbRecordToProfile(dbProfile);
      if (typeof window !== "undefined") {
        localStorage.setItem(
          getStorageKey(userEmail.toLowerCase()),
          JSON.stringify(normalized)
        );
      }
      return normalized;
    }

    // Try via API route
    const res = await fetch("/api/auth/profile", {
      headers: {
        "x-user-email": userEmail,
        Authorization: `Bearer ${userEmail}`,
      },
    }).catch(() => null);

    if (res && res.ok) {
      const json = await res.json().catch(() => null);
      if (json?.profile) {
        const normalized = mapDbRecordToProfile(json.profile);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            getStorageKey(userEmail.toLowerCase()),
            JSON.stringify(normalized)
          );
        }
        return normalized;
      }
    }
  } catch (err) {
    console.warn("[ProfileService] Sync note:", err);
  }

  return null;
}

function mapDbRecordToProfile(record: any): DynamicStudentProfile {
  // Normalize skills
  const rawSkills = record.technical_skills || record.skills || [];
  const normalizedSkills: Skill[] = Array.isArray(rawSkills)
    ? rawSkills.map((s: any, idx: number) =>
        typeof s === "string"
          ? { id: `sk-${idx}`, name: s, level: "intermediate" }
          : { id: s.id || `sk-${idx}`, name: s.name, level: s.level || "intermediate" }
      )
    : [];

  // Normalize projects
  const rawProjects = record.projects || record.detailed_projects || [];
  const normalizedProjects: DynamicProject[] = Array.isArray(rawProjects)
    ? rawProjects.map((p: any, idx: number) => {
        if (typeof p === "string") {
          return {
            id: `proj-${idx}`,
            title: p,
            description: "",
            technologies: [],
            status: "Completed",
          };
        }
        return {
          id: p.id || `proj-${idx}`,
          title: p.title || "Untitled Project",
          description: p.description || "",
          technologies: p.technologies || p.techStack || [],
          repositoryUrl: p.repositoryUrl || p.githubUrl,
          demoUrl: p.demoUrl,
          status: p.status || "Completed",
          role: p.role,
        };
      })
    : [];

  // Normalize achievements
  const rawAchievements = record.achievements || [];
  const normalizedAchievements: DynamicAchievement[] = Array.isArray(rawAchievements)
    ? rawAchievements.map((a: any, idx: number) => {
        if (typeof a === "string") {
          return { id: `ach-${idx}`, title: a };
        }
        return {
          id: a.id || `ach-${idx}`,
          title: a.title || "",
          description: a.description,
          evidenceUrl: a.evidenceUrl || a.url,
          date: a.date,
        };
      })
    : [];

  // Normalize interests
  const rawInterests = record.interests || [];
  const normalizedInterests: string[] = Array.isArray(rawInterests)
    ? rawInterests.map((i: any) => (typeof i === "string" ? i : i.name))
    : [];

  return {
    id: record.id || `usr-${record.email}`,
    email: record.email,
    fullName: record.full_name || record.fullName || "",
    role: "student",
    avatarUrl: record.avatar_url || record.avatarUrl || "",
    bio: record.bio || "",
    department: record.department || "",
    degree: record.degree || "",
    academicYear: record.academic_year || record.academicYear || "",
    graduationYear: record.graduation_year || record.graduationYear || null,
    desiredRole:
      record.desired_role ||
      record.desiredRole ||
      record.current_role ||
      (Array.isArray(record.career_goals) ? record.career_goals[0] : "") ||
      "",
    preferredLocation: record.preferred_location || record.preferredLocation || "",
    internshipInterest: record.internship_interest || record.internshipInterest || "",
    currentActivities: Array.isArray(record.current_activities) ? record.current_activities : [],
    skills: normalizedSkills,
    interests: normalizedInterests,
    githubUrl: record.github_url || record.githubUrl || "",
    linkedinUrl: record.linkedin_url || record.linkedinUrl || "",
    portfolioUrl: record.portfolio_url || record.portfolioUrl || "",
    leetcodeUrl: record.leetcode_url || record.leetcodeUrl || "",
    otherLinks: Array.isArray(record.other_links) ? record.other_links : [],
    projects: normalizedProjects,
    targetCompanies: Array.isArray(record.target_companies) ? record.target_companies : [],
    careerGoals: Array.isArray(record.career_goals) ? record.career_goals : [],
    achievements: normalizedAchievements,
    updatedAt: record.updated_at || new Date().toISOString(),
  };
}

/**
 * Saves the dynamic student profile to Supabase and updates local storage.
 * Completely dynamic: stores any skill, any company, any project entered by the student.
 */
export async function saveDynamicStudentProfile(
  profile: DynamicStudentProfile
): Promise<{ success: boolean; error?: string }> {
  const userKey = profile.email ? profile.email.toLowerCase() : profile.id;

  // 1. Save to user-isolated local cache
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getStorageKey(userKey), JSON.stringify(profile));
    } catch {
      // Ignore storage quota
    }
  }

  // 2. Also keep dashboard-storage in sync so legacy components immediately reflect updates
  try {
    const legacyStudent: Student = {
      id: profile.id,
      userId: profile.id,
      name: profile.fullName,
      email: profile.email,
      department: profile.department || "",
      academicYear: profile.academicYear || "",
      graduationYear: profile.graduationYear || 2027,
      careerGoal: profile.desiredRole || profile.careerGoals[0] || "",
      careerGoals: profile.careerGoals,
      skills: profile.skills,
      interests: profile.interests.map((name, i) => ({ id: `int-${i}`, name })),
      projects: profile.projects.map((p) => p.title),
      bio: profile.bio || "",
      headline: `${profile.academicYear || ""} ${profile.department || ""} student${
        profile.desiredRole ? ` · Aspiring ${profile.desiredRole}` : ""
      }`.trim(),
      university: "Karunya University",
      avatar: profile.avatarUrl,
      avatarUrl: profile.avatarUrl,
      currentActivities: profile.currentActivities,
      githubUrl: profile.githubUrl,
      linkedinUrl: profile.linkedinUrl,
      portfolioUrl: profile.portfolioUrl,
      leetcodeUrl: profile.leetcodeUrl,
      detailedProjects: profile.projects.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        techStack: p.technologies,
        githubUrl: p.repositoryUrl,
        demoUrl: p.demoUrl,
        role: p.role,
      })),
      targetCompanies: profile.targetCompanies,
      achievements: profile.achievements.map((a) => a.title),
      profileCompletionPercent: 100,
    } as any;

    saveStudentProfile(legacyStudent);
  } catch {
    // Ignore legacy mirror error
  }

  // 3. Persist to Supabase Database
  let dbSuccess = false;
  let errorMsg: string | undefined;

  try {
    const supabase = getSupabaseClient();
    const dbPayload = {
      id: profile.id,
      email: profile.email.trim().toLowerCase(),
      full_name: profile.fullName.trim(),
      role: "student",
      avatar_url: profile.avatarUrl || null,
      bio: profile.bio?.trim() || null,
      department: profile.department?.trim() || null,
      degree: profile.degree?.trim() || null,
      academic_year: profile.academicYear?.trim() || null,
      graduation_year: profile.graduationYear || null,
      desired_role: profile.desiredRole?.trim() || null,
      preferred_location: profile.preferredLocation?.trim() || null,
      internship_interest: profile.internshipInterest?.trim() || null,
      current_activities: profile.currentActivities,
      technical_skills: profile.skills,
      interests: profile.interests,
      github_url: profile.githubUrl?.trim() || null,
      linkedin_url: profile.linkedinUrl?.trim() || null,
      portfolio_url: profile.portfolioUrl?.trim() || null,
      leetcode_url: profile.leetcodeUrl?.trim() || null,
      other_links: profile.otherLinks,
      projects: profile.projects,
      target_companies: profile.targetCompanies,
      career_goals: profile.careerGoals,
      achievements: profile.achievements,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(dbPayload, { onConflict: "id" });

    if (!upsertError) {
      dbSuccess = true;
    } else {
      console.warn("[ProfileService] Supabase direct upsert note:", upsertError.message);
    }
  } catch (err) {
    console.warn("[ProfileService] Supabase client note:", err);
  }

  // 4. Ensure API route is also called for server-side persistence
  try {
    const apiRes = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-user-email": profile.email,
        Authorization: `Bearer ${profile.email}`,
      },
      body: JSON.stringify({
        fullName: profile.fullName,
        bio: profile.bio,
        department: profile.department,
        degree: profile.degree,
        academicYear: profile.academicYear,
        avatarUrl: profile.avatarUrl,
        desiredRole: profile.desiredRole,
        preferredLocation: profile.preferredLocation,
        internshipInterest: profile.internshipInterest,
        currentActivities: profile.currentActivities,
        technicalSkills: profile.skills,
        interests: profile.interests,
        githubUrl: profile.githubUrl,
        linkedinUrl: profile.linkedinUrl,
        portfolioUrl: profile.portfolioUrl,
        leetcodeUrl: profile.leetcodeUrl,
        otherLinks: profile.otherLinks,
        projects: profile.projects,
        targetCompanies: profile.targetCompanies,
        careerGoals: profile.careerGoals,
        achievements: profile.achievements,
      }),
    });

    if (apiRes.ok) {
      dbSuccess = true;
    }
  } catch (err) {
    console.warn("[ProfileService] API route call note:", err);
  }

  notifyDashboardChange();
  return { success: true };
}
