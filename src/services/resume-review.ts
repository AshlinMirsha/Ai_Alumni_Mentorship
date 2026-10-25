import type { ResumeAnalysisOptions, ResumeReviewResult } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { loadAuthSession } from "@/lib/dashboard-storage";

export interface ResumeFileInput {
  name: string;
  size: number;
  rawFile?: File;
}

export interface IResumeReviewService {
  analyzeResume(
    file: ResumeFileInput | File,
    targetRole: string,
    options: ResumeAnalysisOptions,
    authorized: boolean
  ): Promise<ResumeReviewResult>;
}

export class ResumeReviewService implements IResumeReviewService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {};
    if (typeof window === "undefined") return headers;

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    } catch {
      // Fall through to the existing local registered-account session.
    }

    try {
      const auth = loadAuthSession();
      const authId = (auth as typeof auth & { id?: string }).id;
      if (auth?.email) headers["x-user-email"] = auth.email;
      if (authId) headers["x-user-id"] = authId;
      if (!headers.Authorization && auth?.isAuthenticated && (authId || auth?.email)) {
        headers.Authorization = `Bearer ${authId || auth.email}`;
      }
    } catch {
      // The API will return a clear authentication error if there is no session.
    }

    return headers;
  }

  async analyzeResume(
    file: ResumeFileInput | File,
    targetRole: string,
    options: ResumeAnalysisOptions,
    authorized: boolean
  ): Promise<ResumeReviewResult> {
    if (!authorized) throw new Error("Authorize AI processing before starting your resume review.");

    const rawFile = file instanceof File ? file : file.rawFile;
    if (!rawFile) throw new Error("The selected resume file is no longer available. Select it again and retry.");

    const formData = new FormData();
    formData.append("file", rawFile);
    formData.append("targetRole", targetRole);
    formData.append("options", JSON.stringify(options));
    formData.append("consent", "true");

    let response: Response;
    try {
      response = await fetch("/api/career/resume-review", {
        method: "POST",
        headers: await this.getAuthHeaders(),
        body: formData,
      });
    } catch {
      throw new Error("Could not reach the resume analysis service. Check your connection and try again.");
    }

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success || !data.result) {
      throw new Error(data?.error || "Resume analysis failed. Please try again.");
    }

    return data.result as ResumeReviewResult;
  }
}

export const resumeReviewService = new ResumeReviewService();
