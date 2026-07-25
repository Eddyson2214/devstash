import { describe, expect, it } from "vitest";

import { authErrorMessage } from "@/lib/auth-errors";

describe("authErrorMessage", () => {
  it("returns null when no error type is given", () => {
    expect(authErrorMessage(undefined)).toBeNull();
    expect(authErrorMessage(null)).toBeNull();
  });

  it("maps known error codes to their message", () => {
    expect(authErrorMessage("CredentialsSignin")).toBe("Invalid email or password.");
    expect(authErrorMessage("expired-reset-token")).toBe(
      "That password reset link has expired. Request a new one."
    );
  });

  it("falls back to a generic message for unknown error codes", () => {
    expect(authErrorMessage("some-unmapped-code")).toBe("Something went wrong. Please try again.");
  });
});
