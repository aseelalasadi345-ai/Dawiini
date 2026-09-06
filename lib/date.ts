// Server-local date/time formatting helpers, shared by the schedule routes.
// Deliberately local (not UTC) — "today"/"now" here means the server's own
// clock, per the schedule endpoints' spec.

export function toLocalDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function toLocalTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

export function todayLocalDateString(): string {
  return toLocalDateString(new Date());
}

// "10 minutes ago" / "2 days ago" style relative timestamp, for the
// notifications page (a notification's createdAt is a real DB timestamp
// now, not a static mock string). English only, matching this app's
// existing convention of plain-English server-generated text (see
// lib/notifications.ts) rather than a translated string.
export function formatRelativeTime(date: Date): string {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString();
}
