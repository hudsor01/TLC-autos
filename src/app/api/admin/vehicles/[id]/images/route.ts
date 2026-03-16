import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadImage, deleteImage } from "@/lib/storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const url = await uploadImage(file, id);

  // Check if this is the first image (make it primary)
  const existingImages = await prisma.vehicleImage.count({ where: { vehicleId: id } });

  const image = await prisma.vehicleImage.create({
    data: {
      vehicleId: id,
      url,
      alt: `${file.name}`,
      isPrimary: existingImages === 0,
      order: existingImages,
    },
  });

  return NextResponse.json(image, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get("imageId");

  if (!imageId) {
    return NextResponse.json({ error: "imageId required" }, { status: 400 });
  }

  const image = await prisma.vehicleImage.findFirst({
    where: { id: imageId, vehicleId: id },
  });

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  await deleteImage(image.url);
  await prisma.vehicleImage.delete({ where: { id: imageId } });

  // If deleted image was primary, make the first remaining image primary
  if (image.isPrimary) {
    const nextImage = await prisma.vehicleImage.findFirst({
      where: { vehicleId: id },
      orderBy: { order: "asc" },
    });
    if (nextImage) {
      await prisma.vehicleImage.update({
        where: { id: nextImage.id },
        data: { isPrimary: true },
      });
    }
  }

  return NextResponse.json({ success: true });
}
