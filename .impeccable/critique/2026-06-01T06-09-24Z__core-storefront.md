---
target: core-storefront
total_score: 22
p0_count: 0
p1_count: 2
timestamp: 2026-06-01T06-09-24Z
slug: core-storefront
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Loading skeletons and payment countdown exist, but some async/payment errors still surface as operational failures. |
| 2 | Match System / Real World | 3 | Shopping concepts are understandable, but mixed Thai/English labels and technical migration errors reduce trust. |
| 3 | User Control and Freedom | 2 | Filters and carousel controls exist, but checkout/payment recovery and cancel paths are weak. |
| 4 | Consistency and Standards | 2 | Buttons, status pills, active nav, wishlist confirmation, and product CTAs use different visual vocabularies. |
| 5 | Error Prevention | 2 | Stock and idempotency are being hardened, but production still depends on DB migrations being present and synced. |
| 6 | Recognition Rather Than Recall | 3 | Product names, prices, categories, and nav labels are visible, but icon-only top actions need stronger labels or tooltips. |
| 7 | Flexibility and Efficiency | 2 | Search/filter/sort are useful, but keyboard, mobile shortcuts, and retry flows are limited. |
| 8 | Aesthetic and Minimalist Design | 2 | The site has a clean premium direction, but hero scale, saturated pink gradients, and repeated rounded cards make it feel less restrained. |
| 9 | Error Recovery | 2 | Product fetch retry exists, but payment/order errors need user-safe recovery and admin-facing diagnostics. |
| 10 | Help and Documentation | 1 | Size guidance, payment explanation, return policy, and failed payment next steps are not yet strong enough. |
| **Total** | | **22/40** | **Acceptable, but not production-confident yet** |

## Anti-Patterns Verdict

**LLM assessment**: The interface does not look like generic AI slop overall because it has a clear Bamblue identity: soft pink, boutique product imagery, rounded cards, and a consistent fashion-store direction. The weak point is that the same pink-gradient/card language appears too often, so premium becomes decorative instead of confidence-building. The hero currently feels more like a campaign poster than a shopping task, while checkout needs to feel more operational and trustworthy.

**Deterministic scan**: The detector found 17 issues across `src/app/products/page.jsx`, `src/app/product/[id]/ProductDetailClient.jsx`, `src/frontend/components/Navbar.jsx`, and `src/frontend/components/PromptPayQR.jsx`. Most findings are `gray-on-color` on tinted/colored states, plus 2 bounce-easing findings, 2 border-accent spinner findings, and 1 side-stripe selection marker in search suggestions. Some `gray-on-color` reports are false positives caused by conditional Tailwind classes, but the pattern is still real in hover/selected states.

**Visual overlays**: No reliable user-visible overlay was produced in this run. The available tool discovery exposed Node REPL only, not the Codex Browser mutation workflow required by the skill. Fallback signal used: CLI detector output plus source inspection and the user-provided screenshots.

## Overall Impression

Bamblue Store has a strong boutique direction and already feels more custom than a template. The biggest opportunity is to stop hiding or delaying core shopping content behind reveal mechanics, then tighten the system vocabulary so product browsing, wishlist, cart, checkout, and payment all feel like one dependable store.

## What's Working

- The visual identity is recognizable: Prompt font, soft pink accent, large product photography, and rounded product cards fit a sweet K-fashion store.
- Product browsing has useful controls: category, search, sort, sale-only, in-stock filter, pagination, skeleton loading, and empty state.
- Checkout hardening is moving in the right direction: server-side pricing, idempotency key, stock validation, and QR confirmation flow are the correct production shape.

## Priority Issues

**[P1] Core product content can be gated by animation triggers**

**Why it matters**: Users have already seen New Arrivals and product grids render blank until they navigate or interact. For ecommerce, invisible products are a revenue blocker, not just a visual bug.

