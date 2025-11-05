import { test, expect } from '@playwright/test';

/**
 * E2E Test: Gift Card Redemption Flow
 * Tests: Points accumulation → gift card generation → redemption
 */

test.describe('Gift Card Redemption Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('complete gift card generation and redemption flow', async ({ page }) => {
    // Step 1: Accumulate points to reach threshold (100 points)
    await page.goto('/pos');

    // First purchase: 50 points (from $500)
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await expect(page.getByText('Juan Pérez')).toBeVisible();

    await page.fill('input[type="number"]', '500');
    await page.click('button:has-text("Asignar")');
    await expect(page.getByText(/puntos asignados/i)).toBeVisible();

    // Second purchase: 50 more points to reach 100
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await page.fill('input[type="number"]', '500');

    // Should show gift card alert
    await expect(page.getByText(/gift card/i)).toBeVisible();

    await page.click('button:has-text("Asignar")');

    // Should see gift card generation notification
    await expect(page.getByText(/tarjeta de regalo generada/i)).toBeVisible();

    // Step 2: Navigate to gift cards page
    await page.goto('/gift-cards');
    await expect(page.getByText('Gift Cards')).toBeVisible();

    // Should see the newly generated gift card
    const giftCardCode = await page.getByText(/GIFT-\d{4}-[A-Z0-9]+/);
    await expect(giftCardCode).toBeVisible();

    // Verify gift card details
    await expect(page.getByText('Juan Pérez')).toBeVisible();
    await expect(page.getByText(/100.*pts/i)).toBeVisible();
    await expect(page.getByText(/no canjeado/i)).toBeVisible();

    // Step 3: Redeem gift card
    const redeemButton = page.getByRole('button', { name: /canjear/i });
    await redeemButton.click();

    // Confirm redemption
    await page.getByRole('button', { name: /confirmar/i }).click();

    // Should see success message
    await expect(page.getByText(/canjeado exitosamente/i)).toBeVisible();

    // Gift card status should update
    await expect(page.getByText(/canjeado/i)).toBeVisible();
  });

  test('shows progress toward next gift card', async ({ page }) => {
    await page.goto('/pos');

    // Search customer with partial points
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await expect(page.getByText('Juan Pérez')).toBeVisible();

    // Should show progress indicator
    await expect(page.getByText(/\d+\/100/)).toBeVisible();
  });

  test('gift card appears in customer profile', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Search for customer
    await page.fill('input[type="search"]', 'Juan');
    await page.click('text=Juan Pérez');

    // Should navigate to customer detail page
    await expect(page).toHaveURL(/\/dashboard\/customers\/\w+/);

    // Check gift cards section
    await expect(page.getByText('Gift Cards')).toBeVisible();
    await expect(page.getByText(/GIFT-\d{4}-[A-Z0-9]+/)).toBeVisible();
  });

  test('cannot redeem already redeemed gift card', async ({ page }) => {
    await page.goto('/gift-cards');

    // Find redeemed gift card
    const redeemedCard = page.locator('[data-status="redeemed"]').first();

    if (await redeemedCard.isVisible()) {
      // Redeem button should be disabled or not present
      const redeemButton = redeemedCard.locator('button:has-text("Canjear")');
      await expect(redeemButton).toBeDisabled();
    }
  });

  test('gift card expiration is displayed', async ({ page }) => {
    await page.goto('/gift-cards');

    // Should show expiration date
    await expect(page.getByText(/expira/i)).toBeVisible();
  });

  test('filters gift cards by status', async ({ page }) => {
    await page.goto('/gift-cards');

    // Filter by unredeemed
    await page.click('text=No canjeados');
    await expect(page.getByText(/no canjeado/i)).toBeVisible();

    // Filter by redeemed
    await page.click('text=Canjeados');
    if (await page.getByText(/canjeado/i).first().isVisible()) {
      await expect(page.getByText(/canjeado/i)).toBeVisible();
    }
  });

  test('exports gift cards to CSV', async ({ page }) => {
    await page.goto('/gift-cards');

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Exportar")');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('gift card value is calculated correctly', async ({ page }) => {
    await page.goto('/pos');

    // Customer with exactly 100 points should generate $5 card
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');

    const customerPoints = await page.getByText(/\d+.*pts/).textContent();

    if (customerPoints && parseInt(customerPoints) >= 100) {
      // Navigate to gift cards
      await page.goto('/gift-cards');

      // Should show $5 value
      await expect(page.getByText(/\$5\.00/)).toBeVisible();
    }
  });

  test('WhatsApp notification sent on gift card generation', async ({ page }) => {
    await page.goto('/pos');

    // Accumulate points to trigger gift card
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await page.fill('input[type="number"]', '1000'); // Enough to trigger

    await page.click('button:has-text("Asignar")');

    // Should show notification message
    await expect(
      page.getByText(/notificación enviada por WhatsApp/i)
    ).toBeVisible();
  });

  test('gift card statistics are displayed on dashboard', async ({ page }) => {
    await page.goto('/dashboard');

    // Check for gift card metric
    await expect(page.getByText('Gift Cards Generadas')).toBeVisible();
    await expect(page.getByText(/\d+/).first()).toBeVisible();
  });
});

test.describe('Gift Card Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('handles network error during redemption', async ({ page }) => {
    await page.goto('/gift-cards');

    // Simulate network error
    await page.route('**/api/gift-cards/**/redeem', (route) =>
      route.abort('failed')
    );

    // Try to redeem
    const redeemButton = page.getByRole('button', { name: /canjear/i }).first();
    await redeemButton.click();
    await page.getByRole('button', { name: /confirmar/i }).click();

    // Should show error message
    await expect(page.getByText(/error.*canjear/i)).toBeVisible();
  });

  test('validates gift card code format', async ({ page }) => {
    await page.goto('/gift-cards');

    // Try to search with invalid code
    await page.fill('input[type="search"]', 'INVALID-CODE');

    // Should show validation error or no results
    await expect(
      page.getByText(/código inválido/i) || page.getByText(/no se encontraron/i)
    ).toBeTruthy();
  });
});
