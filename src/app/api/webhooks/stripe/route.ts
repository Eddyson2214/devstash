import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { syncSubscriptionFromStripe } from "@/lib/db/billing";
import { stripe } from "@/lib/stripe";

async function syncFromSubscription(subscription: Stripe.Subscription): Promise<void> {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const item = subscription.items.data[0];
  const status = subscription.status;

  await syncSubscriptionFromStripe(customerId, {
    isPro: status === "active" || status === "trialing",
    stripeSubscriptionId: subscription.id,
    stripePriceId: item?.price.id ?? null,
    subscriptionStatus: status,
    currentPeriodEnd: item?.current_period_end ? new Date(item.current_period_end * 1000) : null,
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object;
      if (typeof checkoutSession.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription);
        await syncFromSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await syncFromSubscription(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
