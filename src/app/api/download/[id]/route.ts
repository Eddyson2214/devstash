import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getItemDetail } from "@/lib/db/items";
import { getFromR2, keyFromFileUrl } from "@/lib/r2";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const item = await getItemDetail(id, session.user.id);

  if (!item || !item.fileUrl) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const object = await getFromR2(keyFromFileUrl(item.fileUrl));
  if (!object.Body) {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }

  const headers: HeadersInit = {
    "Content-Type": object.ContentType ?? "application/octet-stream",
    "Content-Disposition": `attachment; filename="${item.fileName ?? "download"}"`,
  };
  if (object.ContentLength !== undefined) {
    headers["Content-Length"] = String(object.ContentLength);
  }

  return new NextResponse(await object.Body.transformToWebStream(), { headers });
}
