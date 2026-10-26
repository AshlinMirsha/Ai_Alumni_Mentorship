import type { ResumeAnalysisOptions, ResumeReviewResult } from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { loadAuthSession } from "@/lib/dashboard-storage";
import { extractPdfTextWithPaddleOcr } from "@/services/paddleocr-pdf";

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

    const createRequest = (ocrText?: string) => {
      const formData = new FormData();
      formData.append("file", rawFile);
      formData.append("targetRole", targetRole);
      formData.append("options", JSON.stringify(options));
      formData.append("consent", "true");
      if (ocrText) formData.append("ocrText", ocrText);
      return formData;
    };
    const sendRequest = async (ocrText?: string) => {
      try {
        return await fetch("/api/career/resume-review", {
          method: "POST",
          headers: await this.getAuthHeaders(),
          body: createRequest(ocrText),
        });
      } catch {
        throw new Error("Could not reach the resume analysis service. Check your connection and try again.");
      }
    };

    let response = await sendRequest();
    let data = await response.json().catch(() => null);
    const isPdf = rawFile.type === "application/pdf" || rawFile.name.toLowerCase().endsWith(".pdf");
    const canUseLocalOcr = ["NO_READABLE_TEXT", "PDF_PARSER_UNAVAILABLE", "PDF_PARSE_FAILED", "TEXT_EXTRACTION_FAILED"]
      .includes(String(data?.code));

    if (!response.ok && isPdf && canUseLocalOcr) {
      const ocrText = await extractPdfTextWithPaddleOcr(rawFile);
      response = await sendRequest(ocrText);
      data = await response.json().catch(() => null);
    }

    if (!response.ok) {
      const serverError = typeof data?.error === "string" ? data.error : null;
      const statusMessage: Record<number, string> = {
        401: "Your session has expired. Sign in again, then retry the resume review.",
        413: "The resume request is too large for the server. Choose a PDF under 5 MB.",
        502: "The AI provider could not complete the review. Check its API key, quota, and server logs, then retry.",
        503: "The resume review service is temporarily unavailable. Please retry shortly.",
        504: "The resume review timed out before the AI response finished. Please retry; if it repeats, check the deployment function duration.",
      };
      throw new Error(serverError || statusMessage[response.status] ||
        `Resume review request failed with HTTP ${response.status}. Check the deployment logs for this request.`);
    }
    if (!data?.success || !data.result) {
      throw new Error(typeof data?.error === "string"
        ? data.error
        : "The resume review service returned an incomplete response. Check that the latest deployment is active and review its server logs.");
    }

    return data.result as ResumeReviewResult;
  }
}

export const resumeReviewService = new ResumeReviewService();
