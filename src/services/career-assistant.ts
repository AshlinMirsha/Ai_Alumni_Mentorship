import type {
  AssistantMessage,
  CareerAssistantRequest,
  CareerAssistantResponse,
} from "@/types";
import { getSupabaseClient } from "@/lib/supabase/client";
import { loadAuthSession } from "@/lib/dashboard-storage";

export interface ICareerAssistantService {
  sendMessage(request: CareerAssistantRequest): Promise<CareerAssistantResponse>;
  getInitialWelcomeMessage(): AssistantMessage;
  fetchConversationHistory(): Promise<AssistantMessage[]>;
  fetchContextualTopics(): Promise<any>;
}

export class CareerAssistantService implements ICareerAssistantService {
  private readonly defaultStudentName: string;
  private readonly defaultTargetRole: string;

  constructor(defaultStudentName = "Student", defaultTargetRole = "Full-Stack Software Engineer") {
    this.defaultStudentName = defaultStudentName;
    this.defaultTargetRole = defaultTargetRole;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window === "undefined") return headers;

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        headers["Authorization"] = `Bearer ${session.access_token}`;
      }
    } catch {
      // Ignore session fetch error
    }

    try {
      const auth = loadAuthSession();
      if (auth?.email) headers["x-user-email"] = auth.email;
      if (auth?.id) headers["x-user-id"] = auth.id;
      if (!headers["Authorization"] && auth?.id) {
        headers["Authorization"] = `Bearer ${auth.id}`;
      }
    } catch {
      // Ignore
    }

    return headers;
  }

  getInitialWelcomeMessage(): AssistantMessage {
    return {
      id: "welcome-msg",
      role: "assistant",
      content:
        `Hello! I am your AlumniPath AI Career Assistant. I am here to help you navigate your journey toward your target career role.\n\nWhether you need help breaking down complex roadmaps, auditing your current skill gaps, refining resume bullet points, or preparing for technical interviews, feel free to ask below!`,
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

  async fetchConversationHistory(): Promise<AssistantMessage[]> {
    if (typeof window === "undefined") return [];
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch("/api/assistant/chat", {
        method: "GET",
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          return data.messages;
        }
      }
    } catch (e) {
      console.warn("Could not retrieve online conversation history:", e);
    }
    return [];
  }

  async fetchContextualTopics(): Promise<any> {
    if (typeof window === "undefined") return null;
    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch("/api/assistant/topics", {
        method: "GET",
        headers,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch (e) {
      console.warn("Could not retrieve contextual topics:", e);
    }
    return null;
  }

  async sendMessage(request: CareerAssistantRequest): Promise<CareerAssistantResponse> {
    const startTime = Date.now();
    const promptText = request.prompt.trim();

    try {
      const headers = await this.getAuthHeaders();
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: promptText,
          prompt: promptText,
          studentContext: request.studentContext,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          return {
            message: data.message,
            latencyMs: data.latencyMs || Date.now() - startTime,
          };
        }
      } else {
        const errorData = await res.json().catch(() => null);
        console.warn("Assistant API returned error status:", res.status, errorData?.error);
      }
    } catch (networkErr) {
      console.warn("Network error calling /api/assistant/chat, falling back to local engine:", networkErr);
    }

    // Resilient local fallback if network / remote endpoint is temporarily unreachable
    await new Promise((resolve) => setTimeout(resolve, 500));
    const role = request.studentContext?.targetRole || this.defaultTargetRole;
    const name = request.studentContext?.studentName || this.defaultStudentName;
    const p = promptText.toLowerCase();

    let content = "";
    let suggestions: string[] = [];
    const suggestedActions = [
      { label: "Open Career Roadmap", href: "/career-roadmap", actionType: "roadmap" as const },
      { label: "Audit Resume", href: "/resume-review", actionType: "resume" as const },
      { label: "Find Alumni Mentors", href: "/alumni", actionType: "alumni" as const },
    ];

    if (p.includes("roadmap") || p.includes("plan")) {
      content = `### Career Roadmap for ${role}\n\nHere is a prioritized trajectory:\n1. **Core CS Foundations**: Data structures, time complexity, and algorithms.\n2. **Framework Specialization**: Modern full-stack architecture, API boundaries, and database query tuning.\n3. **Production Cloud Delivery**: Docker containerization and CI/CD automation.\n4. **Interview Readiness**: System design fundamentals and behavioral STAR stories.\n\nYou can track and update your milestones on the dedicated Career Roadmap page.`;
      suggestions = ["What projects should I build?", "How do I practice databases?", "Which mentors can guide me?"];
    } else if (p.includes("skill") || p.includes("gap")) {
      content = `### Skill Gap Assessment for ${name}\n\nFor ${role} roles, industry benchmarks prioritize:\n- **High Priority**: TypeScript, Docker containerization, and automated integration testing.\n- **Medium Priority**: Query performance (PostgreSQL indexing) and caching strategies (Redis).\n\nCheck out the Skill Gap Matrix on the Roadmap page for detailed step-by-step guidance!`;
      suggestions = ["How to learn Docker step-by-step?", "What is the best way to learn TypeScript?"];
    } else {
      content = `Hello ${name}! Regarding your interest in becoming a **${role}**:\n\nFocus on building end-to-end projects with clean architectures, unit test coverage, and clear documentation. Feel free to ask for specific advice on technical interview preparation, project ideas, or resume review!`;
      suggestions = ["How to improve my resume?", "Tell me about technical interviews", "Suggest project ideas"];
    }

    return {
      message: {
        id: `asst-${Date.now()}`,
        role: "assistant",
        content,
        timestamp: "Just now",
        suggestions,
        suggestedActions,
      },
      latencyMs: Date.now() - startTime,
    };
  }
}

// Export singleton default instance
export const careerAssistantService = new CareerAssistantService();
