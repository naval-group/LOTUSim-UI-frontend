import { describe, it, expect } from 'vitest';
import { radToDeg } from './index';

describe('radToDeg', () => {
  it('converts 0 radians to 0 degrees', () => {
    expect(radToDeg(0)).toBe(0);
  });

  it('converts π to 180 degrees', () => {
    expect(radToDeg(Math.PI)).toBeCloseTo(180);
  });

  it('converts 2π to 360 degrees', () => {
    expect(radToDeg(2 * Math.PI)).toBeCloseTo(360);
  });

  it('converts π/2 to 90 degrees', () => {
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
  });

  it('converts negative radians', () => {
    expect(radToDeg(-Math.PI)).toBeCloseTo(-180);
  });
});
