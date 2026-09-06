import { IRecentSearch, IResponse } from "@/interfaces/interfaces";
import { axiosGet, axiosPost } from "@/lib/axios";

// GET /api/recent-searches?limit=
export function listRecentSearches(limit = 4): Promise<IResponse<IRecentSearch[]>> {
  return axiosGet<IRecentSearch[]>(`recent-searches?limit=${limit}`);
}

// POST /api/recent-searches
export function recordRecentSearch(catalogEntryId: string): Promise<IResponse<never>> {
  return axiosPost<{ catalogEntryId: string }, never>("recent-searches", { catalogEntryId });
}
