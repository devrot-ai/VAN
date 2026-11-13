# VAN

One connected platform that helps independent farmers manage their entire
agricultural business — farm intelligence and management, machinery and
equipment access, people and agricultural services, harvest and logistics,
finance and commerce, and connected devices.

This repository contains the full product in one Next.js codebase:

- **Public company website** — vision, the six pillars, and how to join.
- **Authenticated platform** — separate portals for farmers, equipment and
  service providers, cooperatives, produce buyers, and internal VAN
  operations.

## Stack

| Layer     | Choice                                            | Why                                                |
| --------- | ------------------------------------------------- | -------------------------------------------------- |
| Framework | Next.js 15 (App Router, React 19, TypeScript)     | Server components + server-side authorization      |
| Styling   | CSS Modules + design tokens (`app/globals.css`)   | No runtime CSS framework; every token in one place |
| Database  | SQLite (Node's built-in `node:sqlite`)            | Zero native dependencies; file DB under `data/`    |
| Auth      | scrypt password hashing + DB-backed httpOnly sessions | Rotatable, revocable sessions; no JWT secrets in cookies |
| Weather   | Open-Meteo (keyless, free) via `lib/weather.ts`   | Real integration; fails soft and never fabricates data |

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Requirements: Node.js 24+ (for `node:sqlite`).

The database file lives at `data/van.db`. It is created and migrated
automatically on first request; a fresh checkout seeds demo accounts and
sample records on first run.

### Demo accounts

All demo accounts use the password `demo1234`.

| Role        | Email                | Portal       |
| ----------- | -------------------- | ------------ |
| Farmer      | `demo@van.farm`      | `/app`       |
| Provider    | `provider@van.farm`  | `/provider`  |
| Cooperative | `coop@van.farm`      | `/cooperative` |
| Buyer       | `buyer@van.farm`     | `/buyer`     |
| Operations  | `ops@van.farm`       | `/operations` |

Farmer accounts with `@van.farm` emails are labelled as demo accounts in the
interface, and all of their records are sample data. Real weather is real:
set a farm location under **My Farm → Farm profile** and the Home and
Intelligence pages fetch live observations from Open-Meteo.

## Email delivery status (important)

VAN does not claim emails were sent when they weren't. `lib/mail.ts`
centralises delivery; today no SMTP provider is configured, so:

- **Verification** — after registration, the link is displayed on screen with
  a clear explanation (single-use, 24h expiry, SHA-256-hashed in the DB).
  Opening it shows a **Confirm verification** button: the page validates the
  token read-only first, and the single-use token is only consumed when you
  confirm — so link prefetches can't burn it.
- **Recovery** — the flow works end-to-end; the response only contains a
  usable link when `VAN_MAIL_FROM` is unset. Once a mail provider is wired,
  links move to email automatically and the API stops returning them.

To enable production-style behaviour, set `VAN_MAIL_FROM=VAN <no-reply@…>` and
implement `deliver()` in `lib/mail.ts`.

## Design language

A calm, premium "farm operations" identity — the site and product feel like a
clear working system rather than a generic SaaS template:

- **Type** — self-hosted Fraunces variable (in `public/fonts`, OFL licence)
  for display headings via `next/font/local` (no build-time network calls);
  sans for body, UI and data tables. Uppercase letterspaced micro-labels
  (`.eyebrow`) for section eyebrows.
- **Structure** — the platform is presented as a **register**: numbered
  operating rows, hairline-ruled columns and print-style figure captions,
  headed by a wide, hand-built CSS-3D pipeline maquette
  (`Plan → Prepare → Grow → Harvest → Sell`) that you can drag to rotate,
  with readable stage labels.
- **Shape** — sharp editorial geometry: squared panels, quiet 1px rules and
  flat surfaces. No shadows, gradients or hover-lift decoration; buttons,
  inputs and navigation share the same restrained language across the public
  site, auth flow and portals.
- **Colour** — deep forest, sage field neutrals and harvest ochre accents on
  cream, drawn from the ledger palette. All text pairs meet WCAG AA.
- **Honest content** — the homepage figure is labelled as an illustration;
  the pillar index lists real product pillars; portals separate sample
  records with explicit "Demo account" notices.

## Security model

- Passwords: scrypt with per-user salt, timing-safe comparison.
- Sessions: opaque 256-bit tokens; only their cookie value is a secret;
  expiry enforced server-side; logout revokes; recovery reset revokes all.
- Authorization: every private page renders through `AppShell`, which calls
  `requireRole()` server-side and redirects unauthenticated users to
  `/auth/login` (preserving intent) and wrong roles to `/forbidden`.
- Cross-portal writes (booking requests) validate ownership, role and state
  transitions server-side before touching the database.
- Tokens (verification/recovery): single-use, hashed at rest, short TTLs.
- Anti-enumeration: recovery is designed to be un-detectable once a mail
  provider is connected.

## Architecture notes

- `lib/db.ts` — schema, migrations (including guarded `ALTER TABLE` for
  existing databases), seeds, and all data access.
- `lib/tokens.ts` — verification/recovery token semantics.
- `lib/guard.ts`, `lib/portals.ts`, `lib/nav.ts` — role routing.
- `components/app/AppShell.tsx` — server-side portal shell + authorization.
- Bookings: farmer and provider rows are linked by `pair_id` so a provider
  decision updates both sides atomically in application flow.
