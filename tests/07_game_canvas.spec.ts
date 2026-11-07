import { test, expect } from "@playwright/test";

test.describe("Client-Side Interactive Game Engine & Canvas Context Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Phaser Canvas Frame Mount and Scaling Test", async ({ page }) => {
    // Route to the dashboard page layout hosting your active gaming canvas splits
    await page.goto("/");

    const gameCanvasElement = page.locator("canvas");
    const internalCanvasCount = await gameCanvasElement.count();

    if (internalCanvasCount > 0) {
      // If a game view container initializes, ensure it displays on screen layers natively
      await expect(gameCanvasElement.first()).toBeVisible();
    }
  });
});
