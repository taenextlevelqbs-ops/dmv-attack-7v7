import fs from "node:fs";
import path from "node:path";
import { ownerApi, privateHeaders } from "@/lib/admin/api";
export async function GET() {
  try {
    if (!(await ownerApi())) return Response.json({ error: "Owner access required" }, { status: 403, headers: privateHeaders });
    return new Response(fs.readFileSync(path.join(process.cwd(), "supabase/migrations/20261021_stripe_checkout.sql"), "utf8"), {
      headers: { ...privateHeaders, "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": 'attachment; filename="dmv-stripe-setup.sql"' },
    });
  } catch { return Response.json({ error: "Unable to download Stripe setup" }, { status: 503, headers: privateHeaders }); }
}
