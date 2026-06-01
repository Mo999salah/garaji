import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canTransitionOrderStatus,
  getCustomerOrderStatusMessage,
  getNextOrderStatus,
} from '../src/features/orders/selectors/orderSelectors';

test('merchant order workflow advances through the expected statuses', () => {
  assert.equal(getNextOrderStatus('pending'), 'processing');
  assert.equal(getNextOrderStatus('processing'), 'on_the_way');
  assert.equal(getNextOrderStatus('on_the_way'), 'delivered');
  assert.equal(getNextOrderStatus('delivered'), null);
});

test('order status transitions reject skipped and terminal moves', () => {
  assert.equal(canTransitionOrderStatus('pending', 'processing'), true);
  assert.equal(canTransitionOrderStatus('pending', 'delivered'), false);
  assert.equal(canTransitionOrderStatus('processing', 'cancelled'), true);
  assert.equal(canTransitionOrderStatus('delivered', 'cancelled'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'processing'), false);
});

test('customer status messages explain merchant progress', () => {
  assert.match(getCustomerOrderStatusMessage('pending'), /Waiting for the merchant/);
  assert.match(getCustomerOrderStatusMessage('processing'), /reserved/);
  assert.match(getCustomerOrderStatusMessage('cancelled'), /cancelled/);
});
