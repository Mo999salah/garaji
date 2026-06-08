import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getHomePathForRole } from '../src/features/auth/utils/homePaths';

describe('getHomePathForRole', () => {
  it('routes customers to the tab home', () => {
    assert.equal(getHomePathForRole('customer'), '/(tabs)');
  });

  it('routes merchants to the admin dashboard', () => {
    assert.equal(getHomePathForRole('merchant'), '/(admin)/dashboard');
  });
});
