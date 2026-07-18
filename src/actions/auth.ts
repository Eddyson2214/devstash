"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { auth, signIn, signOut } from "@/auth";
import { isEmailVerificationEnabled } from "@/lib/feature-flags";
import { prisma } from "@/lib/prisma";
import { issuePasswordResetToken, issueVerificationEmail } from "@/lib/verification-token";

const BCRYPT_ROUNDS = 12;

function withAuthMarker(url: string, marker: string): string {
  const isAbsolute = /^https?:\/\//i.test(url);
  const parsed = new URL(url, isAbsolute ? undefined : "http://localhost");
  parsed.searchParams.set("auth", marker);
  return isAbsolute ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
}

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");
  const redirectTo = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: withAuthMarker(redirectTo, "login-success"),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const params = new URLSearchParams({ error: error.type });
      if (typeof callbackUrl === "string" && callbackUrl) {
        params.set("callbackUrl", callbackUrl);
      }
      redirect(`/sign-in?${params.toString()}`);
    }
    throw error;
  }
}

export async function signInWithGitHub(formData: FormData) {
  const callbackUrl = formData.get("callbackUrl");
  const redirectTo = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/dashboard";

  await signIn("github", { redirectTo: withAuthMarker(redirectTo, "login-success") });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in?auth=logout-success" });
}

export async function resendVerificationEmail() {
  if (!isEmailVerificationEnabled()) {
    return { success: false, error: "Email verification is currently disabled." };
  }

  const session = await auth();
  if (!session?.user?.email || session.user.emailVerified) {
    return { success: false, error: "No unverified email on this account." };
  }

  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;

  try {
    await issueVerificationEmail(session.user.email, origin);
    return { success: true };
  } catch (error) {
    console.error("Failed to resend verification email:", error);
    return { success: false, error: "Failed to send verification email. Try again later." };
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
});

export async function requestPasswordReset(
  formData: FormData
): Promise<{ success: boolean }> {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });

  if (parsed.success) {
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

    if (user?.password) {
      const requestHeaders = await headers();
      const origin = requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;

      try {
        await issuePasswordResetToken(parsed.data.email, origin);
      } catch (error) {
        console.error("Failed to send password reset email:", error);
      }
    }
  }

  // Always report success, regardless of whether the email is registered, to avoid leaking account existence.
  return { success: true };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: z.string().trim().email(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function resetPassword(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { token, email, password } = parsed.data;

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token } },
  });

  if (!verificationToken) {
    return { success: false, error: "invalid-reset-token" };
  }

  if (verificationToken.expires < new Date()) {
    await prisma.verificationToken.delete({
      where: { identifier_token: { identifier: email, token } },
    });
    return { success: false, error: "expired-reset-token" };
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { email }, data: { password: passwordHash } }),
    prisma.verificationToken.delete({ where: { identifier_token: { identifier: email, token } } }),
  ]);

  return { success: true };
}
