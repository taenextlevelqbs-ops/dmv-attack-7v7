"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/7v7", label: "7v7" },
  { href: "/tryouts", label: "Tryouts" },
  { href: "/coaching", label: "Coaching" },
  { href: "/training", label: "Training" },
  { href: "/camps", label: "Camps" },
  { href: "/girls-flag", label: "Girls Flag" },
  { href: "/foundation", label: "Foundation" },
  { href: "/apparel", label: "Apparel" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function DmvSiteNav() {
  const pathname = usePathname();
  const [expandedPath, setExpandedPath] = useState<string | null>(null);
  const open = expandedPath === pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setExpandedPath(null);
          menuButtonRef.current?.focus();
        }
      }}
      className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link
          href="/"
          aria-label="DMV Attack home"
          onClick={() => setExpandedPath(null)}
          className="flex min-h-12 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10">
            <Image
              src="/DMVAttackLOGO.jpeg"
              alt="DMV Attack logo"
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>

          <div>
            <div className="text-sm font-black tracking-[0.13em]">
              DMV ATTACK
            </div>

            <div className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">
              7v7 Football
            </div>
          </div>
        </Link>

        <nav aria-label="Main navigation" className="hidden xl:block">
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`min-h-11 rounded-full px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    active
                      ? "bg-lime-400 text-black"
                      : "text-white/60 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() =>
            setExpandedPath((value) => (value === pathname ? null : pathname))
          }
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          className="flex h-12 w-12 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] transition hover:border-lime-400/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black xl:hidden"
        >
          <span
            className={`h-0.5 w-5 bg-white transition ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-5 bg-white transition ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-0.5 w-5 bg-white transition ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        id="mobile-navigation"
        hidden={!open}
        className="border-t border-white/10 bg-black xl:hidden"
      >
        <nav
          aria-label="Mobile navigation"
          className="mx-auto max-w-7xl px-4 py-4 md:px-8"
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setExpandedPath(null)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-xs font-black uppercase tracking-[0.14em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                    active
                      ? "border-lime-400 bg-lime-400 text-black"
                      : "border-white/10 bg-white/[0.025] text-white/75"
                  }`}
                >
                  <span>{item.label}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>

          <Link
            href="/tryouts"
            onClick={() => setExpandedPath(null)}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-lime-400 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-lime-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Register For Tryouts →
          </Link>
        </nav>
      </div>
    </header>
  );
}
