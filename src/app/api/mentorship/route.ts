import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: requests, error } = await supabase
      .from("mentorship_requests")
      .select("*, student:profiles!student_id(*), alumni:profiles!alumni_id(*)")
      .or(`student_id.eq.${user.id},alumni_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ requests: requests || [] });
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
    const { alumniId, topic, message, scheduledAt } = body;

    if (!alumniId || !topic || !message) {
      return NextResponse.json(
        { error: "alumniId, topic, and message are required" },
        { status: 400 }
      );
    }

    const { data: newRequest, error } = await supabase
      .from("mentorship_requests")
      .insert({
        student_id: user.id,
        alumni_id: alumniId,
        topic,
        message,
        scheduled_at: scheduledAt || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ request: newRequest });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "requestId and status are required" },
        { status: 400 }
      );
    }

    const { data: updated, error } = await supabase
      .from("mentorship_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", requestId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ request: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
