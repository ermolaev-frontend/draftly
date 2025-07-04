// Canvas/editor types for use across the app

export type ToolType = 'select' | 'pencil' | 'rectangle' | 'circle' | 'line';

export interface BaseShape {
  type: ToolType;
  color: string;
  strokeWidth: number;
  id?: string;
}

export interface RectangleShape extends BaseShape {
  type: 'rectangle';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
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
  points: { x: number; y: number }[];
}

export type Shape = RectangleShape | CircleShape | LineShape | PencilShape;

export interface InteractionState {
  isDragging: boolean;
  isResizing: boolean;
  selectedShape: Shape | null;
  dragOffset: { x: number; y: number };
  resizeHandle: { type: string } | null;
  // Dynamic properties for drawing and resizing
  isDrawingPencil?: boolean;
  isDrawingRectangle?: boolean;
  isDrawingCircle?: boolean;
  isDrawingLine?: boolean;
  drawingShape?: Shape | null;
  startPoint?: { x: number; y: number } | null;
  initialAngle?: number | null;
  startRotation?: number | null;
  pencilResize?: {
    initialPoints: { x: number; y: number }[];
    initialBounds: { x: number; y: number; width: number; height: number };
  } | null;
  initialRadius?: number | null;
  initialDistance?: number | null;
  initialPoints?: { x: number; y: number }[];
  lineCenter?: { x: number; y: number };
  [key: string]: any;
} 
