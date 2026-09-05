"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
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

export default function DmvSiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-white/10 bg-black">
            <Image
              src="/DMVAttackLOGO.jpeg"
              alt="DMV Attack logo"
              fill
              className="object-cover"
            />
          </div>

          <div className="leading-none">
            <div className="text-sm font-black uppercase tracking-[0.28em] text-white">
              DMV ATTACK
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.34em] text-lime-400">
              7v7 Football
            </div>
          </div>
        </Link>

        <nav className="hidden lg:block">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {navItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                    active
                      ? "bg-lime-400 text-black"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <div className="overflow-x-auto border-t border-white/5 lg:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 px-4 py-3 md:px-8">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition ${
                  active
                    ? "bg-lime-400 text-black"
                    : "border border-white/10 bg-white/[0.03] text-white/70 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}