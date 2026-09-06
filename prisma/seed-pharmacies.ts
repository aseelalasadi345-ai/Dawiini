// Seeds Pharmacy + PharmacyHours from data/pharmacies-tripoli.json.
// Run via `npm run db:seed:pharmacies`. Separate from prisma/seed.ts (the
// medication catalog seed) and not wired into prisma7.config.ts's
// migrations.seed — run it standalone, on demand.
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

interface RawHours {
  days: string;
  hours: string;
}

interface RawPharmacy {
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  is24Hours: boolean;
  hours: RawHours[];
}

interface PharmaciesFile {
  source: string;
  pharmacies: RawPharmacy[];
}

const DATA_PATH = join(process.cwd(), "data", "pharmacies-tripoli.json");

// A standalone client for this one-shot script — see prisma/seed.ts for
// why this isn't lib/prisma.ts's dev-HMR-surviving singleton.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const raw = readFileSync(DATA_PATH, "utf-8");
  const file: PharmaciesFile = JSON.parse(raw);

  console.log(`Loaded ${file.pharmacies.length} pharmacies from ${DATA_PATH}.`);

  let created = 0;
  let skipped = 0;

  for (const p of file.pharmacies) {
    // Idempotency key: no unique constraint on the model for this (see
    // schema.prisma), so dedupe at the application level on name+address.
    const existing = await prisma.pharmacy.findFirst({
      where: { name: p.name, address: p.address },
      select: { id: true },
    });

    if (existing) {
      console.log(`Skipping "${p.name}" (${p.address}) — already exists.`);
      skipped += 1;
      continue;
    }

    // `phone` is required (non-null) on the model; one source entry (New
    // Jamal Pharmacy) has no phone number. Store "" rather than drop the
    // pharmacy or invent a number.
    if (!p.phone) {
      console.warn(
        `"${p.name}" has no phone number in the source data — storing "".`
      );
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: p.name,
        address: p.address,
        phone: p.phone ?? "",
        latitude: p.latitude,
        longitude: p.longitude,
        is24Hours: p.is24Hours,
        hours: {
          create: p.hours.map((h) => ({ days: h.days, hours: h.hours })),
        },
      },
    });

    console.log(
      `Created "${pharmacy.name}" with ${p.hours.length} hours row(s).`
    );
    created += 1;
  }

  console.log(
    `Done — created ${created}, skipped ${skipped} (of ${file.pharmacies.length} total).`
  );
}

main()
  .catch((err) => {
    console.error("Pharmacy seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
