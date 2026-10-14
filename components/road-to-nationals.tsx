"use client";

import { useState } from "react";

const stops = [
  { date: "FEB 27–28", title: "Duel in the DMV", location: "Upper Marlboro, MD" },
  { date: "MAR 13–14", title: "Music City Mayhem", location: "Murfreesboro, TN" },
  { date: "MAR 20–21", title: "Football City Clash", location: "Rock Hill, SC" },
  { date: "APR 3–4", title: "Virginia Frenzy", location: "Gainesville, VA" },
  { date: "APR 10–11", title: "PA Classic", location: "West Bradford Township, PA" },
  { date: "MAY 1–2", title: "National Championship", location: "Indianapolis, IN", note: "Qualification Required" },
];

export default function RoadToNationals() {
  const [selected, setSelected] = useState(0);
  const stop = stops[selected];
  const query = encodeURIComponent(stop.location);
  return (
    <section className="border-b border-white/10 bg-black px-4 py-8 text-white sm:py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-lime-400">2027 Prep Redzone National Circuit</p>
        <h2 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-4xl">Road to Nationals</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/55">Tap a tournament to explore its location on the live map.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-stretch">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            {stops.map((event, index) => (
              <button type="button" key={event.title} onClick={() => setSelected(index)} aria-pressed={selected === index}
                className={`flex w-full items-center gap-3 border-b border-white/10 px-4 py-3.5 text-left transition last:border-b-0 sm:px-5 ${selected === index ? "bg-lime-400/10" : "hover:bg-white/5"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${selected === index ? "bg-lime-400 text-black" : "bg-white/10 text-white"}`}>{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[10px] font-black tracking-widest text-lime-400">{event.date}</span>
                  <span className="mt-0.5 block text-sm font-black uppercase sm:text-base">{event.title}</span>
                  <span className="block text-xs text-white/50">{event.location}</span>
                </span>
                <span className="shrink-0 text-lime-400" aria-hidden="true">{selected === index ? "●" : "→"}</span>
              </button>
            ))}
          </div>
          <div className="flex min-h-[390px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] sm:min-h-[470px]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
              <div><p className="text-xs font-black uppercase">{stop.title}</p><p className="text-xs text-white/50">{stop.location}</p></div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${query}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-lime-400 px-4 py-2 text-xs font-black uppercase text-black hover:bg-lime-300">View Full Map ↗</a>
            </div>
            <iframe key={stop.location} title={`Google Map of ${stop.location}`} src={`https://maps.google.com/maps?q=${query}&z=11&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="min-h-[330px] w-full flex-1 border-0 sm:min-h-[410px]" allowFullScreen />
          </div>
        </div>
        <p className="mt-4 text-xs text-white/45">Tournament dates and locations may change. National Championship qualification required.</p>
      </div>
    </section>
  );
}
