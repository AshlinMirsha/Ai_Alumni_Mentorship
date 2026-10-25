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
  private conversationId: string | null = null;

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
      const authId = (auth as typeof auth & { id?: string }).id;
      if (authId) headers["x-user-id"] = authId;
      if (!headers["Authorization"] && auth?.isAuthenticated && (authId || auth?.email)) {
        // The login API can authenticate registered local accounts without a
        // Supabase token, even when Supabase is configured but unavailable.
        const identity = authId || auth.email;
        headers["Authorization"] = `Bearer ${identity}`;
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
          this.conversationId = data.conversationId || null;
          return data.messages;
        }
        if (data.success) this.conversationId = data.conversationId || null;
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
          conversationId: this.conversationId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.message) {
          this.conversationId = data.conversationId || this.conversationId;
          return {
            message: data.message,
            latencyMs: data.latencyMs || Date.now() - startTime,
          };
        }
        throw new Error(data.error || "The AI service returned an invalid response.");
      } else {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `Assistant API request failed (${res.status}).`);
      }
    } catch (networkErr) {
      if (networkErr instanceof Error) throw networkErr;
      throw new Error("Unable to reach the AI Career Assistant. Check your connection and try again.");
    }
  }
}

// Export singleton default instance
export const careerAssistantService = new CareerAssistantService();
