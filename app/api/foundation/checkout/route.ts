import { NextResponse } from "next/server";
import { stripeClient, stripeDatabase } from "@/lib/finance/stripe";

export const runtime = "nodejs";
const prices = { BRONZE: 25000, SILVER: 50000, GOLD: 100000 } as const;
const safe = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0,max) : "";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY || !process.env.SUPABASE_SECRET_KEY) return NextResponse.json({ error: "Secure checkout is temporarily unavailable." }, { status: 503 });
    if (!request.headers.get("content-type")?.startsWith("application/json")) return NextResponse.json({ error: "Invalid request" }, { status: 415 });
    if (Number(request.headers.get("content-length") || "0") > 8000) return NextResponse.json({ error: "Request too large" }, { status: 413 });
    const origin = request.headers.get("origin");
    const url = new URL(request.url);
    if (origin && origin !== url.origin && origin !== "https://www.dmvattack.com" && origin !== "https://dmvattack.com")
      return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });

    const body = await request.json();
    if (body.companyWebsiteHidden) return NextResponse.json({ error: "Unable to process request" }, { status: 400 });
    const kind = body.kind === "SPONSORSHIP" ? "SPONSORSHIP" : body.kind === "CONTRIBUTION" ? "CONTRIBUTION" : null;
    if (!kind) return NextResponse.json({ error: "Invalid contribution type" }, { status: 400 });
    const tier = kind === "SPONSORSHIP" && Object.hasOwn(prices, body.tier) ? body.tier as keyof typeof prices : null;
    if (kind === "SPONSORSHIP" && !tier) return NextResponse.json({ error: "Choose a sponsorship tier" }, { status: 400 });
    const amount = tier ? prices[tier] : Number(body.amountCents);
    if (!Number.isSafeInteger(amount) || amount < 500 || amount > 1000000) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    const contactName = safe(body.contactName, 120);
    const businessName = safe(body.businessName, 160);
    const email = safe(body.email, 254).toLowerCase();
    const websiteInput = safe(body.website, 300);
    let website: string | null = null;
    if (websiteInput) {
      try {
        const parsed = new URL(websiteInput);
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("bad scheme");
        website = parsed.href;
      } catch { return NextResponse.json({ error: "Enter a valid business website URL" }, { status: 400 }); }
    }
    if (!contactName || !emailPattern.test(email) || (kind === "SPONSORSHIP" && !businessName)) return NextResponse.json({ error: "Complete the required contact information" }, { status: 400 });
    if (body.agreed !== true) return NextResponse.json({ error: "Accept the sponsorship and contribution terms" }, { status: 400 });

    const db = stripeDatabase();
    const {data: order, error: orderError} = await db.from("foundation_contributions").insert({
      kind, tier, amount_cents: amount, contact_name: contactName,
      business_name: kind === "SPONSORSHIP" ? businessName : null,
      email, website, status: "PENDING"
    }).select("id").single();
    if (orderError || !order) throw new Error("Unable to open contribution ledger");

    const stripe = stripeClient();
    const label = kind === "SPONSORSHIP" ? `DMV Attack 2027 ${tier} Business Sponsorship` : "DMV Attack Community Contribution";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price_data: { currency: "usd", unit_amount: amount, product_data: { name: label, description: "Not represented as a tax-deductible contribution." } }, quantity: 1 }],
      client_reference_id: order.id,
      metadata: { foundation_order_id: order.id, foundation_kind: kind },
      payment_intent_data: { metadata: { foundation_order_id: order.id } },
      success_url: "https://www.dmvattack.com/foundation/thank-you?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://www.dmvattack.com/foundation#sponsor",
    });
    const {error: attachError} = await db.from("foundation_contributions").update({stripe_session_id:session.id,status:"OPEN",updated_at:new Date().toISOString()}).eq("id",order.id).is("stripe_session_id",null);
    if (attachError || !session.url) {
      await stripe.checkout.sessions.expire(session.id).catch(()=>{});
      throw new Error("Unable to attach checkout");
    }
    return NextResponse.json({ url: session.url }, { headers: {"Cache-Control":"no-store"} });
  } catch (error) {
    console.error("Foundation checkout creation failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: "Unable to start checkout. Please contact the Foundation." }, { status: 503 });
  }
}
