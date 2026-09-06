"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { getMatchRange } from "@/lib/medicationSearch";
import { useMedicationSearch } from "@/hooks/useMedicationSearch";
import type { ICatalogSearchHit } from "@/interfaces/interfaces";

const DEBOUNCE_MS = 250;
const DEFAULT_MAX_RESULTS = 20;

function HighlightedName({ text, query }: { text: string; query: string }) {
  const range = getMatchRange(text, query);
  if (!range) return <>{text}</>;
  return (
    <>
      {text.slice(0, range.start)}
      <span className="text-primary font-semibold">
        {text.slice(range.start, range.end)}
      </span>
      {text.slice(range.end)}
    </>
  );
}

interface MedicationAutocompleteProps {
  onSelect?: (result: ICatalogSearchHit) => void;
  placeholder?: string;
  maxResults?: number;
}

// Real search now — GET /api/medications?q= (Prisma-backed), not an
// in-browser scan of the static data/medications.json bundle. See
// hooks/useMedicationSearch.ts.
export default function MedicationAutocomplete({
  onSelect,
  placeholder,
  maxResults = DEFAULT_MAX_RESULTS,
}: MedicationAutocompleteProps) {
  const t = useTranslations("medicationSearch");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
      setIsOpen(query.trim().length > 0);
      setActiveIndex(-1);
    }, DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [query]);

  const { data: results = [], isFetching } = useMedicationSearch(debouncedQuery, maxResults);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(result: ICatalogSearchHit) {
    setQuery(result.name);
    setDebouncedQuery(result.name);
    setIsOpen(false);
    onSelect?.(result);
  }

  function handleClear() {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(results[activeIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  const showEmptyState =
    isOpen && debouncedQuery.trim().length > 0 && !isFetching && results.length === 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="flex items-center gap-3 bg-surface border border-border rounded-2xl px-4 py-3 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
        <Search size={18} className="text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => debouncedQuery.trim() && setIsOpen(true)}
          placeholder={placeholder ?? t("placeholder")}
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls="medication-autocomplete-list"
          className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted"
        />
        {isFetching && <Loader2 size={16} className="text-muted shrink-0 animate-spin" />}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t("clear")}
            className="p-1 rounded-full text-muted transition-colors hover:bg-background hover:text-foreground active:bg-border shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <ul
          id="medication-autocomplete-list"
          role="listbox"
          className="absolute z-20 mt-2 w-full max-h-96 overflow-y-auto bg-surface border border-border rounded-2xl shadow-lg divide-y divide-border"
        >
          {results.map((result, i) => (
            <li key={result.id} role="option" aria-selected={i === activeIndex}>
              <button
                type="button"
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-start transition-colors active:bg-border ${
                  i === activeIndex ? "bg-primary-light" : "hover:bg-background"
                }`}
              >
                <Search size={14} className="text-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    <HighlightedName text={result.name} query={debouncedQuery} />
                  </p>
                  {result.nameAr && (
                    <p className="text-xs text-muted truncate" dir="rtl">
                      {result.nameAr}
                    </p>
                  )}
                  {(result.form || result.strength) && (
                    <p className="text-xs text-muted truncate">
                      {[result.form, result.strength].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {result.matchSource === "ingredients" && result.ingredients && (
                    <p className="text-xs text-accent truncate mt-0.5">
                      {t("matchesIngredient", { ingredient: result.ingredients })}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showEmptyState && (
        <div className="absolute z-20 mt-2 w-full bg-surface border border-border rounded-2xl shadow-lg px-4 py-3 text-sm text-muted">
          {t("noResults")}
        </div>
      )}
    </div>
  );
}
