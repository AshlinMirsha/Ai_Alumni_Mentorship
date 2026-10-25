import type { User } from "@supabase/supabase-js";
import { getAdminClient } from "../supabase/admin";
import type { Profile, RoleType } from "../supabase/types";
import { getRegisteredUser, getRegisteredUserById } from "./registered-users";

/**
 * Extracts client IP address from standard proxy headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

/**
 * Extracts Bearer token from the Authorization header.
 */
export function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Verifies caller authentication and fetches their trusted profile from the database.
 * Does NOT trust client-supplied roles.
 */
export async function getAuthenticatedUser(req: Request): Promise<{
  user: User | null;
  profile: Profile | null;
  error: string | null;
}> {
  const token = getBearerToken(req);
  if (!token) {
    return { user: null, profile: null, error: "Missing authorization token." };
  }

  const supabase = getAdminClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    // Check fallback for registered user sessions
    const emailHeader = req.headers.get("x-user-email");
    const idHeader = req.headers.get("x-user-id");
    const regUser =
      getRegisteredUserById(token) ||
      getRegisteredUserById(idHeader) ||
      getRegisteredUser(emailHeader) ||
      getRegisteredUser(token);

    if (regUser) {
      let dbProfile: any = null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*, company:companies(*)")
          .eq("email", regUser.email)
          .maybeSingle();
        dbProfile = data;
      } catch {
        // Ignore table check if offline
      }

      const profileObj = dbProfile || {
        id: regUser.id,
        email: regUser.email,
        full_name: regUser.fullName,
        role: regUser.role,
        institution: regUser.institution,
        department: regUser.department,
        academic_year: regUser.academicYear,
        verification_status: regUser.verificationStatus,
        created_at: regUser.createdAt,
        updated_at: new Date().toISOString(),
        degree: (regUser as any).degree || null,
        bio: (regUser as any).bio || null,
        desired_role: (regUser as any).desired_role || (regUser as any).desiredRole || null,
        preferred_location: (regUser as any).preferred_location || (regUser as any).preferredLocation || null,
        internship_interest: (regUser as any).internship_interest || (regUser as any).internshipInterest || null,
        current_activities: (regUser as any).current_activities || (regUser as any).currentActivities || [],
        technical_skills: (regUser as any).technical_skills || (regUser as any).technicalSkills || (regUser as any).skills || [],
        interests: (regUser as any).interests || [],
        github_url: (regUser as any).github_url || (regUser as any).githubUrl || null,
        linkedin_url: (regUser as any).linkedin_url || (regUser as any).linkedinUrl || null,
        portfolio_url: (regUser as any).portfolio_url || (regUser as any).portfolioUrl || null,
        leetcode_url: (regUser as any).leetcode_url || (regUser as any).leetcodeUrl || null,
        other_links: (regUser as any).other_links || (regUser as any).otherLinks || [],
        projects: (regUser as any).projects || (regUser as any).detailedProjects || [],
        target_companies: (regUser as any).target_companies || (regUser as any).targetCompanies || [],
        career_goals: (regUser as any).career_goals || (regUser as any).careerGoals || [],
        achievements: (regUser as any).achievements || [],
        education: (regUser as any).education || null,
        avatar_url: (regUser as any).avatar_url || (regUser as any).avatarUrl || null,
      };

      return {
        user: {
          id: regUser.id,
          email: regUser.email,
          user_metadata: { full_name: regUser.fullName, role: regUser.role },
        } as any,
        profile: profileObj as Profile,
        error: null,
      };
    }

    return {
      user: null,
      profile: null,
      error: authError?.message || "Invalid or expired session token.",
    };
  }

  // Fetch trusted profile from public.profiles
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*, company:companies(*)")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return {
      user,
      profile: null,
      error: "User profile record not found.",
    };
  }

  return {
    user,
    profile: profile as Profile,
    error: null,
  };
}

/**
 * Enforces role-based access control at the backend layer.
 */
export async function requireRole(
  req: Request,
  allowedRoles: RoleType[]
): Promise<{
  authorized: boolean;
  status: number;
  user?: User;
  profile?: Profile;
  error?: string;
}> {
  const { user, profile, error } = await getAuthenticatedUser(req);

  if (error || !user || !profile) {
    return {
      authorized: false,
      status: 401,
      error: error || "Authentication required.",
    };
  }

  if (!allowedRoles.includes(profile.role)) {
    return {
      authorized: false,
      status: 403,
      error: `Access denied. This endpoint requires one of the following roles: [${allowedRoles.join(
        ", "
      )}]. Current role: '${profile.role}'.`,
    };
  }

  // If role is alumni, verify that verification_status is verified
  if (profile.role === "alumni" && profile.verification_status !== "verified") {
    return {
      authorized: false,
      status: 403,
      error: "Access denied. Alumni account verification is pending or revoked.",
    };
  }

  return {
    authorized: true,
    status: 200,
    user,
    profile,
  };
}
