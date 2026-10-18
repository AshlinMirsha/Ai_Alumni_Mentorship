import type {
  ResumeReviewResult,
  ResumeAnalysisOptions,
} from "@/types";

export interface IResumeReviewService {
  analyzeResume(
    file: { name: string; size: number },
    targetRole: string,
    options: ResumeAnalysisOptions
  ): Promise<ResumeReviewResult>;
}

export class MockResumeReviewService implements IResumeReviewService {
  async analyzeResume(
    file: { name: string; size: number },
    targetRole: string,
    options: ResumeAnalysisOptions
  ): Promise<ResumeReviewResult> {
    void options;
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 800));

    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    return {
      id: `rev-${Date.now()}`,
      fileName: file.name,
      fileSize: formattedSize,
      targetRole,
      submittedAt: new Date().toISOString(),
      overallScore: 72, // Illustrative demo score
      atsScore: 78,     // Illustrative demo ATS score
      summary:
        `Strong technical foundation with prominent Python, JavaScript, and React capabilities. To maximize hiring conversion for ${targetRole} loops, transition descriptive task bullets into quantified outcome statements and add core infrastructure keywords (Docker, CI/CD, database indexing).`,
      skillsIdentified: {
        technical: [
          "Python",
          "JavaScript",
          "React",
          "Django",
          "SQL",
          "Git",
          "REST APIs",
          "HTML5/CSS3",
        ],
        soft: [
          "Technical Problem Solving",
          "Peer Collaboration",
          "Iterative Project Delivery",
        ],
        missingForRole: [
          "Docker / Containerization",
          "TypeScript",
          "PostgreSQL Query Optimization",
          "Automated Testing (pytest/Jest)",
        ],
      },
      strengths: [
        "Clean, professional two-column layout that parses predictably for human recruiters.",
        "Demonstrated full-stack project portfolio showcasing complete client-server architectures.",
        "Clear educational credentials and Computer Science foundational coursework.",
        "Strong language mastery in Python and modern frontend JavaScript/React.",
      ],
      areasToImprove: [
        {
          id: "imp-1",
          category: "impact",
          severity: "critical",
          title: "Quantify engineering impact in project bullets",
          description:
            "Replace generic task summaries ('built a REST API') with measurable metrics (response time reduction, test coverage, daily active request volume).",
          section: "Projects / Experience",
        },
        {
          id: "imp-2",
          category: "keywords",
          severity: "critical",
          title: "Incorporate missing ATS technical keywords",
          description:
            `Target ${targetRole} automated resume screening filters look for keywords such as: Docker, TypeScript, unit testing, schema migration, and CI/CD.`,
          section: "Skills & Technical Stack",
        },
        {
          id: "imp-3",
          category: "summary",
          severity: "suggestion",
          title: "Refine professional summary statement",
          description:
            "Your summary should explicitly state your target role, years/academic level, core technical competencies, and your strongest engineering asset in 2-3 concise sentences.",
          section: "Header / Summary",
        },
        {
          id: "imp-4",
          category: "formatting",
          severity: "suggestion",
          title: "Standardize date notations across sections",
          description:
            "Use consistent month-year formats (e.g. 'Jun 2024 – Aug 2024') rather than alternating between seasons, semesters, and years.",
          section: "Work History",
        },
      ],
      projectSuggestions: [
        {
          projectName: "Alumni Mentorship Platform",
          originalBullet:
            "Developed an online platform for connecting college students with verified alumni mentors using React and Django.",
          suggestedBullet:
            "Architected full-stack mentorship platform using React and Django REST Framework, reducing mentee search latency by 45% with indexed PostgreSQL queries.",
          reason:
            "Adopts Google's XYZ formula, specifies the REST framework layer, and introduces quantifiable optimization metric.",
        },
        {
          projectName: "Real-Time Chat Engine",
          originalBullet:
            "Created a real-time messaging application with WebSockets and user authentication.",
          suggestedBullet:
            "Engineered low-latency WebSocket messaging service with JWT authentication and Redis pub/sub, supporting concurrent bi-directional connections.",
          reason:
            "Highlights concurrency, distributed pub/sub architecture, and security protocols.",
        },
      ],
      missingOrUnclearInfo: [
        "No public links to live deployment demos or GitHub repositories were detected in the project headers.",
        "Coursework section lists generic classes rather than advanced electives (e.g., Distributed Systems, Database Management Systems).",
        "Test coverage percentages or automated testing frameworks (pytest, Jest, Cypress) are not mentioned.",
      ],
      recommendedNextSteps: [
        {
          step: 1,
          title: "Revise project bullet points using Google's XYZ formula",
          description:
            "Update at least 3 bullet points with quantifiable performance or scale metrics.",
          actionLabel: "Ask AI Assistant for Rewrite Help",
          actionHref: `/career-assistant?q=${encodeURIComponent(
            `Help me rewrite my resume bullet points using the XYZ formula for a ${targetRole} role.`
          )}`,
        },
        {
          step: 2,
          title: "Add live deployment and GitHub repository links",
          description:
            "Ensure recruiters can verify code quality and interact with your running web applications.",
          actionLabel: "Check Project Showcase",
          actionHref: "/dashboard",
        },
        {
          step: 3,
          title: "Schedule a resume critique with an alumni mentor",
          description:
            "Get human feedback from a practicing senior engineer who reviews campus resumes.",
          actionLabel: "Find Resume Reviewers on AlumniPath",
          actionHref: "/alumni",
        },
      ],
    };
  }
}

export const resumeReviewService = new MockResumeReviewService();
