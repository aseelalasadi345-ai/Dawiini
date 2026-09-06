// Shared by the admin pharmacy form/schema/route (which write PharmacyHours)
// and the public pharmacy pages (which read and display it) — one source of
// truth for "what are the 7 valid day names" and how to order/format them.
//
// PharmacyHours.days/.hours are both free-text columns with no ordering or
// day-enum of their own — the existing seeded data even mixes single days
// ("Sunday") and day-ranges ("Monday – Saturday") in the same field. The
// admin form (going forward) always writes one row per individual day, but
// display code has to work for both shapes since seeded rows aren't being
// rewritten.

export const DAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type DayName = (typeof DAY_NAMES)[number];

// "14:05" (native <input type="time"> value) -> "2:05 PM" — so admin-entered
// hours read in the same style as the existing seeded ones.
export function formatTime12h(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr} ${period}`;
}

// Sorts Monday->Sunday when `days` is an exact single day name (true for
// every row the admin form writes now); rows with a grouped/ranged value
// (all of the pre-existing seeded data) sort after, keeping their original
// relative order, since a range like "Tuesday – Saturday" has no single
// correct position in a strict Monday..Sunday ordering.
export function sortHoursByDay<T extends { days: string }>(hours: T[]): T[] {
  const indexOf = (days: string) => {
    const i = DAY_NAMES.indexOf(days as DayName);
    return i === -1 ? DAY_NAMES.length : i;
  };
  return [...hours].sort((a, b) => indexOf(a.days) - indexOf(b.days));
}
