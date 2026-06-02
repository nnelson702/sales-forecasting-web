# Project Reset Assessment

## Objective

Reset the Employee Hub project around a narrow, finishable Phase 1 execution path.

The project is not the screen-ordering flow project. The screen-ordering work is only the execution model: small slices, clear acceptance criteria, guarded changes, working checkpoints, and no scope drift.

## Current state

Known from repository inspection:

- Primary app lives in `app_v2`.
- App stack is Next.js, React, TypeScript, Tailwind, ESLint, and Supabase.
- Admin monthly and daily goal setup exists at `app_v2/src/app/admin/goals/page.tsx`.
- Store-facing goals view exists at `app_v2/src/app/goals/page.tsx`.
- Supabase client exists at `app_v2/src/shared/supabase/client.ts`.
- Store data helper reads active stores from `stores_v2`.
- Monthly goal helper reads and writes `monthly_goals`.
- Daily goal helper reads admin rows, published rows, and publishes a month of daily goals.

This means the correct reset is not a rebuild. The correct reset is to stabilize, document, test, and harden the existing Phase 1 spine.

## Intended end state

Long term, this should become a central operating hub for store teams and admins:

- Store communication
- Document/resource library
- Store metrics and reporting
- Goal planning and daily execution
- Training resources
- Task visibility
- Admin controls
- Future POS-fed automation

Near term, Phase 1 is narrower:

> Admins can set monthly Net Sales and Transaction goals, generate daily breakdowns, adjust them efficiently, publish them, and store teams can view official goals and progress safely.

## Core modules

### Phase 1 modules

- Authentication
- Role and store assignment
- Admin goal setup
- Daily goal planner
- Publish/lock governance
- Store-facing goal view
- Actuals import/read model
- Basic progress display
- Audit-ready data structure

### Later modules

- Announcement board
- Document/resource library
- Notifications
- Expanded KPI dashboards
- POS data ingestion
- Advanced admin portal
- Optional future screen-ordering admin integration

## Data sources

Current likely data sources:

- Supabase tables for stores, goals, daily goals, actuals, and historical daily sales
- Manual or preloaded historical sales data

Future data sources:

- POS export/feed once schema and manual workflow are proven
- Document storage provider once the document library becomes operationally important

## User roles and permissions

Required roles:

- Admin: creates, edits, publishes, locks, unlocks, manages configuration
- Manager: views store/month/day goals and progress for assigned store(s)
- Employee: views simplified today/MTD execution targets only

Current risk:

- App checks for authenticated user in at least the admin goal setup flow, but durable role/store authorization must be verified and likely hardened before broader rollout.

## Technical stack

Current stack:

- Next.js app under `app_v2`
- React and TypeScript
- Supabase client/data helpers
- ESLint
- Tailwind dependency present

Target architecture:

- Modular monolith first
- Supabase acceptable for Phase 1 if role-level security and schema discipline are enforced
- Licensed file storage likely required before full document library rollout
- No microservices, autonomous forecasting, or complex predictive modeling in Phase 1

## Known blockers

- Confirm actual Supabase schema and constraints.
- Confirm row-level security rules.
- Confirm Admin/Manager/Employee roles exist and are enforced.
- Confirm store assignment model exists.
- Confirm daily goal reconciliation is deterministic and covered by tests.
- Confirm publish and lock states are separate.
- Confirm published goals cannot be silently changed.
- Confirm deployment environment and CI behavior.
- Confirm actuals import path and data accuracy.

## Open decisions

- Source of truth for user role and store assignment
- Whether Supabase remains the long-term auth/database provider
- Exact document storage provider and license tier
- POS data source/export format
- KPI definitions and update cadence
- Whether goal totals must equal exactly 100% or may intentionally publish at 100% to 103.5%
- Whether lock/unlock requires an audit-log table in Phase 1 or immediately after Phase 1

## Build sequence

1. Audit current app, schema, routes, data helpers, and deployment.
2. Add missing tests around date math, allocation, reconciliation, and published-only visibility.
3. Harden auth, roles, and store scoping.
4. Stabilize the admin monthly goal flow.
5. Stabilize daily breakdown generation and adjustment.
6. Add publish/lock/unlock governance.
7. Verify manager and employee store-facing views.
8. Only then expand toward communication/document modules.

## Acceptance criteria

Phase 1 is accepted only when:

- Admin can sign in.
- Admin can select store and month.
- Admin can set monthly Net Sales and Transactions goals.
- System can generate daily goals.
- Admin can adjust daily goals efficiently.
- Daily totals reconcile to the intended monthly totals according to the documented rule.
- Draft goals are not visible to stores.
- Published goals are visible to store users.
- Locked goals cannot be edited without explicit unlock path.
- Store users only see data they are permitted to see.
- Actuals never overwrite goals.
- The system can explain why a suggested day is higher or lower.
- CI catches obvious regressions before merge.

## Strategic reset

The highest-leverage move is not to add more modules. The highest-leverage move is to turn the existing goal engine into a reliable, governed, explainable operating backbone.
