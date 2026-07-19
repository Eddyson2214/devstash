import NextAuth, { CredentialsSignin } from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp, loginRatelimit, RATE_LIMIT_ERROR_CODE } from "@/lib/rate-limit";
import authConfig from "./auth.config";

class RateLimitedSignin extends CredentialsSignin {}
RateLimitedSignin.type = RATE_LIMIT_ERROR_CODE;

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
        const user = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { emailVerified: true },
        });
        session.user.emailVerified = user?.emailVerified ?? null;
      }
      return session;
    },
  },
  ...authConfig,
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          emailVerified: profile.email ? new Date() : null,
        };
      },
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, request) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const ip = getClientIp(request.headers);
        const { success } = await checkRateLimit(loginRatelimit, `${ip}:${email}`);
        if (!success) {
          throw new RateLimitedSignin();
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
});
