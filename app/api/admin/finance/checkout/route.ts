import { ownerApi, privateHeaders, sameOrigin } from "@/lib/admin/api";
import { stripeClient } from "@/lib/finance/stripe";
import { moneyToCents, summarizeAccount } from "@/lib/finance/money.mjs";
import { allRows } from "@/lib/admin/pagination";

const response = (body: unknown, status = 200) => Response.json(body, { status, headers: privateHeaders });
const uuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function GET() {
  try {
    const auth = await ownerApi();
    if (!auth) return response({ error: "Owner access required" }, 403);
    const result = await allRows((start, end) => auth.admin.from("team_fee_checkouts")
      .select("id,account_id,amount_cents,checkout_url,status,paid,refunded_cents,created_at")
      .order("created_at", { ascending: false }).range(start, end));
    if (result.error) return response({ error: "Stripe checkout needs its database setup.", setup_required: true }, 503);
    return response({ configured: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET &&
      (process.env.VERCEL_ENV !== "production" || process.env.STRIPE_SECRET_KEY.startsWith("sk_live_"))),
      mode: process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ? "LIVE" : "TEST", checkouts: result.data });
  } catch {
    return response({ error: "Unable to load Stripe payments." }, 503);
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return response({ error: "Request origin rejected" }, 403);
  try {
    const auth = await ownerApi();
    if (!auth) return response({ error: "Owner access required" }, 403);
    if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)
      return response({ error: "Stripe credentials and payment confirmation endpoint must be configured first." }, 503);
    const stripe = stripeClient();
    const body = await request.json().catch(() => null);
    if (!body || !uuid(body.account_id) || !uuid(body.request_id)) return response({ error: "Select a fee account." }, 400);
    let amount: number;
    try { amount = moneyToCents(body.amount); } catch { return response({ error: "Enter a valid payment amount." }, 400); }
    if (amount < 50) return response({ error: "Minimum payment is $0.50." }, 400);
    const { data: account, error: accountError } = await auth.admin.from("team_fee_accounts").select("*").eq("id", body.account_id).maybeSingle();
    if (accountError) throw accountError;
    if (!account) return response({ error: "Fee account not found." }, 404);
    const transactions = await allRows((start, end) => auth.admin.from("team_fee_transactions").select("*").eq("account_id", account.id).order("id").range(start, end));
    if (transactions.error) throw transactions.error;
    if (amount > summarizeAccount(account, transactions.data || [], "").balance_cents)
      return response({ error: "Payment exceeds the current balance. Refresh before creating another link." }, 400);
    const { data: existing, error: readError } = await auth.admin.from("team_fee_checkouts").select("*").eq("id", body.request_id).maybeSingle();
    if (readError) return response({ error: "Run the Stripe database setup first." }, 503);
    if (existing && (existing.account_id !== account.id || existing.amount_cents !== amount || existing.created_by !== auth.user.id))
      return response({ error: "Retry details changed. Create a new request." }, 409);
    if (existing?.checkout_url) return response({ url: existing.checkout_url });
    if (existing && Date.now() - Date.parse(existing.created_at) > 23 * 60 * 60 * 1000)
      return response({ error: "This checkout attempt is too old. Refresh and create a new link." }, 409);
    if (!existing) {
      const { error } = await auth.admin.rpc("reserve_team_fee_checkout", { p_id: body.request_id, p_account_id: account.id, p_amount_cents: amount, p_created_by: auth.user.id });
      if (error?.code === "22023") return response({ error: "Existing checkout links already reserve this balance. Review pending links before creating another." }, 409);
      if (error) return response({ error: "Unable to reserve checkout. Retry the same request." }, 503);
    }
    const session = await stripe.checkout.sessions.create({
      mode: "payment", allowed_payment_method_types: ["us_bank_account", "card"],
      client_reference_id: body.request_id,
      metadata: { fee_checkout_id: body.request_id, fee_account_id: account.id },
      payment_intent_data: { metadata: { fee_checkout_id: body.request_id } },
      line_items: [{ price_data: { currency: "usd", unit_amount: amount,
        product_data: { name: `DMV Attack ${account.season} team fee payment` } }, quantity: 1 }],
      success_url: "https://www.dmvattack.com/payments/return",
      cancel_url: "https://www.dmvattack.com/payments/return?canceled=1",
    }, { idempotencyKey: `fee-checkout-${body.request_id}` });
    if (!session.url) throw new Error("No checkout URL");
    const { error: saveError } = await auth.admin.from("team_fee_checkouts").update({ session_id: session.id, checkout_url: session.url }).eq("id", body.request_id);
    if (saveError) return response({ error: "Checkout created but not saved. Retry the same request to recover it." }, 503);
    return response({ url: session.url });
  } catch {
    return response({ error: "Unable to create checkout. Check Stripe configuration, then retry. No payment has been taken by this action." }, 503);
  }
}
