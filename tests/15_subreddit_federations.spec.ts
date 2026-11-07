import { test, expect } from "@playwright/test";

test.describe("Subreddit Federations & Shared Timeline Alliance Node Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Verify Federation Alliance Management Dashboard Node Mounts", async ({ page }) => {
    await page.goto("/settings/moderation");

    // Verify that the federation alignment interface displays correctly inside mod dashboards
    const fedHeader = page.locator("text=Subreddit Federations Alliance Node");
    await expect(fedHeader).toBeVisible();
    await expect(page.locator("input[placeholder*='Federation network name']")).toBeVisible();
  });
});
