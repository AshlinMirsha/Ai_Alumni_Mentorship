import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  try {
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json(
        { success: false, error: "Invalid form data." },
        { status: 400 }
      );
    }

    const file = formData.get("avatar") as File | null;
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate mime type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Please upload a JPG, PNG, WebP, or GIF image.",
        },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "File size exceeds the 5MB limit. Please upload a smaller image.",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Try Supabase Storage upload
    const supabase = getAdminClient();
    const fileExt = file.name.split(".").pop() || "png";
    const fileName = `student-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            avatarUrl: publicUrlData.publicUrl,
          });
        }
      }
    } catch {
      // Storage bucket might not be created or network may be restricted
    }

    // Fallback: Return data URL
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      avatarUrl: dataUrl,
    });
  } catch (error) {
    console.error("[Avatar Upload] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar." },
      { status: 500 }
    );
  }
}
