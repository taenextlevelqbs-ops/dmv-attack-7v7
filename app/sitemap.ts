import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    "/tryouts",
    "/7v7",
    "/coaching",
    "/training",
    "/big-man",
    "/camps",
    "/girls-flag",
    "/foundation",
    "/apparel",
    "/about",
    "/contact",
  ].map((path) => ({
    url: `https://www.dmvattack.com${path === "/" ? "" : path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : path === "/tryouts" ? 0.9 : 0.6,
  }));
}
