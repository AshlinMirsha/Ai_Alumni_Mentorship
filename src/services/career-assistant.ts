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

  constructor(defaultStudentName = "Ashlin", defaultTargetRole = "Full-Stack Software Engineer") {
    this.defaultStudentName = defaultStudentName;
    this.defaultTargetRole = defaultTargetRole;
  }

  getInitialWelcomeMessage(): AssistantMessage {
    return {
      id: "welcome-msg",
      role: "assistant",
      content:
        `Hello ${this.defaultStudentName}! I am your AI Career Assistant. I am here to help you navigate your journey toward becoming a **${this.defaultTargetRole}**.\n\nWhether you need help breaking down complex roadmaps, auditing your current skill gaps, refining resume bullet points, or preparing for technical interviews, feel free to ask below!`,
      timestamp: "Just now",
      suggestions: [
        "Build my career roadmap",
        "Identify my skill gaps",
        "Improve my resume",
        "Prepare for a software engineering interview",
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
    const prompt = request.prompt.toLowerCase().trim();
    const role = request.studentContext?.targetRole || this.defaultTargetRole;
    const name = request.studentContext?.studentName || this.defaultStudentName;

    // Simulate realistic network & processing latency
    await new Promise((resolve) => setTimeout(resolve, 650));

    let content = "";
    let suggestions: string[] = [];
    const suggestedActions = [];

    if (prompt.includes("roadmap") || prompt.includes("plan") || prompt.includes("stages")) {
      content = `### Career Roadmap Recommendation for ${role}

Here is a structured 7-stage trajectory tailored to your target position:

1. **Programming Fundamentals**: Solidify Big-O complexity, trees, graphs, and OOP patterns in Python or TypeScript.
2. **Backend Frameworks**: Build deep familiarity with MVC architecture, request lifecycles, and middleware in Django or Express.
3. **REST API Development**: Master HTTP standards, JSON schema validation, cursor pagination, and OpenAPI documentation.
4. **Databases & Data Modeling**: Study 3NF normalization, foreign key constraints, EXPLAIN query planning, and Redis caching.
5. **Authentication & Security**: Implement JWT refresh token rotation, OAuth 2.0 social logins, and OWASP defenses.
6. **Testing & Cloud Deployment**: Write automated pytest suites, author multi-stage Dockerfiles, and configure GitHub Actions CI/CD.
7. **Interview Readiness**: Systematic LeetCode practice and fundamental system design mock sessions.

You can inspect, track, and update your active milestone statuses directly on your personalized roadmap page.`;

      suggestions = [
        "What projects should I build for Stage 3?",
        "How do I practice databases and Redis?",
        "Which alumni can mentor me on backend architecture?",
      ];

      suggestedActions.push({
        label: "Open Full Career Roadmap",
        href: "/career-roadmap",
        actionType: "roadmap" as const,
      });
      suggestedActions.push({
        label: "Find Backend Mentors",
        href: "/alumni",
        actionType: "alumni" as const,
      });
    } else if (prompt.includes("skill") || prompt.includes("gap") || prompt.includes("learn next")) {
      content = `### Skill Gap Analysis for ${name} (${role})

Based on your current self-reported profile skills (**Python, JavaScript, React, Django, SQL**), here is our objective gap assessment:

#### 1. High Priority Gaps
- **TypeScript**: Crucial for enterprise React frontends and modern Node/Next.js backends to eliminate runtime type bugs.
- **Docker & Containerization**: Essential for microservices development, local environment reproducibility, and cloud deployments.
- **PostgreSQL Advanced Features**: Deep dive into indexing strategies, query plan analysis, and connection pooling.

#### 2. Medium Priority Gaps
- **Redis Caching**: High-throughput session storage and latency optimization.
- **Automated Testing (pytest / Jest)**: Unit and integration testing suites are required by standard SWE interview hiring bars.

#### Recommended Next Step
Focus on containerizing your current Django & React application with **Docker Compose**, and rewrite your frontend components with **TypeScript** interfaces.`;

      suggestions = [
        "Recommend learning resources for Docker",
        "How can I practice TypeScript with React?",
        "Show me alumni who work with PostgreSQL",
      ];

      suggestedActions.push({
        label: "View Skill-Gap Details",
        href: "/career-roadmap",
        actionType: "roadmap" as const,
      });
    } else if (prompt.includes("resume") || prompt.includes("cv") || prompt.includes("bullet point")) {
      content = `### Resume Improvement Recommendations

To make your resume stand out to technical recruiters for **${role}** positions, focus on these critical improvements:

1. **Adopt Google's XYZ Formula**:
   - *Weak*: "Built a REST API with Django and PostgreSQL."
   - *Strong*: "Engineered a high-throughput REST API with Django and PostgreSQL, reducing endpoint response latency by 38% for 15,000 daily requests."

2. **Highlight Technical Stack per Project**:
   - Explicitly list technologies in brackets: e.g., \`[Python, Django, PostgreSQL, Docker, Redis, Tailwind CSS]\`.

3. **Incorporate ATS Keywords**:
   - Ensure terms like *RESTful APIs*, *CI/CD pipelines*, *relational schema design*, and *unit testing* appear naturally in your experience bullets.

4. **Add Quantifiable Metrics**:
   - Quantify scale: number of endpoints, test coverage percentage, database query speedups, or active users.`;

      suggestions = [
        "How do I write a good professional summary?",
        "Can you review my project descriptions?",
        "Upload my resume for full ATS scan",
      ];

      suggestedActions.push({
        label: "Run Full Resume Review",
        href: "/resume-review",
        actionType: "resume" as const,
      });
    } else if (prompt.includes("interview") || prompt.includes("leetcode") || prompt.includes("system design") || prompt.includes("behavioral")) {
      content = `### Software Engineering Interview Preparation Strategy

Here is a 3-part blueprint for campus recruitment and entry-level SWE interviews:

#### 1. Algorithmic Coding (40% Weight)
- Don't memorize 500 problems; master the **top 14 patterns**: Two Pointers, Sliding Window, Fast & Slow Pointers, BFS/DFS, Top K Elements.
- Target completing the **Blind 75** or **NeetCode 150** problem sets in Python.

#### 2. Fundamentals & System Design (30% Weight)
- For entry-level, focus on fundamental distributed building blocks:
  - Load balancing, horizontal vs vertical scaling.
  - SQL vs NoSQL trade-offs, database replication vs sharding.
  - Caching layers (Redis cache-aside pattern).

#### 3. Behavioral Preparation (STAR Method) (30% Weight)
- Structure your stories with **Situation, Task, Action, Result**.
- Prepare 4 core stories: a challenging technical bug, a team disagreement, a tight deadline trade-off, and a leadership initiative.

**Pro-Tip**: Book a 30-minute mock technical interview with an alumni engineer on AlumniPath to test your communication under pressure.`;

      suggestions = [
        "What are common behavioral interview questions?",
        "How do I explain system design trade-offs?",
        "Connect with alumni for a mock interview",
      ];

      suggestedActions.push({
        label: "Discover Alumni Mentors for Mock Prep",
        href: "/alumni",
        actionType: "alumni" as const,
      });
    } else {
      content = `Thank you for your question! As your **AI Career Assistant**, I'm analyzing your request regarding "${request.prompt}".

Here are three key insights for your career journey as a student aiming for **${role}**:

- **Continuous Portfolio Iteration**: Ship public, deployed projects with clean commit histories and comprehensive README documentation.
- **Active Alumni Networking**: Technical cold reach-outs work best when you ask specific questions about an engineer's public work or tech stack.
- **Ramp up on Core Standards**: Deep understanding of API contracts, database query plans, and automated testing separates junior candidates from the pack.

Would you like me to elaborate on building your roadmap, auditing your skills, or reviewing your resume bullets?`;

      suggestions = [
        "Build my career roadmap",
        "Identify my skill gaps",
        "Improve my resume",
        "Prepare for a software engineering interview",
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
