"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/7v7", label: "7v7" },
  { href: "/coaching", label: "Coaching" },
  { href: "/training", label: "Training" },
  { href: "/foundation", label: "Foundation" },
  { href: "/girls-flag", label: "Girls Flag" },
  { href: "/camps", label: "Camps" },
  { href: "/apparel", label: "Apparel" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function active(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function DmvSiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-black/95 backdrop-blur-xl">

      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 lg:px-8">

        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3"
        >

          <div className="h-12 w-12 overflow-hidden rounded-xl border border-lime-400/30 bg-black">
            <img
              src="/DMVAttackLOGO.jpeg"
              alt="DMV Attack"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <div className="text-sm font-black uppercase tracking-[0.16em] text-white">
              DMV Attack
            </div>

            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-400">
              7v7 Football
            </div>
          </div>

        </Link>


        <nav className="hidden items-center gap-1 xl:flex">

          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                active(pathname, link.href)
                  ? "rounded-lg bg-lime-400 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-black"
                  : "rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white/50 transition hover:bg-white/5 hover:text-white"
              }
            >
              {link.label}
            </Link>
          ))}

        </nav>


        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-black text-white xl:hidden"
        >
          {open ? "×" : "☰"}
        </button>

      </div>


      {open ? (
        <div className="border-t border-white/10 bg-black p-4 xl:hidden">

          <div className="grid gap-2 sm:grid-cols-2">

            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  active(pathname, link.href)
                    ? "rounded-xl bg-lime-400 px-4 py-3 text-xs font-black uppercase text-black"
                    : "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase text-white/65"
                }
              >
                {link.label}
              </Link>
            ))}

          </div>

        </div>
      ) : null}

    </header>
  );
}
