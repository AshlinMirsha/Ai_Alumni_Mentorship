import { getSupabaseClient } from "@/lib/supabase/client";
import {
  loadAlumniProfile,
  saveAlumniProfile,
  notifyDashboardChange,
} from "@/lib/dashboard-storage";
import type {
  Alumni,
  AlumniInternshipRecord,
  AlumniWorkExperienceRecord,
  AlumniDetailedSkill,
  AlumniCareerMilestone,
  AlumniCurrentEmployment,
  AlumniMentorshipDetails,
} from "@/types";

/**
 * Calculates duration between two dates safely in human readable format.
 * E.g., "3 mos", "6 mos", "1 yr 2 mos".
 * Safe against empty, invalid, or inverted dates.
 */
export function calculateInternshipDuration(
  startDateStr?: string,
  endDateStr?: string,
  status?: string
): string {
  if (!startDateStr) return "Duration unspecified";

  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return "Invalid start date";

  let end: Date;
  if (status === "Ongoing" || !endDateStr) {
    end = new Date();
  } else {
    end = new Date(endDateStr);
    if (isNaN(end.getTime())) return "Invalid end date";
  }

  if (end < start) {
    return "0 mos";
  }

  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  // Include partial months if end day >= start day
  if (end.getDate() >= start.getDate()) {
    months += 1;
  }
  if (months <= 0) months = 1;

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0 && remainingMonths > 0) {
    return `${years} yr${years > 1 ? "s" : ""} ${remainingMonths} mo${remainingMonths > 1 ? "s" : ""}`;
  } else if (years > 0) {
    return `${years} yr${years > 1 ? "s" : ""}`;
  } else {
    return `${months} mo${months > 1 ? "s" : ""}`;
  }
}

/**
 * Derives accurate counts from the alumnus's actual saved internship records.
 * STRICT REQUIREMENT: Only count records with status === "Completed" in completedCount.
 * Never include ongoing in the completed count!
 */
export function calculateInternshipMetrics(internships: AlumniInternshipRecord[] = []) {
  const safeList = Array.isArray(internships) ? internships : [];
  const completedCount = safeList.filter((i) => i.status === "Completed").length;
  const ongoingCount = safeList.filter((i) => i.status === "Ongoing").length;
  const notCompletedCount = safeList.filter((i) => i.status === "Not Completed").length;
  const totalCount = safeList.length;

  return {
    completedCount,
    ongoingCount,
    notCompletedCount,
    totalCount,
  };
}

/**
 * Synchronizes and loads dynamic alumni profile from backend API or local storage.
 */
