# VAN Platform — Architecture

> Built using patterns from **MercurJS** (modules, workflows, links, subscribers) and **OpenHands Software Agent SDK** (event-sourced state, immutable config, typed tools, strict separation of concerns).

## Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Pages (app/app/*)                       │
│  Server components query DB → pass data to presenters       │
│  Client components use forms, SearchBar, RowActions         │
├─────────────────────────────────────────────────────────────┤
│                  Presenters (lib/presenters/)                │
│  Pure functions: raw DB rows → UI-ready data objects        │
├─────────────────────────────────────────────────────────────┤
│              API Routes (app/api/*/route.ts)                 │
│  HTTP handling only: auth, parse, sanitize, call service    │
│  CRUD routes use createCrudRoute() factory from lib/api.ts  │
├─────────────────────────────────────────────────────────────┤
│              Services (lib/services/)                        │
│  Business logic: validate → DB call → emit event            │
│  Pure functions — testable without HTTP                     │
├─────────────────────────────────────────────────────────────┤
│              Validation (lib/validate.ts)                    │
│  Schema-based validation for all 9 entities                 │
├─────────────────────────────────────────────────────────────┤
│              DB Modules (lib/db/)                            │
│  12 focused entity modules, ~50-100 lines each              │
│  Each wrapped with audit logging (lib/audit.ts)             │
├─────────────────────────────────────────────────────────────┤
│              Event Bus (lib/events.ts)                       │
│  Typed event bus — all inter-module communication           │
├─────────────────────────────────────────────────────────────┤
│              Subscribers (lib/notify.ts)                     │
│  Auto-subscribed at startup — reacts to events              │
├─────────────────────────────────────────────────────────────┤
│              Config (lib/config.ts)                          │
│  Immutable app config — single source of truth              │
├─────────────────────────────────────────────────────────────┤
│              SQLite (lib/db/getDb.ts)                        │
│  Connection singleton with WAL mode, migrations, seeding    │
└─────────────────────────────────────────────────────────────┘
```

## Dependency Graph

```
Pages
  └── Presenters
        └── DB Modules
              └── getDb (SQLite)

API Routes
  └── Services
        ├── Validation (lib/validate.ts)
        ├── DB Modules
        └── Event Bus (lib/events.ts)
              └── Subscribers (lib/notify.ts)
                    └── DB Modules (notifications)

Config (lib/config.ts) — imported by any layer needing settings
Workflows (lib/workflows.ts) — composable step engine, used by services
Audit (lib/audit.ts) — wraps DB modules, auto-logs mutations
```

## Rules

1. **No circular dependencies.** Layers only depend on layers below them.
2. **Modules never reference each other directly.** Cross-module communication only through events.
3. **API routes only handle HTTP.** Auth, parse, sanitize → call service → return response.
4. **Services handle business logic.** Validate → DB → emit event. No HTTP knowledge.
5. **Presenters are pure functions.** Take raw DB rows, return UI-ready data. No side effects.
6. **Config is immutable.** All settings go through lib/config.ts. No scattered process.env.
7. **Validation is declarative.** Schemas in lib/validate.ts. No inline validation in routes.
8. **Audit is automatic.** DB modules are wrapped with audit wrappers. Routes don't call audit.

## Key Patterns

### Event Bus (OpenHands)
All inter-module communication flows through `lib/events.ts`. Services emit events; subscribers react. No module knows about another module's existence.

### Workflows (MercurJS)
Multi-step operations use `lib/workflows.ts`. Each step has optional compensation (rollback). If a step fails, completed steps are compensated in reverse order.

### Immutable Config (OpenHands)
`lib/config.ts` validates all env vars once at startup and exposes a frozen object. No `process.env` calls in business logic.

### CRUD Factory (Deepening)
`lib/api.ts` provides `createCrudRoute()` — 9 CRUD routes are ~35 lines of config instead of ~130 lines of boilerplate.

### Audit at DB Layer (Deepening)
`lib/audit.ts` wraps all 9 entity CRUD functions. Calling `createField()` always logs `FIELD_CREATED`. HTTP layer never thinks about audit.

### Notification Rules (MercurJS)
`lib/notify.ts` subscribes to the event bus. 7 rules cover booking responses, activity due dates, maintenance reminders, harvest readiness. Adding a rule touches one file.

### Weather Adapter (Deepening)
`lib/weather/` uses adapter pattern: `WeatherProvider` interface, `OpenMeteoWeatherProvider` adapter, `MockWeatherProvider` for testing, `InMemoryCache` with TTL.

## File Structure

```
lib/
  api.ts              — CRUD route factory + middleware
  audit.ts            — Audit logging wrappers
  auth.ts             — Session auth
  config.ts           — Immutable app config
  events.ts           — Typed event bus
  guard.ts            — Authorization helpers
  mail.ts             — Email delivery
  migrate.ts          — DB migrations
  nav.ts              — Navigation config
  notify.ts           — Notification rules + event subscribers
  password.ts         — Password hashing
  platform.ts         — Platform metrics
  portals.ts          — Portal config
  ratelimit.ts        — Rate limiting
  sanitize.ts         — Input sanitization
  seeds.ts            — Seed data
  tokens.ts           — Token generation
  validate.ts         — Schema-based validation
  workflows.ts        — Composable workflow engine
  useForm.ts          — Form state management hook
  utils.ts            — cn() helper (shadcn)
  db/                 — 12 entity modules
  services/           — 9 business logic services
  presenters/         — 17 UI data presenters
  weather/            — Weather adapter pattern
```
