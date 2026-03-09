const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeDateList(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter((value) => DATE_PATTERN.test(value))
    )
  ).sort();
}

export function parseDateListInput(value: string): string[] {
  return normalizeDateList(
    value
      .split(/[\n,]+/g)
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

export function formatDateLabel(date: string): string {
  if (!DATE_PATTERN.test(date)) {
    return date;
  }

  return new Date(`${date}T00:00:00+09:00`).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });
}

export function buildCalendarDays(monthCursor: Date): string[] {
  const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0);

  const startOffset = start.getDay();
  const days: string[] = [];

  for (let i = 0; i < startOffset; i += 1) {
    days.push("");
  }

  for (let day = 1; day <= end.getDate(); day += 1) {
    const date = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day);
    days.push(date.toISOString().slice(0, 10));
  }

  while (days.length % 7 !== 0) {
    days.push("");
  }

  return days;
}

export function getMonthLabel(monthCursor: Date): string {
  return monthCursor.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
  });
}

export function shiftMonth(base: Date, amount: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + amount, 1);
}
