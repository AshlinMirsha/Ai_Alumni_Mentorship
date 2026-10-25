import { NextResponse, connection } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/authorize";
import { getAdminClient } from "@/lib/supabase/admin";
import { generateAICareerResponse } from "@/lib/ai/provider";
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

    const conversationId = body.conversationId || body.conversation_id;

    // 3. Security: If a conversationId was supplied, verify ownership
    const supabase = getAdminClient();
    let verifiedConversationId = conversationId;

    if (conversationId) {
      try {
        const { data: conv, error: convErr } = await supabase
          .from("career_assistant_conversations")
          .select("id, user_id")
          .eq("id", conversationId)
          .maybeSingle();

        if (!convErr && conv) {
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
        }
      } catch {
        // Table may not exist yet or connection issue
      }
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
Their target career aspiration is: "${targetRole}".

VERIFIED STUDENT PROFILE INFORMATION:
- Skills Reported: ${technicalSkills.length > 0 ? technicalSkills.join(", ") : "None reported yet (encourage adding them)"}
- Portfolio Projects: ${projectsList.length > 0 ? projectsList.join("; ") : "No projects logged yet"}
- Current Focus / Activities: ${currentActivities || "Not specified"}
- Target Companies: ${targetCompanies || "Open to top engineering companies"}

ADVISORY RULES:
1. Personalize all advice to ${studentName}'s actual target role (${targetRole}) and background.
2. Ground technical recommendations in their actual skill level. Never invent fake qualifications.
3. If they lack certain fundamental skills for ${targetRole}, guide them on how to bridge the gap with practical projects and study tracks.
4. Format responses cleanly using GitHub-style Markdown with clear headings and bullet points.
5. End with constructive encouragement and 2-3 relevant follow-up exploration areas.`;

    // 6. Call Server-side AI Provider
    const aiResult = await generateAICareerResponse({
      prompt: rawMessage,
      systemPrompt,
      temperature: 0.65,
    });

    // 7. Generate contextual suggestions and suggested actions
    const dynamicSuggestions: string[] = [
      `What portfolio projects will best demonstrate my skills for ${targetRole}?`,
      `How can I prepare for technical interviews for ${targetRole}?`,
      `How should I structure my resume for ${targetRole} positions?`,
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
    try {
      let finalConvId = verifiedConversationId;
      if (!finalConvId) {
        const { data: newConv } = await supabase
          .from("career_assistant_conversations")
          .insert({
            user_id: user.id,
            title: rawMessage.length > 30 ? `${rawMessage.substring(0, 30)}...` : rawMessage,
          })
          .select("id")
          .maybeSingle();

        if (newConv?.id) {
          finalConvId = newConv.id;
        }
      }

      if (finalConvId) {
        await supabase.from("career_assistant_messages").insert([
          {
            conversation_id: finalConvId,
            user_id: user.id,
            role: "user",
            content: rawMessage,
          },
          {
            conversation_id: finalConvId,
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
      conversationId: verifiedConversationId || `conv-${user.id}`,
      latencyMs,
      provider: aiResult.provider,
    });
  } catch (error: any) {
    console.error("[Career Assistant API] Error:", error);
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
    const { data: messages, error: msgError } = await supabase
      .from("career_assistant_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

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
      messages: formatted,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to retrieve conversation history.", details: err?.message },
      { status: 500 }
    );
  }
}
