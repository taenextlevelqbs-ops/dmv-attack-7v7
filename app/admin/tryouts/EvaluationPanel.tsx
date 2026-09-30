"use client";

import { useEffect, useState } from "react";

type Evaluation = {
  id: string;
  evaluator_name: string;
  evaluator_role: string;
  is_mine: boolean;

  athleticism: number | null;
  speed: number | null;
  football_iq: number | null;
  hands_ball_skills: number | null;
  route_running: number | null;
  coverage_skill: number | null;
  competitiveness: number | null;
  coachability: number | null;
  overall_grade: number | null;

  strengths: string | null;
  development_notes: string | null;
  private_notes: string | null;
  recommendation: string | null;
};

type FormState = {
  athleticism: number;
  speed: number;
  football_iq: number;
  hands_ball_skills: number;
  route_running: number;
  coverage_skill: number;
  competitiveness: number;
  coachability: number;
  overall_grade: number;

  strengths: string;
  development_notes: string;
  private_notes: string;
  recommendation: string;
};

const blankForm: FormState = {
  athleticism: 3,
  speed: 3,
  football_iq: 3,
  hands_ball_skills: 3,
  route_running: 3,
  coverage_skill: 3,
  competitiveness: 3,
  coachability: 3,
  overall_grade: 3,

  strengths: "",
  development_notes: "",
  private_notes: "",
  recommendation: "",
};

const ratingFields: {
  key: keyof FormState;
  label: string;
}[] = [
  { key: "athleticism", label: "Athleticism" },
  { key: "speed", label: "Speed" },
  { key: "football_iq", label: "Football IQ" },
  { key: "hands_ball_skills", label: "Ball Skills" },
  { key: "route_running", label: "Route Running" },
  { key: "coverage_skill", label: "Coverage" },
  { key: "competitiveness", label: "Competitiveness" },
  { key: "coachability", label: "Coachability" },
  { key: "overall_grade", label: "Overall Grade" },
];

