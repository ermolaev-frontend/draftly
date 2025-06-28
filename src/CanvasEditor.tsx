import React, { useRef, useEffect, useState } from 'react';
import styles from './CanvasEditor.module.scss';

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 700;

// Типы фигур
export type Shape =
  | RectangleShape
  | CircleShape
  | LineShape
  | PencilShape;

export interface RectangleShape {
  type: 'rectangle';
  color: string;
  strokeWidth: number;
  selected: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

export interface CircleShape {
  type: 'circle';
  color: string;
  strokeWidth: number;
  selected: boolean;
  x: number;
  y: number;
  radius: number;
}

export interface LineShape {
  type: 'line';
  color: string;
  strokeWidth: number;
  selected: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface PencilShape {
  type: 'pencil';
  color: string;
  strokeWidth: number;
  selected: boolean;
  points: { x: number; y: number }[];
}

// Interaction state (минимально для старта)
interface InteractionState {
  isDragging: boolean;
  isResizing: boolean;
  selectedShape: Shape | null;
  dragOffset: { x: number; y: number };
  resizeHandle: any;
}

function getRandom(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

function getRandomColor() {
  return colors[Math.floor(getRandom(0, colors.length))];
}
function getRandomStrokeWidth() {
  return getRandom(2, 5);
}

function createRectangle(options: Partial<RectangleShape> = {}): RectangleShape {
  return {
    type: 'rectangle',
    color: getRandomColor(),
    strokeWidth: getRandomStrokeWidth(),
    selected: false,
    x: options.x ?? getRandom(50, 600),
    y: options.y ?? getRandom(50, 400),
    width: options.width ?? getRandom(100, 180),
    height: options.height ?? getRandom(80, 140),
    rotation: options.rotation ?? 0,
    ...options,
  };
}
function createCircle(options: Partial<CircleShape> = {}): CircleShape {
  return {
    type: 'circle',
    color: getRandomColor(),
    strokeWidth: getRandomStrokeWidth(),
    selected: false,
    x: options.x ?? getRandom(100, 700),
    y: options.y ?? getRandom(100, 500),
    radius: options.radius ?? getRandom(40, 80),
    ...options,
  };
}
function createLine(options: Partial<LineShape & { angle?: number; length?: number }> = {}): LineShape {
  const x1 = options.x1 ?? getRandom(100, 700);
  const y1 = options.y1 ?? getRandom(100, 500);
  const angle = (options as any).angle ?? getRandom(0, Math.PI * 2);
  const length = (options as any).length ?? getRandom(80, 200);
  const x2 = options.x2 ?? (x1 + Math.cos(angle) * length);
  const y2 = options.y2 ?? (y1 + Math.sin(angle) * length);
  return {
    type: 'line',
    color: getRandomColor(),
    strokeWidth: getRandomStrokeWidth(),
    selected: false,
    x1, y1, x2, y2,
    ...options,
  };
}

type Tool = 'select' | 'pencil' | 'rectangle' | 'circle' | 'line';

// --- Вспомогательные функции для ручек и bounds ---
function getRectangleHandles(shape: RectangleShape, offset = 5) {
  const w = shape.width, h = shape.height;
  return [
    { x: shape.x - offset, y: shape.y - offset, type: 'nw' },
    { x: shape.x + w + offset, y: shape.y - offset, type: 'ne' },
    { x: shape.x + w + offset, y: shape.y + h + offset, type: 'se' },
    { x: shape.x - offset, y: shape.y + h + offset, type: 'sw' },
    { x: shape.x + w / 2, y: shape.y - offset, type: 'n' },
    { x: shape.x + w + offset, y: shape.y + h / 2, type: 'e' },
    { x: shape.x + w / 2, y: shape.y + h + offset, type: 's' },
    { x: shape.x - offset, y: shape.y + h / 2, type: 'w' },
    { x: shape.x + w / 2, y: shape.y - offset - 30, type: 'rotate' },
  ];
}
function getCircleHandle(shape: CircleShape) {
  return { x: shape.x + shape.radius, y: shape.y, type: 'radius' };
}

function getHandleAt(x: number, y: number, shape: Shape) {
  if (shape.type === 'rectangle') {
    for (const h of getRectangleHandles(shape)) {
      if (Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) return h;
    }
  } else if (shape.type === 'circle') {
    const h = getCircleHandle(shape);
    if ((x - h.x) ** 2 + (y - h.y) ** 2 <= 10 * 10) return h;
  }
  return null;
}

// --- Основной компонент ---
export const CanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [shapes, setShapes] = useState<Shape[]>(() => [
    createRectangle(),
    createRectangle(),
    createCircle(),
    createCircle(),
    createLine(),
    createLine(),
    createLine(),
  ]);
  const [tool, setTool] = useState<Tool>('select');
  const [isDrawingPencil, setIsDrawingPencil] = useState(false);
  const [currentPencil, setCurrentPencil] = useState<PencilShape | null>(null);
  const [resizeInfo, setResizeInfo] = useState<any>(null); // { shapeIdx, handleType, startMouse, startShape }

  const interaction = useRef<InteractionState>({
    isDragging: false,
    isResizing: false,
    selectedShape: null,
    dragOffset: { x: 0, y: 0 },
    resizeHandle: null,
  });

  // --- Добавление фигур ---
  function addRectangle() {
    setShapes(prev => [...prev, createRectangle()]);
  }
  function addCircle() {
    setShapes(prev => [...prev, createCircle()]);
  }
  function addLine() {
    setShapes(prev => [...prev, createLine()]);
  }
  function clearCanvas() {
    setShapes([]);
  }

  // --- UI ---
  const toolButtons = [
    { name: 'select', label: 'Выделение' },
    { name: 'pencil', label: 'Карандаш' },
    { name: 'rectangle', label: 'Прямоугольник' },
    { name: 'circle', label: 'Круг' },
    { name: 'line', label: 'Линия' },
  ];

  // Получить фигуру под курсором
  function getShapeAt(x: number, y: number): [Shape, number] | null {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      switch (shape.type) {
        case 'rectangle':
          if (
            x >= shape.x &&
            x <= shape.x + shape.width &&
            y >= shape.y &&
            y <= shape.y + shape.height
          )
            return [shape, i];
          break;
        case 'circle': {
          const dx = x - shape.x;
          const dy = y - shape.y;
          if (dx * dx + dy * dy <= shape.radius * shape.radius) return [shape, i];
          break;
        }
        case 'line': {
          // Простая проверка близости к линии
          const dist = Math.abs(
            (shape.y2 - shape.y1) * x - (shape.x2 - shape.x1) * y + shape.x2 * shape.y1 - shape.y2 * shape.x1
          ) /
            Math.sqrt((shape.y2 - shape.y1) ** 2 + (shape.x2 - shape.x1) ** 2);
          if (dist < 8) return [shape, i];
          break;
        }
        case 'pencil': {
          for (let j = 1; j < shape.points.length; j++) {
            const x1 = shape.points[j - 1].x, y1 = shape.points[j - 1].y;
            const x2 = shape.points[j].x, y2 = shape.points[j].y;
            const dist = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) /
              Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
            if (dist < 8) return [shape, i];
          }
          break;
        }
      }
    }
    return null;
  }

