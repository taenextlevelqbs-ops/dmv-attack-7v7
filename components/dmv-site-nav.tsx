"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-full border border-white/10">
            <Image
              src="/DMVAttackLOGO.jpeg"
              alt="DMV Attack logo"
              fill
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

        <nav className="hidden xl:block">
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
                  className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] transition ${
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
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] xl:hidden"
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

      {open && (
        <div className="border-t border-white/10 bg-black xl:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-4 md:px-8">
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
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl border px-4 py-4 text-xs font-black uppercase tracking-[0.14em] transition ${
                      active
                        ? "border-lime-400 bg-lime-400 text-black"
                        : "border-white/10 bg-white/[0.025] text-white/75"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span>→</span>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/tryouts"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center rounded-xl bg-lime-400 px-5 py-4 text-xs font-black uppercase tracking-[0.16em] text-black"
            >
              Register For Tryouts →
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
