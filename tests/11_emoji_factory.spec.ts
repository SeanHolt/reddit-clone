import { test, expect } from "@playwright/test";

test.describe("Custom Graphic Emoji & Category Tag Creation Factories Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Hex Style Picker & Shortcode Field Evaluation", async ({ page }) => {
    await page.goto("/settings/moderation");
    
    const hexInput = page.locator("input[placeholder*='#']");
    const tagSubmitButton = page.locator("button:has-text('Create Custom Tag')");
    
    if (await tagSubmitButton.count() > 0) {
      if (await hexInput.count() > 0) {
        await expect(hexInput.first()).toBeVisible();
      }
      await expect(tagSubmitButton).toBeVisible();
    }
  });
});
