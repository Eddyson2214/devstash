import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const RATE_LIMIT_ERROR_CODE = "rate-limited";
export const RATE_LIMIT_MESSAGE = "Too many attempts. Please try again later.";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function createLimiter(
  name: string,
  requests: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1]
) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `devstash-ratelimit:${name}`,
  });
}

export const loginRatelimit = createLimiter("login", 5, "15 m");
export const registerRatelimit = createLimiter("register", 3, "1 h");
export const forgotPasswordRatelimit = createLimiter("forgot-password", 3, "1 h");
export const resetPasswordRatelimit = createLimiter("reset-password", 5, "15 m");
export const resendVerificationRatelimit = createLimiter("resend-verification", 3, "15 m");

interface RateLimitResult {
  success: boolean;
  reset: number;
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  key: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, reset: 0 };
  }

  try {
    return await limiter.limit(key);
  } catch (error) {
    console.error("Rate limit check failed, allowing request:", error);
    return { success: true, reset: 0 };
  }
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return "unknown";
}

export function retryAfterSeconds(reset: number): number {
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
}
