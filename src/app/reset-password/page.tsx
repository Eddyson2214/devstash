import Link from "next/link";
import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Reset Password - DevStash",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token, email } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>Choose a new password for your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {token && email ? (
            <ResetPasswordForm token={token} email={email} />
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              This reset link is missing required information.{" "}
              <Link
                href="/forgot-password"
                className="text-primary underline-offset-4 hover:underline"
              >
                Request a new one
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
