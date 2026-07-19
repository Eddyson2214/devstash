import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { isEmailVerificationEnabled } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
  registerRatelimit,
  retryAfterSeconds,
} from "@/lib/rate-limit";
import { issueVerificationEmail } from "@/lib/verification-token";

const BCRYPT_ROUNDS = 12;

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const { success: withinLimit, reset } = await checkRateLimit(registerRatelimit, ip);
  if (!withinLimit) {
    return NextResponse.json(
      { success: false, error: RATE_LIMIT_MESSAGE },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds(reset)) } }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { success: false, error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verificationEnabled = isEmailVerificationEnabled();
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        emailVerified: verificationEnabled ? null : new Date(),
      },
    });

    if (verificationEnabled) {
      try {
        await issueVerificationEmail(email, new URL(request.url).origin);
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }
    }

    return NextResponse.json(
      { success: true, data: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    );
  }
}
