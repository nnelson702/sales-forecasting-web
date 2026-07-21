export type WeeklyPerformanceInputs = {
  netSalesGoal: number;
  netSalesActual: number;
  lastYearNetSales: number;
  gpPercentGoal: number;
  gpDollarsActual: number;
  lastYearGpDollars: number;
  transactionGoal: number;
  transactionsActual: number;
  lastYearTransactions: number;
  weeklyOutsCount: number;
  weeklyPipCost: number;
};

export type WeeklyPerformanceMetrics = {
  netSalesResultPercent: number;
  netSalesVarianceDollars: number;
  netSalesDailyAverage: number;
  netSalesYearOverYearPercent: number;
  netSalesYearOverYearDollars: number;
  gpDollarsGoal: number;
  gpPercentActual: number;
  gpPercentVariancePoints: number;
  gpDollarsVariance: number;
  lastYearGpPercent: number;
  gpYearOverYearPercent: number;
  gpYearOverYearDollars: number;
  transactionsDailyAverage: number;
  atvGoal: number;
  atvActual: number;
  atvDeltaDollars: number;
  lastYearAtv: number;
  atvYearOverYearPercent: number;
  atvYearOverYearDollars: number;
  pipDailyAverage: number;
  pipPercentOfSales: number;
};

export type WeeklyLaborInputs = {
  budgetedHours: number;
  scheduledHours: number;
  actualHours: number;
  overtimeHours: number;
  openBusinessHours: number;
  estimatedLaborCostPerHour: number;
  netSalesGoal: number;
  netSalesActual: number;
  transactionGoal: number;
  transactionsActual: number;
  gpDollarsActual: number;
};

export type WeeklyLaborMetrics = {
  budgetToActualHoursVariance: number;
  budgetToActualPercentVariance: number;
  scheduleToActualHoursVariance: number;
  scheduleToActualPercentVariance: number;
  actualHoursDailyAverage: number;
  salesPerLaborHour: number;
  goalSalesPerLaborHour: number;
  transactionsPerLaborHour: number;
  goalTransactionsPerLaborHour: number;
  laborHoursPerOpenBusinessHour: number;
  gpDollarsPerLaborHour: number;
  overtimePercentOfActualHours: number;
  estimatedLaborSpend: number;
  estimatedLaborSpendPercentOfSales: number;
};

export type PurchasingInputs = {
  currentDemandCycleSales: number;
  priorDemandCycleSales: number;
  trailingDemandCycleSales: number[];
  currentCoreOrderCost: number;
  trailingCoreOrderCosts: number[];
  grossMarginReference: number;
  weeklyPipCost: number;
  fridayOutsCount: number;
  estimatedLostSalesPerOutPerDay?: number;
  orderMultipleAllowancePercent?: number;
  orderToSalesReviewThreshold?: number;
};

export type OrderHealth =
  | "normal"
  | "context_review"
  | "investigate"
  | "insufficient_history";

export type PurchasingMetrics = {
  priorDemandCycleSales: number;
  fourCycleAverageSales: number;
  thirteenCycleAverageSales: number;
  inventoryCostRate: number;
  baseReplenishmentCost: number;
  estimatedLostSalesFromOuts: number;
  estimatedLostSalesReplacementCost: number;
  estimatedTotalOrderNeed: number;
  expectedOrderLow: number;
  expectedOrderHigh: number;
  fourOrderAverage: number;
  thirteenOrderAverage: number;
  historicalOrderLow: number | null;
  historicalOrderMedian: number | null;
  historicalOrderHigh: number | null;
  currentOrderToSalesPercent: number;
  fourOrderToSalesPercent: number;
  thirteenOrderToSalesPercent: number;
  orderVarianceFromEstimatedNeed: number;
  exceedsOrderToSalesReviewThreshold: boolean;
  orderHealth: OrderHealth;
};

function finiteOrZero(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function safeDivide(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }
  return numerator / denominator;
}

export function percentChange(current: number, comparison: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(comparison) || comparison === 0) {
    return 0;
  }
  return current / comparison - 1;
}

export function average(values: number[]): number {
  const finiteValues = values.filter(Number.isFinite);
  if (!finiteValues.length) return 0;
  return finiteValues.reduce((total, value) => total + value, 0) / finiteValues.length;
}

