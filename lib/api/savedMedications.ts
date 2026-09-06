import { ISavedMedication, IResponse } from "@/interfaces/interfaces";
import { axiosGet, axiosPost, axiosDelete } from "@/lib/axios";

// GET /api/saved-medications — the Saved tab's data source.
export function listSavedMedications(): Promise<IResponse<ISavedMedication[]>> {
  return axiosGet<ISavedMedication[]>("saved-medications");
}

// POST /api/saved-medications
export function saveMedication(catalogEntryId: string): Promise<IResponse<never>> {
  return axiosPost<{ catalogEntryId: string }, never>("saved-medications", { catalogEntryId });
}

// DELETE /api/saved-medications/[catalogEntryId]
export function unsaveMedication(catalogEntryId: string): Promise<IResponse<never>> {
  return axiosDelete<never>(`saved-medications/${catalogEntryId}`);
}
