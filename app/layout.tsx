import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.dmvattack.com"),
  title: {
    default: "DMV Attack 7v7",
    template: "%s | DMV Attack",
  },

  description:
    "DMV Attack 7v7 Football. Development, competition, exposure, mentorship and opportunity for athletes throughout Northern Virginia and the DMV.",

  applicationName: "DMV Attack 7v7",

  openGraph: {
    title: "DMV Attack 7v7",
    description:
      "Development. Competition. Exposure. Attack The World.",
    siteName: "DMV Attack 7v7",
    type: "website",

    images: [
      {
        url: "/DMVAttackLOGO.jpeg",
        alt: "DMV Attack 7v7",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "DMV Attack 7v7",
    description:
      "Development. Competition. Exposure. Attack The World.",
    images: ["/DMVAttackLOGO.jpeg"],
  },

  icons: {
    icon: "/DMVAttackLOGO.jpeg",
    shortcut: "/DMVAttackLOGO.jpeg",
    apple: "/DMVAttackLOGO.jpeg",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><a href="#main-content" className="sr-only z-[100] rounded-xl bg-lime-400 px-6 py-3 font-black text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>{children}</body>
    </html>
  );
}
