import { NextRequest, NextResponse } from "next/server";
import { callNvidiaChat, callNvidiaChatStream } from "@/lib/ai/nvidia";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages = [],
      prompt,
      images = [],
      model = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
      stream = false,
      studentContext,
    } = body;

    let systemPrompt = `You are AlumniPath AI, an elite collegiate alumni mentorship and omni-modal career acceleration assistant powered by NVIDIA Nemotron Omni Reasoning.
You guide students and alumni with actionable, practical career wisdom, mock interview advice, professional mastery, resume feedback, and networking best practices.
When images (resumes, architecture diagrams, portfolio designs, documents) are provided, conduct deep visual analysis, audit specifics, highlight strengths, and identify high-leverage areas of improvement.
Format your responses using clean Markdown with bolding, bullet points, and code blocks when appropriate.
Keep responses concise, high-impact, encouraging, and free of fluff.
CRITICAL: Always tailor your response strictly to the student's target role, domain, and experience. DO NOT default to or assume software engineering, coding, or tech unless their target role or question explicitly asks for it.`;

    if (studentContext) {
      systemPrompt += `\n\nStudent Profile Context:
- Name: ${studentContext.studentName || "Student"}
- Target Role: ${studentContext.targetRole || "Career Aspirant"}
- Academic Track: ${studentContext.academicLevel || "Collegiate"}
- Current Focus: ${studentContext.currentFocus || "Career Readiness"}`;
    }

    const formattedMessages: any[] = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m: { role: string; content: any }) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      })),
    ];

    if (prompt && (!messages.length || messages[messages.length - 1].content !== prompt)) {
      if (Array.isArray(images) && images.length > 0) {
        // Multi-modal format for Nemotron Omni
        const parts: any[] = [{ type: "text", text: prompt }];
        for (const imgUrl of images) {
          parts.push({
            type: "image_url",
            image_url: { url: imgUrl },
          });
        }
        formattedMessages.push({ role: "user" as const, content: parts });
      } else {
        formattedMessages.push({ role: "user" as const, content: prompt });
      }
    }

    // Streaming mode
    if (stream) {
      const streamBody = await callNvidiaChatStream(formattedMessages, {
        model,
      });

      return new Response(streamBody, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
        },
      });
    }

    // Standard JSON mode
    const result = await callNvidiaChat(formattedMessages, {
      model,
    });

    return NextResponse.json({
      content: result.text,
      reasoning: result.reasoning,
      model,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    console.error("Chat API error:", err);
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
