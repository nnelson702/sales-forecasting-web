# Phase 1 Execution Plan

## Phase 1 objective

Build and stabilize the operational backbone of the Employee Hub:

> Monthly goal setting, daily goal planning, publish/lock governance, role-safe visibility, and actuals-based progress.

This is the spine of the platform. Do not expand into the full employee hub until this loop is reliable.

## Work-session cadence

At the start of each work session, state:

1. Current objective
2. Project area being touched
3. Files/systems/decisions affected
4. Blockers or assumptions

During the work session:

1. Make controlled changes
2. Preserve working functionality
3. Keep a change log
4. Avoid unrelated rewrites
5. Explain only operationally relevant decisions

At the end of each work session, state:

1. What changed
2. What was verified
3. What remains broken or incomplete
4. Next highest-leverage step

## Decision standard

The best next step is the one that most reduces uncertainty, unlocks future work, or creates a usable operational foundation.

Interesting features lose to foundation work.

## Current Phase 1 slice

### Slice 1: audit and guardrails

Goal: identify what exists and prevent accidental regression.

Deliverables:

- Confirm app routes and data helpers
- Confirm Supabase schema and RLS expectations
- Confirm auth state handling
- Confirm goal/daily goal table constraints
- Add or define tests for allocation/reconciliation logic
- Document current gaps

Acceptance criteria:

- A developer can state exactly what is safe to change.
- Existing goal pages still build.
- Known risks are tracked.

### Slice 2: auth, role, and store scope

Goal: make access control real.

Deliverables:

- Admin route guard
- Manager/employee visibility rules
- Store assignment source of truth
- Store-scoped data access checks
- RLS policy review or implementation

Acceptance criteria:

- Admin can access admin goal setup.
- Manager cannot access admin controls.
- Employee cannot access planning logic.
- Store users only see assigned store data.

### Slice 3: monthly goal workflow

Goal: stabilize the canonical monthly target.

Deliverables:

- Store/month selector
- Net Sales goal input
- Transactions goal input
- ATV auto calculation
- Goal validation
- Save draft monthly goal
- Published state display

Acceptance criteria:

- Goals must be greater than zero.
- Transactions are whole numbers.
- Monthly goal is one row per store/month.
- Existing monthly goal reloads correctly.
- Editing rules respect published/locked state.

### Slice 4: daily planner

Goal: create credible daily execution targets.

Deliverables:

- Calendar grid for selected month
- Equal split baseline
- Suggested allocation based on historical data
- Day-of-week weighting controls
- Closed-date support
- Manual adjustment path
- Deterministic rounding and reconciliation

Acceptance criteria:

- Every date in the month appears exactly once.
- Closed dates can be set to zero.
- Daily totals reconcile to documented monthly rule.
- Admin can reset to baseline.
- Suggestion explains its source logic.

### Slice 5: publish and lock governance

Goal: protect official targets.

Deliverables:

- Draft daily goals not visible to store users
- Published daily goals visible to store users
- Lock state prevents edits
- Unlock requires explicit reason
- Audit entry or audit-ready structure for publish/lock/unlock

Acceptance criteria:

- Publish and lock are separate actions.
- No system logic silently changes published/locked goals.
- Unlock creates an audit trail.

### Slice 6: store-facing goals and progress

Goal: make goals useful for store execution.

Deliverables:

- Manager view: month, daily goals, MTD progress
- Employee view: today, simple pace indicator, limited context
- Actuals read-only model
- MTD actual vs planned MTD goal

Acceptance criteria:

- Store users see only published goals.
- Actuals never modify goals.
- Pace indicator is explainable in one sentence.
- Mobile layout is usable.

## Do-not-break list

- Authentication
- Routing
- Supabase client initialization
- Store loading
- Monthly goal save/load
- Daily goal month-boundary logic
- Published-only store-facing daily goals
- Goal reconciliation
- Calendar completeness

## Change request template

Each PR must include:

```markdown
## Objective

## Scope

## Files changed

## Behavior change

## Verification

## Known gaps

## Rollback plan
```

## Out-of-scope for Phase 1

- Labor forecasting
- Scheduling automation
- Full P&L modeling
- Autonomous AI goal setting
- Vendor integrations
- POS automation before manual logic is proven
- Full document library
- Advanced notification system
- Screen-ordering admin integration

## Immediate next step

Run a repo/schema audit and then implement the smallest complete vertical slice:

> Admin logs in, selects store/month, enters monthly Net Sales and Transaction goals, generates equal daily split, saves draft, and manager/store-facing view can read only published data.
