import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/authorize";
import { getAdminClient } from "@/lib/supabase/admin";
import { updateRegisteredUserProfile } from "@/lib/auth/registered-users";

export async function GET(req: Request) {
  try {
    const { user, profile, error } = await getAuthenticatedUser(req);

    if (error || !user || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: error || "Unauthorized.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role,
        institution: profile.institution,
        department: profile.department,
        degree: (profile as any).degree || null,
        academicYear: profile.academic_year,
        graduationYear: profile.graduation_year,
        currentRole: profile.current_role,
        currentCompany: profile.current_company,
        company: profile.company || null,
        verificationStatus: profile.verification_status,
        verifiedAt: profile.verified_at,
        headline: profile.headline,
        avatarUrl: profile.avatar_url || null,
        bio: (profile as any).bio || null,
        desiredRole: (profile as any).desired_role || (profile as any).current_role || null,
        preferredLocation: (profile as any).preferred_location || null,
        internshipInterest: (profile as any).internship_interest || null,
        currentActivities: (profile as any).current_activities || [],
        technicalSkills: (profile as any).technical_skills || [],
        interests: (profile as any).interests || [],
        githubUrl: (profile as any).github_url || null,
        linkedinUrl: (profile as any).linkedin_url || null,
        portfolioUrl: (profile as any).portfolio_url || null,
        leetcodeUrl: (profile as any).leetcode_url || null,
        otherLinks: (profile as any).other_links || [],
        projects: (profile as any).projects || [],
        targetCompanies: (profile as any).target_companies || [],
        careerGoals: (profile as any).career_goals || [],
        achievements: (profile as any).achievements || [],
        education: (profile as any).education || null,
        city: (profile as any).city || null,
        specializations: (profile as any).specializations || [],
        currentEmployment: (profile as any).current_employment || null,
        workExperience: (profile as any).work_experience || [],
        internships: (profile as any).internships || [],
        careerJourney: (profile as any).career_journey || [],
        mentorshipInterests: (profile as any).mentorship_interests || null,
        mentorshipDetails: (profile as any).mentorship_interests || null,
        skillsDetailed: (profile as any).skills_detailed || [],
        detailedSkills: (profile as any).skills_detailed || [],
        certifications: (profile as any).certifications || [],
        detailedEducation: (profile as any).detailed_education || [],
        otherProfessionalLinks: (profile as any).other_professional_links || [],
        specializationDetails: (profile as any).specialization_details || null,
        university: (profile as any).university || profile.institution || null,
      },
    });
  } catch (error) {
    console.error("[Profile] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve user profile.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { user, profile, error } = await getAuthenticatedUser(req);

    if (error || !user || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: error || "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid profile payload." },
        { status: 400 }
      );
    }

    // Security Rule: Students cannot escalate role to alumni or admin through profile updates
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.fullName === "string" && body.fullName.trim()) {
      updates.full_name = body.fullName.trim();
    }
    if (typeof body.department === "string") {
      updates.department = body.department.trim();
    }
    if (typeof body.degree === "string") {
      updates.degree = body.degree.trim();
    }
    if (typeof body.academicYear === "string") {
      updates.academic_year = body.academicYear.trim();
    }
    if (typeof body.headline === "string") {
      updates.headline = body.headline.trim();
    }
    if (typeof body.bio === "string") {
      updates.bio = body.bio.trim();
    }
    if (typeof body.desiredRole === "string") {
      updates.desired_role = body.desiredRole.trim();
    }
    if (typeof body.preferredLocation === "string") {
      updates.preferred_location = body.preferredLocation.trim();
    }
    if (typeof body.internshipInterest === "string") {
      updates.internship_interest = body.internshipInterest.trim();
    }
    if (typeof body.avatarUrl === "string") {
      updates.avatar_url = body.avatarUrl.trim();
    }
    if (typeof body.githubUrl === "string") {
      updates.github_url = body.githubUrl.trim();
    }
    if (typeof body.linkedinUrl === "string") {
      updates.linkedin_url = body.linkedinUrl.trim();
    }
    if (typeof body.portfolioUrl === "string") {
      updates.portfolio_url = body.portfolioUrl.trim();
    }
    if (typeof body.leetcodeUrl === "string") {
      updates.leetcode_url = body.leetcodeUrl.trim();
    }
    if (Array.isArray(body.otherLinks)) {
      updates.other_links = body.otherLinks;
    }
    if (Array.isArray(body.currentActivities)) {
      updates.current_activities = body.currentActivities;
    }
    if (Array.isArray(body.technicalSkills) || Array.isArray(body.skills)) {
      updates.technical_skills = body.technicalSkills || body.skills;
    }
    if (Array.isArray(body.interests)) {
      updates.interests = body.interests;
    }
    if (Array.isArray(body.projects) || Array.isArray(body.detailedProjects)) {
      updates.projects = body.detailedProjects || body.projects;
    }
    if (Array.isArray(body.targetCompanies)) {
      updates.target_companies = body.targetCompanies;
    }
    if (Array.isArray(body.careerGoals)) {
      updates.career_goals = body.careerGoals;
    } else if (typeof body.careerGoal === "string" && body.careerGoal.trim()) {
      updates.career_goals = [body.careerGoal.trim()];
    }
    if (Array.isArray(body.achievements)) {
      updates.achievements = body.achievements;
    }
    if (body.education && typeof body.education === "object") {
      updates.education = body.education;
    }
    if (typeof body.city === "string") {
      updates.city = body.city.trim();
    }
    if (typeof body.company === "string" || typeof body.currentCompany === "string") {
      const comp = (body.currentCompany || body.company || "").trim();
      updates.company = comp;
      updates.current_company = comp;
    }
    if (typeof body.role === "string" || typeof body.currentRole === "string") {
      const rol = (body.currentRole || body.role || "").trim();
      updates.current_role = rol;
    }
    if (typeof body.graduationYear === "number") {
      updates.graduation_year = body.graduationYear;
    }
    if (Array.isArray(body.specializations)) {
      updates.specializations = body.specializations;
    }
    if (body.currentEmployment && typeof body.currentEmployment === "object") {
      updates.current_employment = body.currentEmployment;
    }
    if (Array.isArray(body.workExperience) || Array.isArray(body.detailedWorkExperience)) {
      updates.work_experience = body.detailedWorkExperience || body.workExperience;
    }
    if (Array.isArray(body.internships)) {
      updates.internships = body.internships;
    }
    if (Array.isArray(body.careerJourney)) {
      updates.career_journey = body.careerJourney;
    }
    if (body.mentorshipDetails && typeof body.mentorshipDetails === "object") {
      updates.mentorship_interests = body.mentorshipDetails;
    } else if (body.mentorshipInterests && typeof body.mentorshipInterests === "object") {
      updates.mentorship_interests = body.mentorshipInterests;
    }
    if (Array.isArray(body.detailedSkills) || Array.isArray(body.skillsDetailed)) {
      updates.skills_detailed = body.detailedSkills || body.skillsDetailed;
    }
    if (Array.isArray(body.certifications)) {
      updates.certifications = body.certifications;
    }
    if (Array.isArray(body.detailedEducation)) {
      updates.detailed_education = body.detailedEducation;
    }
    if (Array.isArray(body.otherProfessionalLinks)) {
      updates.other_professional_links = body.otherProfessionalLinks;
    }
    if (body.specializationDetails && typeof body.specializationDetails === "object") {
      updates.specialization_details = body.specializationDetails;
    }
    if (typeof body.university === "string" || typeof body.institution === "string") {
      const uni = (body.university || body.institution || "").trim();
      updates.institution = uni;
      updates.university = uni;
    }

    updateRegisteredUserProfile(user.email || profile.email, updates);

    const supabase = getAdminClient();
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select("*, company:companies(*)")
      .single();

    if (updateError) {
      console.warn("[Profile] Database update warning:", updateError.message);
      return NextResponse.json({
        success: true,
        profile: {
          ...profile,
          ...updates,
          avatarUrl: updates.avatar_url || profile.avatar_url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("[Profile] Update error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile.",
      },
      { status: 500 }
    );
  }
}
