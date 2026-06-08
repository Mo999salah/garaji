import { expect, test } from '@playwright/test';

import { loginAsCustomer } from './helpers/customer-auth';
import { allowE2EMutations, getCustomerCredentials } from './helpers/env';
import { firstRequestCard, openMyCarsTab, openOrdersTab } from './helpers/page';

test.describe('Garaji customer flows', () => {
  test.describe.configure({ timeout: 60_000 });

  test.beforeEach(async ({ page }) => {
    test.skip(!getCustomerCredentials(), 'Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD.');
    await loginAsCustomer(page);
  });

  test('customer home shows dashboard and tab navigation', async ({ page }) => {
    await expect(page.getByText('مركز العميل')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'الرئيسية' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'حجوزاتي' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'سياراتي' })).toBeVisible();
  });

  test('orders tab renders customer request list or empty state', async ({ page }) => {
    await openOrdersTab(page);
    await expect(page.getByRole('tab', { name: /^نشطة/ })).toBeVisible();

    const requestCard = firstRequestCard(page);
    const emptyState = page.getByText('لا طلبات نشطة');

    await expect(requestCard.or(emptyState)).toBeVisible({ timeout: 15_000 });
  });

  test('my cars tab renders garage or empty state', async ({ page }) => {
    await openMyCarsTab(page);

    const addVehicleButton = page.getByRole('button', { name: '+ إضافة مركبة' });
    const emptyState = page.getByText('لا توجد سيارات');

    await expect(addVehicleButton.or(emptyState)).toBeVisible({ timeout: 15_000 });
  });

  test('cancellable order exposes cancel action in details', async ({ page }) => {
    await openOrdersTab(page);

    const requestCard = firstRequestCard(page);

    if (!(await requestCard.isVisible().catch(() => false))) {
      test.skip(true, 'No active requests on the E2E customer account.');
    }

    await requestCard.click();
    await page.waitForURL('**/order-details**');

    const cancelButton = page.getByRole('button', { name: 'إلغاء الطلب' });

    if (!(await cancelButton.isVisible().catch(() => false))) {
      test.skip(true, 'First active request is not in a customer-cancellable status.');
    }

    await expect(cancelButton).toBeVisible();
    await expect(page.getByText('إلغاء الطلب', { exact: true }).first()).toBeVisible();
  });

  test('vehicle delete opens confirmation without mutating by default', async ({ page }) => {
    await openMyCarsTab(page);

    const deleteButton = page.getByRole('button', { name: 'حذف المركبة' }).first();

    if (!(await deleteButton.isVisible().catch(() => false))) {
      test.skip(true, 'No deletable vehicles on the E2E customer account.');
    }

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toMatch(/حذف/);

      if (allowE2EMutations()) {
        await dialog.accept();
        return;
      }

      await dialog.dismiss();
    });

    await deleteButton.click();

    if (!allowE2EMutations()) {
      await expect(deleteButton).toBeVisible();
    }
  });

  test('order cancel confirmation respects mutation gate', async ({ page }) => {
    await openOrdersTab(page);

    const requestCard = firstRequestCard(page);

    if (!(await requestCard.isVisible().catch(() => false))) {
      test.skip(true, 'No active requests on the E2E customer account.');
    }

    await requestCard.click();
    await page.waitForURL('**/order-details**');

    const cancelButton = page.getByRole('button', { name: 'إلغاء الطلب' });

    if (!(await cancelButton.isVisible().catch(() => false))) {
      test.skip(true, 'No cancellable request available for mutation test.');
    }

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toMatch(/إلغاء/);

      if (allowE2EMutations()) {
        await dialog.accept();
        return;
      }

      await dialog.dismiss();
    });

    await cancelButton.click();

    if (!allowE2EMutations()) {
      await expect(cancelButton).toBeVisible();
      return;
    }

    await expect(page.getByText('ملغى')).toBeVisible({ timeout: 15_000 });
  });
});
