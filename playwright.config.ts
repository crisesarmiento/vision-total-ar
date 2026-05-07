import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
const healthURL = `${baseURL}/api/health`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    // In CI we run against a pre-built production server (started by the CI job before
    // invoking playwright). Locally, reuse the already-running dev server when available.
    command: process.env.CI ? "npm run start" : "npm run dev",
    // Use the dedicated health endpoint so a failing homepage never blocks the suite.
    url: healthURL,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 30_000 : 120_000,
  },
});
