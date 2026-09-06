import fs from "fs";

// Shared constants for the e2e suite. One throwaway account, created once by
// global.setup.ts and reused (via its saved storage state) by every other
// spec — matches this project's established pattern of never running tests
// against real user accounts. Clean up afterward with:
//   npx tsx scripts/_cleanup_e2e_user.mjs
//
// Persisted to disk rather than just `Date.now()` at module scope: Playwright
// re-evaluates this module per test rather than once per run (confirmed
// live — two tests in the same file logged two different generated emails),
// so a plain module-level constant silently produced a *different* email
// per test, and only the very first one (used by global.setup.ts) was ever
// actually signed up. Every other test then "logged in" with an
// email/password pair that was never registered. Persisting the first
// generated value and reading it back for the rest of the run fixes that.
const USER_FILE = "tests/e2e/.auth/test-user.json";

function loadOrCreateTestUser() {
  if (fs.existsSync(USER_FILE)) {
    return JSON.parse(fs.readFileSync(USER_FILE, "utf8"));
  }
  const user = {
    firstName: "Playwright",
    lastName: "Test",
    email: `csrawand+dawiinie2e${Date.now()}@gmail.com`,
    password: "TestPass123!",
  };
  fs.mkdirSync("tests/e2e/.auth", { recursive: true });
  fs.writeFileSync(USER_FILE, JSON.stringify(user));
  return user;
}

export const TEST_USER = loadOrCreateTestUser();
export const AUTH_FILE = "tests/e2e/.auth/user.json";
