import { expect, type Page } from '@playwright/test';

export async function hideDevOverlays(page: Page) {
  await page.addStyleTag({
    content:
      '#error-overlay, #webpack-dev-server-client-overlay { display: none !important; pointer-events: none !important; }',
  });
}

export async function openOrdersTab(page: Page) {
  await page.getByRole('tab', { name: 'حجوزاتي', exact: true }).click();
  await expect(page.getByText('متابعة الصيانة')).toBeVisible();
  await expect(page.getByText('طلباتك')).toBeVisible();
}

export async function openMyCarsTab(page: Page) {
  await page.getByRole('tab', { name: 'سياراتي', exact: true }).click();
  await expect(page.getByText('المرآب')).toBeVisible();
}

export function firstRequestCard(page: Page) {
  return page
    .getByRole('button', { name: /^طلب (موعد في الفرع|خدمة بالموقع)$/ })
    .first();
}
