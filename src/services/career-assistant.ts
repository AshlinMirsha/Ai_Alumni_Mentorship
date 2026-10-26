import type {
  AssistantMessage,
  CareerAssistantRequest,
  CareerAssistantResponse,
} from "@/types";

export interface ICareerAssistantService {
  sendMessage(request: CareerAssistantRequest): Promise<CareerAssistantResponse>;
  getInitialWelcomeMessage(): AssistantMessage;
}

export class MockCareerAssistantService implements ICareerAssistantService {
  private readonly defaultStudentName: string;
  private readonly defaultTargetRole: string;

  constructor(defaultStudentName = "Student", defaultTargetRole = "Professional") {
    this.defaultStudentName = defaultStudentName;
    this.defaultTargetRole = defaultTargetRole;
  }

  getInitialWelcomeMessage(targetRole?: string, studentName?: string): AssistantMessage {
    const role = targetRole?.trim() || this.defaultTargetRole;
    const name = studentName?.trim() || this.defaultStudentName;
    return {
      id: "welcome-msg",
      role: "assistant",
      content:
        `Hello ${name}! I am your AI Career Assistant. I am here to help you navigate your journey toward achieving your goals as a **${role}**.\n\nWhether you need help breaking down roadmap milestones, auditing your current skill gaps, refining resume impact statements, or preparing for interviews, feel free to ask below!`,
      timestamp: "Just now",
      suggestions: [
        `Build my career roadmap for ${role}`,
        `Identify my skill gaps for ${role}`,
        `How can I improve my resume for ${role}?`,
        `Prepare for a ${role} interview`,
      ],
      suggestedActions: [
        {
          label: "View Career Roadmap",
          href: "/career-roadmap",
          actionType: "roadmap",
        },
        {
          label: "Audit Resume",
          href: "/resume-review",
          actionType: "resume",
        },
        {
          label: "Browse Alumni Mentors",
          href: "/alumni",
          actionType: "alumni",
        },
      ],
    };
  }

