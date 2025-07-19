/* eslint-env jest */

import { hashStringToSeed } from '../canvasUtils';

describe('hashStringToSeed', () => {
  it('should return the same seed for the same string', () => {
    expect(hashStringToSeed('test')).toBe(hashStringToSeed('test'));
    expect(hashStringToSeed('another')).toBe(hashStringToSeed('another'));
  });

  it('should return different seeds for different strings', () => {
    expect(hashStringToSeed('test')).not.toBe(hashStringToSeed('Test'));
    expect(hashStringToSeed('a')).not.toBe(hashStringToSeed('b'));
  });

  it('should return a non-negative integer', () => {
    const seed = hashStringToSeed('test');
    expect(Number.isInteger(seed)).toBe(true);
    expect(seed).toBeGreaterThanOrEqual(0);
  });
}); 
