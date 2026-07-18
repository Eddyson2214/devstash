const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked: "That email is already linked to a different sign-in method.",
  "invalid-token": "That verification link is invalid. Request a new one from your dashboard.",
  "expired-token": "That verification link has expired. Request a new one from your dashboard.",
};

export function authErrorMessage(type?: string | null): string | null {
  if (!type) return null;
  return AUTH_ERROR_MESSAGES[type] ?? "Something went wrong. Please try again.";
}
