import { createHash } from "node:crypto";
import { validBirthDate, imageMatchesType } from "@/lib/tryout-validation.mjs";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedDivisions = new Set([
  "10U",
  "12U",
  "14U",
  "15U",
  "18U",
]);

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const maxImageSize = 4 * 1024 * 1024;

function getText(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalInteger(value: string) {
  if (!value) return null;

  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: Request) {
  try {
    const declaredSize=Number(request.headers.get("content-length")||0);
    if(declaredSize>4500000)return NextResponse.json({error:"Registration upload is too large. Use a headshot under 4MB."},{status:413});
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecret = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecret) {
      console.error("Missing Supabase server environment variables.");

      return NextResponse.json(
        { error: "Server configuration is incomplete." },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      supabaseSecret,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const form = await request.formData();

    // Only a private, live, unredeemed link enables the no-tryout registration path.
    const invitationToken = getText(form, "Direct Invitation Token");
    let invitationHash: string | null = null;
    let invitedDivision: string | null = null;
    if (invitationToken) {
      if (!/^[A-Za-z0-9_-]{40,60}$/.test(invitationToken)) return NextResponse.json({error:"Invalid invitation"},{status:404});
      invitationHash=createHash("sha256").update(invitationToken).digest("hex");
      const {data:invitation,error:inviteError}=await supabase.from("direct_roster_invites")
        .select("age_group,expires_at,redeemed_at,revoked_at")
        .eq("token_hash",invitationHash).maybeSingle();
      if(inviteError||!invitation||invitation.redeemed_at||invitation.revoked_at||Date.parse(invitation.expires_at)<=Date.now())
        return NextResponse.json({error:"This invitation is no longer valid. Contact DMV Attack for a new private link."},{status:404});
      invitedDivision=invitation.age_group;
    }

    const firstName = getText(form, "Athlete First Name");
    const lastName = getText(form, "Athlete Last Name");
    const dateOfBirth = getText(form, "Date of Birth");
    const ageGroup = getText(form, "Tryout Division").toUpperCase();
    if (invitedDivision && ageGroup !== invitedDivision) return NextResponse.json({error:"Invitation division mismatch"},{status:400});
    const school = getText(form, "School");
    const primaryPosition = getText(form, "Primary Position");

    const parentName = getText(form, "Parent Guardian Name");
    const parentEmail = getText(form, "Parent Email").toLowerCase();
    const parentPhone = getText(form, "Parent Phone");

    const emergencyName = getText(form, "Emergency Contact");
    const emergencyPhone = getText(form, "Emergency Phone");

    if (
      !firstName ||
      !lastName ||
      !dateOfBirth ||
      !allowedDivisions.has(ageGroup) ||
      !school ||
      !primaryPosition ||
      !parentName ||
      !parentEmail ||
      !parentPhone ||
      !emergencyName ||
      !emergencyPhone
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required registration fields.",
        },
        { status: 400 }
      );
    }

    const today = new Intl.DateTimeFormat("en-CA", {timeZone:"America/New_York"}).format(new Date());
    if (!validBirthDate(dateOfBirth, today)) return NextResponse.json({error:"Please enter a valid athlete date of birth in the past."}, {status:400});
    for (const [key,value] of form.entries()) {
      if (typeof value === "string" && value.length > 5000) return NextResponse.json({error:`${key} is too long. Please shorten it.`}, {status:400});
    }
    const emailIsValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail);

    if (!emailIsValid) {
      return NextResponse.json(
        { error: "Please enter a valid parent email address." },
        { status: 400 }
      );
    }

    const informationConfirmed =
      form.get("Information Confirmation") === "on";

    const communicationConsent =
      form.get("Tryout Communication Consent") === "on";

    const rosterUnderstanding =
      form.get("Roster Understanding") === "on";

    if (
      !informationConfirmed ||
      !communicationConsent ||
      !rosterUnderstanding
    ) {
      return NextResponse.json(
        {
          error:
            "All registration confirmations are required.",
        },
        { status: 400 }
      );
    }

    const headshot = form.get("Athlete Headshot");

    if (!(headshot instanceof File) || headshot.size === 0) {
      return NextResponse.json(
        { error: "An athlete headshot is required." },
        { status: 400 }
      );
    }

    if (!allowedImageTypes.has(headshot.type)) {
      return NextResponse.json(
        {
          error:
            "Headshot must be a JPG, PNG or WEBP image.",
        },
        { status: 400 }
      );
    }

    if (headshot.size > maxImageSize) {
      return NextResponse.json(
        { error: "Headshot must be 4MB or smaller." },
        { status: 400 }
      );
    }

    const imageBytes = await headshot.arrayBuffer();
    if (!imageMatchesType(new Uint8Array(imageBytes), headshot.type)) return NextResponse.json({error:"The uploaded file is not a valid JPG, PNG or WEBP image."},{status:400});

    const { data: generatedId, error: idError } =
      await supabase.rpc(
        "generate_public_tryout_id",
        {
          p_age_group: ageGroup,
        }
      );

    if (idError || !generatedId) {
      console.error("Tryout ID error:", idError);

      return NextResponse.json(
        {
          error:
            "Unable to generate the athlete tryout ID.",
        },
        { status: 500 }
      );
    }

    const tryoutId = String(generatedId);

    let extension = "jpg";

    if (headshot.type === "image/png") {
      extension = "png";
    }

    if (headshot.type === "image/webp") {
      extension = "webp";
    }

    const storagePath =
      `${ageGroup}/${tryoutId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("tryout-headshots")
        .upload(
          storagePath,
          imageBytes,
          {
            contentType: headshot.type,
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "Headshot upload error:",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "Unable to save the athlete headshot.",
        },
        { status: 500 }
      );
    }

    const previous7v7Value =
      getText(form, "Previous 7v7 Experience");

    const previous7v7 =
      previous7v7Value === "Yes"
        ? true
        : previous7v7Value === "No"
          ? false
          : null;

    const { error: insertError } =
      await supabase
        .from("tryout_submissions")
        .insert({
          tryout_id: tryoutId,

          athlete_first_name: firstName,
          athlete_last_name: lastName,
          date_of_birth: dateOfBirth,

          current_age: getOptionalInteger(
            getText(form, "Current Age")
          ),

          age_group: ageGroup,

          graduation_year: getOptionalInteger(
            getText(form, "Graduation Year")
          ),

          school,

          grade:
            getText(form, "Grade") || null,

          height:
            getText(form, "Height") || null,

          weight:
            getText(form, "Weight") || null,

          primary_position: primaryPosition,

          secondary_position:
            getText(form, "Secondary Position") || null,

          current_team:
            getText(form, "Current Team") || null,

          years_playing: getOptionalInteger(
            getText(form, "Years Playing Football")
          ),

          previous_7v7: previous7v7,

          previous_7v7_organization:
            getText(
              form,
              "Previous 7v7 Organization"
            ) || null,

          highlight_url:
            getText(form, "Highlight Link") || null,

          athlete_social:
            getText(form, "Athlete Social Media") || null,

          football_background:
            getText(form, "Football Background") || null,

          parent_guardian_name: parentName,

          relationship_to_athlete:
            getText(
              form,
              "Relationship To Athlete"
            ) || null,

          parent_email: parentEmail,
          parent_phone: parentPhone,

          city:
            getText(form, "City") || null,

          state:
            getText(form, "State") || null,

          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,

          medical_information:
            getText(form, "Medical Information") || null,

          referral_source:
            invitationHash ? "Direct Invitation" : (getText(form, "Referral Source") || null),

          additional_comments:
            getText(form, "Additional Comments") || null,

          headshot_path: storagePath,

          information_confirmed: informationConfirmed,
          communication_consent: communicationConsent,
          roster_understanding: rosterUnderstanding,
        });

    if (insertError?.code === "23505") {
      await supabase.storage.from("tryout-headshots").remove([storagePath]);
      return NextResponse.json(
        { error: "This athlete is already registered. Please contact DMV Attack if you need to update their registration." },
        { status: 409 }
      );
    }

    if (insertError) {
      console.error(
        "Registration insert error:",
        insertError
      );

      await supabase.storage
        .from("tryout-headshots")
        .remove([storagePath]);

      return NextResponse.json(
        {
          error:
            "Unable to complete the tryout registration.",
        },
        { status: 500 }
      );
    }

    if(invitationHash){
      // Consume a single-use link only after a valid submission is saved.
      const {data:created,error:createdError}=await supabase.from("tryout_submissions").select("id").eq("tryout_id",tryoutId).single();
      if(createdError || !created){
        console.error("Direct invitation registration lookup failed",createdError);
        return NextResponse.json({error:"Player information saved, but invitation confirmation requires staff review. Please contact DMV Attack."},{status:500});
      }
      const {data:claimed,error:claimError}=await supabase.rpc("redeem_direct_roster_invite",{p_hash:invitationHash,p_submission_id:created.id});
      if(claimError || !claimed){
        // If another submission consumed this link concurrently, remove the unclaimed record and photo.
        await supabase.from("tryout_submissions").delete().eq("id",created.id);
        await supabase.storage.from("tryout-headshots").remove([storagePath]);
        return NextResponse.json({error:"This invitation has already been used. Please contact DMV Attack."},{status:409});
      }
    }

    const confirmationUrl = new URL(invitationHash ? "/invite/success" : "/tryouts/success", request.url);

    if (!invitationHash) confirmationUrl.searchParams.set("id", tryoutId);
    // Modern clients retain only confirmation details in tab-scoped session storage.
    // Native form fallback keeps the public Tryout ID/division, never athlete names.
    if(request.headers.get("accept")?.includes("application/json")) {
      return NextResponse.json({confirmation:{id:tryoutId,athlete:`${firstName} ${lastName}`,division:ageGroup},direct_invite:!!invitationHash},{headers:{"Cache-Control":"private, no-store"}});
    }
    if (!invitationHash) confirmationUrl.searchParams.set("division", ageGroup);

    return new NextResponse(null, {status:303,headers:{Location:confirmationUrl.pathname+confirmationUrl.search}});
  } catch (error) {
    console.error(
      "Tryout registration error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while submitting the registration.",
      },
      { status: 500 }
    );
  }
}
