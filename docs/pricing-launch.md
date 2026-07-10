# AN Dev Studio — Pricing & Launch Checkout Flow

Desktop-first monetization: **license keys, not hosted accounts.** No card handling happens inside the app itself — Lemon Squeezy's hosted checkout takes payment, then the user pastes the license key it emails them into Settings → Plan & License.

## Plans

Defined in one place — `apps/studio/src/lib/licensing/plans.ts` — enforced server-side in the API routes, not just the UI:

| | Free | Pro | Team *(flagged, not built)* |
|---|---|---|---|
| Projects | 3 | Unlimited | Unlimited |
| AI providers | Local ANu only | Full fallback chain (Groq/Cerebras/Mistral/Cloudflare/OpenRouter/Gemini/HuggingFace) | Full fallback chain |
| Verify-and-fix loop | 2 iterations, no auto-approve | 5 iterations, auto-approve allowed | 5 iterations, auto-approve allowed |
| Support | Community | Priority | Priority + shared seats |

## Checkout flow

1. **User clicks "Upgrade to Pro"** (Settings → Plan & License, or the marketing/pricing page in Phase 6) → opens the Lemon Squeezy hosted checkout for the Pro product (`LEMONSQUEEZY_STORE_ID` / `LEMONSQUEEZY_PRODUCT_ID` in the app's config identify which product that is — see `apps/studio/src/lib/licensing/LicenseManager.ts`).
2. **Lemon Squeezy handles payment** entirely on their hosted page. AN Dev Studio never sees or stores card details.
3. **Lemon Squeezy issues a license key** and emails it to the customer (and/or fires a webhook to a future licensing backend — not required for v1, since the app validates keys directly against Lemon Squeezy's license API).
4. **User pastes the key into the app** (Settings → Plan & License → License key → Activate). The app calls Lemon Squeezy's `/v1/licenses/activate` endpoint, and on success stores the key + plan locally (SQLite `settings` table) via `LicenseManager`.
5. **Ongoing validation**: the app re-checks the key against Lemon Squeezy's `/v1/licenses/validate` endpoint at most once per 24 hours. If the network is unreachable, the last successful validation is trusted for a **7-day offline grace period** — the app never bricks itself because the user's Wi-Fi is down. If the key comes back genuinely invalid (revoked/refunded), the plan demotes to Free immediately rather than waiting out the grace period.

## Swapping to Paddle later

`LicenseManager` implements one contract — `activate(key)` / `revalidate()` / `getStatus()` / `deactivate()` — against Lemon Squeezy's API today. A future move to Paddle (or any other license-key provider) means re-implementing that same contract against Paddle's API; nothing else in the app (the gated routes, the Settings UI, `plans.ts`) needs to change.

## What's NOT built yet

- The actual Lemon Squeezy store/product isn't provisioned — `LEMONSQUEEZY_API_BASE`/`LEMONSQUEEZY_STORE_ID`/`LEMONSQUEEZY_PRODUCT_ID` are placeholders in `LicenseManager.ts`, and the "Upgrade to Pro" link in Settings points at a placeholder checkout URL. Wire these up to a real store before launch.
- A webhook receiver isn't built — v1 relies entirely on the user pasting the key and the app validating it directly against Lemon Squeezy's license API, which is sufficient for a single-user desktop app and avoids standing up a server component just for licensing.
- The Team plan is a placeholder tier in `plans.ts` (`TEAM_PLAN_FLAGGED = true`) — same limits as Pro today, no shared-seat logic yet.
