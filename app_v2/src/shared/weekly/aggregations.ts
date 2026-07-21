export type DatedGoalRow = {
  goal_date: string;
  net_sales_goal: number;
  transactions_goal: number;
};

export type DatedActualRow = {
  business_date: string;
  net_sales_actual: number;
  transactions_actual: number;
  gp_dollars_actual?: number | null;
};

export type HistoricalActualRow = {
  date: string;
  net_sales: number;
  transactions: number;
  gp_dollars?: number | null;
};

export type WeeklyGoalTotals = {
  netSalesGoal: number;
  transactionGoal: number;
  atvGoal: number;
  coveredDays: number;
};

export type WeeklyActualTotals = {
  netSalesActual: number;
  transactionsActual: number;
  gpDollarsActual: number;
  atvActual: number;
  gpPercentActual: number;
  coveredDays: number;
  missingGpDays: number;
};

export type HistoricalWeeklyTotals = {
  netSales: number;
  transactions: number;
  gpDollars: number;
  atv: number;
  gpPercent: number;
  coveredDays: number;
  missingGpDays: number;
};

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator;
}

function isWithinInclusiveRange(dateIso: string, startDate: string, endDate: string): boolean {
  return dateIso >= startDate && dateIso <= endDate;
}

export function aggregateWeeklyGoals(
  rows: DatedGoalRow[],
  startDate: string,
  endDate: string
): WeeklyGoalTotals {
  const included = rows.filter((row) =>
    isWithinInclusiveRange(row.goal_date, startDate, endDate)
  );

  const netSalesGoal = included.reduce(
    (total, row) => total + Number(row.net_sales_goal || 0),
    0
  );
  const transactionGoal = included.reduce(
    (total, row) => total + Number(row.transactions_goal || 0),
    0
  );

  return {
    netSalesGoal,
    transactionGoal,
    atvGoal: safeDivide(netSalesGoal, transactionGoal),
    coveredDays: new Set(included.map((row) => row.goal_date)).size,
  };
}

export function aggregateWeeklyActuals(
  rows: DatedActualRow[],
  startDate: string,
  endDate: string
): WeeklyActualTotals {
  const included = rows.filter((row) =>
    isWithinInclusiveRange(row.business_date, startDate, endDate)
  );

  const netSalesActual = included.reduce(
    (total, row) => total + Number(row.net_sales_actual || 0),
    0
  );
  const transactionsActual = included.reduce(
    (total, row) => total + Number(row.transactions_actual || 0),
    0
  );
  const gpRows = included.filter(
    (row) => row.gp_dollars_actual !== null && row.gp_dollars_actual !== undefined
  );
  const gpDollarsActual = gpRows.reduce(
    (total, row) => total + Number(row.gp_dollars_actual || 0),
    0
  );

  return {
    netSalesActual,
    transactionsActual,
    gpDollarsActual,
    atvActual: safeDivide(netSalesActual, transactionsActual),
    gpPercentActual: safeDivide(gpDollarsActual, netSalesActual),
    coveredDays: new Set(included.map((row) => row.business_date)).size,
    missingGpDays: included.length - gpRows.length,
  };
}

export function aggregateHistoricalWeek(
  rows: HistoricalActualRow[],
  startDate: string,
  endDate: string
): HistoricalWeeklyTotals {
  const included = rows.filter((row) => isWithinInclusiveRange(row.date, startDate, endDate));
  const netSales = included.reduce((total, row) => total + Number(row.net_sales || 0), 0);
  const transactions = included.reduce(
    (total, row) => total + Number(row.transactions || 0),
    0
  );
  const gpRows = included.filter(
    (row) => row.gp_dollars !== null && row.gp_dollars !== undefined
  );
  const gpDollars = gpRows.reduce(
    (total, row) => total + Number(row.gp_dollars || 0),
    0
  );

  return {
    netSales,
    transactions,
    gpDollars,
    atv: safeDivide(netSales, transactions),
    gpPercent: safeDivide(gpDollars, netSales),
    coveredDays: new Set(included.map((row) => row.date)).size,
    missingGpDays: included.length - gpRows.length,
  };
}

export function aggregateSalesForCycles(
  rows: DatedActualRow[],
  cycles: Array<{ startDate: string; endDate: string }>
): number[] {
  return cycles.map(({ startDate, endDate }) =>
    rows
      .filter((row) => isWithinInclusiveRange(row.business_date, startDate, endDate))
      .reduce((total, row) => total + Number(row.net_sales_actual || 0), 0)
  );
}
