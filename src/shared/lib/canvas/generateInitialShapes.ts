import type { Shape } from '../../../shared/types/canvas';

export function generateInitialShapes(canvasWidth: number, canvasHeight: number): Shape[] {
  // Dynamically divide the canvas into 6 zones (2 columns x 3 rows)
  const colWidth = canvasWidth / 2;
  const rowHeight = canvasHeight / 3;
  
  const zones = [
    { xMin: 0, xMax: colWidth, yMin: 0, yMax: rowHeight },
    { xMin: colWidth, xMax: canvasWidth, yMin: 0, yMax: rowHeight },
    { xMin: 0, xMax: colWidth, yMin: rowHeight, yMax: rowHeight * 2 },
    { xMin: colWidth, xMax: canvasWidth, yMin: rowHeight, yMax: rowHeight * 2 },
    { xMin: 0, xMax: colWidth, yMin: rowHeight * 2, yMax: canvasHeight },
    { xMin: colWidth, xMax: canvasWidth, yMin: rowHeight * 2, yMax: canvasHeight },
  ];

  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

  function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function getRandomColor() {
    return colors[Math.floor(getRandom(0, colors.length))];
  }

  function getRandomStrokeWidth() {
    return getRandom(2, 5);
  }

  function createRectangle(zone: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape {
    return {
      id: crypto.randomUUID(),
      type: 'rectangle',
      color: getRandomColor(),
      strokeWidth: getRandomStrokeWidth(),
      selected: false,
      x: getRandom(zone.xMin, zone.xMax - 120),
      y: getRandom(zone.yMin, zone.yMax - 100),
      width: getRandom(100, Math.min(180, zone.xMax - zone.xMin)),
      height: getRandom(80, Math.min(140, zone.yMax - zone.yMin)),
      rotation: 0
    };
  }

  function createCircle(zone: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape {
    return {
      id: crypto.randomUUID(),
      type: 'circle',
      color: getRandomColor(),
      strokeWidth: getRandomStrokeWidth(),
      selected: false,
      x: getRandom(zone.xMin + 60, zone.xMax - 60),
      y: getRandom(zone.yMin + 60, zone.yMax - 60),
      radius: getRandom(40, Math.min(80, (zone.xMax - zone.xMin) / 2, (zone.yMax - zone.yMin) / 2))
    };
  }

  function createLine(zone: { xMin: number; xMax: number; yMin: number; yMax: number }): Shape {
    const cx = (zone.xMin + zone.xMax) / 2;
    const cy = (zone.yMin + zone.yMax) / 2;
    const length = getRandom(80, Math.min(zone.xMax - zone.xMin, zone.yMax - zone.yMin) - 20);
    const angle = getRandom(0, Math.PI * 2);
    const x1 = cx - Math.cos(angle) * length / 2;
    const y1 = cy - Math.sin(angle) * length / 2;
    const x2 = cx + Math.cos(angle) * length / 2;
    const y2 = cy + Math.sin(angle) * length / 2;
    return {
      id: crypto.randomUUID(),
      type: 'line',
      color: getRandomColor(),
      strokeWidth: getRandomStrokeWidth(),
      selected: false,
      x1, y1, x2, y2
    };
  }
  
  // Use helpers to create shapes
  const rect1 = createRectangle(zones[0]);
  const rect2 = createRectangle(zones[1]);
  const circle1 = createCircle(zones[2]);
  const circle2 = createCircle(zones[3]);
  const line1 = createLine(zones[4]);
  const line2 = createLine(zones[5]);
  return [rect1, rect2, circle1, circle2, line1, line2];
} 