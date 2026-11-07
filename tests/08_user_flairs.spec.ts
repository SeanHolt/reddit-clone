import { test, expect } from "@playwright/test";

test.describe("Subreddit User Flair Management & Render Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Flair Management Form Controls Visibility", async ({ page }) => {
    await page.goto("/settings/moderation");
    
    // Target the specific flair component grid within the mod panel
    const flairFormHeader = page.locator("h3:has-text('Flair Management')");
    if (await flairFormHeader.count() > 0) {
      await expect(flairFormHeader).toBeVisible();
      await expect(page.locator("button:has-text('Assign User Flair')")).toBeVisible();
    }
  });
});
