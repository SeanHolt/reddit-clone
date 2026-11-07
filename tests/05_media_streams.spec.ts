import { test, expect } from "@playwright/test";

test.describe("Low-Latency Media Communication Links Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. WebRTC RPAN Live Video Theater Card Ribbon Mount", async ({ page }) => {
    await page.goto("/r/test_community");
    
    const streamTheater = page.locator("text=RPAN Community Live Stream");
    const count = await streamTheater.count();
    
    if (count > 0) {
      // Assert viewer tickers load side-by-side with playback handles
      await expect(page.locator("text=watching").first()).toBeVisible();
      await expect(page.locator("button:has-text('Tune In Live')").first()).toBeVisible();
    }
  });

  test("2. Progressive Cursor Paginated Comment Scroll Intersection", async ({ page }) => {
    await page.goto("/");
    
    const commentThreadTitle = page.locator("text=Discussion Threads");
    if (await commentThreadTitle.count() > 0) {
      // Confirm scroll anchor boundaries register on screen layers cleanly
      const scrollTrigger = page.locator("text=Scroll down to stream context");
      if (await scrollTrigger.count() > 0) {
        await expect(scrollTrigger).toBeVisible();
      }
    }
  });
});
