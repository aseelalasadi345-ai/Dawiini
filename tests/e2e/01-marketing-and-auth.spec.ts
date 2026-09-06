import { test, expect } from "@playwright/test";
import { TEST_USER } from "./fixtures";

// Unauthenticated flows — override the project's default signed-in storage
// state with a clean one.
test.use({ storageState: { cookies: [], origins: [] } });

// A dedicated account for this file's own repeated real logins — NOT
// TEST_USER, the account the shared storageState (tests/e2e/.auth/user.json,
// used by every other spec file) depends on. Confirmed live: this Supabase
// project invalidates a user's earlier session on every new sign-in for that
// same account, so this file logging in 3 more times for TEST_USER silently
// killed the session every other file relies on — every spec after this one
// failed with the app looking signed-out, even though nothing was actually
// wrong with the app. Verified by isolating: 02-home-and-search.spec.ts
// passes 100% of the time alone, and only broke when preceded by this file.
const LOGIN_TEST_USER = {
  firstName: "LoginTest",
  lastName: "User",
  email: `csrawand+dawiinie2elogin${Date.now()}@gmail.com`,
  password: "TestPass123!",
};

test.beforeAll(async ({ request }) => {
  await request.post("/api/auth/signup", { data: LOGIN_TEST_USER });
});

test.describe("marketing / landing page", () => {
  test("loads with hero and nav", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: /find your medication/i })).toBeVisible();
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign Up" })).toBeVisible();
  });
});

test.describe("login", () => {
  test("wrong password shows the generic error, never which field was wrong", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill(LOGIN_TEST_USER.email);
    await page.getByLabel("Password", { exact: true }).fill("WrongPassword1");
    await page.getByRole("button", { name: "Log in" }).click();
    // Not getByRole("alert") alone — Next.js's own route-announcer div
    // (id="__next-route-announcer__") also has role="alert" and is always
    // present, so that locator matches 2 elements.
    await expect(page.getByText("Incorrect email or password")).toBeVisible();
  });

  test("correct credentials logs in and reaches /home", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill(LOGIN_TEST_USER.email);
    await page.getByLabel("Password", { exact: true }).fill(LOGIN_TEST_USER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/en\/home/);
    // Real signed-in navbar — avatar initial derived from the real first name.
    await expect(page.getByRole("link", { name: "Profile" })).toBeVisible();
  });

  test("logout returns to a signed-out state", async ({ page }) => {
    await page.goto("/en/login");
    await page.getByLabel("Email").fill(LOGIN_TEST_USER.email);
    await page.getByLabel("Password", { exact: true }).fill(LOGIN_TEST_USER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/en\/home/);

    await page.goto("/en/settings");
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/en\/login/, { timeout: 10_000 });
  });
});

test.describe("forgot / reset password", () => {
  test("request always shows the same non-enumerating success message", async ({ page }) => {
    // Safe to use the shared TEST_USER's email here — requesting a reset
    // email doesn't create or touch a session, unlike the login tests above.
    await page.goto("/en/forgot-password");
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();

    // Same message for an email that was never registered — this is the
    // whole point of the non-enumeration design (see
    // app/api/auth/forgot-password/route.ts).
    await page.goto("/en/forgot-password");
    await page.getByLabel("Email").fill("definitely-not-registered-xyz@example.com");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  });

  test("an invalid/expired link shows a real error state, not a broken form", async ({ page }) => {
    // Simulates app/api/auth/confirm's own redirect on a bad/expired code —
    // this is the one part of the flow a script can trigger without a real
    // inbox (see the completion report for what still needs a human).
    await page.goto("/en/reset-password?error=invalid");
    await expect(page.getByRole("heading", { name: "This link is invalid or has expired" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Request a new link" })).toBeVisible();
  });
});
