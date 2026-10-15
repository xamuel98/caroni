# Design Engineering Strategy — Caroni

> Deliverable set requested before implementation: skills assessment → reference study → existing-frontend assessment → recommended stack → principles/standards → component motion matrix → execution plan → validation criteria.

Status: **Draft v0.1** · Author: design-engineering pass · Applies to: `apps/consumer-portal`, `apps/ops-console`, `packages/design-system`

---

## 0. Method & Evidence

| Phase | What I did | Confidence |
|---|---|---|
| Skills | Listed `~/.agents/skills`, `~/.claude/skills`; fetched `github.com/emilkowalski/skills`; **read the actual SKILL.md files** for `emil-design-eng`, `review-animations`, `animation-vocabulary` | **Verified** |
| Repo audit | Listed the repo tree; searched for `package.json` | **Verified** — no frontend exists |
| Reference study | Stripe / Cloudflare / Linear / Vercel | **Knowledge-based** (their sites are client-rendered SPAs; `fetch` yields little reliable DOM). Findings marked *obs* (documented/known) vs *hyp* (hypothesis). No pixel values are claimed as measured. |

---

## 1. Design Engineering Skills Assessment

### 1.1 Installed locally (verified present)
| Skill | Installed | Use in this project | Stage |
|---|---|---|---|
| `emil-design-eng` | ✅ `~/.agents/skills` | The master motion/design rulebook — decision framework, easing, durations, springs, GPU rules | Every UI PR |
| `review-animations` | ✅ | Strict motion review (ten non-negotiables, findings table, Block/Approve) | Review gate |
| `animation-vocabulary` | ✅ | Precise naming in specs/PRs ("origin-aware", "stagger") | Specs / comms |
| `apple-design` | ✅ | Fluid-motion + material/depth principles for gesture-heavy surfaces | Sheets, gestures |
| `accessibility` | ✅ | WCAG 2.2 audit of core flows | Review gate |
| `web-design-guidelines` | ✅ | Interface-guideline conformance review | Review gate |
| `ui-ux-pro-max` | ✅ | Palette/type/pairing generators, stack-specific recipes | Foundation |

### 1.2 Upstream but **not installed** (verified absent)
From `emilkowalski/skills` (MIT, `npx skills@latest add emilkowalski/skills`):
`animate`, `improve-animations`, `find-animation-opportunities`, `animation-performance`, `pick-ui-library`, `prototype`, `mobile-native`, `break-ui`, `ask-sonner`, `animate-expo`, `write-swift`.

| Skill | Needed? | Why |
|---|---|---|
| `pick-ui-library` | **Yes** | Pick primitives/table/motion libs by trusted criteria instead of hand-rolling |
| `animate` | **Yes** | Builds one animation with correct curve/duration/properties |
| `improve-animations` | **Yes** | Codebase-wide motion audit → prioritized fix plans |
| `find-animation-opportunities` | **Yes** | Tells us where motion helps **and where not to animate** |
| `animation-performance` | **Yes** | Diagnose dropped frames (ops dashboards run under load) |
| `prototype` | **Yes** | A/B a few versions of visually critical components behind a switcher |
| `break-ui` | **Yes** | Worst-case data (long names, huge counts, empty lists) — vital for tables |
| `mobile-native` | **Yes** | Consumer portal on phones (sticky hover, 100vh, tap delay, safe areas) |
| `ask-sonner` | Optional | Only if we adopt Sonner for toasts |
| `animate-expo`, `write-swift` | **No** | No React Native / Swift in Caroni |

