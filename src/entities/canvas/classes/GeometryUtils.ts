import type { Point } from 'shared/types/canvas';

export class GeometryUtils {
  /**
   * Calculate distance between two points
   */
  static distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance between two points (faster when you only need comparison)
   */
  static distanceSquared(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;

    return dx * dx + dy * dy;
  }

  /**
   * Rotate a point around another point by given angle (in radians)
   */
  static rotatePoint(point: Point, center: Point, angle: number): Point {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = point.x - center.x;
    const dy = point.y - center.y;

    return {
      x: center.x + dx * cos - dy * sin,
      y: center.y + dx * sin + dy * cos,
    };
  }

  /**
   * Transform point by rotation (inverse transform for hit testing)
   */
  static inverseRotatePoint(point: Point, center: Point, angle: number): Point {
    return GeometryUtils.rotatePoint(point, center, -angle);
  }

  /**
   * Check if point is inside a rotated rectangle
   */
  static isPointInRotatedRect(point: Point, center: Point, width: number, height: number, rotation: number): boolean {
    const local = GeometryUtils.inverseRotatePoint(point, center, rotation);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    return (
      local.x >= center.x - halfWidth &&
      local.x <= center.x + halfWidth &&
      local.y >= center.y - halfHeight &&
      local.y <= center.y + halfHeight
    );
  }

  /**
   * Calculate the closest point on a line segment to a given point
   */
  static closestPointOnLine(point: Point, lineStart: Point, lineEnd: Point): Point {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const length = dx * dx + dy * dy;

    if (length === 0) return lineStart;

    const t = Math.max(0, Math.min(1, 
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / length,
    ));

    return {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };
  }

  /**
   * Check if point is inside circle
   */
  static isPointInCircle(point: Point, center: Point, radius: number): boolean {
    return GeometryUtils.distanceSquared(point, center) <= radius * radius;
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Get angle between two points
   */
  static angle(from: Point, to: Point): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }
}
