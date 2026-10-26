import type {
  SessionPreparationResult,
  CareerGuidanceResult,
  LearningRoadmapResult,
  StudentMatchingResult,
  SessionSummaryResult,
  DiscoverStudent,
} from "@/types";

/**
 * AI Mentorship Assistant Service
 *
 * Professional mentorship intelligence service supporting:
 * 1. Session Preparation (tailored discussion prompts & technical exercises)
 * 2. Career Guidance (role expectations, competencies, portfolio guidance)
 * 3. Learning Roadmap (structured multi-phase learning trajectory)
 * 4. Student Matching (intelligent alignment scoring with explainability)
 * 5. Session Summary (structured recap, takeaways & action items)
 *
 * Safety & Privacy:
 * - Operates safely in local client environment without exposing third-party API keys.
 * - Always requests user review prior to saving or applying recommendations.
 * - Disclaims guaranteed outcomes clearly.
 */

export interface AIMentorshipAssistantService {
  generateSessionPreparation(input: {
    menteeName: string;
    careerGoal: string;
    topic: string;
    targetRole?: string;
  }): Promise<SessionPreparationResult>;

  generateCareerGuidance(input: {
    targetRole: string;
    academicLevel: string;
    keyInterests?: string[];
  }): Promise<CareerGuidanceResult>;

  generateLearningRoadmap(input: {
    menteeName: string;
    targetRole: string;
    skillsToDevelop: string[];
    durationWeeks?: number;
  }): Promise<LearningRoadmapResult>;

  generateStudentMatching(input: {
    expertiseAreas: string[];
    maxMentees?: number;
    availableStudents: DiscoverStudent[];
  }): Promise<StudentMatchingResult>;

  generateSessionSummary(input: {
    menteeName: string;
    topic: string;
    rawNotes: string;
  }): Promise<SessionSummaryResult>;
}

export class MockAIMentorshipAssistantService implements AIMentorshipAssistantService {
  async generateSessionPreparation(input: {
    menteeName: string;
    careerGoal: string;
    topic: string;
    targetRole?: string;
  }): Promise<SessionPreparationResult> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const name = input.menteeName || "Student";
    const topic = input.topic || "1:1 Mentorship Session";
    const goal = input.careerGoal || "Software Engineering";
    const role = input.targetRole || "Backend Software Engineer";

