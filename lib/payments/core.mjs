export const paymentAmounts = { TRYOUT: 2000, TEAM: 75000 };
export function validatePrice(price, purpose, liveMode) {
  if (
    !price ||
    !paymentAmounts[purpose] ||
    !price.active ||
    price.currency !== "usd" ||
    price.unit_amount !== paymentAmounts[purpose] ||
    price.type !== "one_time" ||
    price.livemode !== liveMode ||
    (price.product &&
      typeof price.product !== "string" &&
      !price.product.active)
  )
    throw new Error(
      "Stripe price configuration does not match the required payment",
    );
}
// Always reconcile current provider state; the arrival order of events is not trustworthy.
export async function synchronizeRegistration(stripe, db, sessionId, liveMode) {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const id = session.metadata?.registration_attempt_id;
  if (!id) return false;
  const { data: attempt, error } = await db
    .from("registration_payment_attempts")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !attempt) throw new Error("Payment attempt unavailable");
  const { data: order, error: orderError } = await db
    .from("registration_payment_orders")
    .select("*")
    .eq("id", attempt.order_id)
    .single();
  if (orderError || !order) throw new Error("Payment order unavailable");
  if (
    (attempt.session_id && attempt.session_id !== session.id) ||
    session.mode !== "payment" ||
    session.currency !== "usd" ||
    session.amount_total !== order.amount_cents ||
    order.amount_cents !== paymentAmounts[order.purpose] ||
    session.client_reference_id !== order.registration_id ||
    session.metadata.registration_order_id !== order.id ||
    session.metadata.payment_purpose !== order.purpose ||
    session.livemode !== liveMode
  )
    throw new Error("Payment verification failed");
  const intentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;
  const paid = session.payment_status === "paid";
  let status = paid
    ? "PAID"
    : session.status === "expired"
      ? "EXPIRED"
      : session.status === "complete"
        ? "PENDING"
        : "OPEN";
  let refunded = 0;
  let paidAt = null;
  if (intentId) {
    const intent = await stripe.paymentIntents.retrieve(intentId, {
      expand: ["latest_charge"],
    });
    if (
      intent.currency !== "usd" ||
      intent.amount !== order.amount_cents ||
      (paid &&
        (intent.status !== "succeeded" ||
          intent.amount_received !== order.amount_cents))
    )
      throw new Error("Payment intent verification failed");
    // Open card checkouts remain reusable after a declined card; delayed failures may retry a new session.
    if (
      session.status !== "open" &&
      ["requires_payment_method", "canceled"].includes(intent.status)
    )
      status = "FAILED";
    const charge = intent.latest_charge;
    if (paid)
      paidAt = new Date(
        (charge && typeof charge !== "string"
          ? charge.created
          : intent.created) * 1000,
      ).toISOString();
    if (charge && typeof charge !== "string" && charge.disputed)
      status = "REVIEW_REQUIRED";
    for await (const refund of stripe.refunds.list({
      payment_intent: intentId,
      limit: 100,
    })) {
      if (refund.status === "succeeded") refunded += refund.amount;
    }
  } else if (paid) throw new Error("Paid checkout has no payment intent");
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;
  const { error: syncError } = await db.rpc("sync_registration_checkout", {
    p_attempt_id: attempt.id,
    p_session_id: session.id,
    p_intent_id: intentId || null,
    p_customer_id: customerId || null,
    p_paid: paid,
    p_refunded_cents: refunded,
    p_status: status,
    p_paid_at: paidAt,
  });
  if (syncError) throw new Error("Payment ledger write failed");
  return true;
}
export async function dispatchStripeEvent(stripe, event, sync) {
  if (event.type.startsWith("checkout.session.")) {
    await sync(event.data.object.id);
  } else if (
    event.type === "payment_intent.payment_failed" ||
    event.type.startsWith("charge.") ||
    event.type.startsWith("refund.")
  ) {
    const obj = event.data.object;
    const intent =
      event.type === "payment_intent.payment_failed"
        ? obj.id
        : typeof obj.payment_intent === "string"
          ? obj.payment_intent
          : obj.payment_intent?.id;
    if (intent)
      for await (const session of stripe.checkout.sessions.list({
        payment_intent: intent,
        limit: 100,
      }))
        await sync(session.id);
  }
}
export function checkoutParameters(
  order,
  attempt,
  parentEmail,
  priceId,
  origin,
) {
  const metadata = {
    registration_attempt_id: attempt.id,
    registration_order_id: order.id,
    payment_purpose: order.purpose,
    registration_id: order.registration_id,
  };
  const path =
    order.purpose === "TRYOUT" ? "/tryouts/payment" : "/portal/payments";
  return {
    mode: "payment",
    allowed_payment_method_types: ["card"],
    customer_creation: "always",
    customer_email: parentEmail,
    client_reference_id: order.registration_id,
    metadata,
    payment_intent_data: { metadata, receipt_email: parentEmail },
    line_items: [{ price: priceId, quantity: 1 }],
    expires_at: Math.floor(Date.parse(attempt.created_at) / 1000) + 1800,
    success_url: `${origin}${path}?registration=${order.registration_id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}${path}?registration=${order.registration_id}&canceled=1`,
  };
}
