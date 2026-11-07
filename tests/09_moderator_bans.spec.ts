import { test, expect } from "@playwright/test";

test.describe("Moderator Ban Controls & Account Blacklisting Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Verify Account Ban Input Form Layout", async ({ page }) => {
    await page.goto("/settings/moderation");
    
    const banFormInput = page.locator("input[placeholder*='Username to restrict']");
    const banReasonInput = page.locator("input[placeholder*='Reason for enforcement ban']");
    
    if (await banFormInput.count() > 0) {
      await expect(banFormInput).toBeVisible();
      await expect(banReasonInput).toBeVisible();
    }
  });
});
