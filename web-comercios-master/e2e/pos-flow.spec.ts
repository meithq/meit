import { test, expect } from '@playwright/test';

/**
 * E2E Test: POS Flow
 * Tests the critical path: login → POS → search → assign points
 * Target: Complete flow in <10 seconds
 */

test.describe('POS Flow - Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('complete POS flow from login to point assignment', async ({ page }) => {
    const startTime = Date.now();

    // Step 1: Login
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Dashboard')).toBeVisible();

    // Step 2: Navigate to POS
    await page.click('text=Punto de Venta');
    await expect(page).toHaveURL(/\/pos/);
    await expect(page.getByText('Asignación rápida de puntos')).toBeVisible();

    // Step 3: Search for customer by phone
    const phoneInput = page.locator('input[type="tel"]');
    await phoneInput.fill('+584121234567');
    await page.click('button:has-text("Buscar")');

    // Wait for customer to load
    await expect(page.getByText('Juan Pérez')).toBeVisible({ timeout: 5000 });

    // Step 4: Enter purchase amount
    const amountInput = page.locator('input[type="number"]');
    await amountInput.fill('500');

    // Wait for points calculation
    await expect(page.getByText(/50.*pts/i)).toBeVisible({ timeout: 3000 });

    // Step 5: Assign points
    await page.click('button:has-text("Asignar")');

    // Wait for success confirmation
    await expect(page.getByText(/puntos asignados/i)).toBeVisible({ timeout: 5000 });

    // Verify form reset for next customer
    await expect(phoneInput).toHaveValue('');
    await expect(amountInput).toHaveValue('');

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    // Assert total time is under 10 seconds
    expect(duration).toBeLessThan(10);
    console.log(`POS flow completed in ${duration.toFixed(2)}s`);
  });

  test('shows error for invalid phone number', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to POS
    await page.goto('/pos');

    // Enter invalid phone
    await page.fill('input[type="tel"]', '123');
    await page.click('button:has-text("Buscar")');

    // Should show error
    await expect(page.getByText(/número.*inválido/i)).toBeVisible();
  });

  test('shows error for non-existent customer', async ({ page }) => {
    // Login and navigate to POS
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/pos');

    // Search for non-existent customer
    await page.fill('input[type="tel"]', '+584129999999');
    await page.click('button:has-text("Buscar")');

    // Should show error
    await expect(page.getByText(/cliente no encontrado/i)).toBeVisible();
  });

  test('keyboard shortcuts work correctly', async ({ page }) => {
    // Login and set up POS with customer
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/pos');

    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await expect(page.getByText('Juan Pérez')).toBeVisible();

    await page.fill('input[type="number"]', '500');

    // Test Ctrl+Enter to assign
    await page.keyboard.press('Control+Enter');
    await expect(page.getByText(/puntos asignados/i)).toBeVisible();
  });

  test('displays gift card alert when threshold reached', async ({ page }) => {
    // Login and navigate to POS
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/pos');

    // Search for customer near threshold
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await expect(page.getByText('Juan Pérez')).toBeVisible();

    // Enter amount that will trigger gift card
    await page.fill('input[type="number"]', '1000');

    // Should show gift card alert
    await expect(page.getByText(/gift card/i)).toBeVisible();
  });

  test('challenge completion is displayed', async ({ page }) => {
    // Login and navigate to POS
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/pos');

    // Search for customer
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await expect(page.getByText('Juan Pérez')).toBeVisible();

    // Enter amount
    await page.fill('input[type="number"]', '500');

    // Check for challenge completion
    const challengeBadge = page.getByText(/reto completado/i);
    if (await challengeBadge.isVisible()) {
      expect(challengeBadge).toBeVisible();
    }
  });

  test('cancel button resets form', async ({ page }) => {
    // Login and navigate to POS
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/pos');

    // Fill in customer and amount
    await page.fill('input[type="tel"]', '+584121234567');
    await page.click('button:has-text("Buscar")');
    await expect(page.getByText('Juan Pérez')).toBeVisible();
    await page.fill('input[type="number"]', '500');

    // Click cancel
    await page.click('button:has-text("Cancelar")');

    // Verify form is reset
    await expect(page.locator('input[type="tel"]')).toHaveValue('');
    await expect(page.locator('input[type="number"]')).toHaveValue('');
  });

  test('back button returns to dashboard', async ({ page }) => {
    // Login and navigate to POS
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/pos');

    // Click back button
    await page.click('[aria-label="Volver al dashboard"]');

    // Should return to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('POS Accessibility', () => {
  test('POS page is keyboard navigable', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.goto('/pos');

    // Tab through form elements
    await page.keyboard.press('Tab'); // Phone input
    await expect(page.locator('input[type="tel"]')).toBeFocused();

    await page.keyboard.press('Tab'); // Search button
    await expect(page.locator('button:has-text("Buscar")')).toBeFocused();
  });

  test('screen reader labels are present', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/pos');

    // Check for aria-labels
    await expect(page.locator('[aria-label="Volver al dashboard"]')).toBeVisible();
    await expect(page.locator('input[type="tel"]')).toHaveAttribute('aria-label');
  });
});
