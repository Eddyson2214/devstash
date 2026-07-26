import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getSearchableCollections } from "@/lib/db/collections";
import { getSearchableItems } from "@/lib/db/items";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [items, collections] = await Promise.all([
    getSearchableItems(session.user.id),
    getSearchableCollections(session.user.id),
  ]);

  return NextResponse.json({ items, collections });
}
