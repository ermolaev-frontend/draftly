/* eslint-disable no-unused-vars */

import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

export type ToolType = 'select' | 'pencil' | 'rectangle' | 'circle' | 'line';
type ShapeType = 'pencil' | 'rectangle' | 'circle' | 'line';

export interface Point {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EventOffset {
  offsetX: number;
  offsetY: number 
};

export interface IShape {
  type: ShapeType;
  color: string;
  strokeWidth: number;
  id: string;

  draw(ctx: CanvasRenderingContext2D, roughCanvas?: ReturnType<typeof rough.canvas>): void;   
  drawSelection(ctx: CanvasRenderingContext2D): void
  isPointInShape(point: Point): boolean;
  resize(mouse: Point, inter: Interaction): void;
  drawNewShape(mouse: Point, inter: Interaction): void;
  rotate?(mouse: Point, inter: Interaction): void;
  getBounds(): Bounds | null;
  move(mouse: Point, inter: Interaction): void;
  getHandles?(bounds?: Bounds): (Point & { type: Handle })[];
  getHandleAt({ x, y }: Point): Handle | null;
  startDragging(interaction: Interaction, mouse: Point): void;
  startDrawing(interaction: Interaction, mouse?: Point): void;
  startResizing(interaction: Interaction, handle: Handle, mouse?: Point): void;
}
