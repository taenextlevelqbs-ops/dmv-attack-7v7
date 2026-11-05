import Stripe from "stripe";
import {isLiveStripeKey} from "./stripe-key.mjs";
export function foundationStripeClient() {
  if(process.env.FOUNDATION_PAYMENTS_ENABLED!=="true") throw new Error("Foundation payments not enabled");
  const key = process.env.FOUNDATION_STRIPE_SECRET_KEY;
  if (!key) throw new Error("Foundation Stripe account is not configured");
  if(process.env.VERCEL_ENV==="production" && !isLiveStripeKey(key)) throw new Error("Production requires live Foundation Stripe credentials");
  return new Stripe(key,{maxNetworkRetries:2,timeout:20000});
}
