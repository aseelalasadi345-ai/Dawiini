export interface MedicationEntry {
  name: string;
  nameAr?: string;
  form?: string;
  strength?: string;
  atcCode?: string;
  bg?: string;
  ingredients?: string;
  price?: string;
  sourceUrl?: string;
}

export type MedicationMatchSource = "name" | "ingredients";

export interface MedicationSearchResult {
  medication: MedicationEntry;
  index: number;
  matchSource: MedicationMatchSource;
}

// Arabic diacritics (fathatan..sukun), superscript alef, and tatweel —
// stripped so differently-vocalized spellings of the same word still match.
const ARABIC_DIACRITICS_REGEX = /[ً-ْٰـ]/g;

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(ARABIC_DIACRITICS_REGEX, "");
}

// Ingredient matching only kicks in past this length, so a 1-2 character
// query doesn't get swamped by incidental substring hits across a 5,000
// record ingredients list (e.g. "a" is inside almost every ingredient).
const MIN_INGREDIENT_QUERY_LENGTH = 3;

// Lower is better — prefix matches on the drug's own name outrank a match
// that was only found inside its ingredient list.
const RANK_NAME_PREFIX = 0;
const RANK_NAME_CONTAINS = 1;
const RANK_INGREDIENT_PREFIX = 2;
const RANK_INGREDIENT_CONTAINS = 3;

function rankMedication(
  med: MedicationEntry,
  q: string,
): { rank: number; matchSource: MedicationMatchSource } | null {
  const nameNorm = normalize(med.name);
  const nameArNorm = med.nameAr ? normalize(med.nameAr) : "";

  if (nameNorm.startsWith(q) || (nameArNorm && nameArNorm.startsWith(q))) {
    return { rank: RANK_NAME_PREFIX, matchSource: "name" };
  }
  if (nameNorm.includes(q) || (nameArNorm && nameArNorm.includes(q))) {
    return { rank: RANK_NAME_CONTAINS, matchSource: "name" };
  }

  if (q.length >= MIN_INGREDIENT_QUERY_LENGTH && med.ingredients) {
    const ingredientsNorm = normalize(med.ingredients);
    if (ingredientsNorm.startsWith(q)) {
      return { rank: RANK_INGREDIENT_PREFIX, matchSource: "ingredients" };
    }
    if (ingredientsNorm.includes(q)) {
      return { rank: RANK_INGREDIENT_CONTAINS, matchSource: "ingredients" };
    }
  }

  return null;
}

// Prefix matches on name rank above substring-on-name, which ranks above
// prefix-on-ingredients, which ranks above substring-on-ingredients. Ties
// within a tier break by shorter name first, then alphabetically, so e.g.
// querying "pana" surfaces "PANADOL" above "PANADOL EXTRA".
export function searchMedications(
  query: string,
  medications: MedicationEntry[],
  limit = 20,
): MedicationSearchResult[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: (MedicationSearchResult & { rank: number })[] = [];

  medications.forEach((medication, index) => {
    const match = rankMedication(medication, q);
    if (!match) return;
    scored.push({ medication, index, matchSource: match.matchSource, rank: match.rank });
  });

  scored.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    const lengthDiff = a.medication.name.length - b.medication.name.length;
    if (lengthDiff !== 0) return lengthDiff;
    return a.medication.name.localeCompare(b.medication.name);
  });

  return scored.slice(0, limit).map(({ medication, index, matchSource }) => ({
    medication,
    index,
    matchSource,
  }));
}

// Where `query` matches inside `text` (for highlighting the matched span).
export function getMatchRange(
  text: string,
  query: string,
): { start: number; end: number } | null {
  const normQuery = normalize(query);
  if (!normQuery) return null;
  const index = normalize(text).indexOf(normQuery);
  if (index === -1) return null;
  return { start: index, end: index + normQuery.length };
}
