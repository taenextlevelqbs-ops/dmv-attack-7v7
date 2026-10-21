import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Stripe is not configured");
  if (process.env.VERCEL_ENV === "production" && !key.startsWith("sk_live_"))
    throw new Error("Production requires a live Stripe key; test in a separate preview database");
  return new Stripe(key, { maxNetworkRetries: 2, timeout: 20000 });
}
export function stripeDatabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Database is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

import { syncCheckoutState } from "./stripe-sync.mjs";
export async function syncCheckout(stripe: Stripe, sessionId: string) {
  return syncCheckoutState(stripe, stripeDatabase(), sessionId, Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")));
}
