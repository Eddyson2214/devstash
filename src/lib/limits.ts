export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;

export function isLimitEnforcementEnabled(): boolean {
  return process.env.BILLING_LIMITS_ENABLED === "true";
}

export function hasReachedItemLimit(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_ITEM_LIMIT;
}

export function hasReachedCollectionLimit(currentCount: number, isPro: boolean): boolean {
  return !isPro && currentCount >= FREE_COLLECTION_LIMIT;
}
