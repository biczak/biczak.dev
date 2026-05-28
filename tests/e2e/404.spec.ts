import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
  test('returns HTTP 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/this-route-does-not-exist');
    expect(response?.status()).toBe(404);
  });

  test('renders the 404 page with H1 and three recovery links', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.getByRole('heading', { level: 1 })).toContainText("This route doesn't exist");
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: '[ home ]', exact: true })).toHaveAttribute(
      'href',
      '/',
    );
    await expect(main.getByRole('link', { name: '[ tools ]', exact: true })).toHaveAttribute(
      'href',
      '/tools',
    );
    await expect(main.getByRole('link', { name: '[ contact ]', exact: true })).toHaveAttribute(
      'href',
      '/#contact',
    );
  });
});
