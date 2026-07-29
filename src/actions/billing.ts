"use server";

import { headers } from "next/headers";

import { auth } from "@/auth";
import { getStripeCustomerId, setStripeCustomerId } from "@/lib/db/billing";
import { stripe, STRIPE_PRICE_IDS } from "@/lib/stripe";

async function getOrigin(): Promise<string> {
  const requestHeaders = await headers();
  return requestHeaders.get("origin") ?? `https://${requestHeaders.get("host")}`;
}

async function getOrCreateStripeCustomerId(userId: string, email: string): Promise<string> {
  const existingCustomerId = await getStripeCustomerId(userId);
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });
  await setStripeCustomerId(userId, customer.id);

  return customer.id;
}

export async function createCheckoutSession(
  interval: "monthly" | "yearly"
): Promise<{ success: true; url: string } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { success: false, error: "Not authenticated" };
  }

  const origin = await getOrigin();

  try {
    const customerId = await getOrCreateStripeCustomerId(session.user.id, session.user.email);

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: STRIPE_PRICE_IDS[interval], quantity: 1 }],
      success_url: `${origin}/settings`,
      cancel_url: `${origin}/settings`,
    });

    if (!checkoutSession.url) {
      return { success: false, error: "Could not create checkout session" };
    }

    return { success: true, url: checkoutSession.url };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

export async function createBillingPortalSession(): Promise<
  { success: true; url: string } | { success: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const origin = await getOrigin();

  try {
    const customerId = await getStripeCustomerId(session.user.id);
    if (!customerId) {
      return { success: false, error: "No billing account found" };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/settings`,
    });

    return { success: true, url: portalSession.url };
  } catch {
    return { success: false, error: "Something went wrong. Please try again." };
  }
}
