import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://joinstartup.app";
  const now = new Date();

  const routes = [
    "",
    "/analyse",
    "/jobs",
    "/founders",
    "/pricing",
    "/seed",
    "/nominate",
    "/login",
    "/signup",
    "/nominated",
    "/recruiters",
    "/unsubscribed",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