export function quantile(values: number[], percentile: number): number | null {
  if (percentile < 0 || percentile > 1) {
    throw new Error(`Percentile must be between 0 and 1, received: ${percentile}`);
  }

  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return null;
  if (sorted.length === 1) return sorted[0];

  const position = (sorted.length - 1) * percentile;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  const lowerValue = sorted[lowerIndex];
  const upperValue = sorted[upperIndex];

  if (lowerIndex === upperIndex) return lowerValue;
  return lowerValue + (upperValue - lowerValue) * (position - lowerIndex);
}

export function calculateWeeklyPerformance(
  inputs: WeeklyPerformanceInputs
): WeeklyPerformanceMetrics {
  const atvGoal = safeDivide(inputs.netSalesGoal, inputs.transactionGoal);
  const atvActual = safeDivide(inputs.netSalesActual, inputs.transactionsActual);
  const lastYearAtv = safeDivide(inputs.lastYearNetSales, inputs.lastYearTransactions);
  const gpPercentActual = safeDivide(inputs.gpDollarsActual, inputs.netSalesActual);
  const lastYearGpPercent = safeDivide(inputs.lastYearGpDollars, inputs.lastYearNetSales);
  const gpDollarsGoal = inputs.netSalesGoal * inputs.gpPercentGoal;

  return {
    netSalesResultPercent: safeDivide(inputs.netSalesActual, inputs.netSalesGoal),
    netSalesVarianceDollars: inputs.netSalesActual - inputs.netSalesGoal,
    netSalesDailyAverage: inputs.netSalesActual / 7,
    netSalesYearOverYearPercent: percentChange(inputs.netSalesActual, inputs.lastYearNetSales),
    netSalesYearOverYearDollars: inputs.netSalesActual - inputs.lastYearNetSales,
    gpDollarsGoal,
    gpPercentActual,
    gpPercentVariancePoints: gpPercentActual - inputs.gpPercentGoal,
    gpDollarsVariance: inputs.gpDollarsActual - gpDollarsGoal,
    lastYearGpPercent,
    gpYearOverYearPercent: percentChange(inputs.gpDollarsActual, inputs.lastYearGpDollars),
    gpYearOverYearDollars: inputs.gpDollarsActual - inputs.lastYearGpDollars,
    transactionsDailyAverage: inputs.transactionsActual / 7,
    atvGoal,
    atvActual,
    atvDeltaDollars: atvActual - atvGoal,
    lastYearAtv,
    atvYearOverYearPercent: percentChange(atvActual, lastYearAtv),
    atvYearOverYearDollars: atvActual - lastYearAtv,
    pipDailyAverage: inputs.weeklyPipCost / 7,
    pipPercentOfSales: safeDivide(inputs.weeklyPipCost, inputs.netSalesActual),
  };
}

export function calculateWeeklyLabor(inputs: WeeklyLaborInputs): WeeklyLaborMetrics {
  const estimatedLaborSpend = inputs.actualHours * inputs.estimatedLaborCostPerHour;

  return {
    budgetToActualHoursVariance: inputs.actualHours - inputs.budgetedHours,
    budgetToActualPercentVariance: percentChange(inputs.actualHours, inputs.budgetedHours),
    scheduleToActualHoursVariance: inputs.actualHours - inputs.scheduledHours,
    scheduleToActualPercentVariance: percentChange(inputs.actualHours, inputs.scheduledHours),
    actualHoursDailyAverage: inputs.actualHours / 7,
    salesPerLaborHour: safeDivide(inputs.netSalesActual, inputs.actualHours),
    goalSalesPerLaborHour: safeDivide(inputs.netSalesGoal, inputs.budgetedHours),
    transactionsPerLaborHour: safeDivide(inputs.transactionsActual, inputs.actualHours),
    goalTransactionsPerLaborHour: safeDivide(inputs.transactionGoal, inputs.budgetedHours),
    laborHoursPerOpenBusinessHour: safeDivide(inputs.actualHours, inputs.openBusinessHours),
    gpDollarsPerLaborHour: safeDivide(inputs.gpDollarsActual, inputs.actualHours),
    overtimePercentOfActualHours: safeDivide(inputs.overtimeHours, inputs.actualHours),
    estimatedLaborSpend,
    estimatedLaborSpendPercentOfSales: safeDivide(estimatedLaborSpend, inputs.netSalesActual),
  };
}

function inRange(value: number, low: number | null, high: number | null): boolean {
  if (low === null || high === null) return false;
  return value >= low && value <= high;
}

