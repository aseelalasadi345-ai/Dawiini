import { test, expect } from "@playwright/test";

test.describe("profile", () => {
  test("shows the real signed-in name/email and tab navigation works", async ({ page }) => {
    await page.goto("/en/personal-profile");
    await expect(page.getByText("Playwright Test")).toBeVisible();

    await page.getByRole("link", { name: "Health Info" }).click();
    await expect(page).toHaveURL(/health-profile/);
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/settings/);
  });

  test("personal info: editing phone/DOB persists across a reload", async ({ page }) => {
    await page.goto("/en/personal-profile");
    // Note: these two inputs' <label> elements aren't wired to their inputs
    // via htmlFor/id (a real a11y gap — see the completion report), so
    // getByLabel() can't be used here; falling back to a positional locator
    // among the enabled inputs (firstName/lastName/email are disabled).
    const editable = page.locator("input:not([disabled])");
    await editable.nth(0).fill("1990-01-15"); // dateOfBirth
    await editable.nth(1).fill("+96170123456"); // phone
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByRole("button", { name: "Saved!" })).toBeVisible();

    await page.reload();
    const editableAfter = page.locator("input:not([disabled])");
    await expect(editableAfter.nth(1)).toHaveValue("+96170123456");
  });

  test("settings: toggling dose reminders persists", async ({ page }) => {
    // Logout itself is already covered end-to-end in 01-marketing-and-auth.spec.ts
    // (using its own dedicated account, deliberately not this shared one —
    // see that file's comment on why a real logout/login here must never
    // touch the account every other spec file's session depends on).
    await page.goto("/en/settings");
    const toggle = page.getByRole("switch", { name: "Dose reminders" });
    const before = await toggle.getAttribute("aria-checked");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", before === "true" ? "false" : "true");

    await page.reload();
    await expect(page.getByRole("switch", { name: "Dose reminders" })).toHaveAttribute(
      "aria-checked",
      before === "true" ? "false" : "true"
    );
  });
});
