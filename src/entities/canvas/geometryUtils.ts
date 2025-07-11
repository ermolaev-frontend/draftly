import type { Bounds, Point } from 'shared/types/canvas';

// 1. Rotate a point around a center by an angle
export const rotatePoint = (point: Point, center: Point, angle: number, local = false): Point => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const rotatedX = cos * dx - sin * dy;
  const rotatedY = sin * dx + cos * dy;
  
  return local 
    ? { x: rotatedX, y: rotatedY }
    : { x: rotatedX + center.x, y: rotatedY + center.y };
};

// 2. Check if a point is inside an axis-aligned rectangle (AABB)
export const isPointInRect = (point: Point, rect: Bounds): boolean => {
  return point.x >= rect.x && point.x <= rect.x + rect.width && 
         point.y >= rect.y && point.y <= rect.y + rect.height;
};

// 3. Check if a point is inside a circle
export const isPointInCircle = (point: Point, center: Point, radius: number): boolean => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
};

// 4. Distance from a point to a segment
export const pointToSegmentDistance = (point: Point, start: Point, end: Point): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) {
    // The segment is degenerate (a point)
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy),
    ),
  );
  const closestX = start.x + t * dx;
  const closestY = start.y + t * dy;
  return Math.hypot(point.x - closestX, point.y - closestY);
};

// 5. Check if a point is near a segment (with threshold)
export const isPointNearSegment = (point: Point, start: Point, end: Point, threshold: number): boolean => {
  return pointToSegmentDistance(point, start, end) <= threshold;
};

// 6. Get the center of a rectangle
export const getRectCenter = (rect: Bounds): Point => {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
};

// 7. Scale a point relative to a rectangle
export const scalePointInRect = (point: Point, bounds: Bounds, newBounds: Bounds): Point => {
  const relX = (point.x - bounds.x) / bounds.width;
  const relY = (point.y - bounds.y) / bounds.height;
  return {
    x: newBounds.x + relX * newBounds.width,
    y: newBounds.y + relY * newBounds.height,
  };
};

// 8. Distance between two points
export const distance = (p1: Point, p2: Point): number => {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};

// 9. Angle between two points (from p1 to p2)
export const angleBetweenPoints = (p1: Point, p2: Point): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
};

// 10. Translate a point by delta
export const translatePoint = (point: Point, dx: number, dy: number): Point => {
  return { x: point.x + dx, y: point.y + dy };
};

// 11. Convert point to local coordinates relative to center with rotation (alias for convenience)
export const toLocalRotatedCoords = (point: Point, center: Point, angle: number): Point => {
  return rotatePoint(point, center, angle, true);
}; 
