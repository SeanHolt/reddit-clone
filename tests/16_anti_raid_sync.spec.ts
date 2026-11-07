import { test, expect } from "@playwright/test";

test.describe("Shared Network Blacklist Sync & Shield Matrix Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Verify Anti-Raid Shield Network Sync Indicator Paints Natively", async ({ page }) => {
    await page.goto("/settings/moderation");

    // Assert that the automated coalition sync indicator card has mounted successfully
    const syncCardHeader = page.locator("text=Shared Anti-Raid Blacklist Sync Active");
    await expect(syncCardHeader).toBeVisible();
  });
});
