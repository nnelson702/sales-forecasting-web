# Weekly Manager Packet — Implementation Contract

## Objective

Add a manager-facing weekly operating packet to `Employee_Hub/app_v2` without creating a second goals, actuals, store, or reporting system.

The product should:

- automate all calculations that can be derived from existing goals and actuals;
- preserve manual entry only where no reliable import exists yet;
- generate weekly store tasks from company-level thresholds;
- store submission and task history;
- render as a digital worksheet online;
- print cleanly as individual worksheets or a complete packet.

## Repository decision

Use `Employee_Hub/app_v2` as the initial implementation base because it already owns:

- active store records through `stores_v2`;
- monthly and daily sales/transaction goals;
- published goal visibility;
- daily actual sales and transaction records;
- historical sales and transaction records;
- store-facing goal-versus-actual views.

Do not rebuild these capabilities in `skye-hub`. The wider employee hub may link to or surface this module later.

## Confirmed calendar rules

### Operating performance week

- Sunday through Saturday.
- Packet due Wednesday of the following week.
- Weekly Performance, Weekly Labor, Friday outs, PIP, and recurring store tasks use this period.

### Replenishment demand cycle

- Wednesday through Tuesday.
- Tuesday is the order date.
- Thursday is the expected delivery date.
- Use complete calendar days rather than attempting to stop Tuesday at the exact order-submission time.

### Prior-year comparison

Use a 364-day offset for weekly comparisons so Sunday-Saturday and weekday alignment are preserved.

## Existing data that should be reused

### `stores_v2`

Current fields used by the application:

- `store_id`
- `eagle_store_no`
- `store_name`
- `is_active`

### `monthly_goals`

Current usable fields:

- `store_id`
- `month_start`
- `net_sales_goal`
- `transactions_goal`
- `is_published`

Required future extension:

- `gp_percent_goal`

### `daily_goals`

Current usable fields:

- `store_id`
- `goal_date`
- `net_sales_goal`
- `transactions_goal`
- `is_published`
- `is_locked`

Weekly goal values must be sums of published daily goals, not separate manager-entered weekly goals.

### `daily_actuals`

Current usable fields:

- `store_id`
- `business_date`
- `net_sales_actual`
- `transactions_actual`
- source metadata

Required future extension:

- `gp_dollars_actual`
- optional `cost_actual`

### `historical_daily_sales`

Current usable fields:

- `store_id`
- `date`
- `net_sales`
- `transactions`

Required future extension or replacement read model:

- historical GP dollars sufficient to calculate GP percentage and year-over-year GP metrics.

## Weekly Performance data contract

### Automated from existing goals and actuals

- Net Sales Goal: sum published daily sales goals for Sunday-Saturday.
- Actual Net Sales: sum daily actual sales for Sunday-Saturday.
- Sales Result Percent.
- Sales Variance Dollars.
- Sales Daily Average.
- Projected Transactions: sum published daily transaction goals.
- Actual Transactions: sum daily transaction actuals.
- Transaction Daily Average.
- ATV Goal: Sales Goal divided by Transaction Goal.
- ATV Actual: Actual Sales divided by Actual Transactions.
- Comparable prior-year Sales, Transactions, and ATV using the 364-day-aligned week.
- Sales and ATV year-over-year dollar and percentage changes.

### Automated after GP extension

- GP Percent Goal from monthly/configured goal.
- Actual GP Dollars.
- Actual GP Percent.
- Goal GP Dollars.
- GP dollar and percentage variances.
- Comparable prior-year GP Dollars and GP Percent.
- GP year-over-year changes.

### Manual at launch

- Friday weekly outs count.
- Weekly PIP cost.

### Calculated from manual inputs

- PIP Daily Average.
- PIP Percent of Sales.

## Weekly Labor data contract

### Reused from Weekly Performance

- Net Sales Goal.
- Actual Net Sales.
- Transaction Goal.
- Actual Transactions.
- Actual GP Dollars.

### Manual at launch

- Budgeted Hours.
- Scheduled Hours.
- Actual Hours.
- OT Hours.

### Configured

- Open Business Hours by store/week.
- Estimated Labor Cost per Hour, initially $15.
- Company labor variance threshold.

### Calculated

- Budget versus Actual Hours and Percent.
- Scheduled versus Actual Hours and Percent.
- Average Actual Hours per Day.
- Net Sales per Labor Hour.
- Goal Sales per Labor Hour.
- Transactions per Labor Hour.
- Goal Transactions per Labor Hour.
- Average Labor Hours per Open Business Hour.
- GP Dollars per Labor Hour.
- OT Percent of Actual Hours.
- Estimated Labor Spend.
- Estimated Labor Spend Percent of Net Sales.

### Future automation

Use the existing Labor Deployment ROI contract as the single labor source. Do not build a separate weekly-only labor feed.

The labor fact feed should eventually contain:

- employee identifier;
- store;
- punch in/out;
- regular hours;
- OT hours;
- estimated wage or hourly rate;
- position/department where available;
- edited or auto-closed flags where available.

## Purchasing and Inventory data contract

### Automated from daily actuals

- Current Wednesday-Tuesday demand-cycle sales.
- Prior demand-cycle sales.
- Four-cycle average sales.
- Thirteen-cycle average sales.

### Manual at launch

- Current Tuesday core replenishment order cost.
- Third-party order information.
- Price Changes complete acknowledgement.
- ICM complete acknowledgement.
- Negative QOH complete acknowledgement.
- Blank/new locations complete acknowledgement.
- PIE Counts updated acknowledgement.

### Reused from Weekly Performance

- Friday outs count.
- Weekly PIP cost.

### Configured

