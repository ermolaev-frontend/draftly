/* eslint-disable no-unused-vars */
import rough from 'roughjs';

import type { Bounds, Point, IShape, ShapeType } from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { generateId, hashStringToSeed } from '../canvasUtils';
import { ShapeConstants } from './ShapeConstants';

export abstract class BaseShape implements IShape {
  readonly id: string;
  readonly color: string;
  readonly strokeWidth: number;
  abstract readonly type: ShapeType;

  constructor(color: string = 'red', strokeWidth: number = 1) {
    this.id = generateId();
    this.color = color;
    this.strokeWidth = strokeWidth;
  }

  patch(updates: Partial<Record<string, any>>): void {
    Object.assign(this, updates);
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    const center = this.getCenter();

    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: { x: mouse.x - center.x, y: mouse.y - center.y },
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

  protected drawSelectionFrame(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.lineWidth = ShapeConstants.SELECTION_LINE_WIDTH;
    ctx.strokeStyle = ShapeConstants.SELECTION_BORDER_COLOR;
    ctx.fillStyle = ShapeConstants.SELECTION_FILL_COLOR;
    ctx.setLineDash([]);
  }

  protected drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, isRotation: boolean = false): void {
    ctx.save();

    if (isRotation) {
      ctx.beginPath();
      ctx.arc(x, y, ShapeConstants.ROTATION_HANDLE_SIZE, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = ShapeConstants.SELECTION_BORDER_COLOR;
      ctx.lineWidth = ShapeConstants.SELECTION_LINE_WIDTH;
      ctx.stroke();
    } else {
      ctx.fillStyle = ShapeConstants.SELECTION_BORDER_COLOR;

      ctx.fillRect(
        x - ShapeConstants.HANDLE_SIZE / 2, 
        y - ShapeConstants.HANDLE_SIZE / 2, 
        ShapeConstants.HANDLE_SIZE, 
        ShapeConstants.HANDLE_SIZE,
      );
    }

    ctx.restore();
  }

  protected getRoughOptions() {
    return {
      stroke: this.color,
      strokeWidth: this.strokeWidth,
      fill: undefined,
      roughness: ShapeConstants.ROUGHNESS,
      bowing: ShapeConstants.BOWING,
      seed: this.id ? hashStringToSeed(this.id) : undefined,
    };
  }

  protected isPointNearHandle(point: Point, handlePoint: Point): boolean {
    const dx = point.x - handlePoint.x;
    const dy = point.y - handlePoint.y;

    return dx * dx + dy * dy <= ShapeConstants.HANDLE_TOLERANCE * ShapeConstants.HANDLE_TOLERANCE;
  }

  // Abstract methods that must be implemented by subclasses
  abstract getCenter(): Point;
  abstract draw(ctx: CanvasRenderingContext2D, roughCanvas: ReturnType<typeof rough.canvas>): void;
  abstract drawSelection(ctx: CanvasRenderingContext2D): void;
  abstract isPointInShape(point: Point): boolean;
  abstract resize(mouse: Point, interaction: Interaction): void;
  abstract getBounds(): Bounds | null;
  abstract drawNewShape(mouse: Point, interaction: Interaction): void;
  abstract move(mouse: Point, interaction: Interaction): void;
  abstract getHandleAt(point: Point): Handle | null;
  abstract startResizing(interaction: Interaction, handle: Handle, mouse?: Point): void;
}
