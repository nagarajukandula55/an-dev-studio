import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://andevstudio.com";

// Only the public marketing pages belong in a sitemap — the product itself
// (/builder, /settings, /projects, etc.) is the live app UI, not marketing
// content, and isn't meant to be crawled/indexed (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date();
    const pages = ["/pricing", "/features", "/faq", "/terms", "/privacy"];

    return pages.map((path) => ({
        url: `${SITE_URL}${path}`,
        lastModified: now,
        changeFrequency: path === "/pricing" ? "weekly" : "monthly",
        priority: path === "/pricing" ? 1 : 0.6,
    }));
}
