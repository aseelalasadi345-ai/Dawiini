const FALLBACK_BASE_URL = "http://localhost:3000";

/**
 * Normalized site base URL — no trailing slash, regardless of whether
 * NEXT_PUBLIC_BASE_URL is configured with or without one.
 */
export function getBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || FALLBACK_BASE_URL;
  return raw.replace(/\/+$/, "");
}

/** Joins `path` onto the normalized base URL with exactly one slash. */
export function buildUrl(path: string): string {
  const base = getBaseUrl();
  const cleanPath = path.replace(/^\/+/, "");
  return cleanPath ? `${base}/${cleanPath}` : base;
}
