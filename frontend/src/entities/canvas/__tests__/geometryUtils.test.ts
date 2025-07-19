import type { Bounds, Point } from 'shared/types/canvas';

import {
  getRotatedPoint,
  isPointInRect,
  isPointInCircle,
  getPointToSegmentDistance,
  isPointNearSegment,
  getRectCenter,
  getScaledPointInRect,
  getDistanceBetweenPoints,
  getAngleBetweenPoints,
  getTranslatedPoint,
  getLocalRotatedCoords,
} from '../geometryUtils';

describe('geometryUtils', () => {
  describe('getRotatedPoint', () => {
    it('should rotate point around center', () => {
      const point: Point = { x: 2, y: 0 };
      const center: Point = { x: 0, y: 0 };
      const angle = Math.PI / 2; // 90 degrees

      const result = getRotatedPoint(point, center, angle);

      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(2, 5);
    });

    it('should rotate point around arbitrary center', () => {
      const point: Point = { x: 3, y: 1 };
      const center: Point = { x: 1, y: 1 };
      const angle = Math.PI; // 180 degrees

      const result = getRotatedPoint(point, center, angle);

      expect(result.x).toBeCloseTo(-1, 5);
      expect(result.y).toBeCloseTo(1, 5);
    });

    it('should return local coordinates when local=true', () => {
      const point: Point = { x: 2, y: 0 };
      const center: Point = { x: 1, y: 1 };
      const angle = Math.PI / 2; // 90 degrees

      const result = getRotatedPoint(point, center, angle, true);

      expect(result.x).toBeCloseTo(1, 5);
      expect(result.y).toBeCloseTo(1, 5);
    });

    it('should handle zero angle', () => {
      const point: Point = { x: 2, y: 3 };
      const center: Point = { x: 0, y: 0 };
      const angle = 0;

      const result = getRotatedPoint(point, center, angle);

      expect(result.x).toBe(2);
      expect(result.y).toBe(3);
    });
  });

  describe('isPointInRect', () => {
    const rect: Bounds = { x: 0, y: 0, width: 10, height: 10 };

    it('should return true for point inside rectangle', () => {
      const point: Point = { x: 5, y: 5 };
      expect(isPointInRect(point, rect)).toBe(true);
    });

    it('should return true for point on rectangle edge', () => {
      const point: Point = { x: 0, y: 0 };
      expect(isPointInRect(point, rect)).toBe(true);
    });

    it('should return true for point on rectangle corner', () => {
      const point: Point = { x: 10, y: 10 };
      expect(isPointInRect(point, rect)).toBe(true);
    });

    it('should return false for point outside rectangle', () => {
      const point: Point = { x: 15, y: 15 };
      expect(isPointInRect(point, rect)).toBe(false);
    });

    it('should return false for point outside on x-axis', () => {
      const point: Point = { x: 15, y: 5 };
      expect(isPointInRect(point, rect)).toBe(false);
    });

    it('should return false for point outside on y-axis', () => {
      const point: Point = { x: 5, y: 15 };
      expect(isPointInRect(point, rect)).toBe(false);
    });
  });

  describe('isPointInCircle', () => {
    const center: Point = { x: 0, y: 0 };
    const radius = 5;

    it('should return true for point inside circle', () => {
      const point: Point = { x: 3, y: 3 };
      expect(isPointInCircle(point, center, radius)).toBe(true);
    });

    it('should return true for point on circle edge', () => {
      const point: Point = { x: 5, y: 0 };
      expect(isPointInCircle(point, center, radius)).toBe(true);
    });

    it('should return false for point outside circle', () => {
      const point: Point = { x: 6, y: 6 };
      expect(isPointInCircle(point, center, radius)).toBe(false);
    });

    it('should return true for point at center', () => {
      const point: Point = { x: 0, y: 0 };
      expect(isPointInCircle(point, center, radius)).toBe(true);
    });
  });

  describe('getPointToSegmentDistance', () => {
    it('should return distance to segment endpoint when point is closest to start', () => {
      const point: Point = { x: 0, y: 0 };
      const start: Point = { x: 1, y: 1 };
      const end: Point = { x: 10, y: 10 };

      const distance = getPointToSegmentDistance(point, start, end);
      const expectedDistance = Math.hypot(1, 1);

      expect(distance).toBeCloseTo(expectedDistance, 5);
    });

    it('should return distance to segment endpoint when point is closest to end', () => {
      const point: Point = { x: 15, y: 15 };
      const start: Point = { x: 1, y: 1 };
      const end: Point = { x: 10, y: 10 };

      const distance = getPointToSegmentDistance(point, start, end);
      const expectedDistance = Math.hypot(5, 5);

      expect(distance).toBeCloseTo(expectedDistance, 5);
    });

    it('should return distance to point on segment', () => {
      const point: Point = { x: 5, y: 0 };
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };

      const distance = getPointToSegmentDistance(point, start, end);
      expect(distance).toBe(0);
    });

    it('should handle zero-length segment', () => {
      const point: Point = { x: 1, y: 1 };
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 0, y: 0 };

      const distance = getPointToSegmentDistance(point, start, end);
      const expectedDistance = Math.hypot(1, 1);

      expect(distance).toBeCloseTo(expectedDistance, 5);
    });

    it('should handle vertical segment', () => {
      const point: Point = { x: 1, y: 5 };
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 0, y: 10 };

      const distance = getPointToSegmentDistance(point, start, end);
      expect(distance).toBe(1);
    });

    it('should handle horizontal segment', () => {
      const point: Point = { x: 5, y: 1 };
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };

      const distance = getPointToSegmentDistance(point, start, end);
      expect(distance).toBe(1);
    });
  });

  describe('isPointNearSegment', () => {
    it('should return true when point is within threshold', () => {
      const point: Point = { x: 5, y: 1 };
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };
      const threshold = 2;

      expect(isPointNearSegment(point, start, end, threshold)).toBe(true);
    });

    it('should return false when point is outside threshold', () => {
      const point: Point = { x: 5, y: 3 };
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };
      const threshold = 2;

      expect(isPointNearSegment(point, start, end, threshold)).toBe(false);
    });

    it('should return true when point is exactly at threshold distance', () => {
      const point: Point = { x: 5, y: 2 };
      const start: Point = { x: 0, y: 0 };
      const end: Point = { x: 10, y: 0 };
      const threshold = 2;

      expect(isPointNearSegment(point, start, end, threshold)).toBe(true);
    });
  });

  describe('getRectCenter', () => {
    it('should return center of rectangle', () => {
      const rect: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const center = getRectCenter(rect);

      expect(center.x).toBe(5);
      expect(center.y).toBe(5);
    });

    it('should handle rectangle with non-zero origin', () => {
      const rect: Bounds = { x: 5, y: 10, width: 20, height: 30 };
      const center = getRectCenter(rect);

      expect(center.x).toBe(15);
      expect(center.y).toBe(25);
    });

    it('should handle rectangle with odd dimensions', () => {
      const rect: Bounds = { x: 0, y: 0, width: 11, height: 7 };
      const center = getRectCenter(rect);

      expect(center.x).toBe(5.5);
      expect(center.y).toBe(3.5);
    });
  });

  describe('getScaledPointInRect', () => {
    it('should scale point from one rectangle to another', () => {
      const point: Point = { x: 5, y: 5 };
      const bounds: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const newBounds: Bounds = { x: 0, y: 0, width: 20, height: 20 };

      const result = getScaledPointInRect(point, bounds, newBounds);

      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
    });

    it('should handle rectangles with different origins', () => {
      const point: Point = { x: 5, y: 5 };
      const bounds: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const newBounds: Bounds = { x: 10, y: 20, width: 20, height: 20 };

      const result = getScaledPointInRect(point, bounds, newBounds);

      expect(result.x).toBe(20);
      expect(result.y).toBe(30);
    });

    it('should handle point at rectangle corner', () => {
      const point: Point = { x: 10, y: 10 };
      const bounds: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const newBounds: Bounds = { x: 0, y: 0, width: 20, height: 20 };

      const result = getScaledPointInRect(point, bounds, newBounds);

      expect(result.x).toBe(20);
      expect(result.y).toBe(20);
    });

    it('should handle point at rectangle center', () => {
      const point: Point = { x: 5, y: 5 };
      const bounds: Bounds = { x: 0, y: 0, width: 10, height: 10 };
      const newBounds: Bounds = { x: 0, y: 0, width: 20, height: 20 };

      const result = getScaledPointInRect(point, bounds, newBounds);

      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
    });
  });

  describe('getDistanceBetweenPoints', () => {
    it('should calculate distance between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 3, y: 4 };

      const distance = getDistanceBetweenPoints(p1, p2);
      expect(distance).toBe(5);
    });

    it('should return zero for same points', () => {
      const p1: Point = { x: 5, y: 5 };
      const p2: Point = { x: 5, y: 5 };

      const distance = getDistanceBetweenPoints(p1, p2);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const p1: Point = { x: -3, y: -4 };
      const p2: Point = { x: 0, y: 0 };

      const distance = getDistanceBetweenPoints(p1, p2);
      expect(distance).toBe(5);
    });
  });

  describe('getAngleBetweenPoints', () => {
    it('should calculate angle between two points', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 1, y: 1 };

      const angle = getAngleBetweenPoints(p1, p2);
      expect(angle).toBeCloseTo(Math.PI / 4, 5);
    });

    it('should handle horizontal line', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 1, y: 0 };

      const angle = getAngleBetweenPoints(p1, p2);
      expect(angle).toBe(0);
    });

    it('should handle vertical line', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 0, y: 1 };

      const angle = getAngleBetweenPoints(p1, p2);
      expect(angle).toBeCloseTo(Math.PI / 2, 5);
    });

    it('should handle negative angle', () => {
      const p1: Point = { x: 0, y: 0 };
      const p2: Point = { x: 1, y: -1 };

      const angle = getAngleBetweenPoints(p1, p2);
      expect(angle).toBeCloseTo(-Math.PI / 4, 5);
    });
  });

  describe('getTranslatedPoint', () => {
    it('should translate point by given offsets', () => {
      const point: Point = { x: 5, y: 5 };
      const dx = 3;
      const dy = -2;

      const result = getTranslatedPoint(point, dx, dy);

      expect(result.x).toBe(8);
      expect(result.y).toBe(3);
    });

    it('should handle zero translation', () => {
      const point: Point = { x: 5, y: 5 };
      const dx = 0;
      const dy = 0;

      const result = getTranslatedPoint(point, dx, dy);

      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it('should handle negative translation', () => {
      const point: Point = { x: 5, y: 5 };
      const dx = -3;
      const dy = -4;

      const result = getTranslatedPoint(point, dx, dy);

      expect(result.x).toBe(2);
      expect(result.y).toBe(1);
    });
  });

  describe('getLocalRotatedCoords', () => {
    it('should return local rotated coordinates', () => {
      const point: Point = { x: 2, y: 0 };
      const center: Point = { x: 1, y: 1 };
      const angle = Math.PI / 2; // 90 degrees

      const result = getLocalRotatedCoords(point, center, angle);

      expect(result.x).toBeCloseTo(1, 5);
      expect(result.y).toBeCloseTo(1, 5);
    });

    it('should be equivalent to getRotatedPoint with local=true', () => {
      const point: Point = { x: 3, y: 2 };
      const center: Point = { x: 1, y: 1 };
      const angle = Math.PI / 4; // 45 degrees

      const result1 = getLocalRotatedCoords(point, center, angle);
      const result2 = getRotatedPoint(point, center, angle, true);

      expect(result1.x).toBeCloseTo(result2.x, 5);
      expect(result1.y).toBeCloseTo(result2.y, 5);
    });
  });
}); 
