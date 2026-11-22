export function reportedPaymentLabel(method?: string | null) {
  switch (method) {
    case "stripe": return "Stripe";
    case "venmo": return "Venmo";
    case "not_paid": return "Haven’t paid yet";
    case "unsure": return "Not sure";
    default: return "Not reported";
  }
}
