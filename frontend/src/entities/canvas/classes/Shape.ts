/* eslint-disable no-unused-vars */

import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';
import { generateId, getRandomColor } from 'entities/canvas/utils/canvas';

import type { Bounds, IShapeFields, Point } from 'shared/types/canvas';
import type { TOOLS } from 'shared/types/colors';

export type ToolType = (typeof TOOLS)[number];
type ShapeType = 'pencil' | 'rectangle' | 'circle' | 'line';

export abstract class Shape implements IShapeFields {
  abstract type: ShapeType;
  id: string;
  color: string;
  strokeWidth: number;
  rotation: number = 0;
  
  constructor(shape: Partial<Shape>) {
    this.id = shape.id ?? generateId();
    this.color = shape.color ?? getRandomColor();
    this.strokeWidth = shape.strokeWidth ?? 2;
  }
  
  abstract draw(ctx: CanvasRenderingContext2D, roughCanvas?: ReturnType<typeof rough.canvas>): void;
  abstract drawSelection(ctx: CanvasRenderingContext2D): void;
  abstract isPointInShape(point: Point): boolean;
  abstract resize(mouse: Point, inter: Interaction): void;
  abstract drawNewShape(mouse: Point, start?: Point): void;
  abstract getBounds(): Bounds | null;
  abstract move(mouse: Point, inter: Interaction): void;
  abstract getHandleAt(mouse: Point): Handle | null;
  abstract startDragging(interaction: Interaction, mouse: Point): void;
  abstract startDrawing(interaction: Interaction, mouse?: Point): void;
  abstract startResizing(interaction: Interaction, handle: Handle, mouse?: Point): void;
  
  patch(shape: Partial<this>): void {
    Object.assign(this, shape);
  }
  
  isPointOutsideBounds(point: Point): boolean {
    const bounds = this.getBounds();
    if (!bounds) return true;
    const { x, y, width, height } = bounds;

    return (
      point.x < x ||
      point.x > x + width ||
      point.y < y ||
      point.y > y + height
    );
  }
  
  // Optional methods
  rotate?(mouse: Point, inter: Interaction): void;
  getHandles?(bounds?: Bounds): (Point & { type: Handle })[];
}
