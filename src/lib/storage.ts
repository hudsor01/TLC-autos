import { writeFile, unlink, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "vehicles");

/**
 * Upload an image file and return the public URL path.
 */
export async function uploadImage(
  file: File,
  vehicleId: string
): Promise<string> {
  const vehicleDir = path.join(UPLOAD_DIR, vehicleId);
  await mkdir(vehicleDir, { recursive: true });

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  const filepath = path.join(vehicleDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/vehicles/${vehicleId}/${filename}`;
}

/**
 * Delete an image file from the filesystem.
 */
export async function deleteImage(url: string): Promise<void> {
  const filepath = path.join(process.cwd(), "public", url);
  try {
    await unlink(filepath);
  } catch {
    // File may already be deleted
  }
}
