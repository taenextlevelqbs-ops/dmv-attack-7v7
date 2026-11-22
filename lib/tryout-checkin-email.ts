import { createHash } from "node:crypto";

export async function sendTryoutCheckinEmail(parentEmail: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("Tryout check-in email is missing its provider configuration.");
    return;
  }
  const recipient = parentEmail.trim().toLowerCase();
  const idempotencyKey = "nov22-checkin-" + createHash("sha256").update(recipient).digest("hex");
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      signal: AbortSignal.timeout(8000),
      body: JSON.stringify({
        from: "DMV Attack 7v7 <notifications@dmvattack.com>",
        to: [recipient],
        reply_to: "dmvattack@gmail.com",
        subject: "DMV Attack 15U/18U tryouts: check-in opens at 2:15 PM Eastern",
        text: [
          "Your DMV Attack tryout registration is saved.",
          "Sunday, November 22: tryouts run 3:00–4:30 PM Eastern at Independence High School, 23115 Learning Circle, Ashburn, VA 20148.",
          "Once you arrive, check in between 2:15 and 5:00 PM Eastern at https://www.dmvattack.com/tryouts/check-in. Use the parent email you registered with and your athlete’s date of birth.",
          "If you need help, see staff at the check-in desk. Stop there after checking in for a sticker number and any payment verification. If you already paid, hold off on paying again.",
          "Coach Tae\nDMV Attack",
        ].join("\n\n"),
        tags: [{ name: "event", value: "high-school-2026-11-22" }],
      }),
    });
    if (!response.ok) console.error("Tryout check-in email returned provider status", response.status);
  } catch {
    console.error("Tryout check-in email could not reach its provider.");
  }
}
