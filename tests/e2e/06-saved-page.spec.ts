import { test, expect } from "@playwright/test";

const SEEDED_MED = "SODIUM CHLORIDE";

test("a saved medication shows on the real Saved page and unsave removes it", async ({ page }) => {
  await page.goto("/en/search");
  await page.getByRole("combobox").fill(SEEDED_MED);
  const option = page.getByRole("option").first();
  await expect(option).toBeVisible({ timeout: 10_000 });
  await option.click();
  await expect(page).toHaveURL(/\/en\/medications\/[a-z0-9]+/);

  const saveButton = page.getByRole("button", { name: "Save" });
  // Idempotent: only click if not already saved from an earlier spec run.
  if (await saveButton.isVisible().catch(() => false)) {
    // Wait for the real mutation to land before navigating away — the
    // button flips optimistically, so navigating immediately can race
    // ahead of the actual POST (see 03's identical fix).
    const saveResponse = page.waitForResponse((r) => r.url().includes("/api/saved-medications") && r.request().method() === "POST");
    await saveButton.click();
    await saveResponse;
  }

  await page.goto("/en/saved");
  await expect(page.getByText(/sodium chloride/i).first()).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Remove from saved" }).first().click();
  await expect(page.getByText("No saved medications yet.")).toBeVisible({ timeout: 10_000 });
});
