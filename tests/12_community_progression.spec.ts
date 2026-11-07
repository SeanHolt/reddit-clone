import { test, expect } from "@playwright/test";

test.describe("Subreddit Localized Achievements & Progression Engine Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Moderator Progression Multipliers Dashboard Mount", async ({ page }) => {
    await page.goto("/settings/moderation");

    // Verify that the level multipliers widget displays correctly on moderator dashboards
    const levelHeader = page.locator("text=Subreddit Level multipliers");
    await expect(levelHeader).toBeVisible();
    await expect(page.locator("text=Spawn Thread Post")).toBeVisible();
  });
});
