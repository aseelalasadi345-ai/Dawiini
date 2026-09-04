-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('once_daily', 'twice_daily', 'three_times_daily', 'as_needed', 'weekly');

-- CreateEnum
CREATE TYPE "DoseStatus" AS ENUM ('pending', 'taken', 'skipped');

-- CreateEnum
CREATE TYPE "PharmacyAvailabilityLevel" AS ENUM ('plenty', 'limited', 'out_of_stock');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dose" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "times" TEXT[],
    "startDate" DATE NOT NULL,
    "endDate" DATE,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dose" (
    "id" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "status" "DoseStatus" NOT NULL DEFAULT 'pending',
    "takenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dose_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationCatalogEntry" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameAr" TEXT,
    "form" TEXT NOT NULL,
    "strength" TEXT NOT NULL,
    "atcCode" TEXT,
    "bg" TEXT,
    "ingredients" TEXT,
    "price" TEXT,
    "sourceUrl" TEXT,
    "genericName" TEXT,
    "brand" TEXT,
    "useCase" TEXT,
    "categories" TEXT[],
    "description" TEXT,
    "disclaimer" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationCatalogEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedMedication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "catalogEntryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pharmacy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "is24Hours" BOOLEAN NOT NULL DEFAULT false,
    "opensAt" TEXT,
    "openUntil" TEXT,
    "mapUrl" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pharmacy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyHours" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "days" TEXT NOT NULL,
    "hours" TEXT NOT NULL,

    CONSTRAINT "PharmacyHours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PharmacyMedicationAvailability" (
    "id" TEXT NOT NULL,
    "pharmacyId" TEXT NOT NULL,
    "catalogEntryId" TEXT NOT NULL,
    "level" "PharmacyAvailabilityLevel" NOT NULL DEFAULT 'out_of_stock',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PharmacyMedicationAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Dose_medicationId_date_time_key" ON "Dose"("medicationId", "date", "time");

-- CreateIndex
CREATE INDEX "MedicationCatalogEntry_name_idx" ON "MedicationCatalogEntry"("name");

-- CreateIndex
CREATE INDEX "MedicationCatalogEntry_atcCode_idx" ON "MedicationCatalogEntry"("atcCode");

-- CreateIndex
CREATE UNIQUE INDEX "SavedMedication_userId_catalogEntryId_key" ON "SavedMedication"("userId", "catalogEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "PharmacyMedicationAvailability_pharmacyId_catalogEntryId_key" ON "PharmacyMedicationAvailability"("pharmacyId", "catalogEntryId");

-- AddForeignKey
ALTER TABLE "Medication" ADD CONSTRAINT "Medication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dose" ADD CONSTRAINT "Dose_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMedication" ADD CONSTRAINT "SavedMedication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedMedication" ADD CONSTRAINT "SavedMedication_catalogEntryId_fkey" FOREIGN KEY ("catalogEntryId") REFERENCES "MedicationCatalogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyHours" ADD CONSTRAINT "PharmacyHours_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyMedicationAvailability" ADD CONSTRAINT "PharmacyMedicationAvailability_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "Pharmacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PharmacyMedicationAvailability" ADD CONSTRAINT "PharmacyMedicationAvailability_catalogEntryId_fkey" FOREIGN KEY ("catalogEntryId") REFERENCES "MedicationCatalogEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
