import DmvSiteNav from "@/components/dmv-site-nav";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DmvSiteNav />
      {children}
    </>
  );
}
