import { test, expect } from "@playwright/test";

test("a non-admin user gets a real 404 on the admin page, not a redirect that confirms it exists", async ({ page }) => {
  // Our test user is a plain "user" role (admin is only ever granted
  // out-of-band via scripts/set-admin-role.mjs — see prisma/schema.prisma's
  // Role enum comment) — matches app/[locale]/(admin)/pharmacy/page.tsx's
  // own isAdmin() guard.
  const response = await page.goto("/en/pharmacy");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "Add Pharmacy" })).not.toBeVisible();
});
