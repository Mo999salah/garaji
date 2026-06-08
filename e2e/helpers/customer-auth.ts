import type { Page } from '@playwright/test';

import { getCustomerCredentials } from './env';
import { hideDevOverlays } from './page';

export async function loginAsCustomer(page: Page) {
  const credentials = getCustomerCredentials();

  if (!credentials) {
    throw new Error('Missing E2E_CUSTOMER_EMAIL or E2E_CUSTOMER_PASSWORD.');
  }

  await page.goto('/login');
  await page.getByPlaceholder('name@example.com').fill(credentials.email);
  await page.locator('input[type="password"]').fill(credentials.password);
  await page.getByRole('button', { name: 'تسجيل الدخول' }).click();
  await page.getByText('مركز العميل').waitFor({ timeout: 20_000 });
  await hideDevOverlays(page);
}
