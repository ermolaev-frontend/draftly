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
