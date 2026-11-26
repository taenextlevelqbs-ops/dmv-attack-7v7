import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as serverClient } from "@/lib/supabase/server";
import { sameOrigin } from "@/lib/admin/api";
import { filmDivisions } from "@/lib/tryout-film";
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

export async function GET(request: Request) {
  const { db, error } = await access();
  if (!db) return error ?? reply({error:"Draft board unavailable."},503);
  if (new URL(request.url).searchParams.has("film")) {
    const pageSize = 100;
    const submissions = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await db.from("tryout_film_submissions")
        .select("id,registration_id,athlete_name,parent_email,age_group,school,primary_position,secondary_position,film_url,submitted_at")
        .order("submitted_at", { ascending: false }).order("id").range(offset, offset + pageSize - 1);
      if (error) return reply({ error: "Couldn’t load film submissions." }, 503);
      submissions.push(...data);
      if (data.length < pageSize) return reply({ submissions });
    }
  }
  const [players, placements, attendance, guests] = await Promise.all([
    db.from("tryout_submissions").select("id,athlete_first_name,athlete_last_name,age_group,primary_position,secondary_position,school,status,tryout_id,headshot_path,parent_email").in("age_group", [...filmDivisions]).order("athlete_last_name").order("athlete_first_name"),
    db.from("tryout_draft_placements").select("registration_id,division,team,parent_email"),
    db.from("tryout_attendance").select("registration_id,checked_in"),
    db.from("tryout_draft_guests").select("id,team,name,parent_email").order("name"),
  ]);
  if (players.error || placements.error || attendance.error || guests.error) return reply({ error: "Couldn’t load the draft board." }, 503);
  const arrived = new Map(attendance.data.map(row => [row.registration_id, row.checked_in]));
  const photoPaths = [...new Set(players.data.flatMap(row => row.headshot_path ? [row.headshot_path] : []))];
  const signedPhotos = photoPaths.length
    ? (await db.storage.from("tryout-headshots").createSignedUrls(photoPaths, 60 * 60)).data
    : [];
  const photos = new Map(signedPhotos?.map(photo => [photo.path, photo.signedUrl]));
  const registrationEmails = new Map(players.data.map(row => [row.id, row.parent_email]));
  const pool = players.data.map(({ status, headshot_path, parent_email: _parentEmail, ...player }) => ({
    ...player, headshot_url: photos.get(headshot_path) || null,
    checked_in: arrived.get(player.id) ?? (status === "CHECKED_IN"),
  }));
  const playerIds = new Set(pool.map(player => player.id));
  return reply({ players: pool, guests:guests.data, placements: placements.data.filter(row => playerIds.has(row.registration_id)).map(row => ({
    ...row, registration_email: registrationEmails.get(row.registration_id) || null,
  })) });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Request origin rejected." }, 403);
  const { db, error } = await access();
  if (!db) return error ?? reply({error:"Draft board unavailable."},503);
  const body = await request.json().catch(() => null);
  const team = draftTeams.find(team => team.id === body?.team);
  if (body?.action === "addFilmPlayer") {
    if (!team || typeof body.id !== "string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(body.id)) {
      return reply({ error: "Choose a draft team and film submission." }, 400);
    }
    const { data: film, error } = await db.from("tryout_film_submissions")
      .select("registration_id,athlete_name,age_group,parent_email").eq("id", body.id).maybeSingle();
    if (error) return reply({ error: "Couldn’t load the film submission." }, 503);
    if (!film) return reply({ error: "Film submission not found." }, 404);
    if (film.age_group !== team.division) return reply({ error: "Choose a team in the athlete’s age group." }, 400);
    if (film.registration_id) {
      const { error } = await db.from("tryout_draft_placements")
        .upsert({ registration_id: film.registration_id, division: team.division, team: team.id },
          { onConflict: "registration_id,division", ignoreDuplicates: true });
      return error ? reply({ error: "Couldn’t add this athlete to the draft." }, 503) : reply({ saved: true });
    }
    const { error: insertError } = await db.from("tryout_draft_guests")
      .insert({ team: team.id, name: film.athlete_name, parent_email: film.parent_email });
    if (insertError && insertError.code !== "23505") return reply({ error: "Couldn’t add this athlete to the draft." }, 503);
    return reply({ saved: true });
  }
  if (body?.action === "saveParentEmail") {
    const { id, kind, email } = body;
    if (!team || typeof id !== "string" || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)
      || (kind !== "guest" && kind !== "registered") || typeof email !== "string") {
      return reply({ error: "Choose a player on this draft roster." }, 400);
    }
    const address = email.trim();
    if (address.length > 254 || (address && !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(address))) {
      return reply({ error: "Enter a valid parent email address." }, 400);
    }
    const update = { parent_email: address || null };
    const result = kind === "guest"
      ? await db.from("tryout_draft_guests").update(update).eq("team", team.id).eq("id", id).select("id").maybeSingle()
      : await db.from("tryout_draft_placements").update(update).eq("team", team.id)
        .eq("division", team.division).eq("registration_id", id).select("registration_id").maybeSingle();
    if (result.error) return reply({ error: "Couldn’t save the parent email." }, 503);
    if (!result.data) return reply({ error: "This player is no longer on the selected draft roster." }, 404);
    return reply({ saved: true });
  }
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
    .in("age_group", [...filmDivisions]).maybeSingle();
  if (lookupError) return reply({error:"Couldn’t look up the player."},503);
  if (!player) return reply({error:"Player not found."},404);
  const table = db.from("tryout_draft_placements");
  const result = body.remove
    ? await table.delete().eq("registration_id", id).eq("division", team.division).eq("team", team.id)
    : await table.upsert({ registration_id: id, division: team.division, team: team.id }, { onConflict: "registration_id,division" });
  return result.error ? reply({ error: "Couldn’t save the draft change." }, 503) : reply({ saved: true });
}
