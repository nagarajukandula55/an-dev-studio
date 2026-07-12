# AN Dev Studio — SEO & GEO

What's built into the marketing site (`apps/studio/src/app/(marketing)/**`) to help people — and AI answer
engines — actually find this product, and what's still on you.

## What's implemented

- **Root metadata** (`src/app/layout.tsx`): title template, description, keywords, Open Graph, Twitter card,
  `metadataBase` driven by `NEXT_PUBLIC_SITE_URL`.
- **Per-page metadata**: `/pricing`, `/features`, `/faq`, `/terms`, `/privacy` each set their own title/
  description/canonical URL.
- **Structured data (JSON-LD)**:
  - `/pricing` — `SoftwareApplication` + `Offer` (Free/Pro pricing) + `Organization`.
  - `/faq` — `FAQPage`, one `Question`/`Answer` pair per FAQ entry. This is what makes FAQ rich results possible
    in Google, and gives AI answer engines (ChatGPT, Perplexity, Google AI Overviews) clean, quotable Q&A pairs
    instead of having to parse prose.
- **`sitemap.xml`** (`src/app/sitemap.ts`) and **`robots.txt`** (`src/app/robots.ts`): only the marketing pages
  are listed/crawlable; the actual product UI (`/builder`, `/settings`, `/projects`, etc.) and all `/api/*`
  routes are disallowed — they're a live app surface, not indexable marketing content.
- **`llms.txt`** (`public/llms.txt`): an emerging convention (alongside `robots.txt`) for giving AI
  crawlers/agents a short, structured summary of what the site is and where the key pages are — the concrete,
  code-level half of "GEO" (generative engine optimization).
- **Generated OG image** (`src/app/opengraph-image.tsx`): built with `next/og`'s `ImageResponse`, no design
  tool needed — renders at request time from React/CSS.

## What "GEO" means here in practice

Generative engine optimization isn't a separate technology — it's writing content so an LLM summarizing your
site gets the facts right and wants to quote you directly:
- Short, direct, factual sentences ("Free: 3 projects, local ANu only...") instead of marketing fluff answer
  engines have to paraphrase or guess at.
- One clear canonical answer per question (the FAQ page) rather than the same fact scattered across prose.
- Structured data so machines don't have to infer facts from layout.

## What's still needed before this actually ranks/gets cited

1. **A real domain.** Set `NEXT_PUBLIC_SITE_URL` (in `apps/studio/.env.local` and your hosting provider's env
   config) to your real domain once purchased — everything above (canonical URLs, sitemap, OG tags) derives
   from this and currently falls back to a placeholder (`https://andevstudio.com`).
2. **Submit the sitemap** to Google Search Console and Bing Webmaster Tools once deployed.
3. **Backlinks and mentions** — SEO ranking still depends heavily on other sites linking to you (Show HN, dev
   blogs, directories like AlternativeTo/Product Hunt). No code fixes this; it's distribution work.
4. **Real screenshots/demo video** — the landing page currently has no visual proof of the product working;
   see the root README's screenshots placeholder. A short demo GIF/video embedded on `/features` would help
   both conversion and engagement signals search engines weight.
