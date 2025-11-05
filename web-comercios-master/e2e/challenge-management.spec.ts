import { test, expect } from '@playwright/test';

/**
 * E2E Test: Challenge Management
 * Tests: Create and activate challenges
 */

test.describe('Challenge Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('view challenges list', async ({ page }) => {
    await page.goto('/challenges');

    // Page should load
    await expect(page.getByText('Retos y Desafíos')).toBeVisible();

    // Should show active challenges section
    await expect(page.getByText(/RETOS ACTIVOS/i)).toBeVisible();
  });

  test('create frequency challenge', async ({ page }) => {
    await page.goto('/challenges');

    // Click create button
    await page.click('button:has-text("Crear Reto")');

    // Should navigate to creation page
    await expect(page).toHaveURL(/\/challenges\/new/);

    // Fill challenge form
    await page.fill('input[name="name"]', 'Visit 3 times this week');
    await page.fill(
      'textarea[name="description"]',
      'Come back 3 times in one week for bonus points'
    );

    // Select frequency type
    await page.click('[data-testid="type-frequency"]');

    // Set target value
    await page.fill('input[name="targetValue"]', '3');

    // Set reward points
    await page.fill('input[name="rewardPoints"]', '30');

    // Save challenge
    await page.click('button:has-text("Crear Reto")');

    // Should redirect to challenges list
    await expect(page).toHaveURL(/\/challenges$/);

    // Should see new challenge
    await expect(page.getByText('Visit 3 times this week')).toBeVisible();
  });

  test('create amount challenge', async ({ page }) => {
    await page.goto('/challenges/new');

    // Fill basic info
    await page.fill('input[name="name"]', 'Spend $200 bonus');
    await page.fill(
      'textarea[name="description"]',
      'Spend $200 in one purchase'
    );

    // Select amount type
    await page.click('[data-testid="type-amount"]');

    // Set target amount
    await page.fill('input[name="targetValue"]', '200');

    // Set reward
    await page.fill('input[name="rewardPoints"]', '50');

    // Create
    await page.click('button:has-text("Crear Reto")');

    // Verify creation
    await expect(page.getByText('Spend $200 bonus')).toBeVisible();
  });

  test('create streak challenge', async ({ page }) => {
    await page.goto('/challenges/new');

    // Fill form
    await page.fill('input[name="name"]', '7 day streak');
    await page.fill('textarea[name="description"]', 'Visit 7 days in a row');

    // Select streak type
    await page.click('[data-testid="type-streak"]');

    // Set days
    await page.fill('input[name="targetValue"]', '7');

    // Set reward
    await page.fill('input[name="rewardPoints"]', '100');

    // Create
    await page.click('button:has-text("Crear Reto")');

    await expect(page.getByText('7 day streak')).toBeVisible();
  });

  test('edit existing challenge', async ({ page }) => {
    await page.goto('/challenges');

    // Find first challenge and click edit
    const editButton = page.getByRole('button', { name: /editar/i }).first();
    await editButton.click();

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/challenges\/[\w-]+\/edit/);

    // Update name
    await page.fill('input[name="name"]', 'Updated Challenge Name');

    // Save
    await page.click('button:has-text("Guardar")');

    // Should return to list
    await expect(page).toHaveURL(/\/challenges$/);

    // Should see updated name
    await expect(page.getByText('Updated Challenge Name')).toBeVisible();
  });

  test('pause active challenge', async ({ page }) => {
    await page.goto('/challenges');

    // Find active challenge
    const pauseButton = page.getByRole('button', { name: /pausar/i }).first();

    if (await pauseButton.isVisible()) {
      await pauseButton.click();

      // Confirm if modal appears
      const confirmButton = page.getByRole('button', { name: /confirmar/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Challenge should move to paused section
      await expect(page.getByText(/RETOS PAUSADOS/i)).toBeVisible();
    }
  });

  test('activate paused challenge', async ({ page }) => {
    await page.goto('/challenges');

    // Expand paused section
    await page.click('button:has-text("RETOS PAUSADOS")');

    // Find activate button
    const activateButton = page
      .getByRole('button', { name: /activar/i })
      .first();

    if (await activateButton.isVisible()) {
      await activateButton.click();

      // Should move to active section
      // Wait for update
      await page.waitForTimeout(500);
    }
  });

  test('delete challenge', async ({ page }) => {
    await page.goto('/challenges');

    // Click delete button
    const deleteButton = page.getByRole('button', { name: /eliminar/i }).first();
    await deleteButton.click();

    // Should show confirmation modal
    await expect(page.getByText(/confirmar.*eliminación/i)).toBeVisible();

    // Confirm deletion
    await page.click('button:has-text("Eliminar")');

    // Should see success message
    await expect(page.getByText(/eliminado/i)).toBeVisible();
  });

  test('cancel challenge deletion', async ({ page }) => {
    await page.goto('/challenges');

    // Click delete
    const deleteButton = page.getByRole('button', { name: /eliminar/i }).first();
    await deleteButton.click();

    // Cancel
    await page.click('button:has-text("Cancelar")');

    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('WhatsApp message preview updates in real-time', async ({ page }) => {
    await page.goto('/challenges/new');

    // Fill challenge name
    await page.fill('input[name="name"]', 'Test Challenge');

    // Should see preview update
    await expect(page.getByText(/Test Challenge/)).toBeVisible();

    // Update reward points
    await page.fill('input[name="rewardPoints"]', '25');

    // Preview should show points
    await expect(page.getByText(/25.*puntos/i)).toBeVisible();
  });

  test('validate required fields', async ({ page }) => {
    await page.goto('/challenges/new');

    // Try to create without filling required fields
    await page.click('button:has-text("Crear Reto")');

    // Should show validation errors
    await expect(page.getByText(/requerido/i).first()).toBeVisible();
  });

  test('validate points range', async ({ page }) => {
    await page.goto('/challenges/new');

    // Try invalid points value
    await page.fill('input[name="rewardPoints"]', '-10');

    // Should show error
    await expect(page.getByText(/mayor.*cero/i)).toBeVisible();
  });

  test('collapsible paused challenges section', async ({ page }) => {
    await page.goto('/challenges');

    const pausedHeader = page.getByText(/RETOS PAUSADOS/i);

    if (await pausedHeader.isVisible()) {
      // Click to collapse
      await pausedHeader.click();

      // Content should be hidden
      const content = page.locator('#paused-challenges-content');
      await expect(content).not.toBeVisible();

      // Click to expand
      await pausedHeader.click();

      // Content should be visible
      await expect(content).toBeVisible();
    }
  });

  test('challenge statistics displayed', async ({ page }) => {
    await page.goto('/challenges');

    // Each challenge card should show completion count
    const completionStat = page.locator('[data-testid="completion-count"]').first();

    if (await completionStat.isVisible()) {
      await expect(completionStat).toHaveText(/\d+.*completado/i);
    }
  });

  test('filter challenges by type', async ({ page }) => {
    await page.goto('/challenges');

    // Click type filter
    await page.click('button:has-text("Tipo")');

    // Select frequency
    await page.click('text=Frecuencia');

    // Should show only frequency challenges
    await expect(page.getByText(/frecuencia/i)).toBeVisible();
  });

  test('sort challenges by reward points', async ({ page }) => {
    await page.goto('/challenges');

    // Click sort dropdown
    await page.click('button:has-text("Ordenar")');

    // Select points
    await page.click('text=Puntos');

    // Challenges should be sorted
    // First should have highest or lowest depending on order
  });

  test('challenge completion analytics', async ({ page }) => {
    await page.goto('/challenges');

    // Click on a challenge card
    const viewAnalyticsButton = page
      .getByRole('button', { name: /analíticas/i })
      .first();

    if (await viewAnalyticsButton.isVisible()) {
      await viewAnalyticsButton.click();

      // Should show analytics view
      await expect(page.getByText(/completados/i)).toBeVisible();
      await expect(page.getByText(/en progreso/i)).toBeVisible();
    }
  });

  test('duplicate challenge', async ({ page }) => {
    await page.goto('/challenges');

    // Find duplicate button
    const duplicateButton = page
      .getByRole('button', { name: /duplicar/i })
      .first();

    if (await duplicateButton.isVisible()) {
      await duplicateButton.click();

      // Should navigate to create page with pre-filled data
      await expect(page).toHaveURL(/\/challenges\/new/);
      await expect(page.locator('input[name="name"]')).toHaveValue(
        /.*copia.*|.*copy.*/i
      );
    }
  });
});

test.describe('Challenge Creation Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/challenges/new');
  });

  test('validates challenge name length', async ({ page }) => {
    // Try very short name
    await page.fill('input[name="name"]', 'ab');
    await page.click('button:has-text("Crear Reto")');

    await expect(page.getByText(/mínimo.*caracteres/i)).toBeVisible();
  });

  test('validates target value is positive', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test Challenge');
    await page.click('[data-testid="type-frequency"]');
    await page.fill('input[name="targetValue"]', '0');

    await expect(page.getByText(/mayor.*cero/i)).toBeVisible();
  });

  test('validates reward points range', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test Challenge');
    await page.fill('input[name="rewardPoints"]', '10000');

    await expect(page.getByText(/máximo/i)).toBeVisible();
  });
});

test.describe('Challenge Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('create button has accessible label', async ({ page }) => {
    await page.goto('/challenges');
    const createButton = page.getByRole('button', { name: /crear reto/i });
    await expect(createButton).toBeVisible();
  });

  test('collapsible section has aria attributes', async ({ page }) => {
    await page.goto('/challenges');

    const toggleButton = page.getByText(/RETOS PAUSADOS/i).locator('..');

    if (await toggleButton.isVisible()) {
      await expect(toggleButton).toHaveAttribute('aria-expanded');
      await expect(toggleButton).toHaveAttribute('aria-controls');
    }
  });

  test('form fields have labels', async ({ page }) => {
    await page.goto('/challenges/new');

    await expect(page.getByLabelText(/nombre/i)).toBeVisible();
    await expect(page.getByLabelText(/descripción/i)).toBeVisible();
  });
});
