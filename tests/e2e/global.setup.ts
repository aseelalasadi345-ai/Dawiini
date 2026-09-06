import { test as setup, expect } from "@playwright/test";
import { TEST_USER, AUTH_FILE } from "./fixtures";

// Signs up one real throwaway account through the actual signup UI (real
// Supabase Auth + real Prisma User row, exactly like a real user), then
// saves the resulting session so every other spec starts already signed in
// instead of re-running signup per file. The account is cleaned up by
// scripts/_cleanup_e2e_user.mts after the full suite runs (see the test
// report for how to invoke it).
setup("sign up test account and save session", async ({ page }) => {
  await page.goto("/en/signup");

  await page.getByLabel("First name").fill(TEST_USER.firstName);
  await page.getByLabel("Last name").fill(TEST_USER.lastName);
  await page.getByLabel("Email").fill(TEST_USER.email);
  await page.getByLabel("Password", { exact: true }).fill(TEST_USER.password);
  await page.getByLabel("Confirm password").fill(TEST_USER.password);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Create account" }).click();

  // This Supabase project auto-confirms on signup (verified earlier this
  // session — needsEmailConfirmation was false), so signup lands on
  // /onboarding?step=1 (see signup/page.tsx), never a "check your email"
  // screen. If that ever changes, this assertion fails loudly instead of
  // silently continuing with no session.
  await expect(page).toHaveURL(/\/en\/onboarding/, { timeout: 15_000 });

  // Skip all 3 onboarding steps — onboarding itself is covered by its own
  // spec; this setup just needs a clean landing on /home. Each step is a
  // client-side transition (router.push/replace, no full reload), so wait
  // for the URL to actually advance before clicking the next "Skip" —
  // firing all 3 clicks back-to-back raced ahead of the transitions.
  for (const step of [2, 3]) {
    await page.getByRole("button", { name: "Skip this step" }).click();
    await expect(page).toHaveURL(new RegExp(`step=${step}`), { timeout: 10_000 });
  }
  await page.getByRole("button", { name: "Skip this step" }).click();
  await expect(page).toHaveURL(/\/en\/home/, { timeout: 15_000 });

  await page.context().storageState({ path: AUTH_FILE });
});
