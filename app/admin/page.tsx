import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "./SignOutButton";

type Module = {
  title: string;
  description: string;
  href: string;
  badge?: string;
  ownerOnly?: boolean;
};

const modules: Module[] = [
  {
    title: "Tryouts",
    description:
      "Registrations, headshots, check-in, evaluations, callbacks, offers and roster decisions.",
    href: "/admin/tryouts",
    badge: "LIVE",
  },
  {
    title: "Athletes",
    description:
      "Search and manage every DMV Attack athlete profile across programs and seasons.",
    href: "/admin/athletes",
  },
  {
    title: "Teams & Rosters",
    description:
      "Build teams, assign athletes and coaches, and manage active rosters.",
    href: "/admin/teams",
  },
  {
    title: "Families",
    description:
      "Parent accounts, guardians, contact information and athlete-family relationships.",
    href: "/admin/families",
  },
  {
    title: "Communication",
    description:
      "Organization announcements, team messages, email and SMS communication.",
    href: "/admin/communications",
  },
  {
    title: "Schedule",
    description:
      "Practices, tournaments, camps, tryouts and organization events.",
    href: "/admin/schedule",
  },
  {
    title: "Forms & Waivers",
    description:
      "Required documents, signatures, releases and completion tracking.",
    href: "/admin/forms",
  },
  {
    title: "Camps",
    description:
      "Camp registration, attendance, athlete information and staff management.",
    href: "/admin/camps",
  },
  {
    title: "Girls Flag",
    description:
      "Registration, players, teams, schedules and program communication.",
    href: "/admin/girls-flag",
  },
  {
    title: "Foundation",
    description:
      "Foundation camps, programs, participants and community initiatives.",
    href: "/admin/foundation",
  },
  {
    title: "Finance",
    description:
      "Organization revenue, balances, collections and financial reporting.",
    href: "/admin/finance",
    ownerOnly: true,
  },
  {
    title: "Payments",
    description:
      "Family balances, payment plans, transactions, receipts and outstanding amounts.",
    href: "/admin/payments",
    ownerOnly: true,
  },
];

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name,last_name,role")
    .eq("id", user.id)
    .single();

  if (!profile || !["OWNER", "ADMIN"].includes(profile.role)) {
    redirect("/portal");
  }

  const isOwner = profile.role === "OWNER";

  const visibleModules = modules.filter(
    (module) => !module.ownerOnly || isOwner
  );

  const displayName =
    [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ") || "Staff";

  const primaryModules = visibleModules.filter((module) =>
    [
      "/admin/tryouts",
      "/admin/teams",
      "/admin/athletes",
      "/admin/schedule",
    ].includes(module.href)
  );

  const organizationModules = visibleModules.filter((module) =>
    [
      "/admin/families",
      "/admin/communications",
      "/admin/forms",
    ].includes(module.href)
  );

  const programModules = visibleModules.filter((module) =>
    [
      "/admin/camps",
      "/admin/girls-flag",
      "/admin/foundation",
    ].includes(module.href)
  );

  const businessModules = visibleModules.filter((module) =>
    [
      "/admin/finance",
      "/admin/payments",
    ].includes(module.href)
  );

  return (
    <main className="min-h-screen bg-black px-4 py-7 text-white md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">

        <header className="border-b border-white/10 pb-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[9px] font-black uppercase tracking-[0.28em] text-lime-400">
                DMV Attack • 2027
              </div>

              <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl md:text-5xl">
                Command Center
              </h1>

              <p className="mt-2 text-sm text-white/40">
                Welcome back,{" "}
                <span className="font-bold text-white/70">
                  {displayName}
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-lime-400/20 bg-lime-400/[0.07] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-lime-400">
                {profile.role}
              </div>

              <Link
                href="/admin/settings"
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-white/50 transition hover:border-white/20 hover:text-white"
              >
                Settings
              </Link>
            </div>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
          <MiniStat label="Season" value="2027" />
          <MiniStat label="System" value="Active" highlight />
          <MiniStat
            label="Access"
            value={isOwner ? "Owner" : "Admin"}
          />
        </section>

        <section className="mt-8">
          <SectionHeader
            eyebrow="Quick Access"
            title="Run The Program"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {primaryModules.map((module, index) => (
              <Link
                key={module.href}
                href={module.href}
                className="group rounded-[22px] border border-white/10 bg-white/[0.035] p-5 transition hover:border-lime-400/40 hover:bg-white/[0.055]"
              >
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-lime-400">
                    0{index + 1}
                  </div>

                  <div className="text-lg text-white/25 transition group-hover:translate-x-1 group-hover:text-lime-400">
                    →
                  </div>
                </div>

                <h2 className="mt-8 text-lg font-black uppercase leading-tight">
                  {module.title}
                </h2>

                <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/35">
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-9">
          <SectionHeader
            eyebrow="Organization"
            title="People + Communication"
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {organizationModules.map((module) => (
              <CompactLink
                key={module.href}
                href={module.href}
                title={module.title}
                description={module.description}
              />
            ))}
          </div>
        </section>

        <section className="mt-9">
          <SectionHeader
            eyebrow="Programs"
            title="DMV Attack Programs"
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {programModules.map((module) => (
              <CompactLink
                key={module.href}
                href={module.href}
                title={module.title}
                description={module.description}
              />
            ))}
          </div>
        </section>

        {businessModules.length > 0 && (
          <section className="mt-9">
            <SectionHeader
              eyebrow="Owner Access"
              title="Business"
            />

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {businessModules.map((module) => (
                <CompactLink
                  key={module.href}
                  href={module.href}
                  title={module.title}
                  description={module.description}
                />
              ))}
            </div>
          </section>
        )}

        {!isOwner && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4">
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
              Staff Access
            </div>

            <p className="mt-1 text-xs leading-5 text-white/40">
              Operational tools are available to your staff account.
              Owner financial controls remain restricted.
            </p>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6">
          <div>
            <div className="text-[9px] font-black uppercase tracking-[0.18em] text-white/20">
              DMV Attack
            </div>
            <div className="mt-1 text-xs text-white/25">
              Internal Management System
            </div>
          </div>

          <SignOutButton />
        </div>
      </div>
    </main>
  );
}

function MiniStat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-4 py-3 sm:px-5 sm:py-4">
      <div className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
        {label}
      </div>

      <div
        className={`mt-1 text-sm font-black uppercase sm:text-base ${
          highlight ? "text-lime-400" : "text-white"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <div className="text-[9px] font-black uppercase tracking-[0.22em] text-lime-400">
        {eyebrow}
      </div>

      <h2 className="mt-1 text-xl font-black uppercase sm:text-2xl">
        {title}
      </h2>
    </div>
  );
}

function CompactLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[100px] items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-white/[0.025] p-4 transition hover:border-lime-400/30 hover:bg-white/[0.045]"
    >
      <div className="min-w-0">
        <h3 className="text-sm font-black uppercase">
          {title}
        </h3>

        <p className="mt-1 line-clamp-1 text-[11px] text-white/30">
          {description}
        </p>
      </div>

      <div className="shrink-0 text-base text-white/20 transition group-hover:translate-x-1 group-hover:text-lime-400">
        →
      </div>
    </Link>
  );
}

