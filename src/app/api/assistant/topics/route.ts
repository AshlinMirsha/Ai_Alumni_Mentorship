import { NextResponse, connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/authorize";

export async function GET(req: Request) {
  await connection();
  try {
    const { user, profile, error } = await getAuthenticatedUser(req);
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const studentName = profile?.full_name || user.user_metadata?.full_name || "Student";
    const targetRole = (profile as any)?.desired_role || (Array.isArray((profile as any)?.career_goals) && (profile as any).career_goals[0]) || "";
    const academicYear = profile?.academic_year || "";
    const department = profile?.department || "";
    const degree = (profile as any)?.degree || "";

    const rawSkills = (profile as any)?.technical_skills || (profile as any)?.skills || [];
    const skills: string[] = [];
    if (Array.isArray(rawSkills)) {
      rawSkills.forEach((s: any) => {
        if (typeof s === "string") skills.push(s);
        else if (s?.name) skills.push(s.name);
      });
    }

    const rawProjects = (profile as any)?.projects || [];
    const projects: string[] = [];
    if (Array.isArray(rawProjects)) {
      rawProjects.forEach((p: any) => {
        if (p?.title) projects.push(p.title);
      });
    }

    const targetCompanies = Array.isArray((profile as any)?.target_companies)
      ? (profile as any).target_companies
      : [];

    // Track missing fields to prompt user completion rather than hallucinating
    const missingFields: string[] = [];
    if (!targetRole) missingFields.push("Target Career Role");
    if (skills.length === 0) missingFields.push("Technical Skills");
    if (projects.length === 0) missingFields.push("Portfolio Projects");
    if (!academicYear) missingFields.push("Academic Year");

    // Dynamic suggested questions strictly rooted in their real profile
    const suggestedPrompts: {
      title: string;
      description: string;
      prompt: string;
      category: "roadmap" | "skills" | "resume" | "interview" | "profile";
    }[] = [];

    if (targetRole) {
      suggestedPrompts.push({
        title: `Build my ${targetRole} roadmap`,
        description: `Step-by-step career milestones for ${targetRole}`,
        prompt: `Create a step-by-step career roadmap for becoming a ${targetRole}.`,
        category: "roadmap",
      });
    } else {
      suggestedPrompts.push({
        title: "Explore career pathways",
        description: "Discover tech roles that align with your coursework and degree",
        prompt: "What software engineering and tech career paths align with my degree?",
        category: "roadmap",
      });
    }

    if (skills.length > 0) {
      const topSkills = skills.slice(0, 3).join(", ");
      suggestedPrompts.push({
        title: "Analyze my skill gaps",
        description: `Evaluate my skills (${topSkills}) against industry standards`,
        prompt: `Analyze my current skills (${topSkills}) against industry hiring requirements for ${targetRole || "software engineering"}.`,
        category: "skills",
      });
    } else {
      suggestedPrompts.push({
        title: "Recommended foundational skills",
        description: "Essential technical skills to learn first",
        prompt: `What foundational technologies should I learn first to pursue ${targetRole || "software engineering"}?`,
        category: "skills",
      });
    }

    if (projects.length > 0) {
      suggestedPrompts.push({
        title: "Review my project portfolio",
        description: `Feedback on ${projects[0]} and practical improvements`,
        prompt: `How can I highlight my project "${projects[0]}" on my resume and GitHub for ${targetRole || "technical recruiters"}?`,
        category: "resume",
      });
    } else {
      suggestedPrompts.push({
        title: "Portfolio project ideas",
        description: `High-impact project concepts for ${targetRole || "software roles"}`,
        prompt: `Suggest 2 high-impact full-stack portfolio projects that will catch the attention of hiring managers for ${targetRole || "entry-level roles"}.`,
        category: "roadmap",
      });
    }

    suggestedPrompts.push({
      title: "Technical interview preparation",
      description: "Data structures, system design, and behavioral questions",
      prompt: `What are the most frequent technical interview topics and questions asked for ${targetRole || "software engineer"} positions?`,
      category: "interview",
    });

    return NextResponse.json({
      success: true,
      profileContext: {
        studentName,
        targetRole: targetRole || null,
        academicYear: academicYear || null,
        department: department || null,
        degree: degree || null,
        skillsCount: skills.length,
        skills,
        projectsCount: projects.length,
        projects,
        targetCompanies,
        isProfileComplete: missingFields.length === 0,
        missingFields,
      },
      suggestedPrompts,
    });
  } catch (err: any) {
    console.error("[Assistant Topics API] Error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to generate contextual topics.", details: err?.message },
      { status: 500 }
    );
  }
}
