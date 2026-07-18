import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

export async function issueVerificationEmail(email: string, origin: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + TOKEN_EXPIRY_MS),
    },
  });

  const verifyUrl = new URL("/api/auth/verify-email", origin);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("email", email);

  await sendVerificationEmail(email, verifyUrl.toString());
}
