import { prisma } from "@/lib/prisma";

export interface BillingInfo {
  isPro: boolean;
  stripePriceId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
}

export async function getBillingInfo(userId: string): Promise<BillingInfo | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPro: true,
      stripePriceId: true,
      subscriptionStatus: true,
      stripeCurrentPeriodEnd: true,
    },
  });

  if (!user) return null;

  return {
    isPro: user.isPro,
    stripePriceId: user.stripePriceId,
    subscriptionStatus: user.subscriptionStatus,
    currentPeriodEnd: user.stripeCurrentPeriodEnd,
  };
}

export async function setStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId },
  });
}

export interface SubscriptionSyncData {
  isPro: boolean;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | null;
}

export async function syncSubscriptionFromStripe(
  stripeCustomerId: string,
  data: SubscriptionSyncData
): Promise<void> {
  await prisma.user.update({
    where: { stripeCustomerId },
    data: {
      isPro: data.isPro,
      stripeSubscriptionId: data.stripeSubscriptionId,
      stripePriceId: data.stripePriceId,
      subscriptionStatus: data.subscriptionStatus,
      stripeCurrentPeriodEnd: data.currentPeriodEnd,
    },
  });
}

export async function countItemsForUser(userId: string): Promise<number> {
  return prisma.item.count({ where: { userId } });
}

export async function countCollectionsForUser(userId: string): Promise<number> {
  return prisma.collection.count({ where: { userId } });
}
