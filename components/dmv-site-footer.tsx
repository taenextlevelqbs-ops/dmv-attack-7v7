"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function DmvSiteFooter() {
  const path = usePathname();
  if (
    [
      "/admin",
      "/portal",
      "/auth",
      "/login",
      "/set-password",
      "/payments",
      "/tryouts/success",
    ].some((prefix) => path.startsWith(prefix))
  )
    return null;
  return (
    <footer className="border-t border-white/15 bg-[#080a06] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="text-sm font-black tracking-[0.15em]">
            DMV ATTACK
          </Link>
          <p className="mt-2 text-xs leading-6 text-white/65">
            Northern Virginia · Development. Competition. Community.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-5 gap-y-4 text-xs font-bold text-white/75"
        >
          <Link href="/tryouts">Tryouts</Link>
          <Link href="/coaching">Coaches</Link>
          <Link href="/contact">Contact</Link>
          <a
            href="https://www.instagram.com/dmvattack_7on7/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </nav>
      </div>
    </footer>
  );
}
