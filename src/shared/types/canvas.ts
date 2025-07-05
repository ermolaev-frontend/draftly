// Canvas/editor types for use across the app

import type { Drawable } from 'roughjs/bin/core';

export type ToolType = 'select' | 'pencil' | 'rectangle' | 'circle' | 'line';

export interface Point {
  x: number;
  y: number;
}

export interface BaseShape {
  type: ToolType;
  color: string;
  strokeWidth: number;
  id?: string;
}

export interface RectangleShape extends BaseShape, Point {
  type: 'rectangle';
  width: number;
  height: number;
  rotation?: number;
}

export interface CircleShape extends BaseShape, Point {
  type: 'circle';
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
  // Allow custom properties for roughjs caching
  _roughDrawable?: Drawable;
  _roughDrawablePoints?: Point[];
}

export type Shape = RectangleShape | CircleShape | LineShape | PencilShape;

export interface InteractionState {
  isDragging: boolean;
  isResizing: boolean;
  selectedShape: Shape | null;
  dragOffset: Point;
  resizeHandle: { type: string } | null;
  // Dynamic properties for drawing and resizing
  isDrawingPencil?: boolean;
  isDrawingRectangle?: boolean;
  isDrawingCircle?: boolean;
  isDrawingLine?: boolean;
  drawingShape?: Shape | null;
  startPoint?: Point | null;
  initialAngle?: number | null;
  startRotation?: number | null;
  pencilResize?: {
    initialPoints: Point[];
    initialBounds: { x: number; y: number; width: number; height: number };
  } | null;
  initialRadius?: number | null;
  initialDistance?: number | null;
  initialPoints?: Point[];
  lineCenter?: Point;
  [key: string]: any;
} 
