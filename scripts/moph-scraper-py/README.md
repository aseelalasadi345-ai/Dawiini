# MOPH Drugs Database Scraper (Python)

Pulls the full Lebanon National Drugs Database from moph.gov.lb into a
JSON file matching the Dawiini `medications.json` seed schema.

This is a separate, standalone tool — nothing in `app/` or `components/`
imports it. It's not run by Claude/automated agents in this repo: MOPH's
`robots.txt` explicitly disallows `ClaudeBot` site-wide, so this must be
run by a human, from their own machine. See the header comment in
`scrape_medications.py` for the full rationale.

## Setup

This project has no other Python tooling, so use a venv rather than a
system-wide install:

```bash
cd scripts/moph-scraper-py
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
```

(If you're on a Debian/Ubuntu system managing Python system-wide and want
to skip the venv anyway, `pip install -r requirements.txt --break-system-packages`
still works — just not needed here.)

## Run

```bash
# Test on a handful of pages first
python scrape_medications.py --pages 1-3

# Full scrape (~201 pages, ~5,000 records, takes ~5-10 min at default delay)
python scrape_medications.py

# Full scrape including Arabic names (slower -- doubles requests)
python scrape_medications.py --with-arabic
```

Output goes to `medications.json` in this folder, in this shape:

```json
{
  "source": "https://moph.gov.lb/en/Drugs/index/3/4848/lebanon-national-drugs-database",
  "scrapedAt": "2026-08-23T12:00:00Z",
  "count": 5025,
  "partial": false,
  "failedPages": { "english": [], "arabic": [] },
  "medications": [
    {
      "name": "PANADOL",
      "nameAr": "بانادول",
      "form": "Tablet",
      "strength": "500mg",
      "atcCode": "N02BE01",
      "bg": "G",
      "ingredients": "Paracetamol - 500mg",
      "price": "45,000 L.L",
      "sourceUrl": "https://moph.gov.lb/en/Drugs/view/1234"
    }
  ]
}
```

If any pages fail to fetch even after retries, they're listed by number in
`failedPages` and `partial` is set to `true` — check that field before
treating a run as complete. The script also prints a loud warning banner
at the end (not just scrolled-past stderr lines during the run) if this
happens.

## Notes

- The site's table looks JS-loaded but is actually server-rendered once you
  hit a page-numbered URL (`/page:N/...`). No headless browser needed.
- The scraper walks the unfiltered "All" listing (no letter filter) by page
  number, which is simpler than looping through all 26 letters separately.
- Prices are in Lebanese Pounds (L.L) as listed on the site and change often
  due to exchange-rate updates -- treat them as a snapshot, not live data.
- Be polite to the server: default delay is 0.75s between requests. Don't
  drop it much lower or run multiple instances in parallel.
- If MOPH changes their page markup, `parse_table()` is the only function
  that should need updating.
