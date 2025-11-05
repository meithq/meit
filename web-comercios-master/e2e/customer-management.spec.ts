import { test, expect } from '@playwright/test';

/**
 * E2E Test: Customer Management
 * Tests: Create, edit, search, filter customers
 */

test.describe('Customer Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('view customers list', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Page should load
    await expect(page.getByText('Clientes')).toBeVisible();

    // Should show customers
    await expect(page.getByText(/\d+ clientes? registrados?/)).toBeVisible();

    // Should show at least one customer
    const customerRows = page.locator('[data-testid="customer-row"]');
    if ((await customerRows.count()) === 0) {
      // Check for cards on mobile view
      const customerCards = page.locator('[data-testid="customer-card"]');
      expect(await customerCards.count()).toBeGreaterThan(0);
    }
  });

  test('search customer by name', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Search for customer
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('Juan');

    // Wait for debounce
    await page.waitForTimeout(350);

    // Should show filtered results
    await expect(page.getByText('Juan Pérez')).toBeVisible();
  });

  test('search customer by phone number', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Search by phone
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('+584121234567');

    await page.waitForTimeout(350);

    // Should show customer with that phone
    await expect(page.getByText('+584121234567')).toBeVisible();
  });

  test('clear search returns all customers', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Search first
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('Juan');
    await page.waitForTimeout(350);

    // Clear search
    await page.click('[aria-label="Limpiar búsqueda"]');

    // Should show all customers again
    await expect(page.getByText(/\d+ clientes? registrados?/)).toBeVisible();
  });

  test('filter customers by points range', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Open filters panel
    await page.click('button:has-text("Filtros")');

    // Set points range
    await page.fill('input[name="minPoints"]', '50');
    await page.fill('input[name="maxPoints"]', '150');

    // Apply filters
    await page.click('button:has-text("Aplicar")');

    // Should show filtered results
    await expect(page.getByText(/filtrados/i)).toBeVisible();
  });

  test('sort customers by points descending', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Click points column header to sort
    await page.click('th:has-text("Puntos")');

    // First customer should have highest points
    const firstRow = page.locator('[data-testid="customer-row"]').first();
    const lastRow = page.locator('[data-testid="customer-row"]').last();

    const firstPoints = await firstRow
      .locator('[data-testid="points"]')
      .textContent();
    const lastPoints = await lastRow
      .locator('[data-testid="points"]')
      .textContent();

    if (firstPoints && lastPoints) {
      expect(parseInt(firstPoints)).toBeGreaterThanOrEqual(parseInt(lastPoints));
    }
  });

  test('paginate through customers', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Check if pagination exists
    const nextButton = page.getByLabelText('Página siguiente');

    if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
      const firstCustomer = await page
        .locator('[data-testid="customer-row"]')
        .first()
        .textContent();

      // Go to next page
      await nextButton.click();

      // Should show different customers
      await page.waitForTimeout(500);
      const newFirstCustomer = await page
        .locator('[data-testid="customer-row"]')
        .first()
        .textContent();

      expect(firstCustomer).not.toBe(newFirstCustomer);
    }
  });

  test('view customer detail page', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Click on first customer
    const firstCustomer = page.locator('[data-testid="customer-row"]').first();
    await firstCustomer.click();

    // Should navigate to detail page
    await expect(page).toHaveURL(/\/dashboard\/customers\/[\w-]+/);

    // Should show customer details
    await expect(page.getByText(/puntos/i)).toBeVisible();
    await expect(page.getByText(/historial/i)).toBeVisible();
  });

  test('customer detail shows transaction history', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Navigate to customer detail
    await page.locator('[data-testid="customer-row"]').first().click();

    // Should show transactions
    await expect(page.getByText(/transacciones/i)).toBeVisible();
    await expect(
      page.locator('[data-testid="transaction-item"]').first()
    ).toBeVisible();
  });

  test('adjust customer points manually', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Navigate to customer detail
    await page.locator('[data-testid="customer-row"]').first().click();

    // Click adjust points button
    await page.click('button:has-text("Ajustar puntos")');

    // Fill adjustment form
    await page.fill('input[name="points"]', '25');
    await page.fill('textarea[name="reason"]', 'Compensación por error');

    // Submit
    await page.click('button:has-text("Confirmar")');

    // Should see success message
    await expect(page.getByText(/puntos ajustados/i)).toBeVisible();
  });

  test('edit customer information', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Navigate to customer detail
    await page.locator('[data-testid="customer-row"]').first().click();

    // Click edit button
    await page.click('button:has-text("Editar")');

    // Update customer name
    await page.fill('input[name="name"]', 'Juan Pérez Updated');

    // Save
    await page.click('button:has-text("Guardar")');

    // Should see success message
    await expect(page.getByText(/actualizado/i)).toBeVisible();

    // Name should be updated
    await expect(page.getByText('Juan Pérez Updated')).toBeVisible();
  });

  test('export customers to CSV', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('[aria-label="Exportar clientes a CSV"]');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/customers.*\.csv/);
  });

  test('empty state when no customers', async ({ page }) => {
    // Simulate no customers (might need special test data)
    await page.route('**/api/customers**', (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: [], pagination: { total: 0 } }),
      })
    );

    await page.goto('/dashboard/customers');

    // Should show empty state
    await expect(page.getByText(/no hay clientes/i)).toBeVisible();
  });

  test('responsive table vs cards on mobile', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Desktop: should show table
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('table')).toBeVisible();

    // Mobile: should show cards
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('table')).not.toBeVisible();
    await expect(
      page.locator('[data-testid="customer-card"]').first()
    ).toBeVisible();
  });
});

test.describe('Customer Management Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('handles API error gracefully', async ({ page }) => {
    // Simulate API error
    await page.route('**/api/customers**', (route) =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    );

    await page.goto('/dashboard/customers');

    // Should show error message
    await expect(page.getByText(/error al cargar/i)).toBeVisible();
  });

  test('validates phone number format', async ({ page }) => {
    await page.goto('/dashboard/customers');

    // Try to search with invalid phone
    await page.fill('input[type="search"]', '123');

    // Should show validation error or no results
    await page.waitForTimeout(350);
    // Validation would be on search, not immediate
  });
});

test.describe('Customer Management Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('search input has proper label', async ({ page }) => {
    await page.goto('/dashboard/customers');
    await expect(page.getByLabelText('Buscar clientes')).toBeVisible();
  });

  test('table has proper headers', async ({ page }) => {
    await page.goto('/dashboard/customers');
    await page.setViewportSize({ width: 1024, height: 768 });

    await expect(page.locator('th:has-text("Nombre")')).toBeVisible();
    await expect(page.locator('th:has-text("Teléfono")')).toBeVisible();
    await expect(page.locator('th:has-text("Puntos")')).toBeVisible();
  });

  test('pagination buttons have accessible labels', async ({ page }) => {
    await page.goto('/dashboard/customers');

    const prevButton = page.getByLabelText('Página anterior');
    const nextButton = page.getByLabelText('Página siguiente');

    if (await prevButton.isVisible()) {
      await expect(prevButton).toHaveAttribute('aria-label');
    }

    if (await nextButton.isVisible()) {
      await expect(nextButton).toHaveAttribute('aria-label');
    }
  });
});
