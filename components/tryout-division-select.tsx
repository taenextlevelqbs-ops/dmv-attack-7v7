"use client";
import { useState } from "react";
import {
  TRYOUT_EVENTS,
  TRYOUT_TIME,
  tryoutForDivision,
} from "@/lib/tryouts.mjs";
export default function DivisionSelect({ className }: { className: string }) {
  const [division, setDivision] = useState("");
  const event = tryoutForDivision(division);
  return (
    <>
      <select
        name="Tryout Division"
        required
        className={className}
        value={division}
        onChange={(e) => setDivision(e.target.value)}
      >
        <option value="">Select age group</option>
        {TRYOUT_EVENTS.flatMap((e) => e.divisions).map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <span aria-live="polite" className="text-xs leading-6 text-lime-300">
        {event
          ? `${event.dateLabel} · ${TRYOUT_TIME} EST`
          : "Your division determines which tryout to attend."}
      </span>
    </>
  );
}
