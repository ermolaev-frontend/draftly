/* eslint-disable no-unused-vars */

import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

import { TOOLS } from './colors';

export type ToolType = (typeof TOOLS)[number];
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

export interface IShapeFields {
  type: ShapeType;
  id: string;
  color: string;
  strokeWidth: number;
};

export interface IShape extends IShapeFields {
  draw(ctx: CanvasRenderingContext2D, roughCanvas?: ReturnType<typeof rough.canvas>): void;   
  drawSelection(ctx: CanvasRenderingContext2D): void
  isPointInShape(point: Point): boolean;
  resize(mouse: Point, inter: Interaction): void;
  drawNewShape(mouse: Point): void;
  rotate?(mouse: Point, inter: Interaction): void;
  getBounds(): Bounds | null;
  move(mouse: Point, inter: Interaction): void;
  getHandles?(bounds?: Bounds): (Point & { type: Handle })[];
  getHandleAt(mouse: Point): Handle | null;
  startDragging(interaction: Interaction, mouse: Point): void;
  startDrawing(interaction: Interaction, mouse?: Point): void;
  startResizing(interaction: Interaction, handle: Handle, mouse?: Point): void;
  patch(shape: Partial<IShape>): void;
}
