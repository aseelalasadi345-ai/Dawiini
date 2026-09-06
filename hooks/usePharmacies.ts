import { useQuery } from "@tanstack/react-query";
import { getPharmacyAvailability } from "@/lib/api/pharmacies";
import { allowStatuses } from "@/lib/axios";
import type { IPharmacyAvailability, IResponse } from "@/interfaces/interfaces";

// Wraps getPharmacyAvailability. "No pharmacies report stock" (the route's
// embedded status: 404) is a normal empty state, not a failure — caught here
// via allowStatuses and resolved normally, so consuming components just
// branch on `data?.data` (undefined/empty) the same way any other empty
// result renders, instead of needing to handle `isError`/`error` for an
// entirely expected case.
export function usePharmacyAvailability(medicationId: string) {
  return useQuery<IResponse<IPharmacyAvailability[]>>({
    queryKey: ["pharmacyAvailability", medicationId],
    queryFn: async () => {
      try {
        return await getPharmacyAvailability(medicationId);
      } catch (error) {
        return allowStatuses<IPharmacyAvailability[]>(error, 404);
      }
    },
    enabled: Boolean(medicationId),
  });
}
