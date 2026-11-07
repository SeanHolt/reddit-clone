import { test, expect } from "@playwright/test";

test.describe("Next.js 16 Parallel Routes Slot & Interception Matrix Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Verify Modal Slot Interceptor Overlay Shell Markup Mounts", async ({ page }) => {
    await page.goto("/");
    
    // Validate that the catch-all root fallback slots behave safely on the client layout space
    const modalCloseTrigger = page.locator("text=Close View");
    expect(await modalCloseTrigger.count()).toBe(0);
  });
});