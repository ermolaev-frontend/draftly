// geometryUtils.ts
import type { Point } from 'shared/types/canvas';

// 1. Преобразование точки с учётом поворота
export function rotatePoint(px: number, py: number, cx: number, cy: number, angle: number): { x: number, y: number } {
  const dx = px - cx;
  const dy = py - cy;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: cos * dx - sin * dy + cx,
    y: sin * dx + cos * dy + cy,
  };
}

// 2. Проверка попадания точки в прямоугольник (AABB)
export function isPointInRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number): boolean {
  return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// 3. Проверка попадания точки в круг
export function isPointInCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

// 4. Расстояние от точки до отрезка
export function pointToSegmentDistance(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) {
    // Отрезок вырожден в точку
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
}

// 5. Проверка близости точки к отрезку (с порогом)
export function isPointNearSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  threshold: number,
): boolean {
  return pointToSegmentDistance(px, py, x1, y1, x2, y2) <= threshold;
}

// 6. Получение центра прямоугольника
export function getRectCenter(x: number, y: number, width: number, height: number): { x: number, y: number } {
  return {
    x: x + width / 2,
    y: y + height / 2,
  };
}

// 7. Масштабирование точки относительно прямоугольника
export function scalePointInRect(
  pt: Point,
  bounds: { x: number; y: number; width: number; height: number },
  newBounds: { x: number; y: number; width: number; height: number },
): Point {
  const relX = (pt.x - bounds.x) / bounds.width;
  const relY = (pt.y - bounds.y) / bounds.height;
  return {
    x: newBounds.x + relX * newBounds.width,
    y: newBounds.y + relY * newBounds.height,
  };
}

// 8. Расстояние между двумя точками
export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

// 9. Вычисление угла между двумя точками (от p1 к p2)
export function angleBetweenPoints(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

// 10. Смещение точки на дельту
export function translatePoint(pt: Point, dx: number, dy: number): Point {
  return { x: pt.x + dx, y: pt.y + dy };
} 
