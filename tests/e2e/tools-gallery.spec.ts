import { test, expect } from '@playwright/test';

test.describe('Tools gallery', () => {
  test('shows all four tools with correct availability', async ({ page }) => {
    await page.goto('/tools');
    const easingCard = page.getByRole('link').filter({ hasText: /Easing Curve Lab/ });
    await expect(easingCard).toHaveCount(1);

    const bloomCard = page.getByRole('link').filter({ hasText: /Spectral Bloom/ });
    await expect(bloomCard).toHaveCount(1);

    const soonPills = page.getByText('soon', { exact: true });
    await expect(soonPills).toHaveCount(2);
  });

  test('Easing Curve Lab card links to the tool page', async ({ page }) => {
    await page.goto('/tools');
    await page.getByRole('link', { name: /Easing Curve Lab/ }).click();
    await expect(page).toHaveURL(/\/tools\/easing$/);
  });
});
