"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { authErrorMessage } from "@/lib/auth-errors";

const AUTH_EVENT_MESSAGES: Record<string, string> = {
  "login-success": "Signed in successfully.",
  "logout-success": "Signed out successfully.",
  "register-success": "Account created. Sign in to continue.",
  "email-verified": "Email verified successfully.",
  "verification-sent": "Verification email sent. Check your inbox.",
  "reset-email-sent": "If that email is registered, a reset link has been sent.",
  "password-reset-success": "Password reset successfully. Sign in with your new password.",
};

export function AuthToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = searchParams.get("auth");
    const error = searchParams.get("error");

    if (error) {
      toast.error(authErrorMessage(error) ?? "Something went wrong. Please try again.");
    } else if (auth && AUTH_EVENT_MESSAGES[auth]) {
      toast.success(AUTH_EVENT_MESSAGES[auth]);
    }

    if (auth || error) {
      const params = new URLSearchParams(searchParams);
      params.delete("auth");
      params.delete("error");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), pathname]);

  return null;
}
