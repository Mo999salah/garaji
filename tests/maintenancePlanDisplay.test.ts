import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { isMaintenanceDueSoon } from '../src/features/operations/utils/maintenancePlanDisplay';

describe('isMaintenanceDueSoon', () => {
  const now = new Date(2026, 5, 9, 12, 0, 0).getTime();

  it('returns true when due date is within the window', () => {
    const dueSoon = new Date(2026, 5, 20, 12, 0, 0).toISOString();
    assert.ok(isMaintenanceDueSoon(dueSoon, now));
  });

  it('returns false when due date is outside the window', () => {
    const later = new Date(2026, 7, 1, 12, 0, 0).toISOString();
    assert.ok(!isMaintenanceDueSoon(later, now));
  });

  it('returns false when next due date is missing or invalid', () => {
    assert.ok(!isMaintenanceDueSoon(undefined, now));
    assert.ok(!isMaintenanceDueSoon('not-a-date', now));
  });
});