**Decision:** install the "Yes" set. Command:
```bash
npx skills@latest add emilkowalski/skills
```
If installation is not possible in this environment, the applicable rules are already captured in Section 5 (they're largely the `emil-design-eng` body I read), so we are **not** blocked — we just lose the automated auditors. I will not claim a skill ran if it didn't.

> Note: `review-animations` is `disable-model-invocation: true` — it must be invoked deliberately (it's a review, not an auto-loaded rulebook).

---

## 2. Reference Research Findings

### 2.1 Stripe
- *obs* Typography-led hierarchy; generous vertical rhythm; **soft, layered shadows** over hard borders; restrained color with one accent; motion is minimal and almost entirely **purpose/feedback** (button press, payment status).
- *obs* Financial **status communication** is the design center: clear states, receipts, error recovery.
- **Adopt:** status-as-first-class (pills, timelines, receipts); soft elevation; calmer, trust-forward tone.
- **Reject:** heavy marketing gradients/glow in the *app* surfaces (fine on a landing page, wrong for a dashboard).

### 2.2 Cloudflare
- *obs* **Density done well** — data-heavy consoles (analytics, rules) with compact rows, monospace numerics, strong table affordances; a documented design system (**Kumo**).
- *obs* Left-rail navigation, breadcrumbs, permission-gated nav.
- **Adopt:** data-dense table conventions, monospace figures, dense-but-legible spacing — the **ops console** template.
- **Reject:** maximum-density everywhere; the consumer portal should breathe more.

### 2.3 Linear
- *obs* **Keyboard-first**, command palette (⌘K), near-instant navigation, **very fast** subtle motion; Inter; crisp focus rings; minimal chrome.
- *obs* Motion is fast and mostly *spatial continuity* (lists/panels), rarely decorative.
- **Adopt:** command palette; keyboard-complete flows; sub-200ms navigation motion; focus visibility as a feature.
- **Reject:** assuming power users — our consumer surface needs discoverable, mouse/touch-friendly affordances too.

### 2.4 Vercel
- *obs* **Geist** type system (open) — geometric sans + mono; high contrast; precise spacing; **restrained** motion; empty states treated as designed content.
- **Adopt:** a first-class type system with **tabular/mono numerals for money & IDs**; designed empty/loading/error states.
- **Reject:** the ultra-minimal "marketing" look in place of functional density where ops work demands it.

**Cross-cutting synthesis (the shared DNA):** strong type hierarchy · disciplined spacing · soft elevation · semantic color · fast purposeful motion · designed states · keyboard + a11y · density proportional to intent.
**Our direction (not a copy):** *a payments/ops console with Stripe's trust, Cloudflare's table density, Linear's speed, and Vercel's type discipline — but a motion language that is quieter than all four, because money interfaces reward calm over delight.*

---

## 3. Existing Frontend Assessment

**Finding: greenfield.** No `apps/`, no components, no tokens, no motion deps. The only `package.json` is `tools/gh-sync`.

Implications (this changes the brief):
- There is nothing to "retain or revise" — the risk is the opposite: **decisions made now set the quality ceiling.** Getting tokens, primitives, and motion budget right before writing components matters more than iterating later.
- The stack in `TECH_DESIGN.md` is the starting constraint: **Vite + React + TS SPA; Tailwind + Radix + CVA; shared `@caroni/design-system`; TanStack Query.** We build the foundation *as part of* M0–M1 rather than auditing it.
- **Action:** treat `packages/design-system` as the first real frontend deliverable, not an afterthought.

---

## 4. Recommended Design & Motion Stack

| Concern | Choice | Reasoning |
|---|---|---|
| Framework | **Vite + React + TS SPA** | Per TDD; authenticated dashboards don't need SSR |
| Styling | **Tailwind v4 (CSS-first) + CSS variables** | Tokens as CSS vars → theming/dark mode/per-branch; no JS runtime |
| Tokens | CSS custom properties in `@caroni/design-system` | Single source; consumed by Tailwind theme |
| Primitives | **Radix UI** (evaluate **Base UI** as successor) | Headless a11y + `--radix-*-content-transform-origin` for origin-aware popovers |
| Variants | **CVA** | Typed component variants without a runtime |
| Icons | **Heroicons — solid** (`@heroicons/react/24/solid`, plus `20/solid`, `16/solid`) | Filled, confident, premium; consistent optical weight; tree-shakeable. Use 24 for primary, 20/16 for dense UI; never below 16 with solid (detail muddies) |
| Type | **Inter** (UI) + **Geist Mono** or system mono (numbers/IDs) | Strong hierarchy; tabular figures for money |
| Tables | **TanStack Table** | Ops console is table-centric (sort/filter/virtualize) |
| Motion (default) | **CSS transitions + `@starting-style` + WAAPI** | Off-main-thread, interruptible, no bundle cost |
| Motion (targeted) | **Motion (`motion/react`)** only for gesture/spring/drag | Springs for interruptible gestures; not for standard UI |
| Drawers/sheets | **Vaul** | Battle-tested drag-to-dismiss with momentum |
| Toasts | **Sonner** | Cohesive, accessible, interruptible (its author wrote these rules) |
| Command palette | **cmdk** | ⌘K in ops console |
| Contracts | **Zod** (`shared-types`) | FE/BE single source |
| A11y testing | **axe-core + Playwright** | Enforce in CI |
| Visual testing | **Storybook + Playwright snapshots** | Catch regressions |

**Explicitly rejected:** GSAP/Timeline motion for app UI (wrong tool — that's for scroll/storytelling, not dashboards); Framer-Motion everywhere (`x/y/scale` run on the main thread under load — the Vercel dashboard frame-drop lesson); any second design system.

---

## 5. Design Principles & Interaction Standards

### 5.1 Motion — decision rules (from `emil-design-eng`, internalized)
1. **Should it animate?** Frequency first — 100+/day ⇒ **none** (⌘K toggle, keyboard nav); tens/day ⇒ remove/reduce; occasional ⇒ standard; rare/first-time ⇒ may delight.
2. **Purpose test.** No animation without a reason: spatial consistency · state indication · feedback · explanation · preventing a jarring change.
3. **Easing.** Enter/exit → `ease-out`/strong custom curve. On-screen move/morph → `ease-in-out`. Hover/color → `ease`. Constant → `linear`. **Never `ease-in` on UI.**
4. **Duration budget.** UI stays **<300ms**. Button press 100–160 · tooltip 125–200 · dropdown 150–250 · modal/drawer 200–500.
5. **Physicality.** Never `scale(0)` (start 0.95–0.97 + opacity). Popovers/dropdowns/tooltips scale from **trigger** (`transform-origin`); **modals stay centered**.
6. **Interruptibility.** Rapid/gesture motion uses **transitions or springs**, not keyframes (keyframes restart from zero).
7. **GPU only.** Animate `transform`/`opacity`; never `width/height/margin/padding/top/left`.
8. **Asymmetric timing.** Deliberate phase slower, system response snaps.
9. **Reduced motion.** Gentler, not zero — keep opacity/color, drop movement.
10. **Cohesion.** Match the component's personality; a dashboard stays crisp. When unsure → **delete**.

### 5.2 Motion tokens (define in `design-system`, CSS vars)
```css
:root {
  /* durations */
  --dur-instant: 0ms;      /* keyboard/high-frequency */
  --dur-press: 130ms;      /* button feedback */
  --dur-fast: 160ms;       /* micro-interactions */
  --dur-base: 200ms;       /* dropdowns, tooltips, selects */
  --dur-slow: 280ms;       /* modals, sheets */
  --dur-page: 320ms;       /* route transitions (rare here) */

  /* easing — strong custom curves, not CSS defaults */
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* enter/exit */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* on-screen move */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);   /* iOS sheet */
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-press: 0ms; --dur-fast: 80ms; --dur-base: 100ms; --dur-slow: 120ms; }
}
```

### 5.3 Visual system
- **Spacing:** 4px base rhythm (4/8/12/16/24/32/48/64). No arbitrary values.
- **Type scale:** 12/13/14/**16**/18/20/24/32; UI base 14 for density, 16 for consumer reading; line-height 1.4–1.5 body, 1.2 headings.
- **Color:** semantic tokens only — full light/dark system in **Section 5.6**. Raw hex never appears in components.
- **Elevation:** soft layered shadows + 1px subtle borders (semi-transparent), not heavy drop shadows.
- **Radii:** scale 6/8/10/12; consistent per element class.
- **Numerals:** `font-variant-numeric: tabular-nums` for all money, IDs, tables.
- **Density:** ops console compact; consumer portal comfortable.

### 5.4 Accessibility (non-negotiable)
Focus-visible rings always; keyboard-complete flows; correct roles/ARIA; `prefers-reduced-motion`; hover motion gated behind `@media (hover:hover) and (pointer:fine)`; WCAG 2.1 AA minimum (2.2 where feasible).

### 5.5 Performance
CWV budgets (LCP<2.5s, CLS<0.1, INP<200ms); GPU-only animation; virtualize long tables; route code-splitting; no layout thrash; test on throttled CPU + slow network.

### 5.6 Color system (light & dark)

**Principles**
- **Never pure `#000` / pure white** for large areas — off-black text, off-white page. Pure black/white look cheap and cause halation.
- **Cool-neutral greys** (a faint ~4–6% blue cast) read as precise and premium — right for a fintech product. Warm/sand greys would feel softer, less "systems-grade".
- **Borders do the work.** Separators are 1px hairlines at low contrast, not heavy shadows. This is the single biggest thing that separates crafted UI from "AI dashboard".
- **Elevation differs by mode:** in **light**, elevation = hairline border **+ very soft, low-opacity shadow**; in **dark**, elevation = a **lighter surface** (shadows are invisible on dark).
- **One accent** (Iris). Status colours are separate and strictly semantic — never brand a control with green/red/amber.
- Everything is a **CSS variable**; components reference semantic tokens, never ramp steps or hex.

**Neutral ramp (cool slate)** — steps `0→9`; light and dark are tuned independently (not a naive inversion).

| Step | Light | Dark | Typical role |
|---|---|---|---|
| 0 | `#FFFFFF` | `#0C111D` | page base |
| 1 | `#F9FAFB` | `#101828` | surface / panel |
| 2 | `#F2F4F7` | `#1D2939` | sunken / raised |
| 3 | `#EAECF0` | `#344054` | border |
| 4 | `#D0D5DD` | `#475467` | border-strong |
| 5 | `#98A2B3` | `#667085` | text-disabled |
| 6 | `#667085` | `#98A2B3` | text-muted |
| 7 | `#475467` | `#D0D5DD` | text-secondary |
| 8 | `#344054` | `#EAECF0` | text-tertiary |
| 9 | `#101828` | `#F9FAFB` | text (primary) |

**Semantic tokens**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F9FAFB` | `#0C111D` | app background |
| `--surface` | `#FFFFFF` | `#101828` | cards, panels |
| `--surface-raised` | `#FFFFFF` | `#1D2939` | menus, popovers, modals (light = white + shadow) |
| `--surface-sunken` | `#F2F4F7` | `#0C111D` | wells, insets, table stripes |
| `--border` | `#EAECF0` | `#1D2939` | hairlines, dividers |
| `--border-strong` | `#D0D5DD` | `#344054` | inputs, emphasis |
| `--text` | `#101828` | `#F9FAFB` | primary text |
| `--text-secondary` | `#475467` | `#D0D5DD` | supporting text |
| `--text-muted` | `#667085` | `#98A2B3` | labels, meta, table headers |
| `--text-disabled` | `#98A2B3` | `#667085` | disabled only |
| `--accent` | `#444CE7` | `#8098F9` | primary action (Iris) |
| `--accent-hover` | `#3538CD` | `#A4BCFD` | hover |
| `--accent-fg` | `#FFFFFF` | `#0C111D` | text/icon on accent |
| `--ring` | `#6172F3` | `#8098F9` | focus ring (use at ~35% alpha for the halo) |

**Status (semantic, separate from brand)**

| Token | Light | Dark | Subtle bg (light / dark) |
|---|---|---|---|
| `--success` | `#12B76A` | `#32D583` | `#ECFDF3` / `#052E1F` |
| `--warning` | `#F79009` | `#FDB022` | `#FFFAEB` / `#3A2A05` |
| `--danger` | `#F04438` | `#F97066` | `#FEF3F2` / `#3A0D0A` |
| `--info` | `#2E90FA` | `#53B1FD` | `#EFF8FF` / `#0A2540` |

**Grey usage rules (the "make it feel expensive" rules)**
- Page bg is **`#F9FAFB` (light)** / **`#0C111D` (dark)** — *not* pure white/black.
- Cards are `#FFFFFF` (light) sitting on the off-white page; the contrast between the two is deliberately tiny and carried by a hairline + soft shadow.
- **Dark-mode separation** comes from surface lightening: `#0C111D → #101828 → #1D2939 → #344054`. Never rely on shadow in dark.
- **Hover:** light = step toward `#F2F4F7`; dark = step toward `#1D2939`. Hover text/icon darkens/lightens one text step.
- **Table headers and labels** use `--text-muted`; body uses `--text`; the muted-to-primary contrast is the main hierarchy lever.
- **Disabled** is a state, not a colour system — use `--text-disabled` + reduced opacity, keep contrast low intentionally.
- **Dividers** only where needed; prefer spacing over rules.

**Contrast targets (verify in CI with axe):** body text ≥ 7:1; secondary/muted ≥ 4.5:1; icons for active controls ≥ 3:1; focus ring ≥ 3:1 against both surface and background. If accent-on-surface dips below 4.5:1, step `--accent` to `#3F45C8` (light) / `#93A7FF` (dark).

**Per-branch theming:** only `--accent`, `--accent-hover`, `--ring`, and a brand logo change per branch. **Neutrals never change** — that's what keeps every branch feeling like the same product.

---

## 6. Component Motion Decision Matrix

| Component | Animate? | Technique | Notes |
|---|---|---|---|
| Primary button press | Yes (feedback) | `scale(0.97)` `--dur-press` `ease-out` | Applies to all pressables |
| Nav / sidebar item hover | Reduced | `ease` color/opacity | Gate behind hover media query |
| Dropdown / select menu | Yes | opacity+`scale(0.96)`, origin-aware, `--dur-base` | From trigger; `ease-out` |
| Popover / tooltip | Yes (tooltip subtle) | fade+`scale(0.97)`, origin-aware | Instant on subsequent tooltips |
| Dialog / modal | Yes | fade+`scale(0.98)`, centered, `--dur-slow` | Keep origin centered |
| Drawer / bottom sheet | Yes | `translateY` + Vaul, `--ease-drawer` | Drag-to-dismiss with momentum |
| Tabs / segmented | Yes | layout indicator (clip-path/transform) | Interruptible |
| Data table row hover | Subtle | background `ease` | No motion animation |
| Table sort/filter | Minimal | instant re-render; optional FLIP on reorder | Never animate 100 rows at once |
| Command palette (⌘K) | **No** (open/close) | instant | Keyboard = 100+/day |
| Form validation error | Yes | small slide+fade, `--dur-fast` | Not `shake` on every keystroke |
| Toast in/out | Yes | `translateY` + opacity, transitions (not keyframes) | From consistent edge |
| Skeleton → content | Yes | crossfade / `@starting-style` | No layout shift |
| Empty / error states | Fade only | `--dur-fast` | Designed content, not motion |
| Route / page transition | Rare, minimal | fade `--dur-page` | Only where it aids continuity |
| Dashboard KPI count-up | Rare | number ticker, tabular | Only on first load, once |
| Destructive confirm | Asymmetric | slow deliberate confirm, snappy cancel | Match weight to consequence |

**Rule of thumb:** if it's keyboard-initiated or seen constantly, it does not animate.

---

## 7. Prioritized Execution Plan

| Phase | Deliverable | Gate |
|---|---|---|
| **P0 — Install & wire** | `npx skills@latest add emilkowalski/skills`; scaffold `packages/design-system` with tokens (color/type/space/motion) + Tailwind preset | Tokens compile; dark mode flips via CSS vars |
| **P1 — Primitives** | Button, Input, Select, Dialog, Popover, Tooltip, Toast, Table on Radix+CVA, motion tokens applied | `review-animations` **Approve** on the primitive set |
| **P2 — Motion budget** | Apply Section 6 matrix to primitives; reduced-motion + hover gating everywhere | `review-animations` + `accessibility` clean |
| **P3 — Ops console shell** | Sidebar (permission-filtered), data table, ⌘K palette | `break-ui` (worst-case data) + perf pass |
| **P4 — Consumer portal** | Send-to-tag, history, KYC, team — consumer-grade polish | `mobile-native` + `animation-performance` clean |
| **P5 — Prototypes** | For ambiguous/high-visual pieces (send-money confirmation, approval flow) → `prototype` switcher → decide | Written decision per prototype |
| **P6 — Continuity** | Route transitions only where they help; shared-element where identity matters | Whole-app motion consistency review |

Order rationale: tokens → primitives → budget → surfaces. Never build features on un-tokened primitives (that's how "AI slop" starts).

---

## 8. Validation & Acceptance Criteria

A component is **done** only when:
- **Visual:** on-grid spacing; semantic color tokens only (no raw hex); correct grey ramp + elevation per Section 5.6; no pure `#000`/white surfaces; type hierarchy clear; tabular numerals for money; light **and** dark both correct; contrast targets met.
- **Motion:** every animation justified (frequency + purpose); easing/duration within Section 5; origin correct; interruptible where needed; reduced-motion honored; hover gated.
- **A11y:** keyboard-complete; focus visible + restored; roles/ARIA correct; axe clean; ≥4.5:1 text contrast.
- **Performance:** GPU-only properties; no dropped frames under 4× CPU throttle; no CLS; within CWV budgets.
- **Robustness:** survives `break-ui` worst-case data; empty/loading/error states designed.
- **Review:** passes `review-animations` (Approve, not Block) and a `web-design-guidelines`/`accessibility` pass.

**Rejected on sight (matches the brief):** `transition: all`; `scale(0)` entrances; `ease-in` on UI; motion on ⌘K/keyboard actions; >300ms UI; origin:center on popovers; un-gated hover motion; animating layout props; generic gradient "AI dashboard" look; **pure `#000`/white surfaces**; heavy drop shadows; brand-coloured status states.

---

## 9. Open Decisions (need your input)
1. **Type:** Inter+mono (safe, fast) **vs** Geist (Vercel-like identity). Recommend **Inter** for UI + **Geist Mono** for numerals — pragmatic hybrid.
2. **Primitives:** **Radix** (mature, huge ecosystem) vs **Base UI** (modern successor). Recommend **Radix now**, revisit at P1.
3. **Aesthetic reference weighting:** Stripe-trust vs Cloudflare-density vs Linear-speed. Recommend **Cloudflare density for ops, Stripe trust for consumer, Linear speed for both**.
4. **Skills install:** OK to run `npx skills@latest add emilkowalski/skills`?
5. **Accent hue:** **Iris indigo `#444CE7`** (rec — premium, distinct from info-blue and status-green) vs a deeper violet `#5B4FE0` vs a navy `#1D4ED8`. Neutrals stay cool-slate regardless.
