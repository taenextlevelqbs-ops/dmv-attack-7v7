"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/7v7",
    label: "7v7",
  },
  {
    href: "/coaching",
    label: "Coaching",
  },
  {
    href: "/training",
    label: "Training",
  },
  {
    href: "/foundation",
    label: "Foundation",
  },
  {
    href: "/girls-flag",
    label: "Girls Flag",
  },
  {
    href: "/camps",
    label: "Camps",
  },
  {
    href: "/apparel",
    label: "Apparel",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/contact",
    label: "Contact",
  },
];

function isActive(
  pathname: string,
  href: string
) {
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

  const [open, setOpen] =
    useState(false);

  return (
    <header className="sticky top-0 z-[100] border-b border-white/10 bg-black/90 backdrop-blur-xl">

      <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 lg:px-8">

        <Link
          href="/"
          onClick={() =>
            setOpen(false)
          }
          className="group flex min-w-fit items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-lime-400/30 bg-lime-400/10 text-sm font-black tracking-tight text-lime-300">
            DA
          </div>

          <div>
            <div className="text-sm font-black uppercase tracking-[0.16em] text-white">
              DMV Attack
            </div>

            <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-white/40">
              7v7 Football
            </div>
          </div>
        </Link>


        <nav className="hidden items-center gap-1 xl:flex">

          {links.map(
            (link) => {
              const active =
                isActive(
                  pathname,
                  link.href
                );

              return (
                <Link
                  key={
                    link.href
                  }
                  href={
                    link.href
                  }
                  className={
                    active
                      ? "rounded-lg bg-lime-400 px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-black"
                      : "rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/55 transition hover:bg-white/5 hover:text-white"
                  }
                >
                  {
                    link.label
                  }
                </Link>
              );
            }
          )}

        </nav>


        <button
          type="button"
          onClick={() =>
            setOpen(
              (current) =>
                !current
            )
          }
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg font-black text-white xl:hidden"
          aria-label="Open navigation"
        >
          {open
            ? "×"
            : "☰"}
        </button>

      </div>


      {open ? (
        <div className="border-t border-white/10 bg-black px-4 py-4 xl:hidden">

          <div className="mx-auto grid max-w-[1500px] gap-2 sm:grid-cols-2">

            {links.map(
              (link) => {
                const active =
                  isActive(
                    pathname,
                    link.href
                  );

                return (
                  <Link
                    key={
                      link.href
                    }
                    href={
                      link.href
                    }
                    onClick={() =>
                      setOpen(
                        false
                      )
                    }
                    className={
                      active
                        ? "rounded-xl bg-lime-400 px-4 py-3 text-xs font-black uppercase tracking-wider text-black"
                        : "rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-black uppercase tracking-wider text-white/70"
                    }
                  >
                    {
                      link.label
                    }
                  </Link>
                );
              }
            )}

          </div>

        </div>
      ) : null}

    </header>
  );
}
