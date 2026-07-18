import { randomBytes } from "node:crypto";

import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";

const VERIFICATION_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;
const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export async function issueVerificationEmail(email: string, origin: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY_MS),
    },
  });

  const verifyUrl = new URL("/api/auth/verify-email", origin);
  verifyUrl.searchParams.set("token", token);
  verifyUrl.searchParams.set("email", email);

  await sendVerificationEmail(email, verifyUrl.toString());
}

export async function issuePasswordResetToken(email: string, origin: string) {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS),
    },
  });

  const resetUrl = new URL("/reset-password", origin);
  resetUrl.searchParams.set("token", token);
  resetUrl.searchParams.set("email", email);

  await sendPasswordResetEmail(email, resetUrl.toString());
}