  async sendMessage(request: CareerAssistantRequest): Promise<CareerAssistantResponse> {
    const startTime = Date.now();
    try {
      const messagesPayload = (request.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: request.prompt,
          images: request.images || [],
          messages: messagesPayload,
          model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
          studentContext: request.studentContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const latencyMs = Date.now() - startTime;
        const thinkingDurationSeconds = Math.max(1, Math.round(latencyMs / 1000));
        const role = request.studentContext?.targetRole || this.defaultTargetRole;
        return {
          message: {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: data.content,
            reasoning: data.reasoning || undefined,
            thinkingDurationSeconds,
            timestamp: "Just now",
            suggestions: [
              `What core competencies are valued most for ${role}?`,
              `What interview questions are asked for ${role}?`,
              `Review my skill readiness for ${role}`,
            ],
            suggestedActions: [
              {
                label: "View Career Roadmap",
                href: "/career-roadmap",
                actionType: "roadmap",
              },
              {
                label: "Audit Resume",
                href: "/resume-review",
                actionType: "resume",
              },
            ],
          },
          latencyMs,
        };
      }
    } catch (e) {
      console.warn("Backend chat route error, utilizing local intelligence fallback:", e);
    }

    const prompt = request.prompt.toLowerCase().trim();
    const role = request.studentContext?.targetRole || this.defaultTargetRole;
    const name = request.studentContext?.studentName || this.defaultStudentName;
    const isTech = /software|developer|engineer|full-stack|frontend|backend|cloud|devops|data|ai|machine learning/i.test(role);

    // Simulate realistic network & processing latency
    await new Promise((resolve) => setTimeout(resolve, 650));

    let content = "";
    let suggestions: string[] = [];
    const suggestedActions = [];

    if (prompt.includes("roadmap") || prompt.includes("plan") || prompt.includes("stages")) {
      content = isTech
        ? `### Career Roadmap Recommendation for ${role}

Here is a structured milestone progression tailored to your target position:

1. **Foundations & Architecture**: Solidify domain principles, scalable design patterns, and core development workflows.
2. **Frameworks & Production Stack**: Build hands-on expertise in industry-standard frameworks and development environments.
3. **Data Contracts & System Integration**: Master communication protocols, schema design, and API architectures.
4. **Data Persistence & Optimization**: Implement resilient database modeling, query tuning, and caching strategies.
5. **Quality Assurance & Verification**: Build automated test suites and continuous validation pipelines.
6. **Deployment & Reliability**: Deploy containerized services with observability, monitoring, and error tracing.
7. **Interview Readiness & Capstone**: Practical technical problem-solving and portfolio project defense.

You can inspect, track, and update your active milestone statuses directly on your personalized roadmap page.`
        : `### Career Roadmap Recommendation for ${role}

Here is a structured milestone progression tailored to your career advancement in **${role}**:

1. **Foundations & Governance**: Master core principles, institutional guidelines, and industry standards.
2. **Operational Leadership & Execution**: Drive day-to-day excellence, resource allocation, and program management.
3. **Stakeholder & Strategic Communication**: Facilitate cross-functional collaboration and executive relationship management.
4. **Data-Informed Decision Making**: Leverage operational analytics, performance benchmarks, and measurable KPIs.
5. **Quality Assurance & Compliance**: Implement continuous assessment, audit readiness, and policy oversight.
6. **Strategic Vision & Scaled Initiatives**: Lead large-scale institutional or organizational initiatives.
7. **Executive Portfolio & Interview Readiness**: Articulate documented leadership impact, case achievements, and vision.

You can inspect, track, and customize your milestone progression directly on your roadmap page.`;

      suggestions = [
        `What milestones should I prioritize for ${role}?`,
        `How do I build an impressive portfolio for ${role}?`,
        `Which alumni can mentor me in ${role}?`,
      ];

      suggestedActions.push({
        label: "Open Full Career Roadmap",
        href: "/career-roadmap",
        actionType: "roadmap" as const,
      });
      suggestedActions.push({
        label: "Find Alumni Mentors",
        href: "/alumni",
        actionType: "alumni" as const,
      });
    } else if (prompt.includes("skill") || prompt.includes("gap") || prompt.includes("learn next")) {
      const studentSkills = request.studentContext?.currentSkills?.length
        ? request.studentContext.currentSkills.join(", ")
        : "documented competencies";

      content = `### Skill Gap Analysis for ${name} (${role})

Based on your current profile credentials (**${studentSkills}**), here is an objective benchmark assessment for **${role}**:

#### 1. High Priority Gaps
${isTech
  ? "- **System Architecture & Cloud Fundamentals**: Essential for production scalability and deployment readiness.\n- **Data Persistence & Indexing**: Advanced query optimization and schema performance.\n- **End-to-End Testing**: Unit and integration test suites required for high-reliability engineering."
  : "- **Strategic Planning & Governance**: Institutional oversight, compliance policies, and executive leadership.\n- **Data-Driven Metric Tracking**: Establishing and measuring organizational KPIs and operational benchmarks.\n- **Cross-Functional Stakeholder Management**: Leading diverse teams and driving consensus across departments."}

#### 2. Medium Priority Gaps
${isTech
  ? "- **CI/CD Automation**: Continuous integration pipelines and automated release tooling.\n- **Observability & Monitoring**: Metrics logging, alerting, and error tracing."
  : "- **Budgeting & Resource Allocation**: Fiscal responsibility and program cost optimization.\n- **Change Management**: Facilitating transitions and modernization initiatives effectively."}

#### Recommended Next Step
Align your upcoming milestone goals with the core competencies of **${role}**, and connect with experienced alumni on AlumniPath.`;

      suggestions = [
        `Recommend high-yield resources for ${role}`,
        `How do I demonstrate mastery in ${role}?`,
        "Show me alumni who excel in these areas",
      ];

      suggestedActions.push({
        label: "View Skill-Gap Details",
        href: "/career-roadmap",
        actionType: "roadmap" as const,
      });
    } else if (prompt.includes("resume") || prompt.includes("cv") || prompt.includes("bullet point")) {
      const exampleWeak = isTech
        ? '"Responsible for writing backend code and maintaining database."'
        : '"Responsible for administrative oversight and team coordination."';
      const exampleStrong = isTech
        ? '"Architected scalable service modules using modern frameworks, decreasing latency by 35% across 20k daily transactions."'
        : '"Spearheaded institutional operations across a 50+ member organization, boosting program completion rates by 28% year-over-year."';
      const keywordsExample = isTech
        ? 'role-benchmarked competencies like system architecture, API design, automated test coverage, and cloud infrastructure'
        : `core proficiencies, strategic initiatives, stakeholder leadership, and compliance metrics specific to ${role}`;

      content = `### Resume Improvement Recommendations for ${role}

To make your resume stand out to hiring managers and executive evaluators for **${role}** positions, focus on these critical enhancements:

1. **Adopt the Proven Impact Formula (Accomplished [X], measured by [Y], by doing [Z])**:
   - *Weak*: ${exampleWeak}
   - *Strong*: ${exampleStrong}

2. **Target High-Leverage Benchmark Keywords**:
   - Incorporate ${keywordsExample} prominently in your experience bullets and skills taxonomy.

3. **Front-Load Measurable Quantifiable Results**:
   - Anchor bullet points with concrete metrics: scale, percentages, headcount, cost efficiencies, or institutional milestones.

4. **Optimize Structure & ATS Parsability**:
   - Use clean, standard chronological section headers (Summary, Core Competencies, Professional Experience, Education & Credentials) without complex multi-column tables.`;

      suggestions = [
        `How do I write an executive summary for a ${role}?`,
        `What keywords should I include for ${role}?`,
        "Audit my resume with the AI Resume Reviewer",
      ];

      suggestedActions.push({
        label: "Run Full Resume Review",
        href: "/resume-review",
        actionType: "resume" as const,
      });
    } else if (prompt.includes("interview") || prompt.includes("leetcode") || prompt.includes("case study") || prompt.includes("behavioral")) {
      content = `### Interview Preparation Strategy for ${role}

Here is a structured blueprint to prepare for **${role}** interviews:

#### 1. Core Domain Competence & Technical Depth
- Identify the primary proficiencies, case scenarios, and methodological standards expected for **${role}**.
- Prepare concrete, detailed examples of past achievements, challenges overcome, and results delivered.

#### 2. Strategic Problem Solving & Practical Execution
- Be prepared to discuss realistic scenarios and workflows encountered in **${role}**.
- Clarify assumptions, structure your approach methodically, and articulate trade-offs clearly.

#### 3. Behavioral Preparation (STAR Method)
- Structure your stories with **Situation, Task, Action, Result**.
- Prepare core stories highlighting: complex problem-solving, stakeholder collaboration, tight deadlines, and proactive leadership.

**Pro-Tip**: Book a mock interview with an alumni mentor on AlumniPath to test your responses and gain actionable feedback.`;

      suggestions = [
        `What are common interview questions for ${role}?`,
        "How do I structure behavioral answers using the STAR method?",
        "Connect with alumni for a mock interview",
      ];

      suggestedActions.push({
        label: "Discover Alumni Mentors for Mock Prep",
        href: "/alumni",
        actionType: "alumni" as const,
      });
    } else {
      content = `Thank you for your question! As your **AI Career Assistant**, I'm analyzing your request regarding "${request.prompt}".

Here are three key insights for your career journey as you target **${role}**:

- **Demonstrate Verifiable Impact**: Highlight documented outcomes, measurable achievements, and structured portfolio/work artifacts.
- **Active Alumni Networking**: Connect with alumni currently working in **${role}** positions to gain first-hand industry perspectives.
- **Ramp up on Benchmark Standards**: Continuous mastery of domain-standard tools, frameworks, and methodologies will distinguish your candidacy.

Would you like me to elaborate on building your roadmap, auditing your skills, or reviewing your resume bullets?`;

      suggestions = [
        `Build my career roadmap for ${role}`,
        `Identify my skill gaps for ${role}`,
        `How can I improve my resume for ${role}?`,
        `Prepare for a ${role} interview`,
      ];

      suggestedActions.push({
        label: "Explore Roadmap",
        href: "/career-roadmap",
        actionType: "roadmap" as const,
      });
      suggestedActions.push({
        label: "Resume Review",
        href: "/resume-review",
        actionType: "resume" as const,
      });
    }

    const responseMessage: AssistantMessage = {
      id: `msg-${Date.now()}`,
      role: "assistant",
      content,
      reasoning: `1. Analyzed candidate career trajectory and goals for "${role}".
2. Evaluated domain expectations, practical milestones, and key hiring criteria.
3. Synthesized structured, actionable guidance with recommended next actions.`,
      thinkingDurationSeconds: 1,
      timestamp: "Just now",
      suggestions,
      suggestedActions,
    };

    return {
      message: responseMessage,
      latencyMs: 650,
    };
  }
}

// Export singleton default instance
export const careerAssistantService = new MockCareerAssistantService();
