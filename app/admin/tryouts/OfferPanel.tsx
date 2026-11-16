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
  availableTeams,
  status,
}: {
  athleteId: string;
  athleteName: string;
  ageGroup: string;
  onSuccess: () => void;
  availableTeams?: Team[];
  status?: string;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (availableTeams) { setTeams(availableTeams); setLoading(false); return; }
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
  }, [availableTeams]);

  const choices = useMemo(() => {
    const matching = teams.filter(team => team.season === "2027");

    return matching;
  }, [teams, ageGroup]);

  const selectedTeamId=choices.some(t=>t.id===teamId)?teamId:choices.length===1?choices[0].id:"";

  async function makeOffer() {
    const team = teams.find(
      (item) => item.id === selectedTeamId
    );

    if (!team) {
      setMessage("Select a team.");
      return;
    }

    if (
      !window.confirm(
        `Accept ${athleteName} onto ${team.name} and email the parent?`
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
            team_id: selectedTeamId,
            suppress_offer_email: true,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to make offer"
        );
      }

      if (result.already_accepted) {
        setMessage(`${athleteName} is already on ${team.name}.`);
        return;
      }
      const acceptance = await fetch("/api/admin/rosters/accept", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({tryout_submission_id: athleteId, team_id: selectedTeamId}),
      });
      const accepted = await acceptance.json();
      if (!acceptance.ok) throw new Error(accepted.error || "Offer saved, but acceptance failed. Retry acceptance.");
      const emailSent = accepted.email === "sent";
      const confirmation = emailSent
        ? `${athleteName} accepted onto ${team.name}. Acceptance email sent.`
        : accepted.email === "already_sent" ? `${athleteName} added to ${team.name}. The acceptance email was previously sent; no duplicate email sent.` : `${athleteName} accepted onto ${team.name}. Email NOT confirmed sent: ${String(accepted.email ?? "unknown").replaceAll("_", " ")}.`;
      setMessage(confirmation);
      window.alert(confirmation);

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
        Accept Athlete
      </div>

      <h3 className="mt-2 text-2xl font-black uppercase">
        Choose Team & Accept
      </h3>

      <p className="mt-3 text-sm leading-6 text-white/50">
        Registered division: {ageGroup}. Choose any team. Add another team by selecting it and saving again; existing teams stay assigned.
      </p>

      <select
        value={selectedTeamId}
        aria-label={`Team for ${athleteName}`}
        disabled={loading || sending}
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
        disabled={sending || !selectedTeamId}
        onClick={makeOffer}
        className="mt-4 w-full rounded-2xl bg-lime-400 px-6 py-4 text-sm font-black uppercase tracking-[0.14em] text-black disabled:opacity-40"
      >
        {sending
          ? "Accepting..."
          : status === "ACCEPTED" ? "Add to Selected Team" : "Accept Player & Email Parent"}
      </button>

      {message && (
        <p role="status" aria-live="polite" className="mt-4 text-sm font-semibold text-white/80">
          {message}
        </p>
      )}
    </section>
  );
}
