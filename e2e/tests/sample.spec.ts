import { test } from "@playwright/test";
import { init } from "@e2e/support/core/driver";
import { scanPageWithOobee } from "@e2e/support/core/oobeeDriver";

test.describe("Sample Oobee test", () => {
  test.beforeEach(async ({ page }) => {
    await init(page);
  });

  test("should scan for accessibility", async ({}, testInfo) => {
    // init() already navigates to the home page
    // so we can directly do the scan
    await scanPageWithOobee(testInfo);
  });
});
