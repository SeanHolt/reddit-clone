# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03_digital_marketplace.spec.ts >> Creator Digital Marketplace & Inventory Closets Suite >> 2. Identity Vault Cosmetic Toggle Controls Interlock
- Location: tests\03_digital_marketplace.spec.ts:24:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - navigation [ref=f1e2]:
    - link "redditclone" [ref=f1e4] [cursor=pointer]:
      - /url: /
    - textbox "Search titles or text (Press Enter to search posts)" [ref=f1e7]
    - generic [ref=f1e8]:
      - button "Toggle Dark Mode" [ref=f1e9]
      - generic [ref=f1e12]:
        - link "u/testoperator" [ref=f1e13] [cursor=pointer]:
          - /url: /u/testoperator
        - link "Chat Messenger Center" [ref=f1e14] [cursor=pointer]:
          - /url: /messages
        - link "0 unread notifications" [ref=f1e17] [cursor=pointer]:
          - /url: /settings/notifications
        - link "User Settings Configuration" [ref=f1e20] [cursor=pointer]:
          - /url: /settings/profile
        - button "Sign Out" [ref=f1e25]
  - main [ref=f1e26]:
    - heading "🎒 Custom Identity Vault & Inventory" [level=1] [ref=f1e29]
  - button "Open Next.js Dev Tools" [ref=f1e35] [cursor=pointer]
  - alert [ref=f1e39]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Creator Digital Marketplace & Inventory Closets Suite", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/api/test/auth");
  6  |     await expect(page.locator("body")).toContainText('"authenticated":true');
  7  |   });
  8  | 
  9  |   test("1. Storefront Grid Catalog Live Preview Verification", async ({
  10 |     page,
  11 |   }) => {
  12 |     await page.goto("/marketplace");
  13 |     await expect(page.locator("h1")).toContainText(
  14 |       "Creator Digital Asset Marketplace",
  15 |     );
  16 | 
  17 |     // Assert live CSS class preview sample fields are painting on product cards
  18 |     const stylePreviewBox = page.locator("text=Visual Asset Skin Preview");
  19 |     if ((await stylePreviewBox.count()) > 0) {
  20 |       await expect(stylePreviewBox.first()).toBeVisible();
  21 |     }
  22 |   });
  23 | 
  24 |   test("2. Identity Vault Cosmetic Toggle Controls Interlock", async ({
  25 |     page,
  26 |   }) => {
  27 |     await page.goto("/settings/inventory");
  28 |     await expect(page.locator("h1")).toContainText(
  29 |       "Custom Identity Vault & Inventory",
  30 |     );
  31 | 
  32 |     const equipButton = page.locator("button:has-text('Equip Cosmetic')");
  33 |     const unequipButton = page.locator("button:has-text('Unequip Asset')");
  34 | 
  35 |     // FIXED: Upgraded standard text lookup string to a resilient case-insensitive fuzzy regular expression match filter [INDEX]
  36 |     const emptyInventoryMsg = page
  37 |       .locator("div, p")
  38 |       .filter({ hasText: /Inventory Empty/i });
  39 | 
  40 |     const isStateVerified =
  41 |       (await equipButton.count()) > 0 ||
  42 |       (await unequipButton.count()) > 0 ||
  43 |       (await emptyInventoryMsg.count()) > 0;
  44 | 
> 45 |     expect(isStateVerified).toBe(true);
     |                             ^ Error: expect(received).toBe(expected) // Object.is equality
  46 |   });
  47 | });
  48 | 
```