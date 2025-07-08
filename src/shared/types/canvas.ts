/* eslint-disable no-unused-vars */

import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

export type ToolType = 'select' | 'pencil' | 'rectangle' | 'circle' | 'line';
type ShapeType = 'pencil' | 'rectangle' | 'circle' | 'line';

export interface Point {
  x: number;
  y: number;
}

export interface Bounds extends Point {
  width: number;
  height: number;
}

export interface BaseShape {
  type: ToolType;
  color: string;
  strokeWidth: number;
  id?: string;
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
}

export interface CircleShape extends BaseShape {
  type: 'circle';
  x: number;
  y: number;
  radius: number;
}

export interface LineShape extends BaseShape {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PencilShape extends BaseShape {
  type: 'pencil';
  points: Point[];
}

export type Shape = RectangleShape | CircleShape | LineShape | PencilShape;

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
}
