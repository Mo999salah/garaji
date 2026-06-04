import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { vehicleSchema } from '../src/features/vehicles/schemas/vehicleSchema';

const currentYear = new Date().getFullYear();

const validVehicle = {
  make: 'Toyota',
  model: 'Corolla',
  year: 2020,
  plateNumber: 'ABC-123',
};

describe('vehicleSchema', () => {
  it('accepts a valid vehicle', () => {
    const result = vehicleSchema.safeParse(validVehicle);
    assert.ok(result.success, JSON.stringify(result));
  });

  it('rejects missing make', () => {
    const result = vehicleSchema.safeParse({ ...validVehicle, make: '' });
    assert.ok(!result.success);
  });

  it('rejects missing model', () => {
    const result = vehicleSchema.safeParse({ ...validVehicle, model: '' });
    assert.ok(!result.success);
  });

  it('rejects missing plateNumber', () => {
    const result = vehicleSchema.safeParse({ ...validVehicle, plateNumber: '' });
    assert.ok(!result.success);
  });

  it('rejects year below 1900', () => {
    const result = vehicleSchema.safeParse({ ...validVehicle, year: 1899 });
    assert.ok(!result.success);
  });

  it('rejects year above currentYear + 2', () => {
    const result = vehicleSchema.safeParse({ ...validVehicle, year: currentYear + 3 });
    assert.ok(!result.success);
  });

  it('accepts year at currentYear + 2 boundary', () => {
    const result = vehicleSchema.safeParse({ ...validVehicle, year: currentYear + 2 });
    assert.ok(result.success);
  });

  it('accepts optional fields when provided', () => {
    const result = vehicleSchema.safeParse({
      ...validVehicle,
      color: 'أبيض',
      mileage: 50000,
    });
    assert.ok(result.success);
  });

  it('rejects negative mileage', () => {
    const result = vehicleSchema.safeParse({ ...validVehicle, mileage: -1 });
    assert.ok(!result.success);
  });
});
