# Unified Platform Audit: Employee_Hub

## Decision

Treat `Employee_Hub/app_v2` as the current implementation candidate for the sales goals and forecasting module.

Do not replace this work with the employee communications hub. The repo already contains meaningful goal-planning functionality.

## Current App

Primary app path:

```bash
cd app_v2
npm install
npm run dev
```

Stack:

- Next.js
- React
- TypeScript
- Supabase
- Tailwind dependency present
- ESLint

## Existing Goal Functionality

Observed implementation includes:

- Admin goal setup page at `app_v2/src/app/admin/goals/page.tsx`
- Store-facing goals page at `app_v2/src/app/goals/page.tsx`
- Store helper using Supabase
- Monthly goal helper
- Daily goal helper
- Actuals helper
- Historical daily sales helper

## Strategic Fit

This repo maps best to the unified platform's Phase 5 workstream:

- Monthly NET sales goals
- Monthly transaction goals
- Daily goal breakdown
- Store goal calendar
- Published store-facing goal view
- Actuals/progress comparison
- Historical sales reference
- Future MTD percent-to-goal reporting

## Current Strengths

- The goal engine already exists and should be preserved.
- The admin page includes allocation logic for daily sales and transaction goals.
- The store-facing page reads published daily goals and actuals.
- Existing documentation already warns against treating this as a blank project.

## Current Risks

- Role and store scoping need a hard audit before broader rollout.
- Current sales-goal code appears large and may need extraction into smaller helpers/components before further expansion.
- Goal logic, date math, allocation, publishing, and reconciliation need tests before high-confidence operational use.
- The relationship between this repo and `skye-hub` needs to be explicit before any migration.

## Recommendation

Keep `Employee_Hub/app_v2` intact as the sales-goal module candidate for now.

Use the staged repo model:

- `skye-helpful-platform`: umbrella roadmap and architecture source of truth
- `skye-hub`: employee/admin communications and operating hub candidate
- `Employee_Hub/app_v2`: sales goals and forecasting candidate
- `ScreenOrderingFlows`: frozen until quote/request integration is ready

## Next Safe Segment

Add tests or documentation around the existing goal engine before changing behavior.

Recommended order:

1. Audit current data helpers.
2. Extract reusable date/allocation helpers from the admin page.
3. Add tests for date math, even allocation, weighted allocation, closed dates, and true-up behavior.
4. Only then expand to MTD percent-to-goal and date-range analytics.

## Guardrail

Do not broaden this repo into the full employee communications hub. Its current value is the sales-goal engine.