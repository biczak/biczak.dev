import { test, expect } from '@playwright/test';

test.describe('Tools gallery', () => {
  test('shows all four tools with correct availability', async ({ page }) => {
    await page.goto('/tools');
    const cards = page.getByRole('link').filter({ hasText: /Easing Curve Lab/ });
    await expect(cards.first()).toBeVisible();

    const soonPills = page.getByText('soon', { exact: true });
    await expect(soonPills).toHaveCount(3);
  });

  test('Easing Curve Lab card links to the tool page', async ({ page }) => {
    await page.goto('/tools');
    await page.getByText('Easing Curve Lab').click();
    await expect(page).toHaveURL(/\/tools\/easing$/);
  });
});
