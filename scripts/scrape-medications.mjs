#!/usr/bin/env node
/**
 * Scrapes Lebanon's MOPH National Drugs Database and writes the results to
 * data/medications.json for the app's search/autocomplete feature to import.
 *
 * WHY THIS SCRIPT IS "BEST-EFFORT":
 * moph.gov.lb's robots.txt explicitly disallows ClaudeBot ("User-agent:
 * ClaudeBot / Disallow: /"), so this file was written without ever fetching
 * the live page. Rather than hardcode guessed CSS selectors or URL query
 * strings — which would likely just be wrong — this script:
 *   1. Follows the REAL A–Z links found on the page instead of constructing
 *      them from an assumed URL pattern.
 *   2. Detects table columns by matching header text ("Name", "Form",
 *      "Dosage"/"Strength", "ATC") instead of hardcoding column indices.
 *   3. Follows the REAL "next page" link found on each letter's results
 *      page instead of assuming a page-number query param.
 *
 * That should make it work close to out of the box, but you should run it
 * once against a single letter (see USAGE below) and inspect the output
 * before doing a full A–Z run. If it finds nothing, open the page in your
 * browser's devtools, compare against CONFIG below, and adjust.
 *
 * USAGE
 *   node scripts/scrape-medications.mjs                 # full A–Z run
 *   node scripts/scrape-medications.mjs --letters=A,B    # just a couple of letters, for testing
 *   node scripts/scrape-medications.mjs --delay=1500     # slower, more polite
 *   node scripts/scrape-medications.mjs --dry-run        # scrape but don't write the file
 *
 * Re-run this periodically (e.g. monthly, via cron/Task Scheduler) to pick
 * up MOPH updates — it's entirely separate from the app; nothing in
 * app/ or components/ imports this file.
 */

import * as cheerio from "cheerio";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CONFIG = {
  baseUrl:
    "https://www.moph.gov.lb/en/Drugs/index/3/4848/lebanon-national-drugs-database",
  outputPath: resolve(__dirname, "../data/medications.json"),
  // Identify honestly as a distinct, non-Claude client. Fill in a real
  // contact if you plan to run this at any real scale/frequency.
  userAgent:
    "Dawiini-MedicationScraper/1.0 (personal project; contact: set-your-email@example.com)",
  requestDelayMs: 1000,
  requestTimeoutMs: 20000,
  maxPagesPerLetter: 200, // safety cap against an accidental infinite loop
  // Header keywords used to map table columns adaptively (case-insensitive,
  // matched against <th>/first-row-<td> text).
  columnKeywords: {
    name: [/^name$/, /drug\s*name/, /trade\s*name/, /^name\b/],
    nameAr: [/arabic/, /عرب/],
    form: [/^form$/, /dosage\s*form/, /pharmaceutical\s*form/],
    strength: [/dosage/, /strength/, /concentration/],
    atcCode: [/atc/],
  },
};

function log(...args) {
  console.log("[scrape-medications]", ...args);
}

function warn(...args) {
  console.warn("[scrape-medications] WARNING:", ...args);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs(argv) {
  const args = { letters: null, delay: CONFIG.requestDelayMs, dryRun: false };
  for (const arg of argv.slice(2)) {
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg.startsWith("--letters=")) {
      args.letters = arg
        .slice("--letters=".length)
        .split(",")
        .map((l) => l.trim().toUpperCase())
        .filter(Boolean);
    } else if (arg.startsWith("--delay=")) {
      args.delay = Number(arg.slice("--delay=".length)) || CONFIG.requestDelayMs;
    }
  }
  return args;
}

async function fetchHtml(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), CONFIG.requestTimeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": CONFIG.userAgent, Accept: "text/html" },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

/** Resolve a possibly-relative href against the page it was found on. */
function resolveUrl(href, pageUrl) {
  try {
    return new URL(href, pageUrl).toString();
  } catch {
    return null;
  }
}

/** Find A–Z alphabet navigation links on the landing page. */
function findLetterLinks($, pageUrl) {
  const links = new Map(); // letter -> url

  $("a").each((_, el) => {
    const text = $(el).text().trim();
    if (!/^[A-Za-z]$/.test(text)) return;
    const href = $(el).attr("href");
    if (!href) return;
    const resolved = resolveUrl(href, pageUrl);
    if (resolved) links.set(text.toUpperCase(), resolved);
  });

  return links;
}

/** Find a "next page" link on a results page, if one exists. */
function findNextPageLink($, pageUrl, currentPage) {
  let nextHref = null;

  $("a").each((_, el) => {
    if (nextHref) return;
    const rel = ($(el).attr("rel") || "").toLowerCase();
    const text = $(el).text().trim().toLowerCase();
    const ariaLabel = ($(el).attr("aria-label") || "").toLowerCase();

    const looksLikeNext =
      rel === "next" ||
      text === "next" ||
      text === "»" ||
      text === ">" ||
      ariaLabel.includes("next");

    // A numbered pagination link for exactly currentPage + 1 also counts.
    const isNextNumber = text === String(currentPage + 1);

    if (looksLikeNext || isNextNumber) {
      const href = $(el).attr("href");
      if (href) nextHref = href;
    }
  });

  return nextHref ? resolveUrl(nextHref, pageUrl) : null;
}

