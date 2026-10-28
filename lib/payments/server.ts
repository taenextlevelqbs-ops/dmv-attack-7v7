import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { canAccessRegistration } from "./authorization.mjs";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { stripeClient, stripeDatabase } from "@/lib/finance/stripe";
import { isLiveStripeKey } from "@/lib/finance/stripe-key.mjs";
import {
  validatePrice,
  synchronizeRegistration,
  checkoutParameters,
} from "./core.mjs";

export const enabled = () => process.env.STRIPE_REGISTRATION_ENABLED === "true";
export const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");
export const cookieName = (id: string) => `dmv_tryout_${id}`;
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};
export function paymentOrigin() {
  const url = new URL(process.env.PAYMENTS_BASE_URL || "https://dmvattack.com");
  if (
    url.protocol !== "https:" &&
    !(process.env.NODE_ENV !== "production" && url.hostname === "localhost")
  )
    throw Error("Invalid payment return origin");
  return url.origin;
}
export async function paymentAccess(
  registrationId: string,
  purpose: "TRYOUT" | "TEAM",
) {
  const db = stripeDatabase();
  const { data: registration, error } = await db
    .from("tryout_submissions")
    .select("id,tryout_id,parent_email,status,linked_family_id")
    .eq("id", registrationId)
    .maybeSingle();
  if (error || !registration) return null;
  const { data: order, error: orderError } = await db
    .from("registration_payment_orders")
    .select("*")
    .eq("registration_id", registrationId)
    .eq("purpose", purpose)
    .maybeSingle();
  if (orderError) throw Error("Payment migration required");
  if (
    purpose === "TRYOUT" &&
    order?.access_token_hash &&
    Date.now() - Date.parse(order.created_at) < 30 * 24 * 60 * 60 * 1000
  ) {
    const token = (await cookies()).get(cookieName(registrationId))?.value;
    if (token && token.length < 200) {
      const digest = hashToken(token);
      if (
        digest.length === order.access_token_hash.length &&
        timingSafeEqual(
          Buffer.from(digest),
          Buffer.from(order.access_token_hash),
        )
      )
        return { db, registration, order, userId: null };
    }
  }
  const client = await createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user || !user.email_confirmed_at) return null;
  const { data: member } = await db
    .from("family_members")
    .select("id")
    .eq("profile_id", user.id)
    .eq(
      "family_id",
      registration.linked_family_id || "00000000-0000-0000-0000-000000000000",
    )
    .maybeSingle();
  if (
    !canAccessRegistration(
      user,
      registration,
      member
        ? [{ profile_id: user.id, family_id: registration.linked_family_id }]
        : [],
    )
  )
    return null;
  return { db, registration, order, userId: user.id };
}
export async function checkoutOrder(orderId: string, userId: string | null) {
  if (!enabled() || !process.env.STRIPE_WEBHOOK_SECRET)
    throw Error("Online payments are not enabled");
  const db = stripeDatabase(),
    stripe = stripeClient();
  const { data: order, error: orderError } = await db
    .from("registration_payment_orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (orderError || !order) throw Error("Payment order unavailable");
  const priceId =
    process.env[
      order.purpose === "TRYOUT"
        ? "STRIPE_TRYOUT_PRICE_ID"
        : "STRIPE_TEAM_PRICE_ID"
    ];
  if (!priceId) throw Error("Payment price is not configured");
  const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
  validatePrice(
    price,
    order.purpose,
    isLiveStripeKey(process.env.STRIPE_SECRET_KEY),
  );
  // Reconcile old sessions before deciding whether a new attempt is allowed.
  const { data: previous, error: readError } = await db
    .from("registration_payment_attempts")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (readError) throw Error("Payment migration required");
  if (previous?.session_id)
    await synchronizeRegistration(
      stripe,
      db,
      previous.session_id,
      isLiveStripeKey(process.env.STRIPE_SECRET_KEY),
    );
  const { data: attempt, error } = await db.rpc(
    "reserve_registration_checkout",
    { p_order_id: order.id, p_user_id: userId },
  );
  if (error || !attempt)
    throw Error(
      "Payment already completed, athlete not eligible, or another checkout reserves this balance",
    );
  if (attempt.checkout_url) return attempt.checkout_url as string;
  // Replaying an indeterminate request after Stripe's idempotency retention can duplicate a checkout.
  if (Date.now() - Date.parse(attempt.created_at) > 23 * 60 * 60 * 1000)
    throw Error("Payment attempt needs staff reconciliation before retrying");
  const { data: registration, error: regError } = await db
    .from("tryout_submissions")
    .select("parent_email")
    .eq("id", order.registration_id)
    .single();
  if (regError || !registration) throw Error("Registration unavailable");
  const session = await stripe.checkout.sessions.create(
    checkoutParameters(
      order,
      attempt,
      registration.parent_email,
      priceId,
      paymentOrigin(),
    ),
    { idempotencyKey: `registration-${attempt.id}` },
  );
  if (!session.url) throw Error("Stripe did not return checkout");
  const { error: saveError } = await db
    .from("registration_payment_attempts")
    .update({
      session_id: session.id,
      checkout_url: session.url,
      status: "OPEN",
    })
    .eq("id", attempt.id);
  if (saveError)
    throw Error("Payment saved; retry the same checkout to recover it");
  return session.url;
}
