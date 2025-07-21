import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

import type { Bounds, Point } from 'shared/types/canvas';

import { hashStringToSeed } from '../utils/canvas';
import { getPointToSegmentDistance, getRectCenter } from '../utils/geometry';
import { Shape } from './Shape';

export class Line extends Shape {
  readonly type = 'line';

  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;

  constructor(shape: Partial<Line>) {
    super(shape);
    this.x1 = shape.x1 ?? 0;
    this.y1 = shape.y1 ?? 0;
    this.x2 = shape.x2 ?? 0;
    this.y2 = shape.y2 ?? 0;
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    const centerX = (this.x1 + this.x2) / 2;
    const centerY = (this.y1 + this.y2) / 2;

    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: {
        x: mouse.x - centerX,
        y: mouse.y - centerY,
      },
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

    roughCanvas?.line(
      this.x1,
      this.y1,
      this.x2,
      this.y2,
      {
        stroke: this.color,
        strokeWidth: this.strokeWidth,
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

    // Don't draw bounding box, only handles
    ctx.fillStyle = borderColor;
    ctx.fillRect(this.x1 - 4, this.y1 - 4, 8, 8); // start
    ctx.fillRect(this.x2 - 4, this.y2 - 4, 8, 8); // end

    ctx.restore();
  }

  isPointInShape(point: Point): boolean {
    return getPointToSegmentDistance(point, { x: this.x1, y: this.y1 }, { x: this.x2, y: this.y2 }) < 64;
  }

  resize(mouse: Point, { handle }: Interaction): void {
    if (handle === 'start') {
      this.patch({
        x1: mouse.x,
        y1: mouse.y,
      } as Partial<this>);
    } else if (handle === 'end') {
      this.patch({
        x2: mouse.x,
        y2: mouse.y,
      } as Partial<this>);
    }
  }

  getBounds(): Bounds {
    const minX = Math.min(this.x1, this.x2);
    const minY = Math.min(this.y1, this.y2);
    const maxX = Math.max(this.x1, this.x2);
    const maxY = Math.max(this.y1, this.y2);

    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  drawNewShape(mouse: Point): void {    
    this.patch({
      x2: mouse.x,
      y2: mouse.y,
    } as Partial<this>);
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    const bounds = { x: this.x1, y: this.y1, width: this.x2 - this.x1, height: this.y2 - this.y1 };
    const { x: prevCenterX, y: prevCenterY } = getRectCenter(bounds);
    const newCenterX = mouse.x - dragOffset.x;
    const newCenterY = mouse.y - dragOffset.y;
    const dx = newCenterX - prevCenterX;
    const dy = newCenterY - prevCenterY;

    this.patch({
      x1: this.x1 + dx,
      y1: this.y1 + dy,
      x2: this.x2 + dx,
      y2: this.y2 + dy,
    } as Partial<this>);
  }

  getHandleAt({ x, y }: Point): Handle | null {
    if (Math.abs(x - this.x1) <= 8 && Math.abs(y - this.y1) <= 8) return 'start';
    if (Math.abs(x - this.x2) <= 8 && Math.abs(y - this.y2) <= 8) return 'end';

    return null;
  }
}
