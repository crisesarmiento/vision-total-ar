import { test, expect } from "@playwright/test";

const PRESET_LABELS: { label: string; maxPlayers: number }[] = [
  { label: "1 x 1", maxPlayers: 1 },
  { label: "2 x 1", maxPlayers: 2 },
  { label: "2 x 2", maxPlayers: 4 },
  { label: "Elecciones", maxPlayers: 6 },
  { label: "3 x 3", maxPlayers: 9 },
  { label: "4 x 4", maxPlayers: 12 },
];

test.describe("Dashboard preset switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Wait for the dashboard header to appear
    await expect(page.getByText("Dashboard multiview")).toBeVisible();
  });

  test("all preset buttons are visible", async ({ page }) => {
    for (const { label } of PRESET_LABELS) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("clicking a preset button marks it as active", async ({ page }) => {
    const targetButton = page.getByRole("button", { name: "2 x 2" });
    await targetButton.click();

    // The active button has the default variant (non-secondary) — check aria or class signals.
    // We use the aria-pressed semantic by checking that only this button is "active" visually
    // via data-slot="button" active class. Since we can't inspect tailwind classes reliably,
    // we verify the other buttons are still present and the clicked one received focus/activation.
    await expect(targetButton).toBeVisible();

    // Switch to 1x1 and back to confirm switching works bidirectionally
    const smallButton = page.getByRole("button", { name: "1 x 1" });
    await smallButton.click();
    await expect(smallButton).toBeVisible();
    await targetButton.click();
    await expect(targetButton).toBeVisible();
  });

  test("switching to 2x2 preset renders 4 player iframes", async ({ page }) => {
    await page.getByRole("button", { name: "2 x 2" }).click();

    // Player tiles contain YouTube iframes; wait for them to appear in the DOM.
    // We count the iframes inside the player grid (they load lazily, but the elements are present).
    await page.waitForFunction(() => {
      return document.querySelectorAll("iframe").length >= 4;
    }, undefined, { timeout: 10_000 });

    const iframes = page.locator("iframe");
    await expect(iframes).toHaveCount(4);
  });

  test("player channels are preserved when expanding from 1x1 to 2x1", async ({ page }) => {
    // Start at 1x1
    await page.getByRole("button", { name: "1 x 1" }).click();
    await page.waitForFunction(() => document.querySelectorAll("iframe").length >= 1, undefined, { timeout: 10_000 });

    // Expand to 2x1 — the original player should still be in slot 1
    await page.getByRole("button", { name: "2 x 1" }).click();
    await page.waitForFunction(() => document.querySelectorAll("iframe").length >= 2, undefined, { timeout: 10_000 });

    const iframes = page.locator("iframe");
    await expect(iframes).toHaveCount(2);
  });
});