- Gross Margin Reference, initially 46%.
- Inventory Cost Rate = 54%.
- Estimated Lost Sales per Out per Day, initially $1.
- Order Multiple/MOQ Allowance, initially 8%.
- Order-to-sales review threshold, initially 50% and treated only as a review trigger.

### Calculated

- Base Replenishment Cost = Demand-Cycle Sales multiplied by Inventory Cost Rate.
- Estimated Lost Sales from Outs = Outs multiplied by $1 multiplied by 7.
- Outs Replacement Cost = Estimated Lost Sales multiplied by Inventory Cost Rate.
- Estimated Total Order Need = Base Cost plus PIP plus Outs Replacement Cost.
- Expected Order Range = Estimated Need plus/minus allowance.
- Four-Order Average.
- Thirteen-Order Average.
- Historical Normal Range = 25th to 75th percentile of trailing order history.
- Historical Median Order.
- Current/Four/Thirteen Order-to-Sales percentages.
- Current Order Variance from Estimated Need.
- Order Health classification.

### Order Health classification

- `normal`: current order is inside both modeled and historical ranges.
- `context_review`: current order is inside one range but outside the other.
- `investigate`: current order is outside both ranges.
- `insufficient_history`: fewer than four historical orders exist.

## Weekly Store Tasks

### Routine tasks

Routine task templates generate weekly task instances for each applicable store.

Required task-template attributes:

- stable template ID;
- task title and completion standard;
- category;
- applicable stores;
- frequency;
- accountable role;
- due timing;
- active status;
- whether explanation is required.

### Metric-generated tasks

Company-level exceptions generate tasks automatically. Examples:

- Net Sales below threshold.
- GP Percent below goal.
- Actual Labor Hours above budget threshold.
- Core order outside expected ranges.
- Required inventory acknowledgement answered No.

The generated task must include the actual metric, variance, and required response. Managers must not retype the problem.

## Proposed new workflow records

Do not apply schema changes until the live Supabase audit is complete.

The expected minimum records are:

### `user_store_access`

- `user_id`
- `store_id`

Required before manager rollout because the current active model does not enforce store-level visibility.

### `weekly_packets`

- store and operating week;
- status: draft, submitted, locked, reopened;
- submitted by/date;
- reopened by/date/reason;
- manual Weekly Performance inputs;
- manual Weekly Labor inputs;
- manual inventory acknowledgements;
- timestamps.

### `replenishment_orders`

- store;
- Tuesday order date;
- core replenishment order cost;
- known variation notes;
- entered by/date.

### `third_party_orders`

- store;
- week/cycle;
- vendor or department;
- required status;
- completion status;
- order cost;
- expected delivery;
- notes.

### `metric_thresholds`

- metric key;
- company-level threshold;
- effective dates;
- active status.

### `task_templates`

Reusable definitions for routine Weekly Store Tasks.

### `tasks`

Weekly task instances and metric-generated tasks. The model should remain reusable by the wider employee hub.

## Technical work completed in the foundation branch

The branch adds pure TypeScript helpers under:

```text
app_v2/src/shared/weekly/
```

Included functions cover:

- Sunday-Saturday week boundaries;
- following-Wednesday packet due date;
- 364-day prior-year week;
- Wednesday-Tuesday replenishment cycles;
- trailing cycle generation;
- weekly goal and actual aggregation;
- Weekly Performance calculations;
- Weekly Labor calculations;
- Purchasing calculations and percentile ranges;
- company-threshold exception task generation.

No current route, current table, or current goal behavior is changed.

## Production blockers that must be resolved before manager rollout

### 1. Store-level access

The current app has authentication and admin checks but does not have a current-model store-access source of truth tied to `stores_v2`.

### 2. Actuals ingestion runtime

The repository contains a server-side actuals ingestion route, but `next.config.ts` currently uses static export. The import contract is useful, but the route cannot be the production ingestion mechanism in a static deployment.

Preferred resolution:

- move ingestion to the existing data worker or a Supabase Edge Function;
- write imported actuals directly to Supabase;
- keep the front-end focused on authenticated reads and manager workflow.

### 3. Live schema verification

Repository types and documentation are not a substitute for inspecting production Supabase tables, constraints, RLS, row counts, and data freshness.

## Build sequence

1. Complete live Supabase and deployment audit.
2. Add store-level access against the active table model.
3. Add tested weekly calculation and aggregation services.
4. Build read-only Weekly Performance prototype using existing goals and actuals.
5. Add manual packet inputs and draft save.
6. Add Weekly Labor worksheet.
7. Add Purchasing and Inventory worksheet with stored order history.
8. Implement task templates, generated tasks, and completion workflow.
9. Add submit/lock/reopen governance.
10. Add print-specific layouts and full-packet printing.
11. Replace manual data with GP, labor, order, and inventory imports in that order.

## Initial acceptance criteria

The first usable release is complete when:

- a manager logs in and sees only assigned stores;
- the system selects the most recently completed Sunday-Saturday week;
- sales and transaction goals and actuals populate automatically;
- manual fields can be saved as draft;
- calculations update without manager math;
- metric exceptions create Weekly Store Tasks;
- manager can complete and submit the packet by Wednesday;
- leadership can see completion status by store;
- submitted packets can be printed cleanly;
- submitted packets are locked unless explicitly reopened.

## User-owned confirmations and access needed

These do not block the current foundation work but will block production integration:

1. Confirm which Supabase project is the live source used by `Employee_Hub/app_v2`.
2. Provide or authorize a read-only schema/data audit of that project.
3. Identify the current real-world process feeding `daily_actuals`, if any.
4. Identify the Compass/Eagle source that provides GP dollars or cost by day/transaction.
5. Identify the recurring time-clock export location and format that should feed labor facts.
6. Confirm the initial company thresholds before generated tasks are activated.
7. Confirm the manager accounts and store assignments for the pilot rollout.
