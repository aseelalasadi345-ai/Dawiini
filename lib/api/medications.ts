import { ICatalogSearchHit, IMedication, IResponse } from "@/interfaces/interfaces";
import { api, axiosGet, axiosPost, axiosPatch, axiosDelete } from "@/lib/axios";
import type { MedicationFormValues } from "@/lib/schemas/medication";

// All of these are built to the IResponse convention, so the generic
// axios* wrappers work unmodified here. Note: GET /api/medications (wrapped
// separately below, as searchMedicationCatalog) is a different resource
// entirely — the shared, read-only MOPH catalog search, not the current
// user's own regimen.

export function createMedication(values: MedicationFormValues): Promise<IResponse<IMedication>> {
  return axiosPost<MedicationFormValues, IMedication>("medications", values);
}

// GET /api/medications/mine — the medications list page's data source.
export function listMyMedications(): Promise<IResponse<IMedication[]>> {
  return axiosGet<IMedication[]>("medications/mine");
}

// PATCH /api/medications/[id] — used for both a real edit (EditMedicationModal)
// and Set Reminder (which only changes `times`, but sends the full record
// since the route validates against the same medicationFormSchema as create).
export function updateMedication(id: string, values: MedicationFormValues): Promise<IResponse<IMedication>> {
  return axiosPatch<MedicationFormValues, IMedication>(`medications/${id}`, values);
}

export function deleteMedication(id: string): Promise<IResponse<{ id: string }>> {
  return axiosDelete<{ id: string }>(`medications/${id}`);
}

// A single hit from GET /api/medications?q= — only the fields the
// "Find in Pharmacy" lookup actually needs, not the full MedicationCatalogEntry.
export interface IMedicationCatalogHit {
  id: string;
  name: string;
}

// GET /api/medications?q=<name>&limit=1 — the real MOPH catalog search
// (case-insensitive "contains" on name/nameAr), used by the medications
// list page's "Find in Pharmacy" action to resolve a user's own medication
// name (e.g. "Metformin") to a real catalog entry id to filter /pharmacies
// by. This route predates the IResponse convention (returns a bare
// { results } body, not { status, data }) — see its own file's comment —
// so it's called directly through the shared `api` axios instance rather
// than the axiosGet wrapper, which would misread `results` as `data`.
export async function searchMedicationCatalog(query: string): Promise<IMedicationCatalogHit[]> {
  const response = await api.get<{ results: IMedicationCatalogHit[] }>("medications", {
    params: { q: query, limit: 1 },
  });
  return response.data.results;
}

// GET /api/medications?q=<name>&limit=<n> — the full-fidelity version, used
// by the Search page's autocomplete (components/MedicationAutocomplete.tsx).
// Same route/convention as searchMedicationCatalog above, just returning
// the richer fields the autocomplete dropdown renders (nameAr/form/strength/
// ingredients/matchSource) instead of only {id, name}.
export async function searchMedications(query: string, limit = 20): Promise<ICatalogSearchHit[]> {
  const response = await api.get<{ results: ICatalogSearchHit[] }>("medications", {
    params: { q: query, limit },
  });
  return response.data.results;
}
