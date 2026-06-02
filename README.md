# Skye Bridge Employee Hub

Internal employee hub and sales forecasting platform for multi-store ACE Hardware operations.

## Current execution position

This repository should not be treated as a blank project. The current `app_v2` implementation already contains a Next.js/Supabase application with goal-setting and store-facing goal views started.

The immediate objective is to stabilize Phase 1: the operational backbone for monthly goals, daily goal breakdowns, publishing, role-safe visibility, and live progress.

## Product direction

The long-term product is an employee hub that can support store communication, documents, resources, metrics, reporting, goals, training, task visibility, and administrative controls.

The near-term product is narrower:

> Admin sets monthly Net Sales and Transaction goals, generates and adjusts daily goals, publishes them, and store teams view the correct goal/progress safely.

## Source of truth

Start here before changing code:

1. `docs/PROJECT_RESET.md`
2. `docs/PHASE_1_EXECUTION_PLAN.md`
3. `.github/copilot-instructions.md`

## Application

Primary app path:

```bash
cd app_v2
npm install
npm run dev
```

## Working rules

- Do not push directly to `main`.
- Use small PRs.
- Preserve working goal functionality.
- Do not broaden scope beyond the current phase.
- Every change must state scope, affected files, verification, and rollback path.
- Prioritize operational foundation over interesting features.
