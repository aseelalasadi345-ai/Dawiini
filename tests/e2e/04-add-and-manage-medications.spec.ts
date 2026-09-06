import { test, expect } from "@playwright/test";

const MED_NAME = `E2E Test Med ${Date.now()}`;

test.describe.serial("add / edit / delete a real medication", () => {
  test("add a medication via the real form", async ({ page }) => {
    await page.goto("/en/add");
    await page.getByLabel("Medication name").fill(MED_NAME);
    await page.getByLabel("Dosage").fill("500mg");
    // Frequency defaults to "Once daily" with one pre-filled time, and
    // startDate defaults to today — only name/dosage need filling in.
    await page.getByRole("button", { name: "Save Medication" }).click();

    await expect(page).toHaveURL(/\/en\/medications/);
    await expect(page.getByText(MED_NAME)).toBeVisible();
  });

  test("edit modal opens and shows the real medication's data", async ({ page }) => {
    await page.goto("/en/medications");
    // .first(), not .last(): the card's own text (name/dose/frequency) sits
    // in an inner div that is a *sibling* of MedicationCardMenu, not an
    // ancestor of it — .last() picked that inner text-only div, whose
    // subtree never contains "Open menu" at all, hence the earlier timeout.
    // The outermost card div (first in document order) contains both.
    const card = page.locator("div", { hasText: MED_NAME }).first();
    await card.getByLabel("Open menu").click();
    await page.getByRole("button", { name: "Edit" }).click();

    const modalNameInput = page.getByLabel("Medication name");
    await expect(modalNameInput).toHaveValue(MED_NAME);
    // Close without saving — this modal's persistence isn't this suite's
    // concern, just that it opens pre-filled with the real record.
    await page.getByLabel("Close").click();
  });

  test("find in pharmacy navigates to the real pharmacies list", async ({ page }) => {
    await page.goto("/en/medications");
    // .first(), not .last(): the card's own text (name/dose/frequency) sits
    // in an inner div that is a *sibling* of MedicationCardMenu, not an
    // ancestor of it — .last() picked that inner text-only div, whose
    // subtree never contains "Open menu" at all, hence the earlier timeout.
    // The outermost card div (first in document order) contains both.
    const card = page.locator("div", { hasText: MED_NAME }).first();
    await card.getByLabel("Open menu").click();
    await page.getByRole("button", { name: "Find in Pharmacy" }).click();
    await expect(page).toHaveURL(/\/en\/pharmacies/);
  });

  test("delete removes it for real, with a real confirm dialog", async ({ page }) => {
    await page.goto("/en/medications");
    // .first(), not .last(): the card's own text (name/dose/frequency) sits
    // in an inner div that is a *sibling* of MedicationCardMenu, not an
    // ancestor of it — .last() picked that inner text-only div, whose
    // subtree never contains "Open menu" at all, hence the earlier timeout.
    // The outermost card div (first in document order) contains both.
    const card = page.locator("div", { hasText: MED_NAME }).first();
    await card.getByLabel("Open menu").click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();

    await expect(page.getByRole("heading", { name: "Delete medication?" })).toBeVisible();
    // Wait for the real DELETE to land before asserting — clicking confirm
    // doesn't instantly unmount the dialog, so asserting immediately can
    // still see the dialog's own "This will remove {name}…" body text,
    // which also (ambiguously) contains MED_NAME.
    const deleteResponse = page.waitForResponse((r) => /\/api\/medications\//.test(r.url()) && r.request().method() === "DELETE");
    await page.getByRole("button", { name: "Delete", exact: true }).last().click();
    await deleteResponse;

    // Substring match (real text is "{MED_NAME} 500mg") — the dialog itself
    // has already unmounted by now (onSuccess: () => setDeletingId(null)),
    // so this no longer ambiguously also matches its body text.
    await expect(page.getByText(MED_NAME)).not.toBeVisible();
    await page.reload();
    await expect(page.getByText(MED_NAME)).not.toBeVisible();
  });
});
