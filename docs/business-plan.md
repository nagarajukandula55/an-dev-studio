# AN Dev Studio — Business Plan (AN Group)

Practical, numbers-first plan for running AN Dev Studio as a real product under AN Group. This is a planning
document, not legal or financial advice — validate the numbers against your own accounts before committing to
pricing publicly.

---

## 1. What you're selling

A **desktop-first, local-first AI app builder**. The product itself (`apps/studio`) is done — six agents,
approval-gated execution, a verify-and-fix loop, SQLite persistence, Free/Pro/Team plan gating. What's left is
business infrastructure, not code.

## 2. Cost structure

This is unusually cheap to run because there's no hosted backend serving other people's AI calls — users bring
their own AI provider (local ANu, or their own Groq/Gemini/etc. key). Your costs are:

| Cost | Est. monthly | Notes |
|---|---|---|
| Domain (e.g. `andevstudio.com` or similar) | ~$1–2/mo (~$12–20/yr) | One-time-ish, renews yearly |
| Lemon Squeezy transaction fees | 5% + $0.50 per transaction | No monthly fee — pay only when you sell |
| Marketing/landing page hosting | $0 | Static, can ride on Vercel/Netlify free tier or the same box as the app |
| Support email | $0–6/mo | Free with most domain registrars, or Google Workspace (~$6/user/mo) if you want a real inbox |
| Code signing cert (Windows installer) | ~$100–400/yr | Optional — unsigned installers trigger a SmartScreen warning; matters more once you have real users |
| **Total fixed cost to launch** | **~$15–40/mo** | Excluding optional code signing |

You are **not** paying for AI inference — that's the whole point of "local-first, BYO provider." This means your
margin on every Pro subscription is close to 95% (minus Lemon Squeezy's cut).

## 3. Revenue model

Plan limits already implemented server-side in `apps/studio/src/lib/licensing/plans.ts`:

| Plan | Suggested price | What unlocks |
|---|---|---|
| Free | $0 | 3 projects, local ANu only, 2-iteration verify loop |
| Pro | **$19/mo or $180/yr** (suggested — adjust to market) | Unlimited projects, full provider chain, 5-iteration loop + auto-approve |
| Team | TBD, not built | Shared seats — build this once you have Pro customers asking for it |

### Suggested pricing rationale
- $19/mo positions against Cursor ($20/mo) and similar AI dev tools — familiar price anchor.
- Consider a lifetime-license option ($149–199 one-time) for a desktop-first audience that dislikes subscriptions —
  Lemon Squeezy supports one-time products alongside subscriptions.
- Annual discount (~20%, i.e. $180/yr instead of $228/yr) improves cash flow and reduces churn.

### Revenue scenarios (illustrative, not a forecast)

| Pro subscribers | MRR @ $19/mo | Annual (after LS fees ~5.5%) |
|---|---|---|
| 10 | $190 | ~$2,150/yr |
| 100 | $1,900 | ~$21,500/yr |
| 1,000 | $19,000 | ~$215,000/yr |

Getting to even 100 paying users requires actual distribution (see §5) — the product being good is necessary but
not sufficient.

## 4. What YOU need to do (outside this codebase)

Concrete, ordered checklist — none of this is something I can do for you:

1. **Register the business identity.** If "AN Group" isn't already a registered entity, decide whether you're
   selling as a registered company, a sole proprietorship, or an individual. This affects tax handling and what
   Lemon Squeezy will ask for during onboarding.
2. **Create a Lemon Squeezy account** under AN Group. Set up:
   - A **Store** for AN Dev Studio.
   - A **Pro product** (subscription, $19/mo suggested) and optionally a lifetime one-time product.
   - Copy the resulting Store ID and Product ID into `apps/studio/.env.local` as `LEMONSQUEEZY_STORE_ID` and
     `LEMONSQUEEZY_PRODUCT_ID` (see `lib/licensing/LicenseManager.ts`).
   - Update the checkout URL placeholder (`https://an-dev-studio.lemonsqueezy.com/checkout`) in
     `src/app/settings/page.tsx` (PlanTab) and `src/app/(marketing)/pricing/page.tsx` with your real checkout link.
3. **Buy a domain** and point it at wherever you deploy the app/landing page.
4. **Set up a support inbox** (e.g. `support@yourdomain.com`) and put it in the pricing/settings pages in place of
   the placeholder `hello@angroups.dev`.
5. **Replace the placeholder legal pages.** `src/app/(marketing)/terms/page.tsx` and `.../privacy/page.tsx` are
   explicitly marked as unreviewed placeholders — get real Terms of Service and a Privacy Policy (a template
   service like Termly/GetTerms, or a lawyer, depending on your risk tolerance) before taking real payments.
6. **Fix the GitHub App's repository permissions** if you want AI-assisted pushes to work from a Claude Code
   session going forward (see the earlier conversation — it's currently 403'd).
7. **Decide on code signing** for the Windows installer once you have real users — unsigned `.exe`/`.msi` installers
   trigger a Windows SmartScreen warning that scares off non-technical users.
8. **Pick a support/community channel** (Discord, a GitHub Discussions tab, or just email) for the "Community
   support" promised to Free users.

## 5. Getting your first users (distribution, not code)

The product being finished doesn't create users. Cheapest channels for a dev tool like this:
- **Show HN / r/programming / r/LocalLLaMA** — the "local-first, your code never leaves your machine" angle is a
  genuinely differentiated pitch for the privacy-conscious segment of that audience.
- **Twitter/X + a short demo video** — a 30-second clip of prompt → plan → approve → running app converts well for
  builder tools.
- **Compare-to-Cursor/Copilot/Emergent positioning** on the landing page — you already have this in
  `src/app/(marketing)/pricing/page.tsx`'s privacy-pitch section; lean into "approval-gated, sandboxed, local-first"
  as the wedge against cloud-only competitors.

## 6. What's already done vs. still needed

| | Status |
|---|---|
| Plan gating (server-side) | ✅ Done — Phase 5 |
| License activation against Lemon Squeezy | ✅ Done (needs a real store/product ID — see §4.2) |
| Pricing page | ✅ Done — `src/app/(marketing)/pricing/page.tsx` |
| Terms/Privacy | ⚠️ Placeholder only — needs real legal text |
| Payment provider account | ❌ Not created — you need to do this |
| Domain | ❌ Not purchased |
| Support channel | ❌ Not set up |
| Distribution/marketing | ❌ Not started |
