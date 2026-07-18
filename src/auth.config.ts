import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

export default {
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      // Placeholder for edge compatibility (bcrypt needs Node.js runtime).
      // auth.ts overrides this with the real bcrypt-based authorize logic.
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
