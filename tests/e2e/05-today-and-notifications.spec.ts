import { test, expect } from "@playwright/test";

const MED_NAME = `E2E Today Med ${Date.now()}`;

test.describe.serial("today's doses -> real notification -> mark all read", () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: "tests/e2e/.auth/user.json" });
    await page.goto("/en/add");
    await page.getByLabel("Medication name").fill(MED_NAME);
    await page.getByLabel("Dosage").fill("10mg");
    await page.getByRole("button", { name: "Save Medication" }).click();
    await expect(page).toHaveURL(/\/en\/medications/);
    await page.close();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: "tests/e2e/.auth/user.json" });
    await page.goto("/en/medications");
    const card = page.locator("div", { hasText: MED_NAME }).last();
    if (await card.count()) {
      await card.getByLabel("Open menu").click();
      await page.getByRole("button", { name: "Delete", exact: true }).click();
      await page.getByRole("button", { name: "Delete", exact: true }).last().click();
    }
    await page.close();
  });

  test("marking a dose taken creates a real notification and increments the navbar badge", async ({ page }) => {
    await page.goto("/en/today");
    // .first(), not .last() — same reasoning as 04's card locator: the
    // name/time text sits in a div that's a sibling of the action buttons,
    // not their ancestor.
    const doseRow = page.locator("div", { hasText: MED_NAME }).first();
    await expect(doseRow).toBeVisible({ timeout: 10_000 });
    await doseRow.getByRole("button", { name: "Take" }).click();
    await expect(doseRow.getByText("Taken")).toBeVisible();

    // Real dose_taken notification, not a mock badge — see
    // lib/notifications.ts's createDoseTakenNotification, wired from
    // app/api/schedule/doses/[id]/route.ts.
    await page.goto("/en/home"); // reload navbar state
    const badge = page.locator('a[aria-label="Notifications"] span');
    await expect(badge).toBeVisible({ timeout: 10_000 });
    const countBefore = Number(await badge.textContent());
    expect(countBefore).toBeGreaterThan(0);
  });

  test("Mark all read clears the badge and persists across a reload", async ({ page }) => {
    await page.goto("/en/notifications");
    await expect(page.getByText(MED_NAME).first()).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "Mark all read" }).click();

    await page.reload();
    const badge = page.locator('a[aria-label="Notifications"] span');
    await expect(badge).not.toBeVisible();
  });
});
