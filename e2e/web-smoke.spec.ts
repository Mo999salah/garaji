import { expect, test } from '@playwright/test';

test.describe('Garaji web smoke', () => {
  test('login screen renders for unauthenticated visitors', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'تسجيل الدخول' })).toBeVisible();
    await expect(page.getByText('أهلاً بك.')).toBeVisible();
  });

  test('root redirects guests to login', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login**');
    await expect(page.getByRole('button', { name: 'تسجيل الدخول' })).toBeVisible();
  });
});
