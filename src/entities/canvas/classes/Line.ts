import rough from 'roughjs';

import type { Bounds, Point, ShapeType } from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { BaseShape } from './BaseShape';
import { GeometryUtils } from './GeometryUtils';
import { ShapeConstants } from './ShapeConstants';

export class Line extends BaseShape {
  readonly type: ShapeType = 'line';  
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;

  constructor(params: Partial<Line> & { color?: string; strokeWidth?: number }) {
    super(params.color ?? ShapeConstants.DEFAULT_COLOR, params.strokeWidth ?? ShapeConstants.DEFAULT_STROKE_WIDTH);
    this.x1 = params.x1 ?? 0;
    this.y1 = params.y1 ?? 0;
    this.x2 = params.x2 ?? 0;
    this.y2 = params.y2 ?? 0;
  }

  getCenter(): Point {
    return {
      x: (this.x1 + this.x2) / 2,
      y: (this.y1 + this.y2) / 2,
    };
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    const center = this.getCenter();

    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: {
        x: mouse.x - center.x,
        y: mouse.y - center.y,
      },
    });
  }

  startResizing(interaction: Interaction, handle: Handle): void {
    interaction.patch({
      type: 'resizing',
      handle,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      initialAngle: 0,
      startRotation: 0,
      initialPoints: undefined,
      initialBounds: undefined,
    });
  }

  draw(ctx: CanvasRenderingContext2D, roughCanvas: ReturnType<typeof rough.canvas>): void {
    ctx.save();
    roughCanvas?.line(this.x1, this.y1, this.x2, this.y2, this.getRoughOptions());
    ctx.restore();
  }

  drawSelection(ctx: CanvasRenderingContext2D): void {
    this.drawSelectionFrame(ctx);

    // Draw start and end handles
    this.drawHandle(ctx, this.x1, this.y1);
    this.drawHandle(ctx, this.x2, this.y2);

    ctx.restore();
  }

  isPointInShape(point: Point): boolean {
    const lineStart = { x: this.x1, y: this.y1 };
    const lineEnd = { x: this.x2, y: this.y2 };
    const closest = GeometryUtils.closestPointOnLine(point, lineStart, lineEnd);

    return GeometryUtils.distanceSquared(point, closest) < ShapeConstants.POINT_HIT_TOLERANCE;
  }

  resize(mouse: Point, { handle }: Interaction): void {
    if (handle === 'start') {
      this.patch({
        x1: mouse.x,
        y1: mouse.y,
      });
    } else if (handle === 'end') {
      this.patch({
        x2: mouse.x,
        y2: mouse.y,
      });
    }
  }

  getBounds(): Bounds {
    const minX = Math.min(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const maxX = Math.max(this.x1, this.x2);
    const maxY = Math.max(this.y1, this.y2);

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  drawNewShape({ x, y }: Point): void {
    this.patch({
      x2: x,
      y2: y,
    });
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    const center = this.getCenter();

    const newCenter = {
      x: mouse.x - dragOffset.x,
      y: mouse.y - dragOffset.y,
    };

    const dx = newCenter.x - center.x;
    const dy = newCenter.y - center.y;

    this.patch({
      x1: this.x1 + dx,
      y1: this.y1 + dy,
      x2: this.x2 + dx,
      y2: this.y2 + dy,
    });
  }

  getHandleAt(point: Point): Handle | null {
    if (this.isPointNearHandle(point, { x: this.x1, y: this.y1 })) return 'start';
    if (this.isPointNearHandle(point, { x: this.x2, y: this.y2 })) return 'end';

    return null;
  }
}