export async function loadDynamicAlumniProfile(): Promise<Alumni> {
  const local = loadAlumniProfile();
  if (typeof window === "undefined") return local;

  try {
    const res = await fetch("/api/auth/profile", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      const json = await res.json();
      if (json && json.success && json.profile) {
        const p = json.profile;
        const merged: Alumni = {
          ...local,
          id: p.id || local.id,
          name: p.fullName || local.name,
          headline: p.headline || local.headline,
          bio: p.bio || local.bio,
          location: p.preferredLocation || p.city || local.location,
          city: p.city || local.city || p.preferredLocation || local.location,
          company: p.currentCompany || p.company || local.company,
          role: p.currentRole || local.role,
          graduationYear: p.graduationYear || local.graduationYear,
          department: p.department || local.department,
          degree: p.degree || local.degree,
          avatarUrl: p.avatarUrl || local.avatarUrl || local.avatar,
          avatar: p.avatarUrl || local.avatar,
          linkedinUrl: p.linkedinUrl || local.linkedinUrl,
          githubUrl: p.githubUrl || local.githubUrl,
          portfolioUrl: p.portfolioUrl || local.portfolioUrl,
          specializations: Array.isArray(p.specializations) ? p.specializations : local.specializations || [],
          currentEmployment: p.currentEmployment || local.currentEmployment,
          detailedSkills: Array.isArray(p.skillsDetailed)
            ? p.skillsDetailed
            : Array.isArray(p.detailedSkills)
            ? p.detailedSkills
            : local.detailedSkills || [],
          detailedWorkExperience: Array.isArray(p.workExperience)
            ? p.workExperience
            : local.detailedWorkExperience || [],
          internships: Array.isArray(p.internships) ? p.internships : local.internships || [],
          careerJourney: Array.isArray(p.careerJourney) ? p.careerJourney : local.careerJourney || [],
          mentorshipDetails: p.mentorshipDetails || p.mentorshipInterests || local.mentorshipDetails,
          university: p.university || p.institution || local.university,
          institution: p.institution || p.university || (local as any).institution,
          certifications: Array.isArray(p.certifications) ? p.certifications : local.certifications || [],
          detailedEducation: Array.isArray(p.detailedEducation) ? p.detailedEducation : local.detailedEducation || [],
          otherProfessionalLinks: Array.isArray(p.otherProfessionalLinks) ? p.otherProfessionalLinks : local.otherProfessionalLinks || [],
          specializationDetails: p.specializationDetails || local.specializationDetails,
        };
        saveAlumniProfile(merged);
        return merged;
      }
    }
  } catch (err) {
    console.warn("Could not sync profile with remote API, using local profile.", err);
  }

  return local;
}

/**
 * Saves dynamic alumni profile to both local cache and backend Supabase endpoint.
 */
export async function saveDynamicAlumniProfile(profile: Alumni): Promise<{ success: boolean; error?: string }> {
  // First persist immediately locally to guarantee instant UI responsiveness
  saveAlumniProfile(profile);

  try {
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: profile.name,
        headline: profile.headline,
        bio: profile.bio,
        preferredLocation: profile.location,
        city: profile.city || profile.location,
        company: profile.company,
        currentCompany: profile.company,
        role: profile.role,
        currentRole: profile.role,
        graduationYear: profile.graduationYear,
        department: profile.department,
        degree: profile.degree,
        avatarUrl: profile.avatarUrl || profile.avatar,
        linkedinUrl: profile.linkedinUrl,
        githubUrl: profile.githubUrl,
        portfolioUrl: profile.portfolioUrl,
        specializations: profile.specializations || [],
        currentEmployment: profile.currentEmployment,
        detailedSkills: profile.detailedSkills || [],
        detailedWorkExperience: profile.detailedWorkExperience || [],
        workExperience: profile.detailedWorkExperience || profile.workExperience || [],
        internships: profile.internships || [],
        careerJourney: profile.careerJourney || [],
        mentorshipDetails: profile.mentorshipDetails,
        mentorshipInterests: profile.mentorshipDetails,
        university: profile.university || (profile as any).institution,
        institution: (profile as any).institution || profile.university,
        certifications: profile.certifications || [],
        detailedEducation: profile.detailedEducation || [],
        otherProfessionalLinks: profile.otherProfessionalLinks || [],
        specializationDetails: profile.specializationDetails,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      console.warn("API profile update returned non-ok status:", data?.error);
      return { success: true }; // Local save succeeded
    }

    return { success: true };
  } catch (err: any) {
    console.warn("Failed to update profile on backend API:", err);
    return { success: true }; // Local save succeeded
  }
}

/**
 * Uploads an avatar image to Supabase Storage or falls back safely to base64 Data URL.
 */
export async function uploadAlumniAvatar(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Profile picture size must be under 5MB");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be a valid image (JPEG, PNG, WebP, etc.)");
  }

  try {
    const supabase = getSupabaseClient();
    const ext = file.name.split(".").pop() || "png";
    const filename = `alumni-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!uploadError) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(filename);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    }
  } catch (storageError) {
    console.warn("Direct Supabase storage upload unavailable, falling back to Data URL:", storageError);
  }

  // Fallback to base64 Data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to encode image"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}
