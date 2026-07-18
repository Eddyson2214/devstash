import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function redirectWith(request: Request, path: string, params: Record<string, string>) {
  const url = new URL(path, new URL(request.url).origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  if (!token || !email) {
    return redirectWith(request, "/sign-in", { error: "invalid-token" });
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!verificationToken) {
    return redirectWith(request, "/sign-in", { error: "invalid-token" });
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    return redirectWith(request, "/sign-in", { error: "expired-token" });
  }

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { emailVerified: new Date() } }),
    prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } }),
  ]);

  const session = await auth();
  const destination = session?.user?.email === email ? "/dashboard" : "/sign-in";
  return redirectWith(request, destination, { auth: "email-verified" });
}
