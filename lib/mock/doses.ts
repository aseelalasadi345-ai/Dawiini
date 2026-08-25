import { Dose } from "@/lib/types";

// Mirrors the mock medications in MedicationsProvider (Metformin, Omeprazole,
// Atorvastatin) so "today's doses" and "my medications" stay consistent.
export const todayDoses: Dose[] = [
  { id: "d1", medicationName: "Metformin", dose: "850mg", time: "08:00", status: "taken" },
  { id: "d2", medicationName: "Omeprazole", dose: "20mg", time: "08:00", status: "taken" },
  { id: "d3", medicationName: "Metformin", dose: "850mg", time: "20:00", status: "pending" },
  { id: "d4", medicationName: "Atorvastatin", dose: "40mg", time: "21:00", status: "pending" },
];

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// The dose the user needs next: the earliest still-pending dose at or after
// the current time, falling back to the earliest pending dose overall (e.g.
// all of today's remaining doses were actually earlier in the day), and
// finally undefined if nothing is pending at all.
export function getNextPendingDose(
  doses: Dose[],
  now: Date = new Date(),
): Dose | undefined {
  const pending = doses.filter((d) => d.status === "pending");
  if (pending.length === 0) return undefined;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const upcoming = pending
    .filter((d) => timeToMinutes(d.time) >= nowMinutes)
    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time));

  if (upcoming.length > 0) return upcoming[0];

  return [...pending].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time),
  )[0];
}
