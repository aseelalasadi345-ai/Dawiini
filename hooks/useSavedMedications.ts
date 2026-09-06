import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listSavedMedications,
  saveMedication,
  unsaveMedication,
} from "@/lib/api/savedMedications";

// GET /api/saved-medications — the Saved tab's data source.
export function useSavedMedicationsList() {
  return useQuery({
    queryKey: ["savedMedications"],
    queryFn: listSavedMedications,
  });
}

export function useSaveMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogEntryId: string) => saveMedication(catalogEntryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedMedications"] }),
  });
}

export function useUnsaveMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogEntryId: string) => unsaveMedication(catalogEntryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["savedMedications"] }),
  });
}
