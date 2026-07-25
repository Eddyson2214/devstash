import { describe, expect, it } from "vitest";

import { getClientIp, retryAfterSeconds } from "@/lib/rate-limit";

describe("getClientIp", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("203.0.113.1");
  });

  it("falls back to 'unknown' when the header is missing", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("retryAfterSeconds", () => {
  it("rounds up to whole seconds", () => {
    const reset = Date.now() + 2500;
    expect(retryAfterSeconds(reset)).toBe(3);
  });

  it("never returns less than 1 second, even for a reset in the past", () => {
    expect(retryAfterSeconds(Date.now() - 10_000)).toBe(1);
  });
});
