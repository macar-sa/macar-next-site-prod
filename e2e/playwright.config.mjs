// Behaviour suite of the site: npm run build, then npm run test:e2e.
// The config starts the production build on port 3100 (or reuses one already running locally).
import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.spec.mjs",
  timeout: 60000,
  expect: { timeout: 5000 },
  fullyParallel: false,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never", outputFolder: "../playwright-report" }]] : [["list"]],
  outputDir: "../test-results",
  use: {
    baseURL: process.env.BASE_URL || `http://localhost:${PORT}`,
    browserName: "chromium",
    deviceScaleFactor: 1,
    locale: "fr-BE",
    timezoneId: "Europe/Brussels",
    trace: "retain-on-failure",
  },
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npx next start -p ${PORT}`,
        cwd: "..",
        url: `http://localhost:${PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
