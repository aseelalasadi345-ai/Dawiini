// Seeds MedicationCatalogEntry from the MOPH scrape at data/medications.json.
// Run via `npm run db:seed` (or `prisma db seed` / automatically after
// `prisma migrate dev|reset`, wired through prisma7.config.ts).
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

interface RawMedication {
  name: string;
  nameAr?: string;
  form: string;
  strength: string;
  atcCode?: string;
  bg?: string;
  ingredients?: string;
  price?: string;
  sourceUrl?: string;
}

interface MedicationsFile {
  source: string;
  scrapedAt: string;
  count: number;
  medications: RawMedication[];
}

const CHUNK_SIZE = 500;
const DATA_PATH = join(process.cwd(), "data", "medications.json");

// A standalone client for this one-shot script — deliberately not
// lib/prisma.ts's singleton, which exists to survive Next.js dev-server
// hot-reloads and isn't meant to be $disconnect()-ed.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// The scrape uses "" for a missing field; store null instead so it's
// consistent with the curated fields (genericName, brand, ...), which are
// nullable and null until backfilled — see schema.prisma's comment on
// MedicationCatalogEntry.
function nullIfEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const file: MedicationsFile = JSON.parse(raw);

  console.log(
    `Loaded ${file.medications.length} medications from ${DATA_PATH} ` +
      `(scraped ${file.scrapedAt}).`
  );

  // `id` is an auto-generated cuid and this model has no other unique key
  // (see schema.prisma), so skipDuplicates below has nothing to dedupe
  // against on a second run — it would just insert everything again. Guard
  // against that by refusing to seed on top of existing rows unless asked.
  const existing = await prisma.medicationCatalogEntry.count();
  if (existing > 0) {
    const force =
      process.argv.includes("--force") || process.env.SEED_FORCE === "1";
    if (!force) {
      console.log(
        `MedicationCatalogEntry already has ${existing} row(s). Re-seeding would ` +
          `add ${file.medications.length} more on top rather than replace them, since ` +
          `there's no natural unique key to skip-duplicate against. Re-run with ` +
          `--force (or SEED_FORCE=1) if that's really what you want.`
      );
      return;
    }
    console.log(`--force set: seeding on top of ${existing} existing row(s).`);
  }

  const rows = file.medications
    .filter((m) => {
      const valid = Boolean(
        m.name?.trim() && m.form?.trim() && m.strength?.trim()
      );
      if (!valid) {
        console.warn(
          `Skipping entry missing a required field (name/form/strength): ${JSON.stringify(m)}`
        );
      }
      return valid;
    })
    .map((m) => ({
      name: m.name.trim(),
      nameAr: nullIfEmpty(m.nameAr),
      form: m.form.trim(),
      strength: m.strength.trim(),
      atcCode: nullIfEmpty(m.atcCode),
      bg: nullIfEmpty(m.bg),
      ingredients: nullIfEmpty(m.ingredients),
      price: nullIfEmpty(m.price),
      sourceUrl: nullIfEmpty(m.sourceUrl),
    }));

  const batches = chunk(rows, CHUNK_SIZE);
  let inserted = 0;

  for (const [i, batch] of batches.entries()) {
    const result = await prisma.medicationCatalogEntry.createMany({
      data: batch,
      skipDuplicates: true,
    });
    inserted += result.count;
    console.log(
      `Batch ${i + 1}/${batches.length}: inserted ${result.count} ` +
        `(total ${inserted}/${rows.length}).`
    );
  }

  console.log(`Done — inserted ${inserted} of ${rows.length} valid entries.`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
