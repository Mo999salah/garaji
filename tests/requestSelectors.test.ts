import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  ALLOWED_TRANSITIONS,
  STATUS_LABELS,
  TERMINAL_STATUSES,
  canCustomerCancel,
  canTransitionTo,
  getNextStatuses,
  isTerminal,
  selectActiveRequests,
  selectByStatus,
  selectCancelledRequests,
  selectCompletedRequests,
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

describe('STATUS_LABELS', () => {
  it('covers all statuses', () => {
    const statuses: ServiceRequestStatus[] = [
      'pending',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
    ];

    for (const s of statuses) {
      assert.ok(STATUS_LABELS[s], `STATUS_LABELS missing entry for "${s}"`);
      assert.strictEqual(typeof STATUS_LABELS[s], 'string');
    }
  });
});

describe('isTerminal', () => {
  it('marks completed and cancelled as terminal', () => {
    assert.ok(isTerminal('completed'));
    assert.ok(isTerminal('cancelled'));
  });

  it('marks pending / confirmed / in_progress as non-terminal', () => {
    assert.ok(!isTerminal('pending'));
    assert.ok(!isTerminal('confirmed'));
    assert.ok(!isTerminal('in_progress'));
  });

  it('is consistent with TERMINAL_STATUSES array', () => {
    for (const s of TERMINAL_STATUSES) {
      assert.ok(isTerminal(s), `${s} should be terminal`);
    }
  });
});

describe('canTransitionTo', () => {
  it('allows valid transitions', () => {
    assert.ok(canTransitionTo('pending', 'confirmed'));
    assert.ok(canTransitionTo('pending', 'cancelled'));
    assert.ok(canTransitionTo('confirmed', 'in_progress'));
    assert.ok(canTransitionTo('confirmed', 'cancelled'));
    assert.ok(canTransitionTo('in_progress', 'completed'));
  });

  it('rejects invalid transitions', () => {
    assert.ok(!canTransitionTo('pending', 'in_progress'));
    assert.ok(!canTransitionTo('pending', 'completed'));
    assert.ok(!canTransitionTo('confirmed', 'completed'));
    assert.ok(!canTransitionTo('confirmed', 'pending'));
    assert.ok(!canTransitionTo('in_progress', 'pending'));
    assert.ok(!canTransitionTo('in_progress', 'cancelled'));
    assert.ok(!canTransitionTo('completed', 'pending'));
    assert.ok(!canTransitionTo('cancelled', 'pending'));
  });

  it('terminal statuses have no outgoing transitions', () => {
    for (const terminal of TERMINAL_STATUSES) {
      assert.deepStrictEqual(ALLOWED_TRANSITIONS[terminal], []);
    }
  });
});

describe('canCustomerCancel', () => {
  it('allows cancel while pending or confirmed', () => {
    assert.ok(canCustomerCancel('pending'));
    assert.ok(canCustomerCancel('confirmed'));
  });

  it('blocks cancel once work has started or the request is terminal', () => {
    assert.ok(!canCustomerCancel('in_progress'));
    assert.ok(!canCustomerCancel('completed'));
    assert.ok(!canCustomerCancel('cancelled'));
  });
});

describe('getNextStatuses', () => {
  it('returns correct next statuses for each state', () => {
    assert.deepStrictEqual(getNextStatuses('pending').sort(), ['cancelled', 'confirmed'].sort());
    assert.deepStrictEqual(
      getNextStatuses('confirmed').sort(),
      ['cancelled', 'in_progress'].sort(),
    );
    assert.deepStrictEqual(getNextStatuses('in_progress'), ['completed']);
    assert.deepStrictEqual(getNextStatuses('completed'), []);
    assert.deepStrictEqual(getNextStatuses('cancelled'), []);
  });
});

describe('selectActiveRequests', () => {
  it('excludes completed and cancelled requests', () => {
    const requests = [
      makeRequest('1', 'pending'),
      makeRequest('2', 'confirmed'),
      makeRequest('3', 'in_progress'),
      makeRequest('4', 'completed'),
      makeRequest('5', 'cancelled'),
    ];

    const active = selectActiveRequests(requests);
    assert.strictEqual(active.length, 3);
    assert.ok(active.every((r) => !isTerminal(r.status)));
  });

  it('returns empty array when all requests are terminal', () => {
    const requests = [makeRequest('1', 'completed'), makeRequest('2', 'cancelled')];
    assert.deepStrictEqual(selectActiveRequests(requests), []);
  });
});

describe('selectCompletedRequests', () => {
  it('returns only completed requests', () => {
    const requests = [
      makeRequest('1', 'pending'),
      makeRequest('2', 'completed'),
      makeRequest('3', 'completed'),
    ];

    const completed = selectCompletedRequests(requests);
    assert.strictEqual(completed.length, 2);
    assert.ok(completed.every((r) => r.status === 'completed'));
  });
});

describe('selectCancelledRequests', () => {
  it('returns only cancelled requests', () => {
    const requests = [makeRequest('1', 'pending'), makeRequest('2', 'cancelled')];
    const cancelled = selectCancelledRequests(requests);
    assert.strictEqual(cancelled.length, 1);
    assert.strictEqual(cancelled[0]?.id, '2');
  });
});

describe('selectByStatus', () => {
  it('filters by an arbitrary status', () => {
    const requests = [
      makeRequest('1', 'pending'),
      makeRequest('2', 'pending'),
      makeRequest('3', 'confirmed'),
    ];

    assert.strictEqual(selectByStatus(requests, 'pending').length, 2);
    assert.strictEqual(selectByStatus(requests, 'confirmed').length, 1);
    assert.strictEqual(selectByStatus(requests, 'in_progress').length, 0);
  });
});
