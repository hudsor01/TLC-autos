import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { camelKeys } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const supabase = await createClient();

    // Upload to Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("vehicle-images")
      .upload(filePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("vehicle-images")
      .getPublicUrl(filePath);

    // Check if this is the first image (make it primary)
    const { count } = await supabase
      .from("vehicle_images")
      .select("*", { count: "exact", head: true })
      .eq("vehicle_id", id);

    const existingCount = count ?? 0;

    const { data: image, error } = await supabase
      .from("vehicle_images")
      .insert({
        vehicle_id: id,
        url: urlData.publicUrl,
        alt: file.name,
        is_primary: existingCount === 0,
        sort_order: existingCount,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(camelKeys(image), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json({ error: "imageId required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: image, error: findError } = await supabase
      .from("vehicle_images")
      .select("*")
      .eq("id", imageId)
      .eq("vehicle_id", id)
      .single();

    if (findError || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete from storage — extract path from URL
    const urlParts = image.url.split("/vehicle-images/");
    if (urlParts.length > 1) {
      await supabase.storage
        .from("vehicle-images")
        .remove([urlParts[1]]);
    }

    // Delete from database
    await supabase.from("vehicle_images").delete().eq("id", imageId);

    // If deleted image was primary, make the first remaining image primary
    if (image.is_primary) {
      const { data: nextImage } = await supabase
        .from("vehicle_images")
        .select("id")
        .eq("vehicle_id", id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .single();

      if (nextImage) {
        await supabase
          .from("vehicle_images")
          .update({ is_primary: true })
          .eq("id", nextImage.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
