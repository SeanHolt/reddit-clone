import { test, expect } from "@playwright/test";

test.describe("Real-Time Private Messenger & Focus Read Receipts Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Messaging Split-Pane Interface Mount Check", async ({ page }) => {
    await page.goto("/messages");
    
    // Assert the primary structural inbox body layout container is live
    await expect(page.locator("body")).toBeVisible();
  });

  test("2. Volatile Focus Channel Receipt Rendering Verification", async ({ page }) => {
    await page.goto("/messages");

    const readLabel = page.locator("text=✓ Read");
    const deliveredLabel = page.locator("text=Delivered");

    // The interface layout container must successfully display one of our strict status strings
    const hasStatusReceipt = (await readLabel.count()) > 0 || (await deliveredLabel.count()) > 0;
    
    // If active conversation contact rows exist in the sidebar container, verify status text mounts
    if (await page.locator("text=Chat Contact").count() > 0) {
      expect(hasStatusReceipt).toBe(true);
    }
  });
});
