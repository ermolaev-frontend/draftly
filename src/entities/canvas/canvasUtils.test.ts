/* eslint-env jest */

import { catmullRom2bezier, simplifyDouglasPeucker } from './canvasUtils';

describe('catmullRom2bezier', () => {
  it('returns empty array for less than 2 points', () => {
    expect(catmullRom2bezier([])).toEqual([]);
    expect(catmullRom2bezier([{ x: 0, y: 0 }])).toEqual([]);
  });

  it('converts 2 points to a single bezier segment', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    const result = catmullRom2bezier(points);

    expect(result).toHaveLength(1);
    expect(result[0].start).toEqual(points[0]);
    expect(result[0].end).toEqual(points[1]);
    expect(result[0].cp1).toHaveProperty('x');
    expect(result[0].cp2).toHaveProperty('y');
  });

  it('converts multiple points to bezier segments', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 0 },
      { x: 30, y: 10 },
    ];

    const result = catmullRom2bezier(points);

    expect(result.length).toBe(points.length - 1);

    result.forEach(seg => {
      expect(seg).toHaveProperty('start');
      expect(seg).toHaveProperty('cp1');
      expect(seg).toHaveProperty('cp2');
      expect(seg).toHaveProperty('end');
    });
  });
});

describe('simplifyDouglasPeucker', () => {
  it('returns original points if less than 3', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ];

    expect(simplifyDouglasPeucker(points, 1)).toEqual(points);
  });

  it('simplifies a straight line to endpoints', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 5 },
      { x: 10, y: 10 },
    ];

    expect(simplifyDouglasPeucker(points, 0.1)).toEqual([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ]);
  });

  it('keeps points with sufficient distance', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 5, y: 10 }, // far from the line
      { x: 10, y: 0 },
    ];

    const simplified = simplifyDouglasPeucker(points, 1);

    expect(simplified).toContainEqual({ x: 5, y: 10 });
    expect(simplified[0]).toEqual({ x: 0, y: 0 });
    expect(simplified[simplified.length - 1]).toEqual({ x: 10, y: 0 });
  });
}); 
