#!/usr/bin/env python3
"""
MOPH Lebanon National Drugs Database scraper
==============================================

Scrapes https://moph.gov.lb/en/Drugs/index/3/4848 (the official Lebanon
National Drugs Database) and writes out a JSON file matching the schema
used by the Dawiini app's seed data (medications.json).

WHY THIS WORKS WITHOUT A HEADLESS BROWSER:
The site *looks* like it loads its table via AJAX (there's a spinner gif
and the base URL renders an empty table), but the pagination links reveal
that the table is actually rendered server-side once you hit a URL with
the right path segments, e.g.:

    https://moph.gov.lb/en/Drugs/index/3/4848/page:7/sort:Drug.b_g/direction:asc/letter:A

So a plain `requests.get()` on a page-numbered URL returns full HTML with
the table already populated. No Selenium/Playwright required.

USAGE:
    pip install requests beautifulsoup4 --break-system-packages
    python scrape_medications.py                  # scrape everything (~201 pages)
    python scrape_medications.py --pages 1-5       # scrape only pages 1-5 (testing)
    python scrape_medications.py --with-arabic     # also fetch Arabic names (2x requests)

OUTPUT:
    medications.json  -- array of records matching the seed schema, plus
                          a few extra fields (bg, ingredients, price, sourceUrl)
                          that the app doesn't currently use but are handy to keep.
                          Also includes a "failedPages" list (see below) so a
                          partial run is never silently mistaken for a complete one.

BE POLITE:
    This hits a government server ~200+ times. The script sleeps between
    requests (default 0.75s) and retries on failure. Don't lower the delay
    a lot or hammer it in parallel -- there's no need to, and it's someone
    else's infrastructure.
"""

import argparse
import json
import re
import sys
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

BASE_EN = "https://moph.gov.lb/en/Drugs/index/3/4848"
BASE_AR = "https://moph.gov.lb/ar/Drugs/index/3/4848"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
}

REQUEST_DELAY_SECONDS = 0.75
MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 2.0

# Arabic script (main block + supplement). Used to verify a "nameAr" we
# scraped is actually Arabic text, not the site handing back English
# content for an /ar/ URL (see contains_arabic() and its callers below).
ARABIC_CHAR_PATTERN = re.compile(r"[؀-ۿݐ-ݿ]")


def contains_arabic(text: str) -> bool:
    return bool(ARABIC_CHAR_PATTERN.search(text))


def page_url(page: int, lang_base: str = BASE_EN, letter: str | None = None) -> str:
    parts = [lang_base]
    if page > 1:
        parts.append(f"page:{page}")
    if letter:
        parts.append(f"letter:{letter}")
    return "/".join(parts)


def fetch(url: str, lang: str = "en") -> str | None:
    # Send a locale-appropriate Accept-Language rather than one fixed header
    # for every request -- a previous version always sent "en,ar;q=0.8" even
    # for /ar/ URLs, which told the server to prefer English regardless of
    # the path. That's the leading suspect for nameAr coming back identical
    # to name (see contains_arabic() guard in scrape_arabic_names() for the
    # part of this fix that makes that failure mode safe either way).
    headers = dict(HEADERS)
    headers["Accept-Language"] = "ar,en;q=0.5" if lang == "ar" else "en,ar;q=0.5"

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, headers=headers, timeout=20)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as exc:
            print(f"  [retry {attempt}/{MAX_RETRIES}] {url} -> {exc}", file=sys.stderr)
            time.sleep(RETRY_BACKOFF_SECONDS * attempt)
    print(f"  [FAILED] giving up on {url}", file=sys.stderr)
    return None


def extract_drug_id(href: str) -> str | None:
    m = re.search(r"/Drugs/view/(\d+)", href)
    return m.group(1) if m else None


def parse_table(html: str) -> list[dict]:
    """Parse one results page into a list of raw record dicts."""
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table")
    if not table:
        return []

    rows = table.find_all("tr")
    records = []
    for row in rows:
        cells = row.find_all("td")
        if len(cells) < 7:
            continue  # header row or malformed row

        atc = cells[0].get_text(strip=True)
        name = cells[1].get_text(strip=True)
        bg = cells[2].get_text(strip=True)
        ingredients = cells[3].get_text(strip=True)
        dosage = cells[4].get_text(strip=True)
        form = cells[5].get_text(strip=True)
        price_raw = cells[6].get_text(strip=True)

        # price cells contain a trailing "-->" artifact from the site's markup
        price = price_raw.replace("-->", "").strip()

        link = cells[1].find("a")
        drug_id = extract_drug_id(link["href"]) if link and link.has_attr("href") else None

        if not name or not atc:
            continue

        records.append({
            "id": drug_id,
            "name": name,
            "atcCode": atc,
            "bg": bg,               # "G" (generic) or "BioTech"/brand label as shown on site
            "ingredients": ingredients,
            "strength": dosage,
            "form": form,
            "price": price,
            "sourceUrl": f"https://moph.gov.lb/en/Drugs/view/{drug_id}" if drug_id else None,
        })
    return records


