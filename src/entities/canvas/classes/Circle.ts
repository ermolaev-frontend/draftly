import rough from 'roughjs';

import type { Bounds, Point, ShapeType } from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { BaseShape } from './BaseShape';
import { GeometryUtils } from './GeometryUtils';
import { ShapeConstants } from './ShapeConstants';

export class Circle extends BaseShape {
  readonly type: ShapeType = 'circle';
  readonly x: number;
  readonly y: number;
  readonly radius: number;

  constructor(params: Partial<Circle> & { color?: string; strokeWidth?: number }) {
    super(params.color ?? ShapeConstants.DEFAULT_COLOR, params.strokeWidth ?? ShapeConstants.DEFAULT_STROKE_WIDTH);
    this.x = params.x ?? 0;
    this.y = params.y ?? 0;
    this.radius = params.radius ?? ShapeConstants.DEFAULT_SIZE;
  }

  getCenter(): Point {
    return { x: this.x, y: this.y };
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
    roughCanvas?.circle(this.x, this.y, this.radius * 2, this.getRoughOptions());
    ctx.restore();
  }

  drawSelection(ctx: CanvasRenderingContext2D): void {
    this.drawSelectionFrame(ctx);

    // Fill circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Stroke circle
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw radius handle
    const handlePoint = { x: this.x + this.radius, y: this.y };
    this.drawHandle(ctx, handlePoint.x, handlePoint.y);

    ctx.restore();
  }

  isPointInShape(point: Point): boolean {
    return GeometryUtils.isPointInCircle(point, this.getCenter(), this.radius);
  }

  resize(mouse: Point): void {
    const newRadius = GeometryUtils.distance(mouse, this.getCenter());

    this.patch({
      radius: Math.max(ShapeConstants.MIN_SIZE, newRadius),
    });
  }

  getBounds(): Bounds {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  drawNewShape(mouse: Point, { startPoint }: Interaction): void {
    const radius = GeometryUtils.distance(mouse, startPoint);
    this.patch({ radius });
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    this.patch({
      x: mouse.x - dragOffset.x,
      y: mouse.y - dragOffset.y,
    });
  }

  getHandleAt(point: Point): Handle | null {
    const handlePoint = { x: this.x + this.radius, y: this.y };

    return this.isPointNearHandle(point, handlePoint) ? 'radius' : null;
  }
}
