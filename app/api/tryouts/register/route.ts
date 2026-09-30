import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const allowedDivisions = new Set([
  "8U",
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

const maxImageSize = 5 * 1024 * 1024;

function getText(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

function getOptionalInteger(value: string) {
  if (!value) return null;

  const parsed = Number.parseInt(value.replace(/[^\d]/g, ""), 10);

  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: Request) {
  try {
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

    const firstName = getText(form, "Athlete First Name");
    const lastName = getText(form, "Athlete Last Name");
    const dateOfBirth = getText(form, "Date of Birth");
    const ageGroup = getText(form, "Tryout Division").toUpperCase();
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
        { error: "Headshot must be 5MB or smaller." },
        { status: 400 }
      );
    }

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

    const imageBytes = await headshot.arrayBuffer();

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
            getText(form, "Referral Source") || null,

          additional_comments:
            getText(form, "Additional Comments") || null,

          headshot_path: storagePath,

          information_confirmed: informationConfirmed,
          communication_consent: communicationConsent,
          roster_understanding: rosterUnderstanding,
        });

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

    const confirmationUrl = new URL("/tryouts/success", request.url);

    confirmationUrl.searchParams.set("id", tryoutId);
    confirmationUrl.searchParams.set(
      "athlete",
      `${firstName} ${lastName}`
    );
    confirmationUrl.searchParams.set("division", ageGroup);

    return NextResponse.redirect(confirmationUrl, 303);
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
