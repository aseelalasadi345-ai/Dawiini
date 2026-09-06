import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { searchMedications } from "@/lib/api/medications";

const DEFAULT_LIMIT = 20;

// GET /api/medications?q= — the Search page's autocomplete. Disabled for a
// blank query (matches the route's own "no query -> no results" behavior,
// and avoids a request on every keystroke before the user's typed
// anything). keepPreviousData avoids the dropdown flashing empty between
// keystrokes while a new query is in flight.
export function useMedicationSearch(query: string, limit = DEFAULT_LIMIT) {
  const trimmed = query.trim();
  return useQuery({
    queryKey: ["medicationSearch", trimmed, limit],
    queryFn: () => searchMedications(trimmed, limit),
    enabled: trimmed.length > 0,
    placeholderData: keepPreviousData,
  });
}
