import { RATE_LIMIT_ERROR_CODE, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked: "That email is already linked to a different sign-in method.",
  "invalid-token": "That verification link is invalid. Request a new one from your dashboard.",
  "expired-token": "That verification link has expired. Request a new one from your dashboard.",
  "invalid-reset-token": "That password reset link is invalid. Request a new one.",
  "expired-reset-token": "That password reset link has expired. Request a new one.",
  [RATE_LIMIT_ERROR_CODE]: RATE_LIMIT_MESSAGE,
};

export function authErrorMessage(type?: string | null): string | null {
  if (!type) return null;
  return AUTH_ERROR_MESSAGES[type] ?? "Something went wrong. Please try again.";
}
