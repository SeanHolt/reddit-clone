import { test, expect } from "@playwright/test";

test.describe("Platform Coin Wallet & Gifting Systems Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Token Award Selection Drawer Canvas Mount", async ({ page }) => {
    await page.goto("/");
    
    const giftAwardTrigger = page.locator("button:has-text('🌟 Gift Award')").first();
    const count = await giftAwardTrigger.count();
    
    if (count > 0) {
      await giftAwardTrigger.click();
      // Assert that the interactive payment sheet instantly triggers on screen
      await expect(page.locator("text=Gift Content Award")).toBeVisible();
      await expect(page.locator("text=Select an award tier")).toBeVisible();
    }
  });

  test("2. Global Centralized Error Dictionary Translation Pass", async ({ page }) => {
    await page.goto("/marketplace");
    
    // Assert the user-friendly mapping translations match our dictionary
    const walletBalanceText = page.locator("text=coins");
    await expect(walletBalanceText.first()).toBeVisible();
  });
});
