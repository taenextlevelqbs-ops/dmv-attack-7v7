import DirectInvitePage from "./[token]/page";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "DMV Attack | Direct Player Invitation",
  description: "Private player registration for invited DMV Attack athletes.",
  robots: { index: false, follow: false },
};
export default function ShortInvitePage() {
  // The private token stays in server configuration, not in the URL families share.
  const token = process.env.DMV_ATTACK_GENERAL_INVITE_TOKEN;
  if (!token) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-3xl font-black">Invitations are temporarily unavailable</h1>
        <p className="mt-3">Please contact DMV Attack staff for assistance.</p>
      </main>
    );
  }
  return <DirectInvitePage tokenOverride={token} />;
}
