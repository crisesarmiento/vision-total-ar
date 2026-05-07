import { test, expect } from "@playwright/test";

// A minimal valid layout URL-encoded for use in ?layout= param.
// preset=2x2, two known channel IDs (tn, c5n) plus two more (a24, lnmas).
const ENCODED_LAYOUT = encodeURIComponent(
  JSON.stringify({
    preset: "2x2",
    players: [
      { slotId: "slot-1", channelId: "tn", muted: true, volume: 50 },
      { slotId: "slot-2", channelId: "c5n", muted: true, volume: 50 },
      { slotId: "slot-3", channelId: "a24", muted: true, volume: 50 },
      { slotId: "slot-4", channelId: "lnmas", muted: true, volume: 50 },
    ],
  }),
);

test.describe("Dashboard layout deep links", () => {
  test("?layout= param loads the specified channels into the grid", async ({ page }) => {
    await page.goto(`/?layout=${ENCODED_LAYOUT}`);
    await expect(page.getByText("Dashboard multiview")).toBeVisible();

    // The preset row should show 2x2 as active
    await expect(page.getByRole("button", { name: "2 x 2" })).toBeVisible();

    // 4 iframes should render
    await page.waitForFunction(() => document.querySelectorAll("iframe").length >= 4, undefined, { timeout: 10_000 });
    await expect(page.locator("iframe")).toHaveCount(4);
  });

  test("invalid ?layout= param falls back to default dashboard", async ({ page }) => {
    await page.goto("/?layout=notvalidjson%7B%7B");
    await expect(page.getByText("Dashboard multiview")).toBeVisible();

    // Dashboard still renders — does not crash
    await expect(page.locator("body")).not.toContainText("Error");
  });
});

test.describe("Public combo page", () => {
  const comboSlug = process.env.E2E_COMBO_SLUG;

  test.skip(
    !comboSlug,
    "Skipped: set E2E_COMBO_SLUG to a valid public combination slug to run this test",
  );

  test("combo page renders channel iframes", async ({ page }) => {
    await page.goto(`/combo/${comboSlug}`);

    // At least one iframe should be visible
    await page.waitForFunction(() => document.querySelectorAll("iframe").length >= 1, undefined, { timeout: 10_000 });
    await expect(page.locator("iframe").first()).toBeVisible();
  });

  test("'Abrir en dashboard' navigates to dashboard with combo layout", async ({ page }) => {
    await page.goto(`/combo/${comboSlug}`);

    const openButton = page.getByRole("link", { name: "Abrir en dashboard" });
    await expect(openButton).toBeVisible();
    await openButton.click();

    await expect(page).toHaveURL(new RegExp(`[?&]combo=${comboSlug}`));
    await expect(page.getByText("Dashboard multiview")).toBeVisible();
  });
});
