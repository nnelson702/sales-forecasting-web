export type InclusiveDateRange = {
  startDate: string;
  endDate: string;
  endDateExclusive: string;
};

export type OperatingWeek = InclusiveDateRange & {
  packetDueDate: string;
};

export type ReplenishmentCycle = InclusiveDateRange & {
  orderDate: string;
  expectedDeliveryDate: string;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function assertIsoDate(value: string): void {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error(`Expected ISO date in YYYY-MM-DD format, received: ${value}`);
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime()) || formatUtcDate(parsed) !== value) {
    throw new Error(`Invalid calendar date: ${value}`);
  }
}

function formatUtcDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function addDaysIso(dateIso: string, days: number): string {
  assertIsoDate(dateIso);
  if (!Number.isInteger(days)) {
    throw new Error(`Days must be a whole number, received: ${days}`);
  }

  const date = new Date(`${dateIso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDate(date);
}

export function dayOfWeekUtc(dateIso: string): number {
  assertIsoDate(dateIso);
  return new Date(`${dateIso}T00:00:00Z`).getUTCDay();
}

/**
 * Returns the Sunday-Saturday operating week containing the supplied date.
 */
export function getOperatingWeekContaining(dateIso: string): OperatingWeek {
  const dayOfWeek = dayOfWeekUtc(dateIso);
  const startDate = addDaysIso(dateIso, -dayOfWeek);
  const endDate = addDaysIso(startDate, 6);

  return {
    startDate,
    endDate,
    endDateExclusive: addDaysIso(endDate, 1),
    packetDueDate: addDaysIso(endDate, 4), // Wednesday following Saturday close
  };
}

/**
 * Returns the most recently completed Sunday-Saturday operating week.
 * The current in-progress week is never returned.
 */
export function getMostRecentlyCompletedOperatingWeek(asOfDateIso: string): OperatingWeek {
  const currentWeek = getOperatingWeekContaining(asOfDateIso);
  return getOperatingWeekContaining(addDaysIso(currentWeek.startDate, -1));
}

/**
 * Uses a 364-day offset so the comparison retains Sunday-Saturday and weekday alignment.
 */
export function getComparablePriorYearOperatingWeek(weekStartIso: string): OperatingWeek {
  const current = getOperatingWeekContaining(weekStartIso);
  if (current.startDate !== weekStartIso) {
    throw new Error(`Operating week must begin on Sunday, received: ${weekStartIso}`);
  }

  return getOperatingWeekContaining(addDaysIso(weekStartIso, -364));
}

/**
 * Builds the complete Wednesday-Tuesday demand cycle associated with a Tuesday order.
 */
export function getReplenishmentCycleForOrderDate(orderDateIso: string): ReplenishmentCycle {
  if (dayOfWeekUtc(orderDateIso) !== 2) {
    throw new Error(`Replenishment order date must be a Tuesday, received: ${orderDateIso}`);
  }

  const startDate = addDaysIso(orderDateIso, -6);
  const endDate = orderDateIso;

  return {
    startDate,
    endDate,
    endDateExclusive: addDaysIso(endDate, 1),
    orderDate: orderDateIso,
    expectedDeliveryDate: addDaysIso(orderDateIso, 2),
  };
}

/**
 * Returns consecutive completed Wednesday-Tuesday cycles, newest first.
 */
export function getTrailingReplenishmentCycles(
  latestOrderDateIso: string,
  count: number
): ReplenishmentCycle[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error(`Cycle count must be a positive whole number, received: ${count}`);
  }

  return Array.from({ length: count }, (_, index) =>
    getReplenishmentCycleForOrderDate(addDaysIso(latestOrderDateIso, index * -7))
  );
}

export function enumerateDates(range: InclusiveDateRange): string[] {
  assertIsoDate(range.startDate);
  assertIsoDate(range.endDate);

  if (range.endDate < range.startDate) {
    throw new Error(`Range end must not precede range start: ${range.startDate} to ${range.endDate}`);
  }

  const dates: string[] = [];
  for (let date = range.startDate; date <= range.endDate; date = addDaysIso(date, 1)) {
    dates.push(date);
  }
  return dates;
}
