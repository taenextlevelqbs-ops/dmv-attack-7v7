import DmvPageHeader from "@/components/dmv-page-header";

export const metadata = {
  title: "Tryout Registration | DMV Attack",
  description:
    "Register your athlete for upcoming DMV Attack 7v7 tryouts. 2027 DMV Attack 7v7 tryouts will be held at Independence High School in Ashburn, Virginia. Official tryout times will be announced soon.",
};

const divisions = ["8U", "10U", "12U", "14U", "15U", "18U"];

const positions = [
  "Quarterback",
  "Running Back",
  "Wide Receiver",
  "Tight End",
  "Defensive Back",
  "Linebacker",
  "Athlete / Multiple Positions",
];

const inputClass =
  "rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition placeholder:text-white/25 focus:border-lime-400";

const selectClass =
  "rounded-xl border border-white/10 bg-black px-4 py-4 text-white outline-none transition focus:border-lime-400";

const labelClass =
  "text-xs font-black uppercase tracking-[0.15em] text-white/55";

export default function TryoutsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <DmvPageHeader
        eyebrow="DMV Attack 7v7"
        title="Tryout Registration"
        description="Complete the registration form now for DMV Attack 7v7 tryouts at Independence High School in Ashburn, Virginia. Our staff will keep your family updated when official tryout times are announced."
      />

      <section className="border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Youth Tryout", "Sunday, November 8"],
              ["High School Tryout", "Sunday, November 22"],
              ["Location", "Independence High School • Ashburn, VA"],
            ].map(([title, value]) => (
              <div
                key={title}
                className="rounded-3xl border border-lime-400/20 bg-lime-400/[0.07] p-6"
              >
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                  {title}
                </div>

                <div className="mt-3 text-2xl font-black uppercase">
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                  November 8
                </div>
                <div className="mt-2 text-xl font-black uppercase">
                  8U • 10U • 12U • 14U
                </div>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  Youth divisions will try out first so younger teams can begin
                  evaluations and roster planning early.
                </p>
              </div>

              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                  November 22
                </div>
                <div className="mt-2 text-xl font-black uppercase">
                  15U • 18U
                </div>
                <p className="mt-3 text-sm leading-7 text-white/55">
                  High school divisions will try out later in November to allow
                  more athletes to complete their school football seasons.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-6">
              <p className="text-sm leading-7 text-white/60">
                Tryouts will be held at Independence High School in Ashburn, Virginia. Official times will be announced soon. A December
                makeup opportunity may also be added for high school athletes
                whose teams advance deep into the postseason. Registering now
                places your athlete on our tryout list and allows DMV Attack to
                send your family updated tryout information as details are
                finalized.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-10">
          <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
            Athlete Registration
          </div>

          <h2 className="mt-3 text-4xl font-black uppercase md:text-6xl">
            Tell Us About Your Athlete.
          </h2>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/55 md:text-base">
            Please provide as much information as possible. This helps the DMV
            Attack staff understand your athlete&apos;s age group, football
            background, positions and current experience before tryouts.
          </p>
        </div>

        <form
          action="/api/tryouts/register"
          method="POST"
          encType="multipart/form-data"
          className="space-y-10"
        >
          <input
            type="hidden"
            name="Form Type"
            value="DMV Attack Tryout Registration"
          />

          <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-6 md:p-9">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              01 • Athlete Information
            </div>

            <div className="mt-7 rounded-2xl border border-lime-400/20 bg-lime-400/[0.06] p-5 md:p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
                Athlete Headshot • Required
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                Upload a clear, recent photo of the athlete. This will appear on
                the athlete&apos;s tryout profile so our staff can quickly match
                names, evaluations and roster decisions to the correct player.
              </p>

              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/40 px-6 py-10 text-center transition hover:border-lime-400/60">
                <span className="text-sm font-black uppercase tracking-[0.15em] text-white">
                  Upload Athlete Headshot
                </span>

                <span className="mt-2 text-xs text-white/40">
                  JPG, PNG or WEBP • Maximum 5MB
                </span>

                <input
                  type="file"
                  name="Athlete Headshot"
                  accept="image/jpeg,image/png,image/webp"
                  required
                  className="mt-5 block w-full max-w-sm text-xs text-white/60 file:mr-4 file:rounded-full file:border-0 file:bg-lime-400 file:px-5 file:py-3 file:text-xs file:font-black file:uppercase file:text-black"
                />
              </label>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Athlete First Name *</span>
                <input
                  name="Athlete First Name"
                  required
                  className={inputClass}
                  placeholder="First name"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Athlete Last Name *</span>
                <input
                  name="Athlete Last Name"
                  required
                  className={inputClass}
                  placeholder="Last name"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Date of Birth *</span>
                <input
                  type="date"
                  name="Date of Birth"
                  required
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Current Age *</span>
                <input
                  type="number"
                  name="Current Age"
                  min="6"
                  max="19"
                  required
                  className={inputClass}
                  placeholder="Age"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Tryout Division *</span>
                <select
                  name="Tryout Division"
                  required
                  className={selectClass}
                >
                  <option value="">Select age group</option>
                  {divisions.map((division) => (
                    <option key={division} value={division}>
                      {division}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Graduation Year</span>
                <input
                  type="number"
                  name="Graduation Year"
                  min="2027"
                  max="2040"
                  className={inputClass}
                  placeholder="Example: 2030"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>School *</span>
                <input
                  name="School"
                  required
                  className={inputClass}
                  placeholder="Current school"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Grade *</span>
                <select name="Grade" required className={selectClass}>
                  <option value="">Select grade</option>
                  <option>2nd</option>
                  <option>3rd</option>
                  <option>4th</option>
                  <option>5th</option>
                  <option>6th</option>
                  <option>7th</option>
                  <option>8th</option>
                  <option>9th</option>
                  <option>10th</option>
                  <option>11th</option>
                  <option>12th</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Height</span>
                <input
                  name="Height"
                  className={inputClass}
                  placeholder={`Example: 5'10"`}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Weight</span>
                <input
                  name="Weight"
                  className={inputClass}
                  placeholder="Example: 165 lbs"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-6 md:p-9">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              02 • Football Information
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Primary Position *</span>
                <select
                  name="Primary Position"
                  required
                  className={selectClass}
                >
                  <option value="">Select position</option>
                  {positions.map((position) => (
                    <option key={position}>{position}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Secondary Position</span>
                <select name="Secondary Position" className={selectClass}>
                  <option value="">Select position</option>
                  {positions.map((position) => (
                    <option key={position}>{position}</option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Current / Most Recent Team</span>
                <input
                  name="Current Team"
                  className={inputClass}
                  placeholder="School, youth or club team"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Years Playing Football *</span>
                <input
                  type="number"
                  name="Years Playing Football"
                  min="0"
                  max="15"
                  required
                  className={inputClass}
                  placeholder="Years"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Previous 7v7 Experience *</span>
                <select
                  name="Previous 7v7 Experience"
                  required
                  className={selectClass}
                >
                  <option value="">Select</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Previous 7v7 Organization</span>
                <input
                  name="Previous 7v7 Organization"
                  className={inputClass}
                  placeholder="Organization / team"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>Highlight Link</span>
                <input
                  type="url"
                  name="Highlight Link"
                  className={inputClass}
                  placeholder="Hudl, YouTube, Instagram, X, Google Drive, etc."
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>
                  Athlete Social Media / Recruiting Profile
                </span>
                <input
                  name="Athlete Social Media"
                  className={inputClass}
                  placeholder="@username or profile link"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>
                  Football Background / Accomplishments
                </span>
                <textarea
                  name="Football Background"
                  rows={5}
                  className={inputClass}
                  placeholder="Teams, varsity experience, awards, stats, camps, honors, recruiting information or anything else you want our coaches to know."
                />
              </label>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-6 md:p-9">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              03 • Parent / Guardian
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Parent / Guardian Name *</span>
                <input
                  name="Parent Guardian Name"
                  required
                  className={inputClass}
                  placeholder="Full name"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Relationship To Athlete *</span>
                <input
                  name="Relationship To Athlete"
                  required
                  className={inputClass}
                  placeholder="Mother, father, guardian, etc."
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Parent Email *</span>
                <input
                  type="email"
                  name="Parent Email"
                  required
                  className={inputClass}
                  placeholder="parent@email.com"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Parent Phone *</span>
                <input
                  type="tel"
                  name="Parent Phone"
                  required
                  className={inputClass}
                  placeholder="Phone number"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>City *</span>
                <input
                  name="City"
                  required
                  className={inputClass}
                  placeholder="City"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>State *</span>
                <input
                  name="State"
                  required
                  className={inputClass}
                  placeholder="VA"
                />
              </label>
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-6 md:p-9">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              04 • Emergency + Additional Information
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelClass}>Emergency Contact *</span>
                <input
                  name="Emergency Contact"
                  required
                  className={inputClass}
                  placeholder="Full name"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelClass}>Emergency Phone *</span>
                <input
                  type="tel"
                  name="Emergency Phone"
                  required
                  className={inputClass}
                  placeholder="Phone number"
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>
                  Medical Conditions / Allergies / Important Information
                </span>
                <textarea
                  name="Medical Information"
                  rows={4}
                  className={inputClass}
                  placeholder="Optional. List anything the staff should be aware of."
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>How Did You Hear About DMV Attack?</span>
                <select name="Referral Source" className={selectClass}>
                  <option value="">Select</option>
                  <option>Current DMV Attack Player / Parent</option>
                  <option>Coach</option>
                  <option>Instagram</option>
                  <option>Website</option>
                  <option>Training</option>
                  <option>Camp</option>
                  <option>Friend / Family</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelClass}>Additional Comments</span>
                <textarea
                  name="Additional Comments"
                  rows={5}
                  className={inputClass}
                  placeholder="Questions, schedule concerns, additional positions, recruiting information or anything else you would like the DMV Attack staff to know."
                />
              </label>
            </div>
          </div>

          <div className="rounded-[32px] border border-lime-400/20 bg-lime-400/[0.06] p-6 md:p-9">
            <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
              05 • Registration Confirmation
            </div>

            <div className="mt-7 space-y-5">
              <label className="flex items-start gap-4">
                <input
                  type="checkbox"
                  name="Information Confirmation"
                  required
                  className="mt-1 h-5 w-5 accent-lime-400"
                />

                <span className="text-sm leading-6 text-white/65">
                  I confirm that the information submitted on this registration
                  form is accurate to the best of my knowledge.
                </span>
              </label>

              <label className="flex items-start gap-4">
                <input
                  type="checkbox"
                  name="Tryout Communication Consent"
                  required
                  className="mt-1 h-5 w-5 accent-lime-400"
                />

                <span className="text-sm leading-6 text-white/65">
                  I understand that official tryout times and additional event details
                  have not yet been announced and I authorize DMV Attack to
                  contact me with tryout and program information.
                </span>
              </label>

              <label className="flex items-start gap-4">
                <input
                  type="checkbox"
                  name="Roster Understanding"
                  required
                  className="mt-1 h-5 w-5 accent-lime-400"
                />

                <span className="text-sm leading-6 text-white/65">
                  I understand that submitting this registration does not
                  guarantee selection or placement on a DMV Attack roster.
                </span>
              </label>
            </div>
          </div>

          <div className="rounded-[32px] bg-lime-400 p-7 text-black md:p-10">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-black/55">
              Final Step
            </div>

            <h3 className="mt-3 text-3xl font-black uppercase md:text-4xl">
              Submit Tryout Registration
            </h3>

            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-black/65">
              After submitting, your athlete will be added directly to the DMV
              Attack tryout system and assigned a unique Tryout ID. Keep that ID
              for check-in and future tryout communication.
            </p>

            <button
              type="submit"
              className="mt-7 rounded-full bg-black px-8 py-4 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:scale-[1.02]"
            >
              Register Athlete →
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
