"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Athlete = {
  id: string;
  first_name: string;
  last_name: string;
  graduation_year: number | null;
  school: string | null;
  age_group: string | null;
  primary_position: string | null;
  secondary_positions: string[] | null;
  jersey_size: string | null;
};

type PortalData = {
  profile: {
    first_name: string | null;
    last_name: string | null;
    role: string;
  };
  family: {
    id: string;
    family_name: string | null;
    primary_email: string | null;
    primary_phone: string | null;
  } | null;
  athletes: Athlete[];
  message?: string;
};

export default function FamilyPortal() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPortal() {
      try {
        const response = await fetch("/api/portal/family", {
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          router.replace("/admin");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load Family Portal"
          );
        }

        setData(result);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load Family Portal"
        );
      } finally {
        setLoading(false);
      }
    }

    loadPortal();
  }, [router]);

  async function signOut() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/login");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-xs font-black uppercase tracking-[0.2em] text-white/30">
          Loading Family Portal...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-4 py-20 text-white">
        <div className="mx-auto max-w-xl rounded-[28px] border border-red-500/30 bg-red-500/10 p-6">
          <h1 className="text-2xl font-black uppercase">
            Portal Error
          </h1>

          <p className="mt-3 text-sm text-white/60">
            {error}
          </p>

          <Link
            href="/login"
            className="mt-6 inline-block text-xs font-black uppercase text-lime-400"
          >
            Return To Login
          </Link>
        </div>
      </main>
    );
  }

  if (!data) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 md:px-8">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-[0.16em]"
          >
            DMV <span className="text-lime-400">Attack</span>
          </Link>

          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/60"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-14">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">
          Family Portal
        </div>

        <h1 className="mt-3 text-4xl font-black uppercase md:text-6xl">
          Welcome, {data.profile.first_name || "Family"}.
        </h1>

        {data.family && (
          <p className="mt-4 text-sm text-white/45">
            {data.family.family_name || "DMV Attack Family"}
          </p>
        )}

        {!data.family ? (
          <section className="mt-8 rounded-[30px] border border-lime-400/20 bg-lime-400/[0.05] p-7">
            <div className="text-xl font-black uppercase">
              Account Ready
            </div>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55">
              {data.message}
            </p>
          </section>
        ) : (
          <>
            <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                label="Athletes"
                value={data.athletes.length}
              />

              <Stat
                label="Family"
                value="Active"
                highlight
              />

              <Stat
                label="Schedule"
                value="Coming Soon"
              />

              <Stat
                label="Forms"
                value="Coming Soon"
              />
            </section>

            <section className="mt-12">
              <div className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-400">
                My Athletes
              </div>

              <h2 className="mt-2 text-3xl font-black uppercase">
                Your DMV Attack Family
              </h2>

              {data.athletes.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {data.athletes.map((athlete) => (
                    <article
                      key={athlete.id}
                      className="rounded-[28px] border border-white/10 bg-white/[0.03] p-6"
                    >
                      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-lime-400">
                        {athlete.age_group || "DMV Attack"}
                      </div>

                      <h3 className="mt-2 text-2xl font-black uppercase">
                        {athlete.first_name} {athlete.last_name}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-white/45">
                        {athlete.primary_position && (
                          <p>
                            Position:{" "}
                            <span className="text-white/70">
                              {athlete.primary_position}
                            </span>
                          </p>
                        )}

                        {athlete.school && (
                          <p>
                            School:{" "}
                            <span className="text-white/70">
                              {athlete.school}
                            </span>
                          </p>
                        )}

                        {athlete.graduation_year && (
                          <p>
                            Class:{" "}
                            <span className="text-white/70">
                              {athlete.graduation_year}
                            </span>
                          </p>
                        )}

                        {athlete.jersey_size && (
                          <p>
                            Jersey:{" "}
                            <span className="text-white/70">
                              {athlete.jersey_size}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                        <div className="text-[9px] font-black uppercase tracking-[0.14em] text-white/30">
                          Team + Roster
                        </div>

                        <p className="mt-2 text-sm leading-6 text-white/50">
                          Team information will appear here once
                          this athlete is officially rostered.
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.025] p-8">
                  <h3 className="text-xl font-black uppercase">
                    No Athletes Linked Yet
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-white/45">
                    Your family account is ready. Athlete information
                    will appear here once DMV Attack completes the
                    roster connection.
                  </p>
                </div>
              )}
            </section>

            <section className="mt-12 grid gap-4 md:grid-cols-2">
              <ComingSoon
                title="Schedule"
                text="Practices, tournaments and team events will live here."
              />

              <ComingSoon
                title="Forms + Waivers"
                text="Required waivers and athlete documents will live here."
              />

              <ComingSoon
                title="Announcements"
                text="Organization and team updates will appear here."
              />

              <ComingSoon
                title="Payments"
                text="Program balances, payment history and receipts will live here."
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        highlight
          ? "border-lime-400/25 bg-lime-400/[0.07]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
        {label}
      </div>

      <div className="mt-2 text-xl font-black uppercase">
        {value}
      </div>
    </div>
  );
}

function ComingSoon({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-lime-400">
        Coming Soon
      </div>

      <h3 className="mt-2 text-xl font-black uppercase">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/45">
        {text}
      </p>
    </div>
  );
}
