# Yasin RMS One-Page Demo Website

## Overview

Build a premium one-page English/Urdu advertisement site for Yasin Rental Management System using Next.js, Tailwind, Framer Motion, and Lucide — visual mockups and demo data only, no backend.

## Goal

A single-page premium SaaS-style presentation site for **Yasin Rental Management System**. Visual/demo only. No auth, DB, APIs, uploads, payments, WhatsApp, or real PDFs.

Default language: English. Urdu switches content + RTL. Brand name **Yasin RMS** stays untranslated.

## Stack (already available / install on implement)

- Next.js + TypeScript + Tailwind (existing app in `my-app/`)
- Add: `framer-motion`, `lucide-react`
- App Router page: replace default home with the full landing page
- Deployable with `npm run dev` and Vercel (static client components + no env secrets)

## Architecture

```text
app/
  layout.tsx          # fonts, html lang/dir wrapper, metadata
  page.tsx            # composes all sections
  globals.css         # design tokens, gradients, glass utilities
components/
  Navbar.tsx
  LanguageSwitcher.tsx
  Hero.tsx
  ProblemSection.tsx
  SolutionSection.tsx
  Features.tsx
  FinancePreview.tsx
  HouseholdPreview.tsx
  TenantPreview.tsx
  ApprovalPreview.tsx
  RentAutomation.tsx
  InvoicePreview.tsx
  DashboardPreview.tsx
  ComingSoon.tsx
  WhyYasin.tsx
  Roadmap.tsx
  CTA.tsx
  Footer.tsx
  ui/                 # small shared bits: Section, Badge, GlassCard, AnimatedCounter, FakeChart
lib/
  i18n.ts             # EN + Urdu copy for all sections
  demo-data.ts        # fake metrics, tenants, household items, invoices
context/
  LanguageContext.tsx # language state + dir (ltr/rtl)
```

Language is frontend-only via React context (`en` | `ur`). Setting `ur` applies `dir="rtl"` on the document/root and swaps all section strings from `lib/i18n.ts`.

## Design system

- Palette: dark navy base (`#0B1220`), white/soft gray surfaces, violet accent, emerald (positive), amber (pending), red (warnings)
- Typography: distinctive premium fonts via `next/font` (e.g. **Plus Jakarta Sans** for UI + **Instrument Serif** or similar for display headings — not Inter/Roboto)
- Glass cards, subtle gradients, soft borders; premium SaaS ad look (cards used for interactive/demo panels only, not empty decorative boxes)
- Sticky navbar: transparent → blurred solid on scroll
- Framer Motion: hero entrance, scroll reveal, card stagger, counter ticks, timeline, chart draw-in, CTA — restrained, not noisy

## Page flow (one scrollable page)

1. **Navbar** — logo wordmark `Yasin RMS`, anchors (Home / Why / Features / How It Works / Future), `EN | اردو`, Explore CTA; mobile hamburger
2. **Hero** — badge, bilingual headline/support, CTAs, "A Smarter Way…" label + animated fake mini dashboard (properties, tenants, rent, pending, today's income/expense + small chart)
3. **Problem** — 6 problem cards
4. **Solution** — Before → Yasin RMS → After animated flow
5. **Features** — 9 feature cards (property, tenant, docs, rent, bills, payments, reports, daily finance, household)
6. **FinancePreview** — "Know Where Your Money Goes" mock summary + income/expense chart
7. **HouseholdPreview** — item cards (TV, fridge, sofa, AC, washer, bed, laptop) with fake values/condition
8. **TenantPreview** — 3-step flow + fake tenant profile card
9. **ApprovalPreview** — checklist + Reject / Request Changes / Approve (visual only)
10. **RentAutomation** — monthly timeline + copy
11. **InvoicePreview** — fake rent invoice + "PDF Invoice" visual badge
12. **DashboardPreview** — full-width mock dashboard (KPIs, charts, pending list)
13. **ComingSoon** — 8 cards with COMING SOON badge
14. **WhyYasin** — 6 reasons
15. **Roadmap** — Phase 1–8 timeline
16. **CTA** — bilingual closer + Explore / Coming Soon
17. **Footer** — brand, tagline, links, © 2027

Section `id`s match navbar anchors for smooth scroll.

## Implementation approach

- Client-heavy landing: `LanguageProvider` wraps page content; sections are client components where motion/i18n needed
- All numbers/charts from `demo-data.ts` (hardcoded)
- Charts: lightweight CSS/SVG + Framer Motion (no chart library required) for income/expense/rent bars
- Images for household: CSS placeholders / Lucide icons / soft gradient mock frames — no upload UI
- Responsive: desktop 2-col hero + dashboards; tablet/mobile stack; readable feature grids; hamburger nav
- Metadata in `layout.tsx`: title/description for Yasin RMS presentation site

## Explicit non-goals

No login, register, Supabase, DB, API routes for business logic, real forms that persist, real PDFs, WhatsApp, payments, or file uploads.

## Implementation todos

1. Add framer-motion + lucide-react; set fonts, globals.css tokens, LanguageContext + i18n/demo-data
2. Build Navbar, LanguageSwitcher, Hero with animated fake dashboard
3. Build Problem, Solution, Features, Finance, Household, Tenant, Approval sections
4. Build RentAutomation, Invoice, full DashboardPreview mockups
5. Build ComingSoon, WhyYasin, Roadmap, CTA, Footer; wire page.tsx + anchors
6. Responsive polish, EN/UR + RTL check, animation restraint, fix TS issues

## Done criteria

- `npm run dev` shows the full page with no TS/console errors
- EN ↔ Urdu switches content + RTL
- Anchors, mobile menu, and animations work
- Looks like a high-end product launch page; Vercel-ready (no secret env needed)
