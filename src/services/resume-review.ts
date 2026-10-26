import type {
  ResumeReviewResult,
  ResumeAnalysisOptions,
} from "@/types";

export interface ResumeFilePayload {
  file?: File;
  name: string;
  size: number;
}

export interface IResumeReviewService {
  analyzeResume(
    file: ResumeFilePayload,
    targetRole: string,
    options: ResumeAnalysisOptions
  ): Promise<ResumeReviewResult>;
}

export class MockResumeReviewService implements IResumeReviewService {
  async analyzeResume(
    file: ResumeFilePayload,
    targetRole: string,
    options: ResumeAnalysisOptions
  ): Promise<ResumeReviewResult> {
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    try {
      let res: Response;
      if (file.file) {
        const formData = new FormData();
        formData.append("file", file.file);
        formData.append("fileName", file.name);
        formData.append("fileSize", formattedSize);
        formData.append("targetRole", targetRole);
        formData.append("options", JSON.stringify(options));

        res = await fetch("/api/resume/review", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch("/api/resume/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileSize: formattedSize,
            targetRole,
            options,
          }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        return data as ResumeReviewResult;
      }
    } catch (e) {
      console.warn("Backend resume review route error, using local fallback:", e);
    }

    void options;
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      id: `rev-${Date.now()}`,
      fileName: file.name,
      fileSize: formattedSize,
      targetRole,
      submittedAt: new Date().toISOString(),
      overallScore: 74,
      atsScore: 78,
      summary: `Automated critique for ${targetRole}. Resume demonstrates verifiable credentials and professional background. Further aligning quantified leadership outcomes and domain-specific keywords with ${targetRole} will maximize interview conversion.`,
      skillsIdentified: {
        technical: ["Professional Domain Expertise", "Curriculum & Policy", "Strategic Administration"],
        soft: ["Leadership", "Stakeholder Communication", "Institutional Management"],
        missingForRole: [`Keywords benchmarked for ${targetRole}`, "Quantified operational metrics"],
      },
      strengths: [
        `Documented credentials and qualifications relevant to ${targetRole}.`,
        "Established career progression with demonstrable leadership tenure.",
        "Clear professional background and academic credentials.",
      ],
      areasToImprove: [
        {
          id: "imp-1",
          category: "impact",
          severity: "critical",
          title: "Quantify professional impact with measurable metrics",
          description: "Add specific operational metrics, budget scopes, or quantifiable outcomes to your role descriptions.",
          section: "Experience",
        },
        {
          id: "imp-2",
          category: "keywords",
          severity: "suggestion",
          title: `Align keywords directly with ${targetRole}`,
          description: `Incorporate industry-standard benchmark terminology for ${targetRole} to enhance ATS scoring.`,
          section: "Skills",
        },
      ],
      projectSuggestions: [],
      missingOrUnclearInfo: [
        "Specific scope metrics (budget, headcount, or institutional size) in recent appointments.",
      ],
      recommendedNextSteps: [
        {
          step: 1,
          title: `Optimize resume headers and keywords for ${targetRole}`,
          description: "Update the summary and skill sections to prominently mirror key requirements for this position.",
          actionLabel: "Consult AI Career Assistant",
          actionHref: `/career-assistant?q=${encodeURIComponent(`How to optimize my resume for ${targetRole}?`)}`,
        },
      ],
    };
  }
}

export const resumeReviewService = new MockResumeReviewService();
