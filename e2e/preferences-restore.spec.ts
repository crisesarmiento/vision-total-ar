import path from "path";
import { test, expect } from "@playwright/test";

/**
 * Preferences-restore tests require an authenticated session.
 *
 * To run these tests, provide a Playwright storageState JSON file that
 * contains valid session cookies for a test user:
 *
 *   E2E_AUTH_STORAGE_STATE=./e2e/fixtures/auth.json npm run test:e2e
 *
 * Generate the fixture once with:
 *   npx playwright codegen http://localhost:3000/ingresar --save-storage=e2e/fixtures/auth.json
 *
 * The fixture file is git-ignored (see e2e/.gitignore).
 */
const authStoragePath = process.env.E2E_AUTH_STORAGE_STATE
  ? path.resolve(process.env.E2E_AUTH_STORAGE_STATE)
  : null;

const authTest = test.extend<object>({});

authTest.use({
  storageState: authStoragePath ?? ({ cookies: [], origins: [] }),
});

authTest.describe("Authenticated layout preference restore", () => {
  authTest.skip(
    !authStoragePath,
    "Skipped: set E2E_AUTH_STORAGE_STATE=./e2e/fixtures/auth.json to run these tests",
  );

  authTest.describe.configure({ mode: "serial" });

  authTest("switching preset is persisted and restored after reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dashboard multiview")).toBeVisible();

    // Pick a non-default preset to change saved state
    const targetPreset = page.getByRole("button", { name: "3 x 3" });
    await targetPreset.click();

    // Wait for the debounced autosave to fire (~1.5s) plus network round trip
    await page.waitForTimeout(3_000);

    // Reload the page to let the server load the saved preference
    await page.reload();
    await expect(page.getByText("Dashboard multiview")).toBeVisible();

    // Verify 9 iframes are rendered, confirming 3x3 was restored
    await page.waitForFunction(() => document.querySelectorAll("iframe").length >= 9, undefined, { timeout: 10_000 });
    await expect(page.locator("iframe")).toHaveCount(9);
  });

  authTest("restored layout contains the same channels after reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Dashboard multiview")).toBeVisible();

    // Switch to 2x1 and wait for autosave
    await page.getByRole("button", { name: "2 x 1" }).click();
    await page.waitForTimeout(3_000);

    await page.reload();
    await expect(page.getByText("Dashboard multiview")).toBeVisible();

    await page.waitForFunction(() => document.querySelectorAll("iframe").length >= 2, undefined, { timeout: 10_000 });
    await expect(page.locator("iframe")).toHaveCount(2);
  });
});
