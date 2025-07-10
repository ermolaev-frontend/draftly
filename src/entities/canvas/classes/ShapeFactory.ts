import type { ShapeType, Point } from 'shared/types/canvas';

import { BaseShape } from './BaseShape';
import { Circle } from './Circle';
import { Rectangle } from './Rectangle';
import { Line } from './Line';
import { Pencil } from './Pencil';
import { ShapeConstants } from './ShapeConstants';

export interface ShapeCreationParams {
  type: ShapeType;
  color?: string;
  strokeWidth?: number;
  position?: Point;
  [key: string]: any;
}

export class ShapeFactory {
  /**
   * Create a shape with the specified parameters
   */
  static createShape(params: ShapeCreationParams): BaseShape {
    const {
      type,
      color = ShapeConstants.DEFAULT_COLOR,
      strokeWidth = ShapeConstants.DEFAULT_STROKE_WIDTH,
      position = { x: 0, y: 0 },
      ...additionalParams
    } = params;

    switch (type) {
      case 'circle':
        return new Circle({
          x: position.x,
          y: position.y,
          radius: ShapeConstants.DEFAULT_SIZE,
          color,
          strokeWidth,
          ...additionalParams,
        });

      case 'rectangle':
        return new Rectangle({
          x: position.x,
          y: position.y,
          width: ShapeConstants.DEFAULT_SIZE,
          height: ShapeConstants.DEFAULT_SIZE,
          rotation: 0,
          color,
          strokeWidth,
          ...additionalParams,
        });

      case 'line':
        return new Line({
          x1: position.x,
          y1: position.y,
          x2: position.x,
          y2: position.y,
          color,
          strokeWidth,
          ...additionalParams,
        });

      case 'pencil':
        return new Pencil({
          points: [position],
          color,
          strokeWidth,
          ...additionalParams,
        });

      default:
        throw new Error(`Unknown shape type: ${type}`);
    }
  }

  /**
   * Create a shape for drawing mode (with minimal size/points)
   */
  static createDrawingShape(type: ShapeType, startPoint: Point, color?: string, strokeWidth?: number): BaseShape {
    return ShapeFactory.createShape({
      type,
      position: startPoint,
      color,
      strokeWidth,
    });
  }

  /**
   * Create a shape with random properties for demos/testing
   */
  static createRandomShape(type: ShapeType, bounds: { width: number; height: number }): BaseShape {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomStrokeWidth = Math.floor(Math.random() * 4) + 1;
    
    const position = {
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
    };

    const additionalParams: Record<string, any> = {};
    const numPoints = Math.floor(Math.random() * 10) + 3;
    const points = [position];

    switch (type) {
      case 'circle':
        additionalParams.radius = Math.random() * 50 + 20;
        break;
      case 'rectangle':
        additionalParams.width = Math.random() * 100 + 50;
        additionalParams.height = Math.random() * 80 + 40;
        additionalParams.rotation = Math.random() * Math.PI * 2;
        break;
      case 'line':
        additionalParams.x2 = position.x + (Math.random() * 200 - 100);
        additionalParams.y2 = position.y + (Math.random() * 200 - 100);
        break;
      case 'pencil':
        for (let i = 1; i < numPoints; i++) {
          points.push({
            x: position.x + (Math.random() * 100 - 50),
            y: position.y + (Math.random() * 100 - 50),
          });
        }

        additionalParams.points = points;
        break;
    }

    return ShapeFactory.createShape({
      type,
      position,
      color: randomColor,
      strokeWidth: randomStrokeWidth,
      ...additionalParams,
    });
  }

  /**
   * Get available shape types
   */
  static getAvailableTypes(): ShapeType[] {
    return ['circle', 'rectangle', 'line', 'pencil'];
  }

  /**
   * Validate if a shape type is supported
   */
  static isValidShapeType(type: string): type is ShapeType {
    return ShapeFactory.getAvailableTypes().includes(type as ShapeType);
  }
}
