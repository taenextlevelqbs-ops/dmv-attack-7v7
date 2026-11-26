import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/admin/api";
import { filmDivisions, filmPositions, safeFilmUrl } from "@/lib/tryout-film";

const reply = (body: object, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "private, no-store" },
});

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Open the film form on DMVAttack.com and try again." }, 403);
  const raw = await request.text();
  if (raw.length > 8192) return reply({ error: "The submission is too long." }, 413);
  let values: Record<string, unknown>;
  try {
    values = JSON.parse(raw);
    if (!values || typeof values !== "object" || Array.isArray(values)) throw new Error();
  } catch {
    return reply({ error: "Check the form and try again." }, 400);
  }
  function field(key: string) {
    const value = values[key];
    return typeof value === "string" ? value.trim() : "";
  }
  if (field("website")) return reply({ saved: true });

  const mode = field("mode");
  const email = field("parentEmail").toLowerCase();
  const film = safeFilmUrl(field("filmUrl"));
  if (!film) return reply({ error: "Enter a shareable HTTPS link from Hudl, YouTube, or Vimeo." }, 400);
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply({ error: "Enter a valid parent or guardian email." }, 400);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  const unavailable = () => reply({ error: "Film submissions are temporarily unavailable. Please try again." }, 503);
  if (!url || !key) return unavailable();
  const db = createClient(url, key, { auth: { persistSession: false } });

  let registrationId: string | null = null;
  let name = field("name").replace(/\s+/g, " ");
  let division = field("division");
  let school: string | null = field("school") || null;
  let primary: string | null = field("primaryPosition") || null;
  let secondary: string | null = field("secondaryPosition") || null;
  if (mode === "registered") {
    const dob = field("dob");
    const date = new Date(dob + "T00:00:00Z");
    const tryoutId = field("tryoutId").toUpperCase();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== dob
      || (tryoutId && !/^[A-Z0-9-]{3,40}$/.test(tryoutId))) {
      return reply({ error: "Enter the athlete’s date of birth and check the Tryout ID if you entered one." }, 400);
    }
    const lookup = db.from("tryout_submissions")
      .select("id,athlete_first_name,athlete_last_name,parent_email,age_group,school,primary_position,secondary_position")
      .eq("date_of_birth", dob).in("age_group", [...filmDivisions])
      .ilike("parent_email", email.replace(/[\\%_*]/g, "\\$&")).limit(2);
    const { data, error } = await (tryoutId ? lookup.eq("tryout_id", tryoutId) : lookup);
    if (error) return unavailable();
    if (data.length !== 1 || data[0].parent_email?.trim().toLowerCase() !== email) {
      return reply({ error: "Check the registration email and birthday. Add the Tryout ID if you have it, or use New player to send the film for review." }, 400);
    }
    const player = data[0];
    registrationId = player.id;
    name = [player.athlete_first_name, player.athlete_last_name].filter(Boolean).join(" ");
    division = player.age_group;
    school = player.school;
    primary = player.primary_position;
    secondary = player.secondary_position;
  } else if (mode !== "new" || name.length < 2 || name.length > 100 || !school || school.length > 120
    || !filmDivisions.some(option => option === division) || !filmPositions.some(option => option === primary)
    || (secondary !== null && !filmPositions.some(option => option === secondary))) {
    return reply({ error: "Enter the athlete’s name, age group, school, and position." }, 400);
  }

  const submissionKey = createHash("sha256")
    .update(JSON.stringify([registrationId || [email, name.toLowerCase(), division], film])).digest("hex");
  const { error } = await db.from("tryout_film_submissions").insert({
    registration_id: registrationId, athlete_name: name, parent_email: email, age_group: division,
    school, primary_position: primary, secondary_position: secondary, film_url: film, submission_key: submissionKey,
  });
  if (error && error.code !== "23505") return unavailable();
  return reply({ saved: true });
}
