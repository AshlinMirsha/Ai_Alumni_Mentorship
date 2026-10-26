import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      // Get messages for a conversation
      const { data: messages, error } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(*)")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return NextResponse.json({ messages: messages || [] });
    }

    // Otherwise list user's conversations
    const { data: convs, error } = await supabase
      .from("conversations")
      .select("*, participants:conversation_participants(*, profile:profiles(*))")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ conversations: convs || [] });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, content, recipientId } = body;

    if (!content || (!conversationId && !recipientId)) {
      return NextResponse.json({ error: "content and either conversationId or recipientId are required" }, { status: 400 });
    }

    let targetConvId = conversationId;

    if (!targetConvId && recipientId) {
      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from("conversations")
        .insert({ created_by: user.id })
        .select()
        .single();

      if (convError) throw convError;
      targetConvId = newConv.id;

      await supabase.from("conversation_participants").insert([
        { conversation_id: targetConvId, profile_id: user.id },
        { conversation_id: targetConvId, profile_id: recipientId },
      ]);
    }

    // Insert message
    const { data: msg, error: msgError } = await supabase
      .from("messages")
      .insert({
        conversation_id: targetConvId,
        sender_id: user.id,
        role: "user",
        content,
      })
      .select("*, sender:profiles!sender_id(*)")
      .single();

    if (msgError) throw msgError;

    // Update conversation updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", targetConvId);

    return NextResponse.json({ message: msg, conversationId: targetConvId });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
