import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';
import { Shape } from 'entities/canvas/classes/Shape.ts';

import type { Bounds, Point } from 'shared/types/canvas';

import { hashStringToSeed } from '../utils/canvas';
import { isPointInCircle, getDistanceBetweenPoints } from '../utils/geometry';

export class Circle extends Shape {
  readonly type = 'circle';
  readonly x: number;
  readonly y: number;
  readonly radius: number;

  constructor(shape: Partial<Circle>) {
    super(shape);
    this.x = shape.x ?? 0;
    this.y = shape.y ?? 0;
    this.radius = shape.radius ?? 0;
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: { x: mouse.x - this.x, y: mouse.y - this.y },
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

    roughCanvas?.circle(
      this.x,
      this.y,
      this.radius * 2,
      {
        stroke: this.color,
        strokeWidth: this.strokeWidth,
        fill: undefined,
        roughness: 1.5,
        bowing: 2,
        seed: this.id ? hashStringToSeed(this.id) : undefined,
      },
    );

    ctx.restore();
  }

  drawSelection(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const borderColor = '#228be6'; // saturated blue
    const fillColor = 'rgba(34, 139, 230, 0.08)'; // semi-transparent blue
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderColor;
    ctx.fillStyle = fillColor;
    ctx.setLineDash([]); // Solid line

    // Fill
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    // Frame
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.strokeStyle = borderColor;
    ctx.stroke();
    // Right handle from center (on circle)
    const handle = { x: this.x + this.radius, y: this.y, type: 'radius' };
    ctx.beginPath();
    ctx.arc(handle.x, handle.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = borderColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  isPointInShape(point: Point): boolean {
    return isPointInCircle(point, { x: this.x, y: this.y }, this.radius);
  }

  resize(mouse: Point): void {
    const newRadius = getDistanceBetweenPoints({ x: this.x, y: this.y }, mouse);

    this.patch({
      radius: Math.max(20, newRadius),
    } as Partial<this>);
  }

  getBounds(): Bounds {
    return {
      x: this.x - this.radius,
      y: this.y - this.radius,
      width: this.radius * 2,
      height: this.radius * 2,
    };
  }

  drawNewShape(mouse: Point): void {
    this.patch({
      radius: getDistanceBetweenPoints({ x: this.x, y: this.y }, mouse),
    } as Partial<this>);
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    this.patch({
      x: mouse.x - dragOffset.x,
      y: mouse.y - dragOffset.y,
    } as Partial<this>);
  }

  getHandleAt({ x, y }: Point): Handle | null {
    const handleX = this.x + this.radius;
    const handleY = this.y;

    if ((x - handleX) ** 2 + (y - handleY) ** 2 <= 10 * 10) {
      return 'radius';
    }

    return null;
  }
}
