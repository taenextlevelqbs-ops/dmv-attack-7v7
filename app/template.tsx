import DmvSiteFooter from "@/components/dmv-site-footer";
import DmvSiteNav from "@/components/dmv-site-nav";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DmvSiteNav />
      <div id="main-content" tabIndex={-1}>
        {children}
      </div>
      <DmvSiteFooter />
    </>
  );
}
