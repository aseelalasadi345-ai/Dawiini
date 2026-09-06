import { IDose, IDoseToday, IResponse } from "@/interfaces/interfaces";
import { axiosGet, axiosPatch } from "@/lib/axios";

// GET /api/schedule/today and PATCH /api/schedule/doses/[id] now both
// return the IResponse convention natively (see their route files), so the
// generic axiosGet/axiosPatch wrappers work unmodified here — this file no
// longer needs to hand-build the envelope client-side the way it used to.

// GET /api/schedule/today?date=
// `date` (YYYY-MM-DD) is optional and defaults server-side to today.
export function getTodaySchedule(date?: string): Promise<IResponse<IDoseToday[]>> {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  const query = params.toString();

  return axiosGet<IDoseToday[]>(`schedule/today${query ? `?${query}` : ""}`);
}

// PATCH /api/schedule/doses/[id] — note this is PATCH, not PUT/POST; see
// axiosPatch's comment in lib/axios.ts.
export function updateDoseStatus(
  doseId: string,
  status: "taken" | "skipped" | "pending"
): Promise<IResponse<IDose>> {
  return axiosPatch<{ status: string }, IDose>(`schedule/doses/${doseId}`, { status });
}
