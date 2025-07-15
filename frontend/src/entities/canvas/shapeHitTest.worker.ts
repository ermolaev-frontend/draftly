// shapeHitTest.worker.ts
import type { Point } from 'shared/types/canvas';

// Упрощённые типы для передачи в воркер
export type ShapeData =
  | { type: 'rectangle'; x: number; y: number; width: number; height: number; rotation?: number }
  | { type: 'circle'; x: number; y: number; radius: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'pencil'; points: Point[] };

export interface HitTestRequest {
  point: Point;
  shapes: ShapeData[];
}

export interface HitTestResponse {
  hitIndex: number; // индекс первой фигуры, в которую попала точка, либо -1
}

function isPointInRectangle(
  { x, y }: Point,
  rect: { x: number; y: number; width: number; height: number; rotation?: number },
): boolean {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const angle = -(rect.rotation ?? 0);
  const dx = x - cx,
    dy = y - cy;
  const lx = Math.cos(angle) * dx - Math.sin(angle) * dy;
  const ly = Math.sin(angle) * dx + Math.cos(angle) * dy;
  return (
    lx >= -rect.width / 2 &&
    lx <= rect.width / 2 &&
    ly >= -rect.height / 2 &&
    ly <= rect.height / 2
  );
}

function isPointInCircle(
  { x, y }: Point,
  circle: { x: number; y: number; radius: number },
): boolean {
  const dx = x - circle.x,
    dy = y - circle.y;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

function isPointInLine(
  { x, y }: Point,
  line: { x1: number; y1: number; x2: number; y2: number },
): boolean {
  const { x1, y1, x2, y2 } = line;
  const dxToStart = x - x1;
  const dyToStart = y - y1;
  const lineDx = x2 - x1;
  const lineDy = y2 - y1;
  const projection = dxToStart * lineDx + dyToStart * lineDy;
  const lineLengthSq = lineDx * lineDx + lineDy * lineDy;
  let t = lineLengthSq ? projection / lineLengthSq : -1;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * lineDx;
  const closestY = y1 + t * lineDy;
  const sqDistance = (x - closestX) ** 2 + (y - closestY) ** 2;
  return sqDistance < 64;
}

function isPointInPencil(
  { x, y }: Point,
  pencil: { points: Point[] },
): boolean {
  const points = pencil.points;
  if (!points || points.length < 2) return false;
  for (let i = 1; i < points.length; i++) {
    const xStart = points[i - 1].x,
      yStart = points[i - 1].y;
    const xEnd = points[i].x,
      yEnd = points[i].y;
    const dxToStart = x - xStart;
    const dyToStart = y - yStart;
    const segmentDx = xEnd - xStart;
    const segmentDy = yEnd - yStart;
    const projection = dxToStart * segmentDx + dyToStart * segmentDy;
    const segmentLengthSq = segmentDx * segmentDx + segmentDy * segmentDy;
    let t = segmentLengthSq ? projection / segmentLengthSq : -1;
    t = Math.max(0, Math.min(1, t));
    const closestX = xStart + t * segmentDx;
    const closestY = yStart + t * segmentDy;
    const sqDistance = (x - closestX) ** 2 + (y - closestY) ** 2;
    if (sqDistance < 64) return true;
  }
  return false;
}

self.onmessage = function (e: MessageEvent<HitTestRequest>) {
  console.log('[Worker] received', e.data);
  const { point, shapes } = e.data;
  let hitIndex = -1;
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    let hit = false;
    switch (shape.type) {
      case 'rectangle':
        hit = isPointInRectangle(point, shape);
        break;
      case 'circle':
        hit = isPointInCircle(point, shape);
        break;
      case 'line':
        hit = isPointInLine(point, shape);
        break;
      case 'pencil':
        hit = isPointInPencil(point, shape);
        break;
    }
    if (hit) {
      hitIndex = i;
      break;
    }
  }
  const response: HitTestResponse = { hitIndex };
  console.log('[Worker] postMessage', response);
  postMessage(response);
}; 