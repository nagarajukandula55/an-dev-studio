import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://andevstudio.com";

// Marketing pages are open to crawl; the actual product UI (builder,
// settings, projects, dashboards) and all API routes are disallowed — it's
// a live app surface, not indexable content, and there's no auth wall to
// otherwise keep crawlers out of it.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/pricing", "/features", "/faq", "/terms", "/privacy"],
            disallow: ["/api/", "/builder", "/settings", "/projects", "/workspace", "/crm", "/erp", "/mobile", "/ai"],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
