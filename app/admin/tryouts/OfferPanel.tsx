"use client";

import { useEffect, useMemo, useState } from "react";

type Team = {
  id: string;
  name: string;
  age_group: string;
  season: string;
};

export default function OfferPanel({
  athleteId,
  athleteName,
  ageGroup,
  onSuccess,
}: {
  athleteId: string;
  athleteName: string;
  ageGroup: string;
  onSuccess: () => void;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/teams", {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error);
        }

        setTeams(result.teams ?? []);
      })
      .catch((error) => {
        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to load teams"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const choices = useMemo(() => {
    const matching = teams.filter(
      (team) => team.age_group === ageGroup
    );

    return matching.length ? matching : teams;
  }, [teams, ageGroup]);

  useEffect(() => {
    if (!teamId && choices.length === 1) {
      setTeamId(choices[0].id);
    }
  }, [choices, teamId]);

  async function makeOffer() {
    const team = teams.find(
      (item) => item.id === teamId
    );

    if (!team) {
      setMessage("Select a team.");
      return;
    }

    if (
      !window.confirm(
        `Make ${athleteName} an offer for ${team.name}?`
      )
    ) {
      return;
    }

    try {
      setSending(true);
      setMessage("");

      const response = await fetch(
        "/api/admin/rosters/offer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tryout_submission_id: athleteId,
            team_id: teamId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to make offer"
        );
      }

      setMessage(
        `Offer created for ${result.team.name}.`
      );

      onSuccess();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to make offer"
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-lime-400/20 bg-lime-400/[0.05] p-5 md:p-6">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">
        Offer + Team Assignment
      </div>

      <h3 className="mt-2 text-2xl font-black uppercase">
        Make The Offer
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/50">
        Select the team and create this athlete&apos;s
        DMV Attack roster offer.
      </p>

      <select
        value={teamId}
        disabled={loading}
        onChange={(event) =>
          setTeamId(event.target.value)
        }
        className="mt-5 w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-sm font-bold outline-none focus:border-lime-400"
      >
        <option value="">
          {loading
            ? "Loading teams..."
            : "Select team"}
        </option>

        {choices.map((team) => (
          <option
            key={team.id}
            value={team.id}
          >
            {team.name} • {team.season}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={sending || !teamId}
        onClick={makeOffer}
        className="mt-4 w-full rounded-2xl bg-lime-400 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-black disabled:opacity-40"
      >
        {sending
          ? "Creating Offer..."
          : "Make Offer + Assign Team"}
      </button>

      {message && (
        <p className="mt-4 text-sm font-semibold text-white/60">
          {message}
        </p>
      )}
    </section>
  );
}
