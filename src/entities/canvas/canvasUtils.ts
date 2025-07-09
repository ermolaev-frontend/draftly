import type { Point, IShape } from 'shared/types/canvas';

import { Rectangle } from './classes/Rectangle';
import { Circle } from './classes/Circle';
import { Line } from './classes/Line';
import { Pencil } from './classes/Pencil';
import { Ellipse } from './classes/Ellipse';

export function catmullRom2bezier(
  points: Point[],
): Array<{
  start: Point;
  cp1: Point;
  cp2: Point;
  end: Point;
}> {
  if (points.length < 2) return [];
  const beziers = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1] || points[i];
    const p3 = points[i + 2] || p2;

    // Catmull-Rom to Bezier conversion
    const cp1 = {
      x: p1.x + (p2.x - p0.x) / 6,
      y: p1.y + (p2.y - p0.y) / 6,
    };

    const cp2 = {
      x: p2.x - (p3.x - p1.x) / 6,
      y: p2.y - (p3.y - p1.y) / 6,
    };

    beziers.push({
      start: { x: p1.x, y: p1.y },
      cp1,
      cp2,
      end: { x: p2.x, y: p2.y },
    });
  }

  return beziers;
}

export function simplifyDouglasPeucker(
  points: Point[],
  epsilon: number,
): Point[] {
  if (points.length < 3) return points;
  const dmax = { dist: 0, idx: 0 };

  const sq = (
    a: Point,
    b: Point,
  ) => (
    (a.x - b.x) ** 2 + (a.y - b.y) ** 2
  );

  function getPerpendicularDistance(
    pt: Point,
    lineStart: Point,
    lineEnd: Point,
  ): number {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    if (dx === 0 && dy === 0) return Math.sqrt(sq(pt, lineStart));

    const t =
      ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) /
      (dx * dx + dy * dy);

    const proj = {
      x: lineStart.x + t * dx,
      y: lineStart.y + t * dy,
    };

    return Math.sqrt(sq(pt, proj));
  }

  for (let i = 1; i < points.length - 1; i++) {
    const d = getPerpendicularDistance(points[i], points[0], points[points.length - 1]);

    if (d > dmax.dist) {
      dmax.dist = d;
      dmax.idx = i;
    }
  }

  if (dmax.dist > epsilon) {
    const rec1 = simplifyDouglasPeucker(points.slice(0, dmax.idx + 1), epsilon);
    const rec2 = simplifyDouglasPeucker(points.slice(dmax.idx), epsilon);

    return rec1.slice(0, -1).concat(rec2);
  } else {
    return [points[0], points[points.length - 1]];
  }
}

export function hashStringToSeed(str: string): number {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return Math.abs(hash);
}

export function generateId(): string {
  if (crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2) + '-' + Date.now();
}

export function getRandomColor(): string {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

  return colors[Math.floor(Math.random() * colors.length)];
}
  
export function getRandomStrokeWidth(): number {
  return getRandomFromArray([3, 4, 5]);
}

export function getRandom(min: number, max: number, int = false): number {
  const rand = Math.random() * (max - min) + min;

  return int ? Math.floor(rand) : rand;
}

export function getRandomFromArray<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Array must not be empty');
  }

  const idx = Math.floor(Math.random() * arr.length);
  
  return arr[idx];
}

export function getInitialShapes (canvas: HTMLCanvasElement, shapesCount: number): IShape[] {
  const margin = 40; // inner margin for shapes
  const zoneRows = 6;
  const zoneCols = 6;
  const zoneWidth = (canvas.width - 2 * margin) / zoneCols;
  const zoneHeight = (canvas.height - 2 * margin) / zoneRows;
  const zones = [];

  for (let row = 0; row < zoneRows; row++) {
    for (let col = 0; col < zoneCols; col++) {
      zones.push({
        xMin: margin + col * zoneWidth,
        xMax: margin + (col + 1) * zoneWidth,
        yMin: margin + row * zoneHeight,
        yMax: margin + (row + 1) * zoneHeight,
      });
    }
  }

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
  const shapes = [];

  for (let i = 0; i < shapesCount; i++) {
    const zone = zones[i % zones.length];
    const typeRand = Math.random();
    let newShape: IShape;

    if (typeRand < 0.2) {
      // Rectangle
      newShape = new Rectangle({
        x: getRandom(zone.xMin, zone.xMax - 120),
        y: getRandom(zone.yMin, zone.yMax - 100),
        width: getRandom(100, Math.min(180, zone.xMax - zone.xMin)),
        height: getRandom(80, Math.min(140, zone.yMax - zone.yMin)),
        color: colors[Math.floor(getRandom(0, colors.length))],
        strokeWidth: getRandom(3, 6, true),
        rotation: 0,
      });
    } else if (typeRand < 0.4) {
      // Circle
      newShape = new Circle({
        x: getRandom(zone.xMin + 60, zone.xMax - 60),
        y: getRandom(zone.yMin + 60, zone.yMax - 60),
        radius: getRandom(
          40,
          Math.min(80, (zone.xMax - zone.xMin) / 2, (zone.yMax - zone.yMin) / 2),
        ),
        color: colors[Math.floor(getRandom(0, colors.length))],
        strokeWidth: getRandom(3, 6, true),
      });
    } else if (typeRand < 0.6) {
      // Ellipse
      newShape = new Ellipse({
        x: getRandom(zone.xMin + 60, zone.xMax - 60),
        y: getRandom(zone.yMin + 60, zone.yMax - 60),
        radiusX: getRandom(30, Math.min(90, (zone.xMax - zone.xMin) / 2)),
        radiusY: getRandom(20, Math.min(60, (zone.yMax - zone.yMin) / 2)),
        color: colors[Math.floor(getRandom(0, colors.length))],
        strokeWidth: getRandom(3, 6, true),
        rotation: getRandom(0, Math.PI * 2),
      });
    } else if (typeRand < 0.8) {
      // Line
      const cx = (zone.xMin + zone.xMax) / 2;
      const cy = (zone.yMin + zone.yMax) / 2;

      const length = getRandom(
        80,
        Math.min(zone.xMax - zone.xMin, zone.yMax - zone.yMin) - 20,
      );

      const angle = getRandom(0, Math.PI * 2);
      const x1 = cx - Math.cos(angle) * length / 2;
      const y1 = cy - Math.sin(angle) * length / 2;
      const x2 = cx + Math.cos(angle) * length / 2;
      const y2 = cy + Math.sin(angle) * length / 2;

      newShape = new Line({
        x1, y1, x2, y2,
        color: colors[Math.floor(getRandom(0, colors.length))],
        strokeWidth: getRandom(3, 6, true),
      });
    } else {
      // Pencil
      const numPoints = Math.floor(getRandom(5, 20));
      const points = [];
      let px = getRandom(zone.xMin + 10, zone.xMax - 10);
      let py = getRandom(zone.yMin + 10, zone.yMax - 10);
      points.push({ x: px, y: py });

      for (let p = 1; p < numPoints; p++) {
        px += getRandom(-20, 20);
        py += getRandom(-20, 20);
        px = Math.max(zone.xMin + 5, Math.min(zone.xMax - 5, px));
        py = Math.max(zone.yMin + 5, Math.min(zone.yMax - 5, py));
        points.push({ x: px, y: py });
      }

      newShape = new Pencil({
        color: colors[Math.floor(getRandom(0, colors.length))],
        strokeWidth: getRandom(3, 6),
        points,
      });
    }

    shapes.push(newShape);
  }

  return shapes;
}
