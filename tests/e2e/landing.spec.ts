import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders hero, about, work, and contact sections', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('#about')).toBeVisible();
    await expect(page.locator('#work')).toBeVisible();
    await expect(page.locator('#contact')).toBeVisible();
  });

  test('has a working mailto link', async ({ page }) => {
    await page.goto('/');
    const mailto = page.locator('a[href^="mailto:"]').first();
    await expect(mailto).toBeVisible();
    const href = await mailto.getAttribute('href');
    expect(href).toMatch(/^mailto:.+@.+\..+$/);
  });

  test('header navigates to tools page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'tools', exact: true }).click();
    await expect(page).toHaveURL(/\/tools$/);
  });
});