    return {
      objectives: [
        `Align on current progress toward ${name}'s ${role} (${goal}) career trajectory.`,
        `Deepen technical understanding of ${topic} through architectural breakdown and code review.`,
        `Identify 1-2 concrete blocker items and assign measurable weekly milestones.`,
      ],
      discussionPrompts: [
        `"Walk me through your thought process when designing the component boundaries for ${topic}."`,
        `"What trade-offs did you consider between throughput, latency, and operational simplicity?"`,
        `"Where have you experienced the most friction in your local testing or database migrations?"`,
        `"How does this technical milestone align with what top teams look for in ${role} candidates?"`,
      ],
      technicalExercises: [
        `Scenario Walkthrough: Simulate a peak-traffic bottleneck in ${topic} and sketch a mitigation plan.`,
        `Whiteboard Drill: Draw the request lifecycle diagram including authentication middleware and connection pools.`,
        `Code Review Check: Review error handling and graceful degradation patterns in recent PRs.`,
      ],
      suggestedTakeaway:
        `By the end of this 45-minute session, ${name} should have a refactored PR plan, an updated system diagram, and clear benchmark goals.`,
      draftAgenda:
        `1. Welcome & Milestone Check-in (5 mins)\n2. Technical Deep-Dive: ${topic} (25 mins)\n   • Architecture review & trade-offs\n   • Live edge-case analysis & failure modes\n3. Resume & Interview Positioning (10 mins)\n4. Action Items & Next Session Date (5 mins)`,
    };
  }

  async generateCareerGuidance(input: {
    targetRole: string;
    academicLevel: string;
    keyInterests?: string[];
  }): Promise<CareerGuidanceResult> {
    await new Promise((resolve) => setTimeout(resolve, 650));

    const role = input.targetRole || "Full-Stack Software Engineer";
    const level = input.academicLevel || "Undergraduate";
    const interests = input.keyInterests?.length
      ? input.keyInterests.join(", ")
      : "Cloud Infrastructure, Distributed Systems, API Architecture";

    return {
      targetRole: role,
      keyCompetencies: [
        `Production-Grade Architecture for ${level}: Experience building resilient services in ${interests} beyond academic toy projects.`,
        `Data Modeling & Query Optimization: 3NF normalization, index optimization, and caching strategies.`,
        `Observability & Reliability: Distributed tracing, structured metrics, and graceful failure handling.`,
        `Code Quality & CI/CD: Automated integration suites, reproducible Docker builds, and automated linting.`,
      ],
      discussionTopics: [
        {
          title: "Bridging the Gap from Coursework to Production Engineering",
          description: `Help the student understand that real-world ${role} work emphasizes maintainability, telemetry, and debugging under ambiguity rather than simple syntax knowledge.`,
        },
        {
          title: "System Design Framework for Early-Career Candidates",
          description: `Guide the student on how to articulate trade-offs (e.g., consistency vs. availability) clearly during behavioral and system design interview rounds.`,
        },
        {
          title: "Resume Impact Metrics over Technology Keyword Laundering",
          description: `Advise the student to quantify bullet points (e.g., "Reduced p99 latency by 35% via Redis caching" vs. "Used Redis").`,
        },
      ],
      recommendedProjects: [
        {
          title: "Distributed Job Processing Queue with Dead-Letter Handling",
          description: `Build an asynchronous task worker in Go or TypeScript backed by Redis/PostgreSQL with retry exponential backoff and observability metrics.`,
          techStack: ["PostgreSQL", "Redis", "TypeScript / Go", "Docker", "Prometheus"],
        },
        {
          title: "Real-Time Collaborative Document Canvas",
          description: `Implement optimistic UI updates, conflict resolution with operational transformation or CRDTs, and WebSocket reconnection logic.`,
          techStack: ["React", "WebSockets", "Node.js", "Jest", "Tailwind CSS"],
        },
      ],
      strategicAdvice: [
        `Focus deeply on 2 high-craft portfolio repositories with extensive README documentation, unit tests, and live preview URLs rather than 10 superficial homework clones.`,
        `Encourage contributing small bug fixes to popular open-source repositories to demonstrate git fluency and collaborative review experience.`,
        `Target summer internship application windows 6-9 months in advance (August through November).`,
      ],
    };
  }

  async generateLearningRoadmap(input: {
    menteeName: string;
    targetRole: string;
    skillsToDevelop: string[];
    durationWeeks?: number;
  }): Promise<LearningRoadmapResult> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const name = input.menteeName || "Mentee";
    const role = input.targetRole || "Software Engineer";
    const skills = input.skillsToDevelop.length
      ? input.skillsToDevelop.join(", ")
      : "Distributed Systems, PostgreSQL, Docker, CI/CD";

    return {
      menteeName: name,
      targetRole: role,
      overview: `A structured 8-week developmental roadmap tailored for ${name} targeting ${role} readiness. Focuses on bridging technical fundamentals (${skills}) into verified production capabilities.`,
      phases: [
        {
          title: "Phase 1: Architecture Fundamentals & Data Modeling",
          weeks: "Weeks 1–2",
          description: `Solidify core design patterns, clean database schema design, and concurrency safety.`,
          milestones: [
            { title: "Complete PostgreSQL schema design with foreign keys and composite indexes", targetWeeks: "Week 2" },
            { title: "Author comprehensive OpenAPI 3.0 specification for API services", targetWeeks: "Week 2" },
          ],
        },
        {
          title: "Phase 2: Service Implementation & Resiliency Patterns",
          weeks: "Weeks 3–4",
          description: `Build scalable backend handlers with rate limiting, structured error envelopes, and caching layers.`,
          milestones: [
            { title: "Implement Redis cache-aside pattern with automatic TTL eviction", targetWeeks: "Week 3" },
            { title: "Write end-to-end integration tests achieving >80% branch coverage", targetWeeks: "Week 4" },
          ],
        },
        {
          title: "Phase 3: Containerization, Telemetry & CI/CD Automation",
          weeks: "Weeks 5–6",
          description: `Package applications into production-ready containers and set up automated validation pipelines.`,
          milestones: [
            { title: "Author multi-stage Dockerfile optimized for minimal image size (<50MB)", targetWeeks: "Week 5" },
            { title: "Configure GitHub Actions workflow running tests and linter on pull requests", targetWeeks: "Week 6" },
          ],
        },
        {
          title: "Phase 4: Capstone Evaluation & Technical Interview Polish",
          weeks: "Weeks 7–8",
          description: `Benchmark system throughput under load and conduct mock technical interview drills.`,
          milestones: [
            { title: "Perform Locust load test verifying 1,000 req/sec throughput with p99 < 80ms", targetWeeks: "Week 7" },
            { title: "Conduct 45-minute live technical mock interview and resume walkthrough", targetWeeks: "Week 8" },
          ],
        },
      ],
    };
  }

  async generateStudentMatching(input: {
    expertiseAreas: string[];
    maxMentees?: number;
    availableStudents: DiscoverStudent[];
  }): Promise<StudentMatchingResult> {
    try {
      const res = await fetch("/api/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          expertiseAreas: input.expertiseAreas,
          mentors: input.availableStudents.map((s) => ({
            id: s.id,
            name: s.name,
            role: s.department,
            company: s.university,
            skills: (s.skills || []).map((sk) => sk.name),
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          const matchMap = new Map<string, { matchScore: number; matchTier: string; reasons: string[] }>(
            data.matches.map((m: { mentorId: string; matchScore: number; matchTier: string; reasons: string[] }) => [m.mentorId, m])
          );

          const recommendations = input.availableStudents
            .map((s) => {
              const match = matchMap.get(s.id);
              return {
                studentId: s.id,
                studentName: s.name,
                department: s.department,
                academicYear: s.academicYear,
                matchScore: match?.matchScore || 75,
                matchReasons: match?.reasons || [`Direct domain synergy in ${input.expertiseAreas.slice(0, 2).join(", ")}`],
                suggestedTopics: [
                  `Production architecture review for ${s.careerGoal || "engineering roles"}`,
                  `Mock technical coding & system design drills`,
                  `Resume audit targeted toward engineering hiring bars`,
                ],
                careerGoal: s.careerGoal,
              };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, input.maxMentees || 3);

          return {
            recommendations,
            summary: `Evaluated ${input.availableStudents.length} candidate mentees using neural reasoning. Top ${recommendations.length} students align directly with your expertise in ${input.expertiseAreas.slice(0, 3).join(", ")}.`,
          };
        }
      }
    } catch (e) {
      console.warn("Backend matching route error, using local heuristic fallback:", e);
    }

    await new Promise((resolve) => setTimeout(resolve, 500));

    const expertiseLower = input.expertiseAreas.map((e) => e.toLowerCase());

    const scored = input.availableStudents.map((s) => {
      let score = 70;
      const reasons: string[] = [];

      const studentSkills = (s.skills || []).map((sk) => sk.name.toLowerCase());
      const overlapping = studentSkills.filter((sk) =>
        expertiseLower.some((e) => e.includes(sk) || sk.includes(e))
      );

      if (overlapping.length > 0) {
        score += Math.min(overlapping.length * 8, 20);
        reasons.push(`Direct skill overlap in ${overlapping.slice(0, 3).join(", ")}`);
      }

      if (s.careerGoal && expertiseLower.some((e) => s.careerGoal.toLowerCase().includes(e))) {
        score += 8;
        reasons.push(`Career target closely aligns with your industry domain (${s.careerGoal})`);
      }

      if (s.academicYear?.includes("Senior") || s.academicYear?.includes("Junior")) {
        score += 5;
        reasons.push(`High interview readiness (${s.academicYear}) seeking active mentorship`);
      }

      const suggestedTopics = [
        `Production architecture review for ${s.careerGoal || "software roles"}`,
        `Mock technical coding & system design drills`,
        `Resume audit targeted toward engineering hiring bars`,
      ];

      return {
        studentId: s.id,
        studentName: s.name,
        department: s.department,
        academicYear: s.academicYear,
        matchScore: Math.min(score, 98),
        matchReasons: reasons.length ? reasons : ["General engineering background match"],
        suggestedTopics,
        careerGoal: s.careerGoal,
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    const topPicks = scored.slice(0, input.maxMentees || 3);

    return {
      recommendations: topPicks,
      summary: `Found ${topPicks.length} high-affinity students matching your expertise in ${input.expertiseAreas.slice(0, 3).join(", ")}. These students exhibit verified foundational skills and actively seek guidance on technical milestones.`,
    };
  }

  async generateSessionSummary(input: {
    menteeName: string;
    topic: string;
    rawNotes: string;
  }): Promise<SessionSummaryResult> {
    await new Promise((resolve) => setTimeout(resolve, 550));

    const name = input.menteeName || "Student";
    const topic = input.topic || "Mentorship Session";
    const raw = input.rawNotes.trim();

    const executiveSummary =
      `Productive 1:1 mentorship session held with ${name} focusing on "${topic}". Reviewed technical implementation trade-offs, audited current project bottlenecks, and established concrete next deliverables.`;

    const keyHighlights = [
      `Deep-dived into core architectural patterns related to ${topic}.`,
      `Analyzed trade-offs between performance, code clarity, and edge-case resiliency.`,
      raw ? `Discussed mentor note observations: "${raw.slice(0, 120)}${raw.length > 120 ? "..." : ""}"` : `Reviewed pull request code quality and modular boundaries.`,
    ];

    const studentActionItems = [
      `Refactor service handlers to incorporate agreed error boundary patterns.`,
      `Write integration tests validating failure recovery and edge-case behavior.`,
      `Share updated PR branch link prior to our next meeting.`,
    ];

    const mentorActionItems = [
      `Share recommended architecture blog post and sample repository reference.`,
      `Review ${name}'s updated pull request once posted in the repository.`,
    ];

    const formattedNotes = `### Mentorship Session Summary\n**Student:** ${name}\n**Topic:** ${topic}\n**Date:** ${new Date().toLocaleDateString()}\n\n#### Highlights\n${keyHighlights.map((h) => `- ${h}`).join("\n")}\n\n#### Action Items for ${name}\n${studentActionItems.map((a) => `- [ ] ${a}`).join("\n")}\n\n#### Recommended Next Session\nNext discussion: System Observability & Load Testing.`;

    return {
      executiveSummary,
      keyHighlights,
      studentActionItems,
      mentorActionItems,
      recommendedNextTopic: "System Observability, Distributed Tracing & Load Testing",
      formattedNotes,
    };
  }
}

export const aiMentorshipAssistantService = new MockAIMentorshipAssistantService();
