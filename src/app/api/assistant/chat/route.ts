import { NextResponse, connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/authorize";
import { getAdminClient } from "@/lib/supabase/admin";
import { AIProviderError, generateAICareerResponse } from "@/lib/ai/provider";
import type { AssistantMessage, AssistantSuggestedAction } from "@/types";

// Maximum allowable prompt length in characters
const MAX_MESSAGE_LENGTH = 4000;

export async function POST(req: Request) {
  const startTime = Date.now();

  try {
    // 1. Authenticate user
    const { user, profile, error: authError } = await getAuthenticatedUser(req);
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please sign in to consult the AI Career Assistant.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // 2. Parse & Validate request payload
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request payload.", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const rawMessage = (body.message || body.prompt || "").trim();
    if (!rawMessage) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty.", code: "EMPTY_MESSAGE" },
        { status: 400 }
      );
    }

    if (rawMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Message exceeds the ${MAX_MESSAGE_LENGTH}-character limit. Please shorten your message.`,
          code: "MESSAGE_TOO_LONG",
        },
        { status: 400 }
      );
    }

    const requestedConversationId = body.conversationId || body.conversation_id;

    // 3. Security: If a conversationId was supplied, verify ownership
    const supabase = getAdminClient();
    let verifiedConversationId: string | undefined;
    let priorMessages: Array<{ role: "user" | "assistant"; content: string }> = [];

    if (requestedConversationId) {
      const { data: conv, error: convErr } = await supabase
        .from("career_assistant_conversations")
        .select("id, user_id")
        .eq("id", requestedConversationId)
        .maybeSingle();

      if (convErr || !conv) {
        return NextResponse.json(
          { success: false, error: "Conversation not found. Start a new chat and try again.", code: "CONVERSATION_NOT_FOUND" },
          { status: 404 }
        );
      }
      if (conv.user_id !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized access: You do not have permission to view or participate in this conversation.",
            code: "FORBIDDEN_CONVERSATION",
          },
          { status: 403 }
        );
      }
      verifiedConversationId = conv.id;
      const { data: history } = await supabase
        .from("career_assistant_messages")
        .select("role, content")
        .eq("conversation_id", verifiedConversationId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(12);
      priorMessages = (history || [])
        .reverse()
        .filter((message: any) => message.role === "user" || message.role === "assistant")
        .map((message: any) => ({ role: message.role, content: message.content }));
    }

    // 4. Retrieve student's actual profile context from DB
    const studentName = profile?.full_name || user.user_metadata?.full_name || "Student";
    const targetRole =
      (profile as any)?.desired_role ||
      (Array.isArray((profile as any)?.career_goals) && (profile as any).career_goals[0]) ||
      "Software Engineer";
    const academicYear = profile?.academic_year || "Undergraduate";
    const department = profile?.department || "Computer Science";
    const degree = (profile as any)?.degree || "B.S.";

    // Parse technical skills safely
    const technicalSkills: string[] = [];
    if (Array.isArray((profile as any)?.technical_skills)) {
      (profile as any).technical_skills.forEach((s: any) => {
        if (typeof s === "string") technicalSkills.push(s);
        else if (s?.name) technicalSkills.push(`${s.name} (${s.level || "intermediate"})`);
      });
    }

    // Parse projects safely
    const projectsList: string[] = [];
    if (Array.isArray((profile as any)?.projects)) {
      (profile as any).projects.forEach((p: any) => {
        if (p?.title) {
          const tech = Array.isArray(p.technologies) ? p.technologies.join(", ") : "";
          projectsList.push(`${p.title} (${tech || "Custom stack"})`);
        }
      });
    }

    const currentActivities = Array.isArray((profile as any)?.current_activities)
      ? (profile as any).current_activities.join("; ")
      : "";
    const targetCompanies = Array.isArray((profile as any)?.target_companies)
      ? (profile as any).target_companies.join(", ")
      : "";

    // 5. Build personalized AI prompt with verified profile data
    const systemPrompt = `You are AlumniPath's AI Career Assistant, a high-caliber collegiate career mentor and technical advisor.
You are mentoring ${studentName}, currently a ${academicYear} student pursuing ${degree} in ${department}.
Their saved target career aspiration is: "${targetRole}". Treat this only as optional personalization context. It never overrides or changes the subject or role requested in the user's latest message.

VERIFIED STUDENT PROFILE INFORMATION:
- Skills Reported: ${technicalSkills.length > 0 ? technicalSkills.join(", ") : "None reported yet (encourage adding them)"}
- Portfolio Projects: ${projectsList.length > 0 ? projectsList.join("; ") : "No projects logged yet"}
- Current Focus / Activities: ${currentActivities || "Not specified"}
- Target Companies: ${targetCompanies || "Open to top engineering companies"}

ADVISORY RULES:
1. Answer the question the user actually asked. Determine the subject and any explicitly named career role from the latest user message, and keep that role as the subject of your answer.
2. Never substitute the saved target role (${targetRole}) for the role named in the latest question. Do not change the saved profile target based on a question.
3. Use profile details only to tailor useful advice; do not let them redirect the question. If no role is specified, use the conversation context and ask a clarifying question only if needed.
4. For career questions, give a role-specific roadmap, skills, projects, learning resources, and career preparation as relevant. For comparisons, address both roles. For technical or project questions, answer those directly.
5. Use prior conversation messages only to resolve follow-ups. When the user asks about a different career path, switch to that path without carrying over assumptions from the previous one.
6. Ground recommendations in reported skills; do not invent qualifications. Format responses cleanly using Markdown and include a concise next step when helpful.`;

    // 6. Call Server-side AI Provider
    const aiResult = await generateAICareerResponse({
      prompt: rawMessage,
      systemPrompt,
      history: priorMessages,
      temperature: 0.65,
    });

    // 7. Generate contextual suggestions and suggested actions
    const dynamicSuggestions: string[] = [
      "What should I learn next based on this answer?",
      "What project could help me practice this?",
      "How can I prepare for opportunities in this area?",
    ];

    const suggestedActions: AssistantSuggestedAction[] = [
      {
        label: "View Career Roadmap",
        href: "/career-roadmap",
        actionType: "roadmap",
      },
      {
        label: "Analyze My Resume",
        href: "/resume-review",
        actionType: "resume",
      },
      {
        label: "Find Alumni Mentors",
        href: "/alumni",
        actionType: "alumni",
      },
    ];

    const assistantMsgId = `asst-${Date.now()}`;
    const userMsgId = `user-${Date.now()}`;

    // 8. Asynchronously persist conversation and messages to Supabase
    let finalConversationId = verifiedConversationId;
    try {
      if (!finalConversationId) {
        const { data: newConv } = await supabase
          .from("career_assistant_conversations")
          .insert({
            user_id: user.id,
            title: rawMessage.length > 30 ? `${rawMessage.substring(0, 30)}...` : rawMessage,
          })
          .select("id")
          .maybeSingle();

        if (newConv?.id) {
          finalConversationId = newConv.id;
        }
      }

      if (finalConversationId) {
        await supabase
          .from("career_assistant_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", finalConversationId)
          .eq("user_id", user.id);
        await supabase.from("career_assistant_messages").insert([
          {
            conversation_id: finalConversationId,
            user_id: user.id,
            role: "user",
            content: rawMessage,
          },
          {
            conversation_id: finalConversationId,
            user_id: user.id,
            role: "assistant",
            content: aiResult.text,
            suggestions: dynamicSuggestions,
            suggested_actions: suggestedActions,
          },
        ]);
      }
    } catch (dbErr) {
      console.warn("[Career Assistant] Message persistence warning:", dbErr);
    }

    const latencyMs = Date.now() - startTime;

    const responseMessage: AssistantMessage = {
      id: assistantMsgId,
      role: "assistant",
      content: aiResult.text,
      timestamp: "Just now",
      suggestions: dynamicSuggestions,
      suggestedActions,
    };

    return NextResponse.json({
      success: true,
      message: responseMessage,
      conversationId: finalConversationId || null,
      latencyMs,
      provider: aiResult.provider,
    });
  } catch (error: any) {
    console.error("[Career Assistant API] Error:", error);
    if (error instanceof AIProviderError) {
      const status = error.code === "AI_NOT_CONFIGURED" ? 503 : 502;
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: "An internal server error occurred while generating career guidance. Please try again.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET: Retrieves the user's active conversation history or threads.
 */
export async function GET(req: Request) {
  await connection();
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Authentication required.", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();
    const { data: latestConversation } = await supabase
      .from("career_assistant_conversations")
      .select("id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let messagesQuery = supabase
      .from("career_assistant_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (latestConversation?.id) messagesQuery = messagesQuery.eq("conversation_id", latestConversation.id);
    const { data: messages, error: msgError } = await messagesQuery.limit(50);

    if (msgError) {
      return NextResponse.json({
        success: true,
        messages: [],
      });
    }

    const formatted: AssistantMessage[] = (messages || []).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestions: m.suggestions || [],
      suggestedActions: m.suggested_actions || [],
    }));

    return NextResponse.json({
      success: true,
      conversationId: latestConversation?.id || null,
      messages: formatted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve conversation history.", details: err?.message },
      { status: 500 }
    );
  }
}