  // --- Mouse Events ---
  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (tool === 'pencil') {
      setIsDrawingPencil(true);
      const newPencil: PencilShape = {
        type: 'pencil',
        color: getRandomColor(),
        strokeWidth: getRandomStrokeWidth(),
        selected: false,
        points: [{ x, y }],
      };
      setCurrentPencil(newPencil);
      return;
    }
    // --- Проверка на ручку ---
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (!shapes[i].selected) continue;
      const handle = getHandleAt(x, y, shapes[i]);
      if (handle) {
        setResizeInfo({
          shapeIdx: i,
          handleType: handle.type,
          startMouse: { x, y },
          startShape: { ...shapes[i] },
        });
        return;
      }
    }
    // --- Обычное выделение/перетаскивание ---
    const found = getShapeAt(x, y);
    if (found) {
      const [shape, idx] = found;
      setShapes(prev => prev.map((s, i) => ({ ...s, selected: i === idx })));
      let dragOffset = { x, y };
      if (shape.type === 'rectangle') {
        dragOffset = { x: x - shape.x, y: y - shape.y };
      } else if (shape.type === 'line') {
        const cx = (shape.x1 + shape.x2) / 2;
        const cy = (shape.y1 + shape.y2) / 2;
        dragOffset = { x: x - cx, y: y - cy };
      } else if (shape.type === 'pencil') {
        const first = shape.points[0];
        dragOffset = { x: x - first.x, y: y - first.y };
      }
      interaction.current = {
        ...interaction.current,
        isDragging: true,
        selectedShape: shape,
        dragOffset,
      };
    } else {
      setShapes(prev => prev.map(s => ({ ...s, selected: false })));
      interaction.current = {
        ...interaction.current,
        isDragging: false,
        selectedShape: null,
      };
    }
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (tool === 'pencil' && isDrawingPencil && currentPencil) {
      setCurrentPencil({
        ...currentPencil,
        points: [...currentPencil.points, { x, y }],
      });
      return;
    }
    // --- Resize ---
    if (resizeInfo) {
      setShapes(prev => prev.map((s, i) => {
        if (i !== resizeInfo.shapeIdx) return s;
        if (s.type === 'rectangle') {
          let { x: sx, y: sy, width, height } = resizeInfo.startShape;
          let dx = x - resizeInfo.startMouse.x;
          let dy = y - resizeInfo.startMouse.y;
          switch (resizeInfo.handleType) {
            case 'nw':
              return { ...s, x: sx + dx, y: sy + dy, width: width - dx, height: height - dy };
            case 'ne':
              return { ...s, y: sy + dy, width: width + dx, height: height - dy };
            case 'se':
              return { ...s, width: width + dx, height: height + dy };
            case 'sw':
              return { ...s, x: sx + dx, width: width - dx, height: height + dy };
            case 'n':
              return { ...s, y: sy + dy, height: height - dy };
            case 's':
              return { ...s, height: height + dy };
            case 'e':
              return { ...s, width: width + dx };
            case 'w':
              return { ...s, x: sx + dx, width: width - dx };
            case 'rotate': {
              const cx = sx + width / 2;
              const cy = sy + height / 2;
              const angle0 = Math.atan2(resizeInfo.startMouse.y - cy, resizeInfo.startMouse.x - cx);
              const angle1 = Math.atan2(y - cy, x - cx);
              return { ...s, rotation: (resizeInfo.startShape.rotation ?? 0) + (angle1 - angle0) };
            }
          }
        } else if (s.type === 'circle' && resizeInfo.handleType === 'radius') {
          const dx = x - s.x;
          const dy = y - s.y;
          return { ...s, radius: Math.max(10, Math.sqrt(dx * dx + dy * dy)) };
        }
        return s;
      }));
      return;
    }
    if (!interaction.current.isDragging || !interaction.current.selectedShape) return;
    setShapes(prev => prev.map(s => {
      if (!s.selected) return s;
      switch (s.type) {
        case 'rectangle':
          return { ...s, x: x - interaction.current.dragOffset.x, y: y - interaction.current.dragOffset.y };
        case 'circle':
          return { ...s, x, y };
        case 'line': {
          const cx = (s.x1 + s.x2) / 2;
          const cy = (s.y1 + s.y2) / 2;
          const newCenterX = x - interaction.current.dragOffset.x;
          const newCenterY = y - interaction.current.dragOffset.y;
          const dx = newCenterX - cx;
          const dy = newCenterY - cy;
          return { ...s, x1: s.x1 + dx, y1: s.y1 + dy, x2: s.x2 + dx, y2: s.y2 + dy };
        }
        case 'pencil': {
          const dx = x - interaction.current.dragOffset.x - s.points[0].x;
          const dy = y - interaction.current.dragOffset.y - s.points[0].y;
          return {
            ...s,
            points: s.points.map(pt => ({ x: pt.x + dx, y: pt.y + dy })),
          };
        }
        default:
          return s;
      }
    }));
  }

  function handleMouseUp() {
    if (tool === 'pencil' && isDrawingPencil && currentPencil) {
      setShapes(prev => [...prev, currentPencil]);
      setIsDrawingPencil(false);
      setCurrentPencil(null);
      return;
    }
    if (resizeInfo) {
      setResizeInfo(null);
      return;
    }
    interaction.current.isDragging = false;
    interaction.current.selectedShape = null;
  }

  // --- Удаление выделенной фигуры по клавише ---
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        setShapes(prev => prev.filter(s => !s.selected));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // --- Отрисовка ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    shapes.forEach(shape => {
      ctx.save();
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.beginPath();
      // --- Основная отрисовка фигуры ---
      if (shape.type === 'rectangle') {
        if (shape.rotation) {
          ctx.translate(shape.x + shape.width / 2, shape.y + shape.height / 2);
          ctx.rotate(shape.rotation);
          ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
        } else {
          ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
      } else if (shape.type === 'circle') {
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (shape.type === 'line') {
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
      } else if (shape.type === 'pencil') {
        if (shape.points.length > 1) {
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
        }
      }
      ctx.restore();
      // --- Выделение ---
      if (shape.selected) {
        ctx.save();
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        if (shape.type === 'rectangle') {
          const offset = 5;
          const cx = shape.x + shape.width/2;
          const cy = shape.y + shape.height/2;
          ctx.translate(cx, cy);
          ctx.rotate(shape.rotation ?? 0);
          // Заливка
          ctx.fillStyle = 'rgba(34, 139, 230, 0.08)';
          ctx.fillRect(-shape.width/2 - offset, -shape.height/2 - offset, shape.width + offset*2, shape.height + offset*2);
          // Рамка
          ctx.strokeStyle = '#228be6';
          if (shape.rotation) {
            ctx.save();
            ctx.beginPath();
            ctx.strokeRect(-shape.width / 2 - 5, -shape.height / 2 - 5, shape.width + 10, shape.height + 10);
            ctx.restore();
            // Рисуем ручки с учетом поворота
            const handles = getRectangleHandles({ ...shape, x: -shape.width / 2, y: -shape.height / 2 });
            ctx.fillStyle = '#228be6';
            handles.forEach(h => {
              ctx.beginPath();
              ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
              ctx.fill();
            });
          } else {
            ctx.strokeRect(shape.x - 5, shape.y - 5, shape.width + 10, shape.height + 10);
            // Рисуем ручки без поворота
            const handles = getRectangleHandles(shape);
            ctx.fillStyle = '#228be6';
            handles.forEach(h => {
              ctx.beginPath();
              ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
              ctx.fill();
            });
          }
          ctx.setLineDash([]);
        }
      } else if (shape.type === 'circle') {
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
        ctx.stroke();
        if (shape.selected) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#228be6';
          ctx.beginPath();
          ctx.arc(shape.x, shape.y, shape.radius + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          // Ручка радиуса
          const h = getCircleHandle(shape);
          ctx.fillStyle = '#228be6';
          ctx.beginPath();
          ctx.arc(h.x, h.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (shape.type === 'line') {
        ctx.moveTo(shape.x1, shape.y1);
        ctx.lineTo(shape.x2, shape.y2);
        ctx.stroke();
        if (shape.selected) {
          ctx.setLineDash([4, 4]);
          ctx.strokeStyle = '#228be6';
          ctx.beginPath();
          ctx.moveTo(shape.x1, shape.y1);
          ctx.lineTo(shape.x2, shape.y2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else if (shape.type === 'pencil') {
        if (shape.points.length > 1) {
          ctx.moveTo(shape.points[0].x, shape.points[0].y);
          shape.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
          ctx.stroke();
          if (shape.selected) {
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#228be6';
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            shape.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }
      ctx.restore();
    });
    // Рисуем текущую карандашную линию (если рисуется)
    if (tool === 'pencil' && isDrawingPencil && currentPencil && currentPencil.points.length > 1) {
      ctx.save();
      ctx.strokeStyle = currentPencil.color;
      ctx.lineWidth = currentPencil.strokeWidth;
      ctx.beginPath();
      ctx.moveTo(currentPencil.points[0].x, currentPencil.points[0].y);
      currentPencil.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
      ctx.restore();
    }
  }, [shapes, tool, isDrawingPencil, currentPencil]);

  return (
    <div className={styles.canvasEditorRoot}>
      <div className={styles.controls}>
        {toolButtons.map(btn => (
          <button
            key={btn.name}
            onClick={() => setTool(btn.name as Tool)}
            className={
              tool === btn.name
                ? `${styles.button} ${styles.activeTool}`
                : styles.button
            }
          >
            {btn.label}
          </button>
        ))}
        <button className={styles.button} onClick={addRectangle}>+ Прямоугольник</button>
        <button className={styles.button} onClick={addCircle}>+ Круг</button>
        <button className={styles.button} onClick={addLine}>+ Линия</button>
        <button className={styles.button} onClick={clearCanvas}>Очистить</button>
      </div>
      <div>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
  );
}; 