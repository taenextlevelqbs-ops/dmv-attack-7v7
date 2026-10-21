import { allRows } from "@/lib/admin/pagination";
import { NextResponse } from "next/server";
import { ownerApi, sameOrigin, privateHeaders } from "@/lib/admin/api";
import { moneyToCents, summarizeAccount } from "@/lib/finance/money.mjs";
const validDate = (v: unknown): v is string =>
  typeof v === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v + "T12:00Z")) &&
  new Date(v + "T12:00Z").toISOString().slice(0, 10) === v;
const uuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
function response(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privateHeaders });
}
function failure(error: { code?: string } | unknown) {
  const code =
    error && typeof error === "object" && "code" in error ? error.code : null;
  console.error("Team fee operation failed", { code });
  return response(
    {
      error:
        code === "42P01" || code === "PGRST205" || code === "PGRST202"
          ? "Team fee tracking needs its database setup. Existing tryout payments are unchanged."
          : "Unable to load or save team fee records. Please retry.",
      setup_required: ["42P01", "PGRST205", "PGRST202"].includes(String(code)),
    },
    503,
  );
}
export async function GET() {
  try {
    const auth = await ownerApi();
    if (!auth) return response({ error: "Owner access required" }, 403);
    const [
      accounts,
      transactions,
      registrations,
      teams,
      settings,
      adjustments,
    ] = await Promise.all([
      allRows((start, end) =>
        auth.admin
          .from("team_fee_accounts")
          .select("*")
          .order("created_at", { ascending: false })
          .range(start, end),
      ),
      allRows((start, end) =>
        auth.admin
          .from("team_fee_transactions")
          .select("*")
          .order("recorded_at", { ascending: false })
          .range(start, end),
      ),
      allRows((start, end) =>
        auth.admin
          .from("tryout_submissions")
          .select(
            "id,tryout_id,athlete_first_name,athlete_last_name,age_group,parent_guardian_name,parent_email",
          )
          .order("athlete_last_name")
          .range(start, end),
      ),
      allRows((start, end) =>
        auth.admin
          .from("teams")
          .select("id,name,age_group,season,active")
          .order("name")
          .range(start, end),
      ),
      auth.admin
        .from("team_fee_settings")
        .select("default_fee_cents")
        .eq("id", "default")
        .maybeSingle(),
      allRows((start, end) =>
        auth.admin
          .from("team_fee_adjustments")
          .select("*")
          .order("recorded_at", { ascending: false })
          .range(start, end),
      ),
    ]);
    const err = [
      accounts,
      transactions,
      registrations,
      teams,
      settings,
      adjustments,
    ].find((r) => r.error)?.error;
    if (err) return failure(err);
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
    }).format(new Date());
    // This amount exists only in the authenticated server response, never public page props.
    const configured = settings.data?.default_fee_cents ?? null;
    return response({
      accounts: (accounts.data || []).map((a) =>
        summarizeAccount(a, transactions.data || [], today),
      ),
      transactions: transactions.data || [],
      adjustments: adjustments.data || [],
      registrations: registrations.data || [],
      teams: teams.data || [],
      default_fee_cents: configured,
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(request: Request) {
  if (!sameOrigin(request))
    return response({ error: "Request origin rejected" }, 403);
  try {
    const auth = await ownerApi();
    if (!auth) return response({ error: "Owner access required" }, 403);
    const body = await request.json().catch(() => null);
    if (!body) return response({ error: "Invalid request" }, 400);
    if (body.action === "set_default_fee") {
      let fee;
      try {
        fee = moneyToCents(body.fee);
      } catch (e) {
        return response({ error: (e as Error).message }, 400);
      }
      const { error } = await auth.admin.from("team_fee_settings").upsert(
        {
          id: "default",
          default_fee_cents: fee,
          updated_by: auth.user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );
      if (error) return failure(error);
      return response({ success: true });
    }
    if (body.action === "create_account") {
      if (
        !uuid(body.registration_id) ||
        !uuid(body.team_id) ||
        !/^20\d{2}$/.test(body.season) ||
        typeof body.discount_note !== "string" ||
        body.discount_note.length > 500
      )
        return response({ error: "Select an athlete, team and season." }, 400);
      let fee, discount;
      try {
        fee = moneyToCents(body.fee);
        discount = moneyToCents(body.discount || "0");
      } catch (e) {
        return response({ error: (e as Error).message }, 400);
      }
      if (discount > fee || (discount > 0 && !body.discount_note.trim()))
        return response(
          { error: "Discount needs a reason and cannot exceed the fee." },
          400,
        );
      if (body.due_date && !validDate(body.due_date))
        return response({ error: "Enter a valid due date." }, 400);
      const { data: team, error: teamError } = await auth.admin
        .from("teams")
        .select("id,season,active,age_group")
        .eq("id", body.team_id)
        .maybeSingle();
      if (teamError) return failure(teamError);
      if (!team?.active || String(team.season) !== body.season)
        return response(
          { error: "The selected team is not active in that season." },
          400,
        );
      const { data: athlete, error: athleteError } = await auth.admin
        .from("tryout_submissions")
        .select("id,age_group")
        .eq("id", body.registration_id)
        .maybeSingle();
      if (athleteError) return failure(athleteError);
      if (!athlete)
        return response({ error: "Athlete registration not found." }, 404);
      if (athlete.age_group !== team.age_group)
        return response(
          { error: "Athlete division must match the selected team." },
          400,
        );
      const { error } = await auth.admin.from("team_fee_accounts").insert({
        registration_id: body.registration_id,
        team_id: body.team_id,
        season: body.season,
        fee_cents: fee,
        discount_cents: discount,
        discount_note: body.discount_note.trim(),
        due_date: body.due_date || null,
        created_by: auth.user.id,
      });
      if (error?.code === "23505")
        return response(
          {
            error:
              "This athlete already has a fee account for that team and season.",
          },
          409,
        );
      if (error) return failure(error);
      return response({ success: true }, 201);
    }
    if (body.action === "adjust_account") {
      if (
        !uuid(body.account_id) ||
        !uuid(body.request_id) ||
        typeof body.reason !== "string" ||
        !body.reason.trim() ||
        body.reason.length > 500 ||
        typeof body.discount_note !== "string" ||
        body.discount_note.length > 500 ||
        (body.due_date && !validDate(body.due_date))
      )
        return response(
          {
            error:
              "A valid account, due date and adjustment reason are required.",
          },
          400,
        );
      let fee, discount;
      try {
        fee = moneyToCents(body.fee);
        discount = moneyToCents(body.discount || "0");
      } catch (e) {
        return response({ error: (e as Error).message }, 400);
      }
      if (discount > fee || (discount > 0 && !body.discount_note.trim()))
        return response(
          { error: "Discount needs a reason and cannot exceed the fee." },
          400,
        );
      const { error } = await auth.admin.rpc("adjust_team_fee_account", {
        p_account_id: body.account_id,
        p_request_id: body.request_id,
        p_fee_cents: fee,
        p_discount_cents: discount,
        p_discount_note: body.discount_note.trim(),
        p_due_date: body.due_date || null,
        p_reason: body.reason.trim(),
        p_recorded_by: auth.user.id,
      });
      if (error) return failure(error);
      return response({ success: true });
    }
    if (body.action === "record_transaction") {
      if (
        !uuid(body.account_id) ||
        !uuid(body.request_id) ||
        !["PAYMENT", "REFUND"].includes(body.kind) ||
        !["VENMO", "CASH", "CHECK", "BANK", "OTHER"].includes(body.method) ||
        typeof body.reference !== "string" ||
        !body.reference.trim() ||
        body.reference.length > 200 ||
        typeof body.note !== "string" ||
        body.note.length > 500 ||
        body.verified !== true
      )
        return response(
          { error: "Verify the payment and include a payment reference." },
          400,
        );
      let amount;
      try {
        amount = moneyToCents(body.amount);
      } catch (e) {
        return response({ error: (e as Error).message }, 400);
      }
      if (
        !amount ||
        !validDate(body.paid_on) ||
        body.paid_on >
          new Intl.DateTimeFormat("en-CA", {
            timeZone: "America/New_York",
          }).format(new Date())
      )
        return response(
          { error: "Enter a positive amount and valid payment date." },
          400,
        );
      const { error, data } = await auth.admin.rpc(
        "record_team_fee_transaction",
        {
          p_account_id: body.account_id,
          p_request_id: body.request_id,
          p_kind: body.kind,
          p_amount_cents: amount,
          p_method: body.method,
          p_reference: body.reference.trim(),
          p_note: body.note.trim(),
          p_paid_on: body.paid_on,
          p_recorded_by: auth.user.id,
        },
      );
      if (error?.code === "22023")
        return response(
          {
            error:
              "Check the payment date, refund amount and reference. Refunds cannot exceed recorded payments; retries must keep the same details.",
          },
          400,
        );
      if (error?.code === "23505")
        return response(
          {
            error:
              "That payment reference is already recorded. Review the transaction history before adding it again.",
          },
          409,
        );
      if (error?.code === "P0002")
        return response({ error: "Fee account not found." }, 404);
      if (error) return failure(error);
      return response({ success: true, id: data });
    }
    return response({ error: "Unknown operation" }, 400);
  } catch (error) {
    return failure(error);
  }
}
