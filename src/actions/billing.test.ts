import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/db/billing", () => ({
  getStripeCustomerId: vi.fn(),
  setStripeCustomerId: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  },
  STRIPE_PRICE_IDS: { monthly: "price_monthly", yearly: "price_yearly" },
}));

import { headers } from "next/headers";

import { auth } from "@/auth";
import { getStripeCustomerId, setStripeCustomerId } from "@/lib/db/billing";
import { stripe } from "@/lib/stripe";
import { createBillingPortalSession, createCheckoutSession } from "@/actions/billing";

const mockedAuth = vi.mocked(auth);
const mockedHeaders = vi.mocked(headers);
const mockedGetStripeCustomerId = vi.mocked(getStripeCustomerId);
const mockedSetStripeCustomerId = vi.mocked(setStripeCustomerId);
const mockedCustomersCreate = vi.mocked(stripe.customers.create);
const mockedCheckoutSessionsCreate = vi.mocked(stripe.checkout.sessions.create);
const mockedPortalSessionsCreate = vi.mocked(stripe.billingPortal.sessions.create);

beforeEach(() => {
  vi.clearAllMocks();
  // @ts-expect-error - minimal mock, only the fields the actions read
  mockedHeaders.mockResolvedValue(new Headers({ origin: "https://devstash.io" }));
});

describe("createCheckoutSession", () => {
  it("rejects when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await createCheckoutSession("monthly");

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedCheckoutSessionsCreate).not.toHaveBeenCalled();
  });

  it("reuses an existing Stripe customer id", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", email: "user@example.com" } });
    mockedGetStripeCustomerId.mockResolvedValue("cus_existing");
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedCheckoutSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session" });

    const result = await createCheckoutSession("monthly");

    expect(result).toEqual({ success: true, url: "https://checkout.stripe.com/session" });
    expect(mockedCustomersCreate).not.toHaveBeenCalled();
    expect(mockedCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" })
    );
  });

  it("creates and persists a new Stripe customer when the user has none", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", email: "user@example.com" } });
    mockedGetStripeCustomerId.mockResolvedValue(null);
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedCustomersCreate.mockResolvedValue({ id: "cus_new" });
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedCheckoutSessionsCreate.mockResolvedValue({ url: "https://checkout.stripe.com/session" });

    const result = await createCheckoutSession("yearly");

    expect(result).toEqual({ success: true, url: "https://checkout.stripe.com/session" });
    expect(mockedCustomersCreate).toHaveBeenCalledWith({
      email: "user@example.com",
      metadata: { userId: "user-1" },
    });
    expect(mockedSetStripeCustomerId).toHaveBeenCalledWith("user-1", "cus_new");
    expect(mockedCheckoutSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_new",
        line_items: [{ price: "price_yearly", quantity: 1 }],
      })
    );
  });

  it("returns a friendly error when the Stripe call throws", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1", email: "user@example.com" } });
    mockedGetStripeCustomerId.mockResolvedValue("cus_existing");
    mockedCheckoutSessionsCreate.mockRejectedValue(new Error("Stripe is down"));

    const result = await createCheckoutSession("monthly");

    expect(result).toEqual({ success: false, error: "Something went wrong. Please try again." });
  });
});

describe("createBillingPortalSession", () => {
  it("rejects when there is no session", async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await createBillingPortalSession();

    expect(result).toEqual({ success: false, error: "Not authenticated" });
    expect(mockedPortalSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns an error when the user has no Stripe customer id", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedGetStripeCustomerId.mockResolvedValue(null);

    const result = await createBillingPortalSession();

    expect(result).toEqual({ success: false, error: "No billing account found" });
    expect(mockedPortalSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns the portal session url on success", async () => {
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockedGetStripeCustomerId.mockResolvedValue("cus_existing");
    // @ts-expect-error - minimal mock, only the fields the action reads
    mockedPortalSessionsCreate.mockResolvedValue({ url: "https://billing.stripe.com/portal" });

    const result = await createBillingPortalSession();

    expect(result).toEqual({ success: true, url: "https://billing.stripe.com/portal" });
    expect(mockedPortalSessionsCreate).toHaveBeenCalledWith({
      customer: "cus_existing",
      return_url: "https://devstash.io/settings",
    });
  });
});
