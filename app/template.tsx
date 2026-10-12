import DmvSiteNav from "@/components/dmv-site-nav";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only fixed left-4 top-4 z-[60] bg-lime-400 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-black focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        Skip to content
      </a>
      <DmvSiteNav />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
    </>
  );
}
