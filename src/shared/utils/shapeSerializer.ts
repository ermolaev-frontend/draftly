import type { IShape } from '../types/canvas';
import { Rectangle } from '../../entities/canvas/classes/Rectangle';
import { Circle } from '../../entities/canvas/classes/Circle';
import { Line } from '../../entities/canvas/classes/Line';
import { Pencil } from '../../entities/canvas/classes/Pencil';

// Интерфейс для сериализованных данных shape
interface SerializedShape {
  type: string;
  id: string;
  color: string;
  strokeWidth: number;
  [key: string]: any; // Дополнительные свойства для каждого типа
}

// Функция для сериализации shapes (убираем методы, оставляем только данные)
export const serializeShapes = (shapes: IShape[]): SerializedShape[] => {
  return shapes.map(shape => {
    const serialized: SerializedShape = {
      type: shape.type,
      id: shape.id,
      color: shape.color,
      strokeWidth: shape.strokeWidth,
    };

    // Добавляем специфичные свойства для каждого типа
    switch (shape.type) {
      case 'rectangle':
        const rect = shape as any;
        Object.assign(serialized, {
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
          rotation: rect.rotation,
        });
        break;

      case 'circle':
        const circle = shape as any;
        Object.assign(serialized, {
          x: circle.x,
          y: circle.y,
          radius: circle.radius,
        });
        break;

      case 'line':
        const line = shape as any;
        Object.assign(serialized, {
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2,
        });
        break;

      case 'pencil':
        const pencil = shape as any;
        Object.assign(serialized, {
          points: pencil.points,
        });
        break;
    }

    return serialized;
  });
};

// Функция для десериализации shapes (создаем новые объекты с методами)
export const deserializeShapes = (serializedShapes: SerializedShape[]): IShape[] => {
  return serializedShapes.map(serialized => {
    switch (serialized.type) {
      case 'rectangle':
        return new Rectangle({
          id: serialized.id,
          color: serialized.color,
          strokeWidth: serialized.strokeWidth,
          x: serialized.x,
          y: serialized.y,
          width: serialized.width,
          height: serialized.height,
          rotation: serialized.rotation,
        });

      case 'circle':
        return new Circle({
          id: serialized.id,
          color: serialized.color,
          strokeWidth: serialized.strokeWidth,
          x: serialized.x,
          y: serialized.y,
          radius: serialized.radius,
        });

      case 'line':
        return new Line({
          id: serialized.id,
          color: serialized.color,
          strokeWidth: serialized.strokeWidth,
          x1: serialized.x1,
          y1: serialized.y1,
          x2: serialized.x2,
          y2: serialized.y2,
        });

      case 'pencil':
        return new Pencil({
          id: serialized.id,
          color: serialized.color,
          strokeWidth: serialized.strokeWidth,
          points: serialized.points,
        });

      default:
        throw new Error(`Неизвестный тип shape: ${serialized.type}`);
    }
  });
}; 