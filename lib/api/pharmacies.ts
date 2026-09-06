import { IPharmacyAvailability, IResponse } from "@/interfaces/interfaces";
import { axiosGet } from "@/lib/axios";

// GET /api/pharmacies/availability?medicationId=xxx — a new route built to
// the adopted convention (HTTP 200 always, real outcome in body.status), so
// the generic axiosGet unwrap works unmodified here.
export function getPharmacyAvailability(
  medicationId: string
): Promise<IResponse<IPharmacyAvailability[]>> {
  return axiosGet<IPharmacyAvailability[]>(
    `pharmacies/availability?medicationId=${encodeURIComponent(medicationId)}`
  );
}
