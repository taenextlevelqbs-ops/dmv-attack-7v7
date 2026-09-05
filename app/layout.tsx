import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
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
      <body>{children}</body>
    </html>
  );
}
