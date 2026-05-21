type Duration = "day" | "week" | "month";

interface DateRange {
  currentStartDate: Date;
  previousStartDate: Date;
  now: Date;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)

  const adjustedDay = day === 0 ? 7 : day; // make Sunday = 7
  const diff = 1 - adjustedDay; // Monday = start of week

  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);

  return d;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getDateRange(duration: Duration): DateRange {
  const now = new Date();

  let currentStartDate: Date;
  let previousStartDate: Date;

  // DAY
  if (duration === "day") {
    currentStartDate = startOfDay(now);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 1);
  }

  // WEEK
  if (duration === "week") {
    currentStartDate = startOfWeek(now);

    previousStartDate = new Date(currentStartDate);
    previousStartDate.setDate(previousStartDate.getDate() - 7);
  }

  // MONTH
  if (duration === "month") {
    currentStartDate = startOfMonth(now);

    previousStartDate = new Date(
      currentStartDate.getFullYear(),
      currentStartDate.getMonth() - 1,
      1,
    );
  }

  // fallback (optional safety)
  if (!currentStartDate! || !previousStartDate!) {
    currentStartDate = new Date(0);
    previousStartDate = new Date(0);
  }

  return {
    now,
    currentStartDate,
    previousStartDate,
  };
}