def get_last_page_number(html: str) -> int:
    """Look at the pagination links to find the highest page number available."""
    soup = BeautifulSoup(html, "html.parser")
    page_numbers = set()
    for a in soup.find_all("a", href=True):
        m = re.search(r"/page:(\d+)/", a["href"] + "/")
        if m:
            page_numbers.add(int(m.group(1)))
    return max(page_numbers) if page_numbers else 1


def scrape_arabic_names(ids_needed: set[str]) -> tuple[dict[str, str], list[int], int]:
    """
    Fetch Arabic drug names by re-walking the Arabic version of the listing
    and matching on the numeric drug id embedded in each row's link.
    Only call this if you actually want nameAr populated -- it roughly
    doubles total requests.

    A row is only accepted into the id -> Arabic name map if its scraped
    "name" actually contains Arabic script (see contains_arabic()). This
    guards against a previously-real bug: if the /ar/ URL doesn't actually
    return localized content (wrong Accept-Language, a redirect, the
    endpoint just not being translated, etc.), parse_table() would still
    successfully extract a "name" -- it would just be the same English/Latin
    text as the non-Arabic page, silently corrupting nameAr with a
    duplicate of name instead of leaving it blank. Skipping non-Arabic rows
    here means that failure mode can no longer produce wrong data, only
    missing data, regardless of its root cause.

    Returns (id -> Arabic name map, list of Arabic page numbers that failed
    to fetch even after retries, count of rows seen that did NOT contain
    Arabic script and were therefore skipped).
    """
    print(f"\nFetching Arabic names for {len(ids_needed)} drugs...")
    id_to_name_ar: dict[str, str] = {}
    failed_pages: list[int] = []
    rows_skipped_non_arabic = 0

    first_html = fetch(page_url(1, lang_base=BASE_AR), lang="ar")
    if not first_html:
        failed_pages.append(1)
        return id_to_name_ar, failed_pages, rows_skipped_non_arabic
    last_page = get_last_page_number(first_html)

    for page in range(1, last_page + 1):
        if not ids_needed - id_to_name_ar.keys():
            break  # found everything we need already
        url = page_url(page, lang_base=BASE_AR)
        html = fetch(url, lang="ar") if page > 1 else first_html
        if not html:
            failed_pages.append(page)
            print(f"  [ar page {page}/{last_page}] FAILED -- no names collected from this page", file=sys.stderr)
            time.sleep(REQUEST_DELAY_SECONDS)
            continue
        for rec in parse_table(html):
            if not rec["id"]:
                continue
            if contains_arabic(rec["name"]):
                id_to_name_ar[rec["id"]] = rec["name"]
            else:
                rows_skipped_non_arabic += 1
        print(
            f"  [ar page {page}/{last_page}] collected so far: {len(id_to_name_ar)} "
            f"(skipped {rows_skipped_non_arabic} non-Arabic rows)"
        )
        time.sleep(REQUEST_DELAY_SECONDS)

    return id_to_name_ar, failed_pages, rows_skipped_non_arabic


