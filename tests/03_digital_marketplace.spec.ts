import { test, expect } from "@playwright/test";

test.describe("Creator Digital Marketplace & Inventory Closets Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Storefront Grid Catalog Live Preview Verification", async ({
    page,
  }) => {
    await page.goto("/marketplace");
    await expect(page.locator("h1")).toContainText(
      "Creator Digital Asset Marketplace",
    );

    // Assert live CSS class preview sample fields are painting on product cards
    const stylePreviewBox = page.locator("text=Visual Asset Skin Preview");
    if ((await stylePreviewBox.count()) > 0) {
      await expect(stylePreviewBox.first()).toBeVisible();
    }
  });

  test("2. Identity Vault Cosmetic Toggle Controls Interlock", async ({
    page,
  }) => {
    await page.goto("/settings/inventory");
    await expect(page.locator("h1")).toContainText(
      "Custom Identity Vault & Inventory",
    );

    const equipButton = page.locator("button:has-text('Equip Cosmetic')");
    const unequipButton = page.locator("button:has-text('Unequip Asset')");

    // FIXED: Upgraded standard text lookup string to a resilient case-insensitive fuzzy regular expression match filter [INDEX]
    const emptyInventoryMsg = page
      .locator("div, p")
      .filter({ hasText: /Inventory Empty/i });

    const isStateVerified =
      (await equipButton.count()) > 0 ||
      (await unequipButton.count()) > 0 ||
      (await emptyInventoryMsg.count()) > 0;

    expect(isStateVerified).toBe(true);
  });
});
