"use client";

import { useState, useTransition } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";

import { resendVerificationEmail } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function VerifyEmailBanner() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  function handleResend() {
    startTransition(async () => {
      const result = await resendVerificationEmail();
      if (result.success) {
        setSent(true);
        toast.success("Verification email sent. Check your inbox.");
      } else {
        toast.error(result.error ?? "Failed to send verification email.");
      }
    });
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-yellow-200">
        <Mail className="size-4 shrink-0" aria-hidden="true" />
        <span>Please verify your email address to secure your account.</span>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={isPending || sent}
      >
        {sent ? "Sent" : isPending ? "Sending..." : "Resend email"}
      </Button>
    </div>
  );
}