export function calculatePurchasing(inputs: PurchasingInputs): PurchasingMetrics {
  const grossMarginReference = finiteOrZero(inputs.grossMarginReference);
  if (grossMarginReference < 0 || grossMarginReference > 1) {
    throw new Error("Gross margin reference must be between 0 and 1.");
  }

  const orderMultipleAllowancePercent = inputs.orderMultipleAllowancePercent ?? 0.08;
  if (orderMultipleAllowancePercent < 0) {
    throw new Error("Order multiple allowance cannot be negative.");
  }

  const orderToSalesReviewThreshold = inputs.orderToSalesReviewThreshold ?? 0.5;
  const lostSalesPerOutPerDay = inputs.estimatedLostSalesPerOutPerDay ?? 1;
  const inventoryCostRate = 1 - grossMarginReference;
  const baseReplenishmentCost = inputs.currentDemandCycleSales * inventoryCostRate;
  const estimatedLostSalesFromOuts = inputs.fridayOutsCount * lostSalesPerOutPerDay * 7;
  const estimatedLostSalesReplacementCost = estimatedLostSalesFromOuts * inventoryCostRate;
  const estimatedTotalOrderNeed =
    baseReplenishmentCost + inputs.weeklyPipCost + estimatedLostSalesReplacementCost;
  const expectedOrderLow = estimatedTotalOrderNeed * (1 - orderMultipleAllowancePercent);
  const expectedOrderHigh = estimatedTotalOrderNeed * (1 + orderMultipleAllowancePercent);

  const trailingSales = inputs.trailingDemandCycleSales.filter(Number.isFinite);
  const trailingOrders = inputs.trailingCoreOrderCosts.filter(Number.isFinite);
  const fourSales = trailingSales.slice(0, 4);
  const thirteenSales = trailingSales.slice(0, 13);
  const fourOrders = trailingOrders.slice(0, 4);
  const thirteenOrders = trailingOrders.slice(0, 13);

  const fourCycleAverageSales = average(fourSales);
  const thirteenCycleAverageSales = average(thirteenSales);
  const fourOrderAverage = average(fourOrders);
  const thirteenOrderAverage = average(thirteenOrders);
  const historicalOrderLow = thirteenOrders.length >= 4 ? quantile(thirteenOrders, 0.25) : null;
  const historicalOrderMedian = thirteenOrders.length >= 4 ? quantile(thirteenOrders, 0.5) : null;
  const historicalOrderHigh = thirteenOrders.length >= 4 ? quantile(thirteenOrders, 0.75) : null;

  const withinModelRange =
    inputs.currentCoreOrderCost >= expectedOrderLow && inputs.currentCoreOrderCost <= expectedOrderHigh;
  const hasHistoricalRange = historicalOrderLow !== null && historicalOrderHigh !== null;
  const withinHistoricalRange = inRange(
    inputs.currentCoreOrderCost,
    historicalOrderLow,
    historicalOrderHigh
  );

  let orderHealth: OrderHealth;
  if (!hasHistoricalRange) {
    orderHealth = "insufficient_history";
  } else if (withinModelRange && withinHistoricalRange) {
    orderHealth = "normal";
  } else if (withinModelRange || withinHistoricalRange) {
    orderHealth = "context_review";
  } else {
    orderHealth = "investigate";
  }

  const currentOrderToSalesPercent = safeDivide(
    inputs.currentCoreOrderCost,
    inputs.currentDemandCycleSales
  );

  return {
    priorDemandCycleSales: inputs.priorDemandCycleSales,
    fourCycleAverageSales,
    thirteenCycleAverageSales,
    inventoryCostRate,
    baseReplenishmentCost,
    estimatedLostSalesFromOuts,
    estimatedLostSalesReplacementCost,
    estimatedTotalOrderNeed,
    expectedOrderLow,
    expectedOrderHigh,
    fourOrderAverage,
    thirteenOrderAverage,
    historicalOrderLow,
    historicalOrderMedian,
    historicalOrderHigh,
    currentOrderToSalesPercent,
    fourOrderToSalesPercent: safeDivide(fourOrderAverage, fourCycleAverageSales),
    thirteenOrderToSalesPercent: safeDivide(thirteenOrderAverage, thirteenCycleAverageSales),
    orderVarianceFromEstimatedNeed: inputs.currentCoreOrderCost - estimatedTotalOrderNeed,
    exceedsOrderToSalesReviewThreshold:
      currentOrderToSalesPercent > orderToSalesReviewThreshold,
    orderHealth,
  };
}
