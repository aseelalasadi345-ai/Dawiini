import { test, expect } from "@playwright/test";

const SEEDED_MED = "SODIUM CHLORIDE";

async function openFirstSearchResult(page: import("@playwright/test").Page) {
  await page.goto("/en/search");
  await page.getByRole("combobox").fill(SEEDED_MED);
  const option = page.getByRole("option").first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
  await expect(page).toHaveURL(/\/en\/medications\/[a-z0-9]+/);
}

test.describe("medication detail page", () => {
  test("shows the honest 'no availability info' empty state, never a fabricated pharmacy list", async ({ page }) => {
    await openFirstSearchResult(page);
    await expect(page.getByRole("heading", { name: "Nearby pharmacies" })).toBeVisible();
    // This medication has zero real PharmacyMedicationAvailability rows (by
    // design — see that model's schema comment), so this must be the honest
    // empty state, not a generic pharmacy listing.
    await expect(page.getByText("No availability info right now")).toBeVisible();
  });

  test("save toggles the heart and the state survives a reload", async ({ page }) => {
    await openFirstSearchResult(page);
    const saveButton = page.getByRole("button", { name: "Save" });
    await expect(saveButton).toBeVisible();
    // SaveMedicationButton flips the heart optimistically before the
    // mutation resolves — wait for the real POST to actually land before
    // reloading, or the reload can race ahead of it and read the
    // pre-save state back from the server.
    const saveResponse = page.waitForResponse((r) => r.url().includes("/api/saved-medications") && r.request().method() === "POST");
    await saveButton.click();
    await saveResponse;

    const unsaveButton = page.getByRole("button", { name: "Remove from saved" });
    await expect(unsaveButton).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "Remove from saved" })).toBeVisible();

    // Clean up the save so later specs (saved-page) control their own state.
    await page.getByRole("button", { name: "Remove from saved" }).click();
    await expect(page.getByRole("button", { name: "Save" })).toBeVisible();
  });
});
