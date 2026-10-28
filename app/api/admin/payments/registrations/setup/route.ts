import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ownerApi, privateHeaders } from "@/lib/admin/api";
export async function GET() {
  const auth = await ownerApi();
  if (!auth)
    return Response.json(
      { error: "Owner access required" },
      { status: 403, headers: privateHeaders },
    );
  const sql = await readFile(
    join(process.cwd(), "supabase/migrations/20261028_registration_stripe.sql"),
    "utf8",
  );
  return new Response(sql, {
    headers: {
      ...privateHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="20261028_registration_stripe.sql"',
    },
  });
}