**Fix**: Change reveal primitives so content is visible by default and animation enhances visibility instead of controlling it. Above-the-fold sections should use load animation only. Below-the-fold sections can animate in, but must not start from an invisible DOM state that can get stuck.

**Suggested command**: `$impeccable animate`

**[P1] Payment and order confidence still depends on operational schema sync**

**Why it matters**: A customer who sees a QR amount, confirms payment, then gets `column payment_method_details does not exist` loses trust immediately. Even after code fixes, production needs migration state, safe error copy, and admin diagnosis to be explicit.

**Fix**: Add a migration checklist or health check for checkout RPC columns, replace raw Supabase errors with user-safe messages, and keep technical details in server logs/admin diagnostics. Payment confirmation should show a clear retry/contact path without clearing cart prematurely.

**Suggested command**: `$impeccable harden`

**[P2] State colors and contrast are inconsistent**

**Why it matters**: Gray text on pink/red/green tinted states looks washed out and weakens readability. Active nav, filter pills, wishlist, QR actions, sale badges, and payment states should read as one system.

**Fix**: Define semantic tokens for primary, danger, success, warning, muted, selected, disabled, and focus. Use darker hue-matched text on tinted backgrounds instead of generic gray. Replace bounce easing with a calmer 150-250 ms state transition.

**Suggested command**: `$impeccable colorize`

**[P2] Hero and campaign layout compete with the shopping task**

**Why it matters**: The hero is memorable, but the massive uppercase typography and large decorative product collage can push the actual product discovery lower. For a store, campaign energy should guide users into products quickly.

**Fix**: Reduce heading max size and letter spacing, keep hero product cards fewer and more intentional, and make the primary CTA visually dominant. The hero should tell users what to buy next, not just establish mood.

**Suggested command**: `$impeccable layout`

**[P2] Mobile and action affordances are fragmented**

**Why it matters**: Wishlist confirmation, search suggestions, filters, carousel arrows, and top nav icons all work differently. Users must relearn interaction patterns across the same shopping flow.

**Fix**: Standardize button sizes, focus rings, selected states, confirmation controls, and icon labels. On mobile, make filter/search/wishlist/cart actions obvious without relying on icon memory.

**Suggested command**: `$impeccable polish`

## Persona Red Flags

**Jordan (First-time buyer)**: On the first shopping path, Jordan sees strong product visuals but may not understand the icon-only top actions or what happens after QR payment. A raw database error after confirming payment is an immediate abandonment trigger.

**Casey (Mobile shopper)**: Casey depends on fast scanning and obvious controls. Hidden carousel arrows on desktop versus bottom controls on mobile, icon-only actions, and filter sheet state changes increase friction.

**Riley (Stress tester / edge-case user)**: Riley will rapid-click add to cart, resize the viewport, navigate back after checkout, and retry payment. Current hardening helps, but animation visibility and migration-dependent checkout are still high-risk paths.

## Minor Observations

- `src/frontend/components/motion/MotionPrimitives.jsx` uses `whileInView` for broad sections. This is the root of several blank-content risks.
- `src/app/page.jsx` uses uppercase section typography and decorative hero materials heavily. One or two moments are fine, but repeated use reduces premium restraint.
- `src/frontend/components/PromptPayQR.jsx` uses `animate-bounce` on success. It reads playful, but payment confirmation should feel calm and trustworthy.
- `src/frontend/components/Navbar.jsx` search suggestion active state uses a left border accent. A full selected background or focus ring would be cleaner.
- There is no `DESIGN.md` yet, so design decisions are spread across Tailwind class strings instead of a documented system.

## Questions to Consider

- Should Bamblue prioritize campaign mood or checkout trust first? Current design spends more craft on hero mood than payment confidence.
- What should the user feel at QR confirmation: playful celebration, calm receipt, or admin-pending verification?
- Should product cards be a compact browsing grid, or a boutique lookbook grid with fewer items per row?
