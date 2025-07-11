import type { Bounds, Point } from 'shared/types/canvas';

// 1. Rotate a point around a center by an angle
export const rotatePoint = (px: number, py: number, cx: number, cy: number, angle: number): Point => {
  const dx = px - cx;
  const dy = py - cy;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: cos * dx - sin * dy + cx,
    y: sin * dx + cos * dy + cy,
  };
};

// 2. Check if a point is inside an axis-aligned rectangle (AABB)
export const isPointInRect = (px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean => {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
};

// 3. Check if a point is inside a circle
export const isPointInCircle = (px: number, py: number, cx: number, cy: number, r: number): boolean => {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
};

// 4. Distance from a point to a segment
export const pointToSegmentDistance = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    // The segment is degenerate (a point)
    return Math.hypot(px - x1, py - y1);
  }
  const t = Math.max(
    0,
    Math.min(
      1,
      ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy),
    ),
  );
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  return Math.hypot(px - closestX, py - closestY);
};

// 5. Check if a point is near a segment (with threshold)
export const isPointNearSegment = (
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold: number,
): boolean => {
  return pointToSegmentDistance(px, py, x1, y1, x2, y2) <= threshold;
};

// 6. Get the center of a rectangle
export const getRectCenter = (x: number, y: number, width: number, height: number): Point => {
  return {
    x: x + width / 2,
    y: y + height / 2,
  };
};

// 7. Scale a point relative to a rectangle
export const scalePointInRect = (
  pt: Point,
  bounds: Bounds,
  newBounds: Bounds,
): Point => {
  const relX = (pt.x - bounds.x) / bounds.width;
  const relY = (pt.y - bounds.y) / bounds.height;
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
export const translatePoint = (pt: Point, dx: number, dy: number): Point => {
  return { x: pt.x + dx, y: pt.y + dy };
};

// 11. Convert point to local coordinates relative to center with rotation
export const toLocalRotatedCoords = (px: number, py: number, cx: number, cy: number, angle: number): Point => {
  const dx = px - cx;
  const dy = py - cy;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: cos * dx - sin * dy,
    y: sin * dx + cos * dy,
  };
}; 
