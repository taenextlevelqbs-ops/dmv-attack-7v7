import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as serverClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/admin/api";
import { draftTeams } from "@/lib/tryout-draft-teams";

const reply = (body: unknown, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "private, no-store" },
});

async function access() {
  const auth = await serverClient();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { error: reply({ error: "Sign in as a coach to open the draft board." }, 401) };
  const { data: profile } = await auth.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) {
    return { error: reply({ error: "Coach access required." }, 403) };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return { error: reply({ error: "Draft board unavailable." }, 503) };
  return { db: createClient(url, key, { auth: { persistSession: false } }) };
}

export async function GET() {
  const { db, error } = await access();
  if (!db) return error ?? reply({error:"Draft board unavailable."},503);
  const [players, placements, attendance, guests] = await Promise.all([
    db.from("tryout_submissions").select("id,athlete_first_name,athlete_last_name,age_group,primary_position,secondary_position,school,status,tryout_id").in("age_group", ["12U","14U","15U","18U"]).order("athlete_last_name").order("athlete_first_name"),
    db.from("tryout_draft_placements").select("registration_id,division,team"),
    db.from("tryout_attendance").select("registration_id,checked_in"),
    db.from("tryout_draft_guests").select("id,team,name").order("name"),
  ]);
  if (players.error || placements.error || attendance.error || guests.error) return reply({ error: "Couldn’t load the draft board." }, 503);
  const arrived = new Map(attendance.data.map(row => [row.registration_id, row.checked_in]));
  const pool = players.data.map(({ status, ...player }) => ({
    ...player, checked_in: arrived.get(player.id) ?? (status === "CHECKED_IN"),
  }));
  const playerIds = new Set(pool.map(player => player.id));
  return reply({ players: pool, guests:guests.data, placements: placements.data.filter(row => playerIds.has(row.registration_id)) });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Request origin rejected." }, 403);
  const { db, error } = await access();
  if (!db) return error ?? reply({error:"Draft board unavailable."},503);
  const body = await request.json().catch(() => null);
  const team = draftTeams.find(team => team.id === body?.team);
  if (team && body?.action === "addGuest") {
    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";
    if (!name || name.length > 100) return reply({error:"Enter a player name up to 100 characters."},400);
    const {error} = await db.from("tryout_draft_guests").insert({team:team.id,name});
    if (error?.code === "23505") return reply({error:"That name is already on this draft team."},409);
    return error ? reply({error:"Couldn’t add the player."},503) : reply({saved:true});
  }
  if (team && body?.action === "removeGuest" && typeof body.id === "string" && /^[0-9a-f-]{36}$/i.test(body.id)) {
    const {error} = await db.from("tryout_draft_guests").delete().eq("team",team.id).eq("id",body.id);
    return error ? reply({error:"Couldn’t remove the player."},503) : reply({saved:true});
  }
  const id = body?.registrationId;
  if (!team || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id) || typeof body?.remove !== "boolean") {
    return reply({ error: "Choose a player and draft team." }, 400);
  }
  const { data: player, error: lookupError } = await db.from("tryout_submissions").select("id").eq("id", id)
    .in("age_group", ["12U","14U","15U","18U"]).maybeSingle();
  if (lookupError) return reply({error:"Couldn’t look up the player."},503);
  if (!player) return reply({error:"Player not found."},404);
  const table = db.from("tryout_draft_placements");
  const result = body.remove
    ? await table.delete().eq("registration_id", id).eq("division", team.division).eq("team", team.id)
    : await table.upsert({ registration_id: id, division: team.division, team: team.id }, { onConflict: "registration_id,division" });
  return result.error ? reply({ error: "Couldn’t save the draft change." }, 503) : reply({ saved: true });
}
