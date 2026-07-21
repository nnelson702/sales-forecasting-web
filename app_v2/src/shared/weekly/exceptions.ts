import type {
  PurchasingMetrics,
  WeeklyLaborMetrics,
  WeeklyPerformanceInputs,
  WeeklyPerformanceMetrics,
} from "./calculations";

export type WeeklyThresholds = {
  minimumSalesResultPercent: number;
  minimumGpPercent: number;
  maximumLaborBudgetVariancePercent: number;
};

export type InventoryAcknowledgements = {
  priceChangesComplete: boolean;
  icmComplete: boolean;
  negativeQohComplete: boolean;
  blankAndNewLocationsComplete: boolean;
  pieCountsUpdated: boolean;
};

export type GeneratedWeeklyTask = {
  sourceKey: string;
  category: "performance" | "labor" | "purchasing" | "inventory";
  title: string;
  requiredOutcome: string;
  explanationRequired: boolean;
};

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function money(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function buildWeeklyExceptionTasks(params: {
  performanceInputs: WeeklyPerformanceInputs;
  performanceMetrics: WeeklyPerformanceMetrics;
  laborMetrics: WeeklyLaborMetrics;
  purchasingMetrics: PurchasingMetrics;
  acknowledgements: InventoryAcknowledgements;
  thresholds: WeeklyThresholds;
}): GeneratedWeeklyTask[] {
  const {
    performanceInputs,
    performanceMetrics,
    laborMetrics,
    purchasingMetrics,
    acknowledgements,
    thresholds,
  } = params;

  const tasks: GeneratedWeeklyTask[] = [];

  if (performanceMetrics.netSalesResultPercent < thresholds.minimumSalesResultPercent) {
    tasks.push({
      sourceKey: "weekly-performance:net-sales",
      category: "performance",
      title: "Review weekly net-sales result",
      requiredOutcome:
        `Net sales finished at ${percent(performanceMetrics.netSalesResultPercent)}, ` +
        `${money(Math.abs(performanceMetrics.netSalesVarianceDollars))} ` +
        `${performanceMetrics.netSalesVarianceDollars < 0 ? "below" : "above"} goal. ` +
        "Document the primary driver and the operating correction for the next week.",
      explanationRequired: true,
    });
  }

  if (performanceMetrics.gpPercentActual < thresholds.minimumGpPercent) {
    tasks.push({
      sourceKey: "weekly-performance:gross-profit",
      category: "performance",
      title: "Review weekly gross-profit result",
      requiredOutcome:
        `Gross profit finished at ${percent(performanceMetrics.gpPercentActual)} versus a ` +
        `${percent(performanceInputs.gpPercentGoal)} goal. Document the material cause and corrective action.`,
      explanationRequired: true,
    });
  }

  if (
    laborMetrics.budgetToActualPercentVariance >
    thresholds.maximumLaborBudgetVariancePercent
  ) {
    tasks.push({
      sourceKey: "weekly-labor:hours-variance",
      category: "labor",
      title: "Review labor hours above budget",
      requiredOutcome:
        `Actual labor exceeded budget by ${laborMetrics.budgetToActualHoursVariance.toFixed(1)} hours ` +
        `(${percent(laborMetrics.budgetToActualPercentVariance)}). Document the driver and next-week adjustment.`,
      explanationRequired: true,
    });
  }

  if (purchasingMetrics.orderHealth === "investigate") {
    tasks.push({
      sourceKey: "purchasing:order-health",
      category: "purchasing",
      title: "Investigate core replenishment order",
      requiredOutcome:
        "The current core order falls outside both the modeled replenishment range and the store's historical normal range. " +
        "Document order multiples, one-time buys, inventory builds, or another material driver.",
      explanationRequired: true,
    });
  } else if (purchasingMetrics.orderHealth === "context_review") {
    tasks.push({
      sourceKey: "purchasing:order-context",
      category: "purchasing",
      title: "Review core replenishment order context",
      requiredOutcome:
        "The current core order falls outside one of the two normal ranges. Confirm whether case packs, minimum quantities, " +
        "seasonal buying, or another known factor explains the variance.",
      explanationRequired: true,
    });
  }

  const acknowledgementTasks: Array<{
    complete: boolean;
    sourceKey: string;
    title: string;
    requiredOutcome: string;
  }> = [
    {
      complete: acknowledgements.priceChangesComplete,
      sourceKey: "inventory:price-changes",
      title: "Complete weekly price changes",
      requiredOutcome: "Complete and verify all outstanding weekly price changes.",
    },
    {
      complete: acknowledgements.icmComplete,
      sourceKey: "inventory:icm",
      title: "Complete Item Change Management",
      requiredOutcome:
        "Complete Item Change Management in ACEnet so replacement items activate before canceled items sell through.",
    },
    {
      complete: acknowledgements.negativeQohComplete,
      sourceKey: "inventory:negative-qoh",
      title: "Complete negative quantity-on-hand corrections",
      requiredOutcome: "Review and correct all required negative quantity-on-hand items.",
    },
    {
      complete: acknowledgements.blankAndNewLocationsComplete,
      sourceKey: "inventory:locations",
      title: "Complete blank and new location corrections",
      requiredOutcome: "Review and correct all required blank or newly assigned item locations.",
    },
    {
      complete: acknowledgements.pieCountsUpdated,
      sourceKey: "inventory:pie-counts",
      title: "Update PIE counts",
      requiredOutcome:
        "Update required PIE counts before the company ordering run to prevent avoidable under-ordering.",
    },
  ];

  for (const task of acknowledgementTasks) {
    if (!task.complete) {
      tasks.push({
        sourceKey: task.sourceKey,
        category: "inventory",
        title: task.title,
        requiredOutcome: task.requiredOutcome,
        explanationRequired: false,
      });
    }
  }

  return tasks;
}
