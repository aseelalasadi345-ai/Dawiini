import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listRecentSearches, recordRecentSearch } from "@/lib/api/recentSearches";

// GET /api/recent-searches — used by both the Search page's own "Recent
// Searches" section and the Home page's. `enabled` lets callers skip the
// request entirely when signed out (see components/Navbar.tsx's
// useNotifications for the same pattern).
export function useRecentSearches(limit = 4, enabled = true) {
  return useQuery({
    queryKey: ["recentSearches", limit],
    queryFn: () => listRecentSearches(limit),
    enabled,
  });
}

export function useRecordRecentSearch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (catalogEntryId: string) => recordRecentSearch(catalogEntryId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recentSearches"] }),
  });
}
