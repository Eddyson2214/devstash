import { randomUUID } from "crypto";

import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { validateUpload, type UploadCategory } from "@/lib/file-upload";
import { uploadToR2 } from "@/lib/r2";

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const category = formData.get("category");

  if (!(file instanceof File) || (category !== "file" && category !== "image")) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const validationError = validateUpload(category as UploadCategory, {
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type,
  });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${session.user.id}/${randomUUID()}-${sanitizeFileName(file.name)}`;
  const fileUrl = await uploadToR2(key, buffer, file.type || "application/octet-stream");

  return NextResponse.json({ fileUrl, fileName: file.name, fileSize: file.size });
}
