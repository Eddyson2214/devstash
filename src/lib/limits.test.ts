import { afterEach, describe, expect, it } from "vitest";

import {
  FREE_COLLECTION_LIMIT,
  FREE_ITEM_LIMIT,
  hasReachedCollectionLimit,
  hasReachedItemLimit,
  isLimitEnforcementEnabled,
} from "@/lib/limits";

describe("isLimitEnforcementEnabled", () => {
  afterEach(() => {
    delete process.env.BILLING_LIMITS_ENABLED;
  });

  it("defaults to false when BILLING_LIMITS_ENABLED is unset", () => {
    expect(isLimitEnforcementEnabled()).toBe(false);
  });

  it("is true only when exactly \"true\"", () => {
    process.env.BILLING_LIMITS_ENABLED = "true";
    expect(isLimitEnforcementEnabled()).toBe(true);

    process.env.BILLING_LIMITS_ENABLED = "TRUE";
    expect(isLimitEnforcementEnabled()).toBe(false);

    process.env.BILLING_LIMITS_ENABLED = "1";
    expect(isLimitEnforcementEnabled()).toBe(false);
  });
});

describe("hasReachedItemLimit", () => {
  it("returns false below the limit for free users", () => {
    expect(hasReachedItemLimit(FREE_ITEM_LIMIT - 1, false)).toBe(false);
  });

  it("returns true at or above the limit for free users", () => {
    expect(hasReachedItemLimit(FREE_ITEM_LIMIT, false)).toBe(true);
    expect(hasReachedItemLimit(FREE_ITEM_LIMIT + 1, false)).toBe(true);
  });

  it("always returns false for Pro users regardless of count", () => {
    expect(hasReachedItemLimit(0, true)).toBe(false);
    expect(hasReachedItemLimit(FREE_ITEM_LIMIT + 100, true)).toBe(false);
  });
});

describe("hasReachedCollectionLimit", () => {
  it("returns false below the limit for free users", () => {
    expect(hasReachedCollectionLimit(FREE_COLLECTION_LIMIT - 1, false)).toBe(false);
  });

  it("returns true at or above the limit for free users", () => {
    expect(hasReachedCollectionLimit(FREE_COLLECTION_LIMIT, false)).toBe(true);
    expect(hasReachedCollectionLimit(FREE_COLLECTION_LIMIT + 1, false)).toBe(true);
  });

  it("always returns false for Pro users regardless of count", () => {
    expect(hasReachedCollectionLimit(0, true)).toBe(false);
    expect(hasReachedCollectionLimit(FREE_COLLECTION_LIMIT + 100, true)).toBe(false);
  });
});
