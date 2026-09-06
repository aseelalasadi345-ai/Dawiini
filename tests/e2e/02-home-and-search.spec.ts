import { test, expect } from "@playwright/test";

// A real seeded MOPH catalog entry (data/medications.json / prisma/seed.ts)
// — guaranteed to exist regardless of what other specs add/remove, so
// search always has a real result to select.
const SEEDED_MED = "SODIUM CHLORIDE";

test.describe("home page", () => {
  test("loads signed in with the real navbar and quick actions", async ({ page }) => {
    await page.goto("/en/home");
    await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
    await expect(page.getByText("Scan Prescription")).toBeVisible();
    await expect(page.getByText("Find Pharmacies")).toBeVisible();
    await expect(page.getByText("Today's Doses")).toBeVisible();
  });
});

test.describe("search", () => {
  test("autocomplete finds a real seeded medication and selecting it opens the real detail page", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("combobox").fill(SEEDED_MED);
    const option = page.getByRole("option").first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();

    // Real id-based route, not a mock array index.
    await expect(page).toHaveURL(/\/en\/medications\/[a-z0-9]+/);
    // Not getByRole("heading", { level: 1 }) alone — this page is nested
    // under the (my-medication) route group, whose layout always renders
    // its own "My Medications" h1 (see the completion report: a public
    // catalog page inheriting "my medications" management chrome looks like
    // an unintended side effect of that route grouping, flagged there).
    await expect(page.getByRole("heading", { name: /sodium chloride/i })).toBeVisible();
  });

  test("an unmatched query shows the honest 'no results' state, not a silent empty box", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("combobox").fill("zzzznonexistentmedicationxyz");
    await expect(page.getByText("No medications found")).toBeVisible({ timeout: 10_000 });
  });

  test("a selected search is recorded and appears as a Recent Search on both Search and Home", async ({ page }) => {
    await page.goto("/en/search");
    await page.getByRole("combobox").fill(SEEDED_MED);
    const option = page.getByRole("option").first();
    await expect(option).toBeVisible({ timeout: 10_000 });
    await option.click();
    await expect(page).toHaveURL(/\/en\/medications\/[a-z0-9]+/);

    await page.goto("/en/search");
    await expect(page.getByText("Recent Searches")).toBeVisible();
    await expect(page.getByText(/sodium chloride/i).first()).toBeVisible();

    await page.goto("/en/home");
    await expect(page.getByText("Recent Searches")).toBeVisible();
    await expect(page.getByText(/sodium chloride/i).first()).toBeVisible();
  });
});
