# Copilot Operating Instructions

## Product context

This repository is the Employee Hub / Skye Bridge platform for multi-store ACE Hardware operations.

The long-term vision is a central operating hub for store communication, documents, resources, metrics, reporting, goals, training, task visibility, and admin controls.

The current execution target is narrower: Phase 1 goal-setting and daily execution planning.

## Current priority

Do not build the full employee hub yet.

Stabilize the Phase 1 spine:

1. Authentication
2. Role and store assignment
3. Admin monthly goal setup
4. Daily goal generation and adjustment
5. Publish/lock governance
6. Store-facing goals and progress
7. Actuals as read-only performance data
8. Tests/guardrails around reconciliation and visibility

## Existing app structure

Primary app path:

- `app_v2`

Important files already present:

- `app_v2/src/app/admin/goals/page.tsx`
- `app_v2/src/app/goals/page.tsx`
- `app_v2/src/shared/db/goals.ts`
- `app_v2/src/shared/db/daily_goals.ts`
- `app_v2/src/shared/db/stores.ts`
- `app_v2/src/shared/supabase/client.ts`

Preserve existing behavior unless the change explicitly replaces it.

## Execution rules

- Do not rewrite broad sections unless the current structure is proven unsalvageable.
- Build one complete slice at a time.
- Keep mobile usability in mind.
- Tie technical decisions to operational value.
- Prefer clear, durable architecture over temporary patches.
- Do not add nice-to-have features before the core flow works.
- Do not introduce autonomous goal-setting logic in Phase 1.
- Do not force screen-ordering admin portal integration in Phase 1.

## Data rules

Monthly goals are canonical truth.

Daily goals are derived execution plans.

Actuals are read-only observed performance and must never silently modify goals.

Published goals are official.

Locked goals are immutable unless explicitly unlocked with a reason.

Daily goal totals must reconcile according to the documented rule for the current implementation.

## Required checks before changing goal logic

Before editing goal allocation, reconciliation, publishing, or store-facing goal visibility:

1. Identify affected files.
2. State expected behavior change.
3. Confirm whether draft, published, or locked data is affected.
4. Confirm whether store-facing users can see the result.
5. Add or update tests if logic changes.

## Pull request requirements

Every PR should include:

- Objective
- Scope
- Files changed
- Behavior change
- Verification performed
- Known gaps
- Rollback plan

## Highest-priority next tasks

1. Audit Supabase schema and RLS expectations.
2. Add tests for date helpers, month boundaries, daily allocation, and reconciliation.
3. Harden auth/role/store scoping.
4. Separate publish and lock behavior if not fully implemented.
5. Add audit-ready unlock reason support.

## Do not do yet

- Do not build document library UI before roles/storage/permissions are stable.
- Do not build announcements before the goal spine is reliable.
- Do not automate POS ingestion before manual import and KPI definitions are proven.
- Do not add complex forecasting models before explainable daily planning is trusted.
