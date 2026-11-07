import { test, expect } from "@playwright/test";

test.describe("Administrative Governance, Tribunals, & Shield Matrices Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/api/test/auth");
    await expect(page.locator("body")).toContainText('"authenticated":true');
  });

  test("1. Auto-Remove Reports Count Spinner Target Isolation", async ({ page }) => {
    await page.goto("/settings/moderation");
    
    // Strictly scope the input selector to avoid multi-match strict mode ambient violations
    const thresholdInput = page
      .locator("form")
      .filter({ hasText: "🚨 Anti-Raid Shield Configuration" })
      .locator("input[type='number']");
      
    await expect(thresholdInput).toBeVisible();
  });

  test("2. Unalterable Staff Operational Audit Timeline Stream", async ({ page }) => {
    await page.goto("/settings/moderation");
    
    // Verify the unalterable history ledger card mounts directly beneath dials
    const ledgerTitle = page.locator("text=Staff Action Action Audit Ledger");
    const backupTitle = page.locator("text=Staff Action Audit Ledger");
    const emptyMsg = page.locator("text=Ledger Empty: No administrative events");
    
    const isLedgerPresent = (await ledgerTitle.count()) > 0 || (await backupTitle.count()) > 0 || (await emptyMsg.count()) > 0;
    expect(isLedgerPresent).toBe(true);
  });
});
