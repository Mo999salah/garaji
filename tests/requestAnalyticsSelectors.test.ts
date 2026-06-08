import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  filterRequestsByPeriod,
  isWithinLocalDay,
  selectCompletedToday,
} from '../src/features/requests/selectors/requestSelectors';
import type { ServiceRequest, ServiceRequestStatus } from '../src/features/requests/types';

function makeRequest(
  id: string,
  status: ServiceRequestStatus,
  overrides: Partial<ServiceRequest> = {},
): ServiceRequest {
  return {
    id,
    customerId: 'customer-1',
    vehicleId: 'vehicle-1',
    serviceId: 'service-1',
    requestType: 'branch_appointment',
    scheduledAt: '2026-06-10T10:00:00.000Z',
    status,
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('isWithinLocalDay', () => {
  it('matches timestamps on the same local calendar day', () => {
    const reference = new Date(2026, 5, 9, 18, 30, 0);
    const morning = new Date(2026, 5, 9, 2, 0, 0).toISOString();
    const evening = new Date(2026, 5, 9, 23, 0, 0).toISOString();

    assert.ok(isWithinLocalDay(morning, reference));
    assert.ok(isWithinLocalDay(evening, reference));
  });

  it('rejects timestamps on a different local calendar day', () => {
    const reference = new Date(2026, 5, 9, 12, 0, 0);
    const yesterday = new Date(2026, 5, 8, 12, 0, 0).toISOString();

    assert.ok(!isWithinLocalDay(yesterday, reference));
  });
});

describe('selectCompletedToday', () => {
  it('returns only completed requests updated today', () => {
    const reference = new Date(2026, 5, 9, 12, 0, 0);
    const requests = [
      makeRequest('1', 'completed', { updatedAt: '2026-06-09T08:00:00.000Z' }),
      makeRequest('2', 'completed', { updatedAt: '2026-06-08T08:00:00.000Z' }),
      makeRequest('3', 'pending', { updatedAt: '2026-06-09T08:00:00.000Z' }),
    ];

    const today = selectCompletedToday(requests, reference);
    assert.strictEqual(today.length, 1);
    assert.strictEqual(today[0]?.id, '1');
  });
});

describe('filterRequestsByPeriod', () => {
  it('filters requests created within the last 7 days', () => {
    const reference = new Date(2026, 5, 9, 12, 0, 0);
    const requests = [
      makeRequest('recent', 'pending', { createdAt: '2026-06-08T10:00:00.000Z' }),
      makeRequest('old', 'pending', { createdAt: '2026-05-01T10:00:00.000Z' }),
    ];

    const filtered = filterRequestsByPeriod(requests, '7d', reference);
    assert.strictEqual(filtered.length, 1);
    assert.strictEqual(filtered[0]?.id, 'recent');
  });

  it('returns all requests when period is all', () => {
    const requests = [
      makeRequest('1', 'pending', { createdAt: '2026-01-01T00:00:00.000Z' }),
      makeRequest('2', 'completed', { createdAt: '2026-06-01T00:00:00.000Z' }),
    ];

    assert.strictEqual(filterRequestsByPeriod(requests, 'all').length, 2);
  });
});
