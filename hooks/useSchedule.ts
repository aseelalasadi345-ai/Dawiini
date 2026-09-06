import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTodaySchedule, updateDoseStatus } from "@/lib/api/schedule";
import { useAuth } from "@/components/AuthProvider";
import type { IDose, IDoseToday, IResponse } from "@/interfaces/interfaces";

// Wraps getTodaySchedule. `userId` is no longer a caller-supplied param —
// the backend now reads it from the session (see
// app/api/schedule/today/route.ts) — so this reads the signed-in user off
// AuthProvider itself instead. The query key still includes the user's id
// so each signed-in user's cache is keyed separately, and
// useUpdateDoseStatus's invalidation below still targets every mounted
// instance regardless of who's signed in.
export function useTodaySchedule(date?: string) {
  const { user } = useAuth();

  return useQuery<IResponse<IDoseToday[]>>({
    queryKey: ["todaySchedule", user?.id, date],
    queryFn: () => getTodaySchedule(date),
    enabled: Boolean(user),
  });
}

interface UpdateDoseStatusVariables {
  doseId: string;
  status: "taken" | "skipped" | "pending";
}

// Wraps updateDoseStatus. On success, invalidates every mounted
// ["todaySchedule", ...] query (regardless of which userId/date) so the
// today view refetches and reflects the new status.
export function useUpdateDoseStatus() {
  const queryClient = useQueryClient();

  return useMutation<IResponse<IDose>, unknown, UpdateDoseStatusVariables>({
    mutationFn: ({ doseId, status }) => updateDoseStatus(doseId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todaySchedule"] });
    },
  });
}
