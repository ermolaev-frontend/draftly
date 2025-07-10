import type { Bounds, Point, ShapeType } from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { BaseShape } from './BaseShape';
import { GeometryUtils } from './GeometryUtils';
import { ShapeConstants } from './ShapeConstants';

export class Pencil extends BaseShape {
  readonly type: ShapeType = 'pencil';
  readonly points: Point[];

  constructor(params: Partial<Pencil> & { color?: string; strokeWidth?: number }) {
    super(params.color ?? ShapeConstants.DEFAULT_COLOR, params.strokeWidth ?? ShapeConstants.DEFAULT_STROKE_WIDTH);
    this.points = params.points ?? [];
  }

  getCenter(): Point {
    const bounds = this.getBounds();
    if (!bounds) return { x: 0, y: 0 };

    return {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    };
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

  startResizing(interaction: Interaction, handle: Handle): void {
    let initialPoints, initialBounds;
    const bounds = this.getBounds();

    if (bounds) {
      initialPoints = this.points.map(pt => ({ ...pt }));
      initialBounds = { ...bounds };
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

  private drawSmoothLine(ctx: CanvasRenderingContext2D, points: Point[]): void {
    if (points.length < 2) return;
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i++) {
      const midX = (points[i].x + points[i + 1].x) / 2;
      const midY = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
    }

    // Draw last segment
    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
    ctx.stroke();
  }

  drawSelection(ctx: CanvasRenderingContext2D): void {
    const bounds = this.getBounds();
    if (!bounds) return;

    this.drawSelectionFrame(ctx);

    // Fill and stroke bounding box
    ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Draw resize handles
    this.getHandles(bounds).forEach(handle => {
      this.drawHandle(ctx, handle.x, handle.y);
    });

    ctx.restore();
  }

  getHandles(bounds?: Bounds): (Point & { type: Handle })[] {
    if (!bounds) {
      const calcBounds = this.getBounds();
      if (!calcBounds) return [];
      bounds = calcBounds;
    }

    return [
      { x: bounds.x, y: bounds.y, type: 'nw' },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'ne' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'se' },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'sw' },
      { x: bounds.x + bounds.width / 2, y: bounds.y, type: 'n' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2, type: 'e' },
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height, type: 's' },
      { x: bounds.x, y: bounds.y + bounds.height / 2, type: 'w' },
    ];
  }

  isPointInShape(point: Point): boolean {
    if (!this.points || this.points.length < 2) return false;

    for (let i = 1; i < this.points.length; i++) {
      const lineStart = this.points[i - 1];
      const lineEnd = this.points[i];
      const closest = GeometryUtils.closestPointOnLine(point, lineStart, lineEnd);
      
      if (GeometryUtils.distanceSquared(point, closest) < ShapeConstants.POINT_HIT_TOLERANCE) {
        return true;
      }
    }

    return false;
  }

  resize(mouse: Point, { handle, initialBounds, initialPoints }: Interaction): void {
    if (!initialPoints || !initialBounds) return;

    let newX = initialBounds.x;
    let newY = initialBounds.y;
    let newW = initialBounds.width;
    let newH = initialBounds.height;

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

    newW = Math.max(ShapeConstants.MIN_SIZE / 2, newW);
    newH = Math.max(ShapeConstants.MIN_SIZE / 2, newH);

    const newPoints = initialPoints.map((pt: Point) => {
      const relX = (pt.x - initialBounds.x) / initialBounds.width;
      const relY = (pt.y - initialBounds.y) / initialBounds.height;

      return {
        x: newX + relX * newW,
        y: newY + relY * newH,
      };
    });

    this.patch({ points: newPoints });
  }

  getBounds(): Bounds | null {
    if (!this.points || this.points.length === 0) return null;

    let minX = this.points[0].x;
    let maxX = this.points[0].x;
    let minY = this.points[0].y;
    let maxY = this.points[0].y;

    for (const pt of this.points) {
      minX = Math.min(minX, pt.x);
      maxX = Math.max(maxX, pt.x);
      minY = Math.min(minY, pt.y);
      maxY = Math.max(maxY, pt.y);
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  drawNewShape(mouse: Point): void {
    this.patch({
      points: [...this.points, mouse],
    });
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

  getHandleAt(point: Point): Handle | null {
    const bounds = this.getBounds();
    if (!bounds) return null;

    for (const handle of this.getHandles(bounds)) {
      if (this.isPointNearHandle(point, handle)) {
        return handle.type;
      }
    }

    return null;
  }
}
