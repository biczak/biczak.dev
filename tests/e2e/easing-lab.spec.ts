import { test, expect } from '@playwright/test';

test.describe('Easing Curve Lab', () => {
  test('loads with default state and core controls visible', async ({ page }) => {
    await page.goto('/tools/easing');
    await expect(page.getByRole('heading', { name: /easing curve lab/i })).toBeVisible();
    await expect(page.getByRole('application', { name: /bezier curve editor/i })).toBeVisible();
    await expect(page.getByText('Export', { exact: true })).toBeVisible();
  });

  test('selecting a preset updates the curve in the URL', async ({ page }) => {
    await page.goto('/tools/easing');
    await page.getByRole('button', { name: 'ease-out' }).click();
    await expect(page).toHaveURL(/c=0,0,0\.58,1/);
  });

  test('clicking a target button updates URL state', async ({ page }) => {
    await page.goto('/tools/easing');
    await page.getByRole('button', { name: 'scale', exact: true }).click();
    await expect(page).toHaveURL(/t=scale/);
  });

  test('export panel copy button triggers copy and shows confirmation', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'Clipboard permission API differs on webkit');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/tools/easing');
    const copyButtons = page.getByRole('button', { name: 'copy' });
    await copyButtons.first().click();
    await expect(page.getByText('✓ copied').first()).toBeVisible({ timeout: 2000 });
  });

  test('keyboard nudges the control point', async ({ page }) => {
    await page.goto('/tools/easing#c=0.2,0.7,0.1,1&d=800&t=translate');
    await page.getByLabel(/control point 1/i).focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.waitForURL(/c=0\.22/);
  });

  test('pasted URL hash restores state', async ({ page }) => {
    await page.goto('/tools/easing#c=0,0,1,1&d=500&t=rotate');
    const select = page.locator('select');
    await expect(page.getByRole('button', { name: 'rotate', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(select).toHaveValue('');
  });
});
