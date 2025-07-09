import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

import type { Bounds, Point, IShape } from 'shared/types/canvas';

import { generateId, hashStringToSeed } from '../canvasUtils';

export class Circle implements IShape {
  readonly type = 'circle';
  readonly color: string;
  readonly strokeWidth: number;
  readonly id: string;

  readonly x: number;
  readonly y: number;
  readonly radius: number;

  constructor(shape: Partial<Circle>) {
    this.id = generateId();
    this.color = shape.color ?? 'red';
    this.strokeWidth = shape.strokeWidth ?? 1;
    this.x = shape.x ?? 0;
    this.y = shape.y ?? 0;
    this.radius = shape.radius ?? 0;
  }

  patch(shape: Partial<Circle>): void {
    Object.assign(this, shape);
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: { x: mouse.x - this.x, y: mouse.y - this.y },
    });
  }

  startDrawing(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      handle: null,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      type: 'drawing',
      startPoint: { ...mouse },
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

  isPointInShape({ x, y }: Point): boolean {
    const dx = x - this.x, dy = y - this.y;

    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  resize(mouse: Point): void {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const newRadius = Math.sqrt(dx * dx + dy * dy);

    this.patch({
      radius: Math.max(20, newRadius),
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
    this.patch({
      radius: Math.sqrt((mouse.x - startPoint.x) ** 2 + (mouse.y - startPoint.y) ** 2),
    });
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    this.patch({
      x: mouse.x - dragOffset.x,
      y: mouse.y - dragOffset.y,
    });
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
