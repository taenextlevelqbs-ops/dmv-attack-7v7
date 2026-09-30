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
    href: "/admin/communication",
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

  return (
    <main className="min-h-screen bg-black px-4 py-10 text-white md:px-8 md:py-14">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-lime-400">
              DMV Attack
            </div>

            <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
              Command Center
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/50">
              Run DMV Attack from one place. Manage athletes,
              tryouts, teams, families, communication and programs.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              Signed In
            </div>

            <div className="mt-1 font-black uppercase">
              {displayName}
            </div>

            <div className="mt-1 text-xs font-bold text-lime-400">
              {profile.role}
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="System"
            value="ACTIVE"
          />

          <Stat
            label="Season"
            value="2027"
          />

          <Stat
            label="Access"
            value={profile.role}
          />

          <Stat
            label="Programs"
            value="7V7 +"
          />
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
                Operations
              </div>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Management
              </h2>
            </div>

            <div className="text-xs font-bold text-white/30">
              {visibleModules.length} modules
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleModules.map((module) => (
              <Link
                key={module.title}
                href={module.href}
                className="group relative min-h-[210px] overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] p-6 transition hover:border-lime-400/40 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-lime-400/25 bg-lime-400/[0.08] text-sm font-black text-lime-400 transition group-hover:bg-lime-400 group-hover:text-black">
                    →
                  </div>

                  {module.badge && (
                    <div className="rounded-full bg-lime-400 px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-black">
                      {module.badge}
                    </div>
                  )}
                </div>

                <h3 className="mt-7 text-2xl font-black uppercase">
                  {module.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/45">
                  {module.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {!isOwner && (
          <section className="mt-10 rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
              Staff Access
            </div>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Your account has full DMV Attack operational
              management access.
            </p>
          </section>
        )}

        <div className="mt-12 flex justify-end">
          <SignOutButton />
        </div>

        <footer className="mt-8 border-t border-white/10 pt-7 text-xs leading-6 text-white/25">
          DMV Attack internal management system.
        </footer>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
        {label}
      </div>

      <div className="mt-2 text-xl font-black uppercase">
        {value}
      </div>
    </div>
  );
}
