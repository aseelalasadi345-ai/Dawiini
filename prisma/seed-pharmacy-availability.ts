// Seeds a handful of PharmacyMedicationAvailability rows for local testing
// of GET /api/pharmacies/availability. Reuses existing seeded Pharmacy and
// MedicationCatalogEntry rows (run `npm run db:seed:pharmacies` and
// `npm run db:seed` first) rather than fabricating new parent rows.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// A few real MOPH catalog names likely to exist post-seed (see
// prisma/seed.ts) — matched loosely by substring, case-insensitive.
const MEDICATION_NAME_QUERIES = ["PANADOL", "AMOXICILLIN", "AUGMENTIN"];
const PHARMACY_COUNT = 3;
const LEVELS = ["plenty", "limited", "out_of_stock"] as const;

async function main() {
  const pharmacies = await prisma.pharmacy.findMany({
    take: PHARMACY_COUNT,
    orderBy: { name: "asc" },
  });
  if (pharmacies.length === 0) {
    console.log(
      "No Pharmacy rows found — run `npm run db:seed:pharmacies` first."
    );
    return;
  }

  const medications: { id: string; name: string }[] = [];
  for (const query of MEDICATION_NAME_QUERIES) {
    const match = await prisma.medicationCatalogEntry.findFirst({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
    });
    if (match) medications.push({ id: match.id, name: match.name });
  }
  if (medications.length === 0) {
    console.log(
      "No matching MedicationCatalogEntry rows found — run `npm run db:seed` first."
    );
    return;
  }

  console.log(
    `Seeding availability for ${pharmacies.length} pharmacies × ${medications.length} medications ` +
      `(${medications.map((m) => m.name).join(", ")}).`
  );

  let count = 0;
  for (const pharmacy of pharmacies) {
    for (const medication of medications) {
      const level = LEVELS[count % LEVELS.length];
      await prisma.pharmacyMedicationAvailability.upsert({
        where: {
          pharmacyId_catalogEntryId: {
            pharmacyId: pharmacy.id,
            catalogEntryId: medication.id,
          },
        },
        update: { level },
        create: { pharmacyId: pharmacy.id, catalogEntryId: medication.id, level },
      });
      console.log(
        `- ${pharmacy.name} × ${medication.name}: ${level} (medicationId=${medication.id})`
      );
      count += 1;
    }
  }

  console.log(`Done — upserted ${count} availability row(s).`);
}

main()
  .catch((err) => {
    console.error("Availability seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