export default function EvaluationPanel({
  tryoutSubmissionId,
}: {
  tryoutSubmissionId: string;
}) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [form, setForm] = useState<FormState>(blankForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadEvaluations() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/admin/tryouts/evaluations?tryout=${encodeURIComponent(
          tryoutSubmissionId
        )}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load evaluations"
        );
      }

      const loaded = result.evaluations ?? [];

      setEvaluations(loaded);

      const mine = loaded.find(
        (evaluation: Evaluation) => evaluation.is_mine
      );

      if (mine) {
        setForm({
          athleticism: mine.athleticism ?? 3,
          speed: mine.speed ?? 3,
          football_iq: mine.football_iq ?? 3,
          hands_ball_skills:
            mine.hands_ball_skills ?? 3,
          route_running: mine.route_running ?? 3,
          coverage_skill: mine.coverage_skill ?? 3,
          competitiveness:
            mine.competitiveness ?? 3,
          coachability: mine.coachability ?? 3,
          overall_grade: mine.overall_grade ?? 3,

          strengths: mine.strengths ?? "",
          development_notes:
            mine.development_notes ?? "",
          private_notes: mine.private_notes ?? "",
          recommendation:
            mine.recommendation ?? "",
        });
      } else {
        setForm(blankForm);
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load evaluations"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvaluations();
  }, [tryoutSubmissionId]);

  async function saveEvaluation() {
    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        "/api/admin/tryouts/evaluations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tryout_submission_id: tryoutSubmissionId,
            ...form,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to save evaluation"
        );
      }

      setMessage("Evaluation saved.");
      await loadEvaluations();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to save evaluation"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <div className="text-xs font-black uppercase tracking-[0.2em] text-lime-400">
        Coach Evaluations
      </div>

      <p className="mt-2 text-sm leading-6 text-white/45">
        Each coach has their own evaluation. Your notes do not
        overwrite another coach&apos;s evaluation.
      </p>

      <div className="mt-5 rounded-[28px] border border-lime-400/20 bg-lime-400/[0.04] p-5 md:p-6">
        <div className="text-sm font-black uppercase">
          My Evaluation
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ratingFields.map((field) => (
            <div
              key={field.key}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                {field.label}
              </div>

              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((number) => (
                  <button
                    key={number}
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        [field.key]: number,
                      }))
                    }
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition ${
                      form[field.key] === number
                        ? "bg-lime-400 text-black"
                        : "border border-white/10 bg-white/5 text-white/55 hover:border-lime-400/50"
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4">
          <label>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Strengths
            </span>

            <textarea
              value={form.strengths}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  strengths: event.target.value,
                }))
              }
              rows={3}
              placeholder="What does this athlete do well?"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-lime-400"
            />
          </label>

          <label>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Development Notes
            </span>

            <textarea
              value={form.development_notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  development_notes:
                    event.target.value,
                }))
              }
              rows={3}
              placeholder="Areas that need development..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-lime-400"
            />
          </label>

          <label>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Private Coach Notes
            </span>

            <textarea
              value={form.private_notes}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  private_notes: event.target.value,
                }))
              }
              rows={3}
              placeholder="Internal DMV Attack staff notes..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-lime-400"
            />
          </label>

          <label>
            <span className="text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
              Recommendation
            </span>

            <select
              value={form.recommendation}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  recommendation: event.target.value,
                }))
              }
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black px-4 py-4 text-sm font-bold outline-none focus:border-lime-400"
            >
              <option value="">Select recommendation</option>
              <option value="TAKE">TAKE</option>
              <option value="CALLBACK">CALLBACK</option>
              <option value="BORDERLINE">BORDERLINE</option>
              <option value="PASS">PASS</option>
            </select>
          </label>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={saveEvaluation}
          className="mt-5 rounded-full bg-lime-400 px-7 py-4 text-xs font-black uppercase tracking-[0.15em] text-black transition hover:bg-lime-300 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save My Evaluation"}
        </button>

        {message && (
          <div className="mt-4 text-sm font-semibold text-white/60">
            {message}
          </div>
        )}
      </div>

      <div className="mt-7">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
          Staff Evaluations • {evaluations.length}
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-white/40">
            Loading evaluations...
          </div>
        ) : evaluations.length ? (
          <div className="mt-4 grid gap-4">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="rounded-3xl border border-white/10 bg-white/[0.025] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-black uppercase">
                      {evaluation.evaluator_name}
                    </div>

                    <div className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                      {evaluation.evaluator_role}
                      {evaluation.is_mine ? " • MY EVALUATION" : ""}
                    </div>
                  </div>

                  {evaluation.recommendation && (
                    <div className="rounded-full bg-lime-400 px-4 py-2 text-xs font-black text-black">
                      {evaluation.recommendation}
                    </div>
                  )}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5">
                  <Score
                    label="Athletic"
                    value={evaluation.athleticism}
                  />
                  <Score
                    label="Speed"
                    value={evaluation.speed}
                  />
                  <Score
                    label="IQ"
                    value={evaluation.football_iq}
                  />
                  <Score
                    label="Ball"
                    value={evaluation.hands_ball_skills}
                  />
                  <Score
                    label="Overall"
                    value={evaluation.overall_grade}
                  />
                </div>

                {evaluation.strengths && (
                  <Note
                    label="Strengths"
                    value={evaluation.strengths}
                  />
                )}

                {evaluation.development_notes && (
                  <Note
                    label="Development"
                    value={evaluation.development_notes}
                  />
                )}

                {evaluation.private_notes && (
                  <Note
                    label="Private Notes"
                    value={evaluation.private_notes}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/40">
            No evaluations submitted yet.
          </div>
        )}
      </div>
    </section>
  );
}

function Score({
  label,
  value,
}: {
  label: string;
  value: number | null;
}) {
  return (
    <div className="rounded-xl bg-black/40 p-3 text-center">
      <div className="text-[8px] font-black uppercase tracking-wider text-white/30">
        {label}
      </div>

      <div className="mt-1 text-xl font-black text-lime-400">
        {value ?? "—"}
      </div>
    </div>
  );
}

function Note({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mt-4">
      <div className="text-[9px] font-black uppercase tracking-[0.16em] text-white/30">
        {label}
      </div>

      <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white/65">
        {value}
      </div>
    </div>
  );
}