def main():
    global REQUEST_DELAY_SECONDS

    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--pages", type=str, default=None,
                         help="Page range to scrape, e.g. '1-5' or '10'. Default: all pages.")
    parser.add_argument("--with-arabic", action="store_true",
                         help="Also scrape Arabic drug names (nameAr field). Roughly doubles requests.")
    parser.add_argument("--out", type=str, default="medications.json",
                         help="Output JSON file path.")
    parser.add_argument("--delay", type=float, default=REQUEST_DELAY_SECONDS,
                         help="Seconds to sleep between requests.")
    args = parser.parse_args()

    REQUEST_DELAY_SECONDS = args.delay

    print(f"Fetching page 1 of {BASE_EN} to discover total page count...")
    first_html = fetch(page_url(1))
    if not first_html:
        print("Could not reach MOPH site at all -- check network/URL.", file=sys.stderr)
        sys.exit(1)

    last_page = get_last_page_number(first_html)
    print(f"Site reports {last_page} total pages (~{last_page * 25} records).")

    if args.pages:
        if "-" in args.pages:
            start, end = map(int, args.pages.split("-"))
        else:
            start = end = int(args.pages)
        end = min(end, last_page)
    else:
        start, end = 1, last_page

    all_records: list[dict] = []
    seen_ids: set[str] = set()
    failed_pages: list[int] = []

    for page in range(start, end + 1):
        html = first_html if page == 1 else fetch(page_url(page))
        if not html:
            failed_pages.append(page)
            print(f"[page {page}/{end}] FAILED -- no records collected from this page", file=sys.stderr)
            time.sleep(REQUEST_DELAY_SECONDS)  # still be polite before trying the next page
            continue
        page_records = parse_table(html)
        new_count = 0
        for rec in page_records:
            key = rec["id"] or f"{rec['name']}|{rec['strength']}|{rec['form']}"
            if key in seen_ids:
                continue
            seen_ids.add(key)
            all_records.append(rec)
            new_count += 1
        print(f"[page {page}/{end}] +{new_count} new records (total: {len(all_records)})")
        time.sleep(REQUEST_DELAY_SECONDS)

    failed_ar_pages: list[int] = []
    ids_needed: set[str] = set()
    ar_rows_skipped = 0
    if args.with_arabic:
        ids_needed = {r["id"] for r in all_records if r["id"]}
        name_ar_map, failed_ar_pages, ar_rows_skipped = scrape_arabic_names(ids_needed)
        for rec in all_records:
            rec["nameAr"] = name_ar_map.get(rec["id"], "")

    # Shape to match the Dawiini seed schema (name, nameAr, form, strength, atcCode)
    # while keeping the extra fields around for anyone who wants richer data.
    output = {
        "source": "https://moph.gov.lb/en/Drugs/index/3/4848/lebanon-national-drugs-database",
        "scrapedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "count": len(all_records),
        "partial": bool(failed_pages or failed_ar_pages),
        "failedPages": {
            "english": failed_pages,
            "arabic": failed_ar_pages,
        },
        "arabicCoverage": {
            "requested": len(ids_needed),
            "found": len(all_records) - sum(1 for r in all_records if not r.get("nameAr")),
            "nonArabicRowsSkipped": ar_rows_skipped,
        } if args.with_arabic else None,
        "medications": [
            {
                "name": r["name"],
                "nameAr": r.get("nameAr", ""),
                "form": r["form"],
                "strength": r["strength"],
                "atcCode": r["atcCode"],
                # extra fields beyond the original seed schema:
                "bg": r["bg"],
                "ingredients": r["ingredients"],
                "price": r["price"],
                "sourceUrl": r["sourceUrl"],
            }
            for r in all_records
        ],
    }

    out_path = Path(args.out)
    out_path.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\nDone. Wrote {len(all_records)} records to {out_path.resolve()}")

    # A failure 5 minutes into an unattended run is easy to miss if it's just
    # one line scrolled past in stderr -- repeat it loudly at the very end,
    # and it's also persisted in the "failedPages" field of the output file.
    if failed_pages or failed_ar_pages:
        print("\n" + "=" * 60, file=sys.stderr)
        print("WARNING: this run is INCOMPLETE. Some pages could not be", file=sys.stderr)
        print("fetched even after retries -- their records are missing.", file=sys.stderr)
        if failed_pages:
            print(f"  English pages that failed: {failed_pages}", file=sys.stderr)
        if failed_ar_pages:
            print(f"  Arabic pages that failed:  {failed_ar_pages}", file=sys.stderr)
        print("Re-run with --pages <N> for just those pages and merge manually,", file=sys.stderr)
        print("or re-run the full scrape if failures were widespread.", file=sys.stderr)
        print("=" * 60, file=sys.stderr)

    if args.with_arabic:
        found = output["arabicCoverage"]["found"]
        requested = output["arabicCoverage"]["requested"]
        coverage_pct = (found / requested * 100) if requested else 0
        print(f"\nArabic coverage: {found}/{requested} records ({coverage_pct:.0f}%) got a real nameAr.")
        if found == 0:
            print("\n" + "=" * 60, file=sys.stderr)
            print("WARNING: 0 records got a real Arabic name. Every row on the", file=sys.stderr)
            print("/ar/ pages was non-Arabic text, so nameAr was left blank", file=sys.stderr)
            print("everywhere rather than duplicating the English name.", file=sys.stderr)
            print("This means the /ar/ endpoint likely isn't returning localized", file=sys.stderr)
            print("content at all (redirect, no translation for this listing,", file=sys.stderr)
            print("etc.) -- that's a site-side question, not something re-running", file=sys.stderr)
            print("this script differently is likely to fix.", file=sys.stderr)
            print("=" * 60, file=sys.stderr)


if __name__ == "__main__":
    main()
