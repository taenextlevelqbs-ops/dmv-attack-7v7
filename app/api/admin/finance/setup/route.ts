import fs from "node:fs";
import path from "node:path";
import { ownerApi, privateHeaders } from "@/lib/admin/api";
export async function GET() {
  try {
    if (!(await ownerApi()))
      return Response.json(
        { error: "Owner access required" },
        { status: 403, headers: privateHeaders },
      );
    const sql = fs.readFileSync(
      path.join(
        process.cwd(),
        "supabase/migrations/20261021_team_fee_ledger.sql",
      ),
      "utf8",
    );
    return new Response(sql, {
      headers: {
        ...privateHeaders,
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="dmv-team-fee-setup.sql"',
      },
    });
  } catch {
    return Response.json(
      { error: "Unable to download setup SQL" },
      { status: 503, headers: privateHeaders },
    );
  }
}
