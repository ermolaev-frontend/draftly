import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

import type { Bounds, Point, IShape } from 'shared/types/canvas';

import { generateId } from '../canvasUtils';
import { pointToSegmentDistance, scalePointInRect } from '../geometryUtils';

export class Pencil implements IShape {
  readonly type = 'pencil';
  readonly color: string;
  readonly strokeWidth: number;
  readonly id: string;
  readonly points: Point[];

  constructor(shape: Partial<Pencil>) {
    this.id = generateId();
    this.color = shape.color ?? 'red';
    this.strokeWidth = shape.strokeWidth ?? 1;
    this.points = shape.points ?? [];
  }

  patch(shape: Partial<Pencil>) {
    Object.assign(this, shape);
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: { x: mouse.x, y: mouse.y },
      initialPoints: this.points.map(pt => ({ ...pt })),
    });
  }

  startDrawing(interaction: Interaction): void {
    interaction.patch({
      handle: null,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      type: 'drawing',
    });
  }

  startResizing(interaction: Interaction, handle: Handle) {
    let initialPoints, initialBounds;
    const bounds = this.getBounds();

    if (bounds) {
      initialPoints = this.points.map(pt => ({ ...pt }));

      initialBounds = {
        x: bounds.x ?? 0,
        y: bounds.y ?? 0,
        width: bounds.width ?? 0,
        height: bounds.height ?? 0,
      };
    }

    interaction.patch({
      type: 'resizing',
      handle,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      initialAngle: 0,
      startRotation: 0,
      initialPoints,
      initialBounds,
    });
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.strokeWidth * 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.points.length > 1) {
      this.drawSmoothLine(ctx, this.points);
    }

    ctx.restore();
  }

  private drawSmoothLine(ctx: CanvasRenderingContext2D, points: Point[]) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    // last segment
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  }

  drawSelection(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    const bounds = this.getBounds();

    if (!bounds) return;

    const borderColor = '#228be6'; // saturated blue
    const fillColor = 'rgba(34, 139, 230, 0.08)'; // semi-transparent blue
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderColor;
    ctx.fillStyle = fillColor;
    ctx.setLineDash([]); // Solid line

    // Bounding box + 8 handles
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fillStyle = borderColor;
    this.getHandles(bounds).forEach(h => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));

    ctx.restore();
  }

  getHandles(bounds: Bounds): (Point & { type: Handle })[] {
    return [
      { x: bounds.x, y: bounds.y, type: 'nw' },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'ne' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'se' },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'sw' },
      { x: bounds.x + bounds.width/2, y: bounds.y, type: 'n' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height/2, type: 'e' },
      { x: bounds.x + bounds.width/2, y: bounds.y + bounds.height, type: 's' },
      { x: bounds.x, y: bounds.y + bounds.height/2, type: 'w' },
    ];
  }

  isPointInShape({ x, y }: Point): boolean {
    if (!this.points || this.points.length < 2) return false;
    for (let i = 1; i < this.points.length; i++) {
      const xStart = this.points[i-1].x, yStart = this.points[i-1].y;
      const xEnd = this.points[i].x, yEnd = this.points[i].y;
      if (pointToSegmentDistance(x, y, xStart, yStart, xEnd, yEnd) < 64) return true;
    }
    return false;
  }

  resize(mouse: Point, { handle, initialBounds, initialPoints }: Interaction): void {
    if (!initialPoints || !initialBounds) return;
    let newX = initialBounds.x,
      newY = initialBounds.y,
      newW = initialBounds.width,
      newH = initialBounds.height;
    switch (handle) {
      case 'nw':
        newX = mouse.x;
        newY = mouse.y;
        newW = initialBounds.x + initialBounds.width - mouse.x;
        newH = initialBounds.y + initialBounds.height - mouse.y;
        break;
      case 'ne':
        newY = mouse.y;
        newW = mouse.x - initialBounds.x;
        newH = initialBounds.y + initialBounds.height - mouse.y;
        break;
      case 'se':
        newW = mouse.x - initialBounds.x;
        newH = mouse.y - initialBounds.y;
        break;
      case 'sw':
        newX = mouse.x;
        newW = initialBounds.x + initialBounds.width - mouse.x;
        newH = mouse.y - initialBounds.y;
        break;
      case 'n':
        newY = mouse.y;
        newH = initialBounds.y + initialBounds.height - mouse.y;
        break;
      case 's':
        newH = mouse.y - initialBounds.y;
        break;
      case 'e':
        newW = mouse.x - initialBounds.x;
        break;
      case 'w':
        newX = mouse.x;
        newW = initialBounds.x + initialBounds.width - mouse.x;
        break;
    }
    newW = Math.max(10, newW);
    newH = Math.max(10, newH);
    const newPoints = initialPoints.map((pt: Point) => scalePointInRect(pt, initialBounds, { x: newX, y: newY, width: newW, height: newH }));
    this.patch({ points: newPoints });
  }

  getBounds(): Bounds | null {
    if (!this.points || this.points.length === 0) return null;

    let minX = this.points[0].x, maxX = this.points[0].x;
    let minY = this.points[0].y, maxY = this.points[0].y;

    for (const pt of this.points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }

    return {
      x: minX,
      y: minY,
      width: (maxX - minX),
      height: (maxY - minY),
    };
  }

  drawNewShape(mouse: Point): void {    
    this.points.push(mouse);
  }

  move(mouse: Point, { dragOffset, initialPoints }: Interaction): void {
    const dx = mouse.x - dragOffset.x;
    const dy = mouse.y - dragOffset.y;

    if (initialPoints && this.points) {
      this.patch({
        points: initialPoints.map(pt => ({
          x: pt.x + dx,
          y: pt.y + dy,
        })),
      });
    }
  }

  getHandleAt({ x, y }: Point): Handle | null {
    const bounds = this.getBounds();
    if (!bounds) return null;

    for (const h of this.getHandles(bounds)) {
      if (Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) return h.type;
    }

    return null;
  }
}
