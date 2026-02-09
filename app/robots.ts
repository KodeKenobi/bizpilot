import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/favicon.ico",
        "/manifest.json",
        "/api/",
        "/admin/",
        "/auth/",
        "/dashboard",
        "/enterprise",
        "/_next/",
        "/icons/",
        "/test",
        "/google*.html",
        "/*?",
      ],
    },
    sitemap: "https://www.trevnoctilla.com/sitemap.xml",
  };
}
