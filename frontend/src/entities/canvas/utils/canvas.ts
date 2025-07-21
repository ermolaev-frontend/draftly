import { BASE_PALETTE } from 'shared/types/colors';
import { Shape } from 'entities/canvas/classes/Shape.ts';

import { Rectangle } from '../classes/Rectangle';
import { Circle } from '../classes/Circle';
import { Line } from '../classes/Line';
import { Pencil } from '../classes/Pencil';

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
  const colors = BASE_PALETTE;

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

export function getInitialShapes (canvas: HTMLCanvasElement, shapesCount: number): Shape[] {
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

  const shapes: Shape[] = [];

  for (let i = 0; i < shapesCount; i++) {
    const zone = zones[i % zones.length];
    const typeRand = Math.random();
    let newShape: Shape;

    if (typeRand < 0.25) {
      // Rectangle
      newShape = new Rectangle({
        x: getRandom(zone.xMin, zone.xMax - 120),
        y: getRandom(zone.yMin, zone.yMax - 100),
        width: getRandom(100, Math.min(180, zone.xMax - zone.xMin)),
        height: getRandom(80, Math.min(140, zone.yMax - zone.yMin)),
        color: getRandomColor(),
        strokeWidth: getRandom(3, 6, true),
        rotation: 0,
      });
    } else if (typeRand < 0.5) {
      // Circle
      newShape = new Circle({
        x: getRandom(zone.xMin + 60, zone.xMax - 60),
        y: getRandom(zone.yMin + 60, zone.yMax - 60),
        radius: getRandom(
          40,
          Math.min(80, (zone.xMax - zone.xMin) / 2, (zone.yMax - zone.yMin) / 2),
        ),
        color: getRandomColor(),
        strokeWidth: getRandom(3, 6, true),
      });
    } else if (typeRand < 0.75) {
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
        color: getRandomColor(),
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
        color: getRandomColor(),
        strokeWidth: getRandom(3, 6),
        points,
      });
    }

    shapes.push(newShape);
  }

  return shapes;
}
