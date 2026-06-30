import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { writeFile } from "fs/promises";
import path from "path";
import { ensureStorageDirs, UPLOADS_DIR } from "@/lib/watch-storage";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, or GIF images are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be smaller than 5 MB" },
        { status: 400 }
      );
    }

    await ensureStorageDirs();

    const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const filename = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOADS_DIR, filename), buffer);

    const imagePath = `/uploads/watches/${filename}`;
    return NextResponse.json({ imagePath, filename });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