/** Map table header cells to field names using CONFIG.columnKeywords. */
function detectColumnMap($, $table) {
  const headerRow = $table.find("thead tr").first().length
    ? $table.find("thead tr").first()
    : $table.find("tr").first();

  const map = {};
  headerRow.find("th, td").each((i, el) => {
    const text = $(el).text().trim().toLowerCase();
    for (const [field, patterns] of Object.entries(CONFIG.columnKeywords)) {
      if (map[field] !== undefined) continue;
      if (patterns.some((re) => re.test(text))) {
        map[field] = i;
      }
    }
  });

  return map;
}

/** Extract drug rows from a letter's results page HTML. */
function extractMedications(html) {
  const $ = cheerio.load(html);
  const results = [];

  const tables = $("table");
  if (tables.length === 0) {
    warn(
      "No <table> found on this page. If the real markup uses a different " +
        "layout (e.g. list/card items instead of a table), extractMedications() " +
        "needs a matching branch — inspect the page and adjust.",
    );
    return results;
  }

  tables.each((_, table) => {
    const $table = $(table);
    const columnMap = detectColumnMap($, $table);

    if (columnMap.name === undefined) {
      warn(
        "Couldn't detect a 'name' column from header text in one of the " +
          "tables on this page — skipping it. Check CONFIG.columnKeywords " +
          "against the real header text.",
      );
      return;
    }

    const bodyRows = $table.find("tbody tr").length
      ? $table.find("tbody tr")
      : $table.find("tr").slice(1); // skip header row if no <tbody>

    bodyRows.each((_, row) => {
      const cells = $(row).find("td");
      if (cells.length === 0) return;

      const cellText = (index) =>
        index !== undefined ? $(cells[index]).text().trim() : undefined;

      const name = cellText(columnMap.name);
      if (!name) return;

      results.push({
        name,
        nameAr: cellText(columnMap.nameAr) || undefined,
        form: cellText(columnMap.form) || undefined,
        strength: cellText(columnMap.strength) || undefined,
        atcCode: cellText(columnMap.atcCode) || undefined,
      });
    });
  });

  return results;
}

async function scrapeLetter(letter, url, delayMs) {
  const medications = [];
  let currentUrl = url;
  let page = 1;

  while (currentUrl && page <= CONFIG.maxPagesPerLetter) {
    log(`Letter ${letter}, page ${page}: ${currentUrl}`);

    let html;
    try {
      html = await fetchHtml(currentUrl);
    } catch (err) {
      warn(`Failed to fetch ${currentUrl}: ${err.message}. Skipping rest of letter ${letter}.`);
      break;
    }

    const pageMedications = extractMedications(html);
    log(`  found ${pageMedications.length} row(s)`);
    medications.push(...pageMedications);

    const $ = cheerio.load(html);
    const nextUrl = findNextPageLink($, currentUrl, page);

    await sleep(delayMs);

    if (!nextUrl || nextUrl === currentUrl) break;
    currentUrl = nextUrl;
    page += 1;
  }

  return medications;
}

function dedupe(medications) {
  const seen = new Set();
  const result = [];
  for (const med of medications) {
    const key = `${med.name}|${med.form ?? ""}|${med.strength ?? ""}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(med);
  }
  return result;
}

async function main() {
  const args = parseArgs(process.argv);

  log(`Fetching landing page: ${CONFIG.baseUrl}`);
  const landingHtml = await fetchHtml(CONFIG.baseUrl);
  await sleep(args.delay);

  const $ = cheerio.load(landingHtml);
  const letterLinks = findLetterLinks($, CONFIG.baseUrl);

  if (letterLinks.size === 0) {
    warn(
      "No A–Z letter links were found on the landing page. The site's " +
        "alphabet nav likely isn't plain <a> tags with single-letter text " +
        "— inspect the page and update findLetterLinks(). Aborting.",
    );
    process.exitCode = 1;
    return;
  }

  log(`Found ${letterLinks.size} letter link(s): ${[...letterLinks.keys()].join(", ")}`);

  const lettersToScrape = args.letters
    ? [...letterLinks.entries()].filter(([letter]) => args.letters.includes(letter))
    : [...letterLinks.entries()];

  let allMedications = [];
  for (const [letter, url] of lettersToScrape) {
    const letterMedications = await scrapeLetter(letter, url, args.delay);
    allMedications.push(...letterMedications);
  }

  allMedications = dedupe(allMedications);
  log(`Total unique medications scraped: ${allMedications.length}`);

  if (args.dryRun) {
    log("--dry-run set, not writing output file.");
    return;
  }

  const output = {
    source: CONFIG.baseUrl,
    scrapedAt: new Date().toISOString(),
    count: allMedications.length,
    medications: allMedications,
  };

  await mkdir(dirname(CONFIG.outputPath), { recursive: true });
  await writeFile(CONFIG.outputPath, JSON.stringify(output, null, 2), "utf8");
  log(`Wrote ${allMedications.length} medications to ${CONFIG.outputPath}`);
}

main().catch((err) => {
  console.error("[scrape-medications] Fatal error:", err);
  process.exitCode = 1;
});
