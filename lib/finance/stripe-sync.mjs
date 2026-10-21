// Read current provider state instead of trusting event order or a return-page URL.
export async function syncCheckoutState(stripe, db, sessionId, liveMode) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const linkId = session.metadata?.fee_checkout_id;
  if (!linkId) return; // Other training/payment integrations are separate.
  const { data: link, error } = await db.from("team_fee_checkouts").select("*").eq("id", linkId).maybeSingle();
  if (error || !link) throw new Error("Checkout record unavailable");
  if ((link.session_id && link.session_id !== session.id) || session.mode !== "payment" ||
      session.currency !== "usd" || session.amount_total !== link.amount_cents ||
      session.client_reference_id !== link.id || session.metadata?.fee_account_id !== link.account_id ||
      session.livemode !== liveMode) {
    throw new Error("Checkout verification failed");
  }
  const intentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  let refunded = 0;
  if (intentId) {
    for await (const refund of stripe.refunds.list({ payment_intent: intentId, limit: 100 })) {
      if (refund.status === "succeeded") refunded += refund.amount;
    }
  }
  const paid = session.payment_status === "paid";
  let status = paid ? "PAID" : session.status === "expired" ? "EXPIRED" : session.status === "complete" ? "PENDING" : "OPEN";
  if (intentId) {
    const intent = await stripe.paymentIntents.retrieve(intentId, { expand: ["latest_charge"] });
    if (intent.status === "requires_payment_method" || intent.status === "canceled") status = "FAILED";
    const charge = intent.latest_charge;
    if (charge && typeof charge !== "string" && charge.disputed) status = "REVIEW_REQUIRED";
  }
  const { error: syncError } = await db.rpc("sync_team_fee_checkout", {
    p_id: link.id, p_session_id: session.id, p_intent_id: intentId || null,
    p_paid: paid, p_refunded_cents: refunded, p_status: status,
  });
  if (syncError) throw new Error("Unable to update payment ledger");
}
