const AUTH_ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked: "That email is already linked to a different sign-in method.",
};

export function authErrorMessage(type?: string | null): string | null {
  if (!type) return null;
  return AUTH_ERROR_MESSAGES[type] ?? "Something went wrong. Please try again.";
}
