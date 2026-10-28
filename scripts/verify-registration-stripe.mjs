// Read-only configuration verification. No Checkout sessions, payments or products are created.
import Stripe from "stripe";
import { validatePrice } from "../lib/payments/core.mjs";
import { isLiveStripeKey } from "../lib/finance/stripe-key.mjs";
const required = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_TRYOUT_PRICE_ID",
  "STRIPE_TEAM_PRICE_ID",
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error("Missing server configuration: " + missing.join(", "));
  process.exit(1);
}
const live = isLiveStripeKey(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  maxNetworkRetries: 1,
  timeout: 15000,
});
let failure = false;
for (const [purpose, name] of [
  ["TRYOUT", "STRIPE_TRYOUT_PRICE_ID"],
  ["TEAM", "STRIPE_TEAM_PRICE_ID"],
]) {
  try {
    const price = await stripe.prices.retrieve(process.env[name], {
      expand: ["product"],
    });
    validatePrice(price, purpose, live);
    if (purpose === "TRYOUT") {
      const product = price.product;
      if (
        typeof product === "string" ||
        !product ||
        !("name" in product) ||
        product.name.replace(/[–—]/g, "-").trim().toUpperCase() !==
          "DMV ATTACK 2026-2027"
      )
        throw Error("Product name mismatch");
    }
    console.log(
      `${purpose}: active one-time USD price, required amount, account mode and product verified (${live ? "LIVE" : "TEST"}).`,
    );
  } catch (error) {
    failure = true;
    console.error(
      `${purpose}: verification failed. Check price/product/account configuration and API access. Error type: ${error?.type || error?.name || "Unknown"}.`,
    );
  }
}
console.log(
  "Webhook signing-secret presence verified only; actual signed delivery, settlement and receipts still require isolated Stripe test-mode validation.",
);
if (failure) process.exit(1);
