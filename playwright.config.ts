import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

dotenv.config({ quiet: true });

export default defineConfig({
  testDir: "./e2e/tests",
  timeout: 120_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
  ],

  use: {
    baseURL: process.env.APP_BASE_URL!,
    actionTimeout: 30_000,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    contextOptions: {
      javaScriptEnabled: true,
    },
  },

  expect: {
    timeout: 30_000,
  },

  projects: [
    {
      name: "desktop-chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        defaultBrowserType: "chromium",
      },
    },
    {
      name: "tablet",
      use: {
        ...devices["iPad (gen 7)"],
        defaultBrowserType: "chromium",
      },
    },
  ],
});
