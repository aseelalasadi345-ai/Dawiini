// Where `query` matches inside `text` (for highlighting the matched span in
// MedicationAutocomplete). Pure string logic — kept here even though the
// actual search moved server-side (GET /api/medications?q=, see
// lib/api/medications.ts) because highlighting only needs the query text
// and the already-fetched result name, not another round trip.
export function getMatchRange(
  text: string,
  query: string,
): { start: number; end: number } | null {
  const normQuery = query.trim().toLowerCase();
  if (!normQuery) return null;
  const index = text.toLowerCase().indexOf(normQuery);
  if (index === -1) return null;
  return { start: index, end: index + normQuery.length };
}
