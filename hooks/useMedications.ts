import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMedication,
  listMyMedications,
  updateMedication,
  deleteMedication,
} from "@/lib/api/medications";
import type { MedicationFormValues } from "@/lib/schemas/medication";

// Named useCreateMedication/useMyMedications (not useMedications) to avoid
// colliding with components/MedicationsProvider.tsx's unrelated
// useMedications() context hook — that one previously backed the medications
// LIST page with in-memory mock data; the list page (and its card menu's
// Edit/Delete/Set Reminder actions) now uses the real hooks below instead,
// and MedicationsProvider has been retired (see medications/page.tsx).
export function useCreateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MedicationFormValues) => createMedication(values),
    onSuccess: () => {
      // A new medication changes what GET /api/schedule/today generates —
      // invalidating refetches it so the new medication's doses show up
      // immediately on the Today page/widget. It also belongs on the
      // medications list now, so that query is invalidated too.
      queryClient.invalidateQueries({ queryKey: ["todaySchedule"] });
      queryClient.invalidateQueries({ queryKey: ["myMedications"] });
    },
  });
}

// GET /api/medications/mine — the medications list page's data source.
export function useMyMedications() {
  return useQuery({
    queryKey: ["myMedications"],
    queryFn: listMyMedications,
  });
}

interface UpdateMedicationVariables {
  id: string;
  values: MedicationFormValues;
}

// PATCH /api/medications/[id] — used for both a real edit and Set Reminder
// (which sends the full record with only `times` changed; see
// lib/api/medications.ts). Either can change dose-generation inputs
// (frequency/times/dates), so both queries are invalidated on success.
export function useUpdateMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: UpdateMedicationVariables) => updateMedication(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myMedications"] });
      queryClient.invalidateQueries({ queryKey: ["todaySchedule"] });
    },
  });
}

// DELETE /api/medications/[id]
export function useDeleteMedication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMedication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myMedications"] });
      queryClient.invalidateQueries({ queryKey: ["todaySchedule"] });
    },
  });
}
