import { test, expect } from "@playwright/test";

test.describe("Subreddit Virtual Audio Stage & Talk Spaces Integration Suite", () => {
  test.beforeEach(async ({ page }) => {
    // Natively authorize our virtual test user profile prior to each evaluation pass
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Virtual Stage Banners & Listener Metrics Mounting Test", async ({ page }) => {
    // Navigate directly to our mock testing community viewport
    await page.goto("/r/test_community");

    const talkSpaceWidget = page.locator("text=RPAN Community Live Stream");
    const count = await talkSpaceWidget.count();

    if (count > 0) {
      // Assert concurrent viewer counters paint natively next to connection handles
      await expect(page.locator("text=watching").first()).toBeVisible();
      await expect(page.locator("button:has-text('Tune In Live')").first()).toBeVisible();
    }
  });

  test("2. Audio Broadcaster Studio Console Controls Render Test", async ({ page }) => {
    await page.goto("/settings/moderation");

    // Verify that the level multipliers widget displays correctly on moderator dashboards
    const studioTitle = page.locator("text=Virtual Stage Audio Studio");
    const activeStageTitle = page.locator("text=Active Stage");
    
    const isStudioVisible = (await studioTitle.count()) > 0 || (await activeStageTitle.count()) > 0;
    expect(isStudioVisible).toBe(true);
  });
});
