import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/portal",
        "/login",
        "/set-password",
        "/auth/",
        "/payments/",
        "/tryouts/success",
      ],
    },
    sitemap: "https://www.dmvattack.com/sitemap.xml",
  };
}
