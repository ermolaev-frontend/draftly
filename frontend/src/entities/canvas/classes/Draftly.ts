import rough from 'roughjs';
import { BASE_PALETTE, TOOLS } from 'shared/types/colors';

import type { Point } from 'shared/types/canvas';
import type {
  ToolType,
  IShape,
  EventOffset,
} from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { getRandomStrokeWidth } from '../canvasUtils';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { Line } from './Line';
import { Pencil } from './Pencil';
import ShapeHitTestWorker from '../shapeHitTest.worker.ts?worker';
// Дублирую тип ShapeData локально, чтобы избежать ошибки импорта типа из воркера
// (или можно импортировать напрямую из shapeHitTest.worker.ts, если нужно)
type ShapeData =
  | { type: 'rectangle'; x: number; y: number; width: number; height: number; rotation?: number }
  | { type: 'circle'; x: number; y: number; radius: number }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'pencil'; points: Point[] };

// Type guards для фигур
function isRectangle(shape: IShape): shape is Rectangle {
  return shape.type === 'rectangle';
}
function isCircle(shape: IShape): shape is Circle {
  return shape.type === 'circle';
}
function isLine(shape: IShape): shape is Line {
  return shape.type === 'line';
}
function isPencil(shape: IShape): shape is Pencil {
  return shape.type === 'pencil';
}

export class Draftly {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private shapes: IShape[] = [];
  private currentTool: ToolType;
  private readonly interaction: Interaction;
  private animationFrameId: number | null = null;
  // private static readonly INITIAL_SHAPES_COUNT = 100;
  private readonly roughCanvas: ReturnType<typeof rough.canvas>;
  private static readonly DRAWING_TOOLS = [TOOLS[1], TOOLS[2], TOOLS[3], TOOLS[4]];
  private currentColor: string = BASE_PALETTE[0];
  private static readonly HANDLE_CURSOR_MAP = new Map([
    ['nw', 'nwse-resize'],
    ['n', 'ns-resize'],
    ['ne', 'nesw-resize'],
    ['e', 'ew-resize'],
    ['se', 'nwse-resize'],
    ['s', 'ns-resize'],
    ['sw', 'nesw-resize'],
    ['w', 'ew-resize'],
    ['rotate', 'grab'],
  ]);
  // Viewport for pan/zoom
  private viewport = {
    x: 0,
    y: 0,
  };
  private hitTestWorker = new ShapeHitTestWorker();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.roughCanvas = rough.canvas(this.canvas);
    this.interaction = new Interaction();
    this.currentTool = TOOLS[4];
    this.resizeCanvasToWrapper();
    this.requestDraw();
  }

  private requestDraw(): void {
    if (this.animationFrameId !== null) return;

    this.animationFrameId = requestAnimationFrame(() => {
      this.drawShapes();
      this.animationFrameId = null;
    });
  }
    
  clearCanvas(): void {
    this.shapes = [];
    this.deselectShape();
  }
    
  setTool(toolName: ToolType): void {
    this.currentTool = toolName;
  }

  setColor(color: string): void {
    this.currentColor = color;
  }

  deleteSelectedShape(): void {
    if (this.interaction.shape) {
      this.deleteShape(this.interaction.shape);
      this.interaction.patch({ shape: null });
      this.requestDraw();
      this.autoSave();
    }
  }

  deselectShape(): void {
    this.interaction.patch({ shape: null, handle: null, type: 'idle' });
    this.setCursor('default');
    this.requestDraw();
  }

  private setCursor(cursor: CSSStyleDeclaration['cursor']): void {
    this.canvas.style.cursor = cursor;
  }

  private addShape(shape: IShape) {
    this.shapes.push(shape);
  }

  private deleteShape(shape: IShape) {
    this.shapes = this.shapes.filter(s => s !== shape);
  }

  private drawShapes(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.viewport.x, this.viewport.y);
        
    const { shape, type } = this.interaction;

    this.shapes.forEach(shape => {
      shape.draw(this.ctx, this.roughCanvas);
    });

    if (type !== 'drawing') {
      shape?.drawSelection(this.ctx);
    }
    this.ctx.restore();
  }
    
  private getMousePos(e: EventOffset): Point {
    return {
      x: e.offsetX - this.viewport.x,
      y: e.offsetY - this.viewport.y,
    };
  }

  handlePointerDown(e: EventOffset): void {    
    const mouse = this.getMousePos(e);

    if (this.isDrawingToolSelected()) {
      let newShape: IShape | null = null;

      switch (this.currentTool) {
        case 'pencil': {
          newShape = new Pencil({
            color: this.currentColor,
            strokeWidth: getRandomStrokeWidth(),
            points: [mouse],
          });

          break;
        }

        case 'rectangle': {
          newShape = new Rectangle({
            color: this.currentColor,
            strokeWidth: getRandomStrokeWidth(),
            x: mouse.x,
            y: mouse.y,
            width: 1,
            height: 1,
          });

          break;
        }

        case 'circle': {
          newShape = new Circle({
            color: this.currentColor,
            strokeWidth: getRandomStrokeWidth(),
            x: mouse.x,
            y: mouse.y,
            radius: 1,
          });

          break;
        }

        case 'line': {
          newShape = new Line({
            color: this.currentColor,
            strokeWidth: getRandomStrokeWidth(),
            x1: mouse.x,
            y1: mouse.y,
            x2: mouse.x,
            y2: mouse.y,
          });

          break;
        }
      }

      if (newShape) {
        newShape.startDrawing(this.interaction, mouse);
        this.addShape(newShape);
        this.requestDraw();
      }
    } else {
      if (this.interaction.shape) {
        const shape = this.interaction.shape;
        const handle = shape.getHandleAt(mouse);
  
        if (handle) {
          shape.startResizing(this.interaction, handle, mouse);
  
          return;
        }
      }

      let shapeSelected = false;

      for (let i = this.shapes.length - 1; i >= 0; i--) {
        const shape = this.shapes[i];
    
        if (shape.isPointInShape(mouse)) {
          shape.startDragging(this.interaction, mouse);
          this.setCursor('move');
          shapeSelected = true;
          break;
        }
      }
    
      if (!shapeSelected) {
        this.interaction.patch({
          type: 'panning',
          panOffset: { x: this.viewport.x - e.offsetX, y: this.viewport.y - e.offsetY },
          shape: null,
          handle: null,
        });
        this.setCursor('grab');
      }
      
      this.requestDraw();
    }
  }
    
  async handlePointerMove(e: EventOffset): Promise<void> {
    const mouse = this.getMousePos(e);

    const { shape: interShape, type: interType } = this.interaction;

    if (interType === 'panning') {
      this.handlePanning(e);
      this.requestDraw();
      this.setCursor('grabbing');
    } else if (interType === 'drawing') {
      interShape?.drawNewShape(mouse);
      this.requestDraw();
      this.setCursor('crosshair');
    } else if (interType === 'dragging') {
      interShape?.move(mouse, this.interaction);
      this.requestDraw();
      this.setCursor('move');
    } else if (interType === 'resizing') {
      interShape?.resize(mouse, this.interaction);
      this.requestDraw();
      this.setCursor(this.getCursorForHandle(this.interaction.handle));
    } else if (interType === 'idle') {
      if (this.isDrawingToolSelected()) {
        this.setCursor('crosshair');
        return;
      }

      const hoveredHandle = interShape?.getHandleAt(mouse) ?? null;

      if (hoveredHandle) {
        this.setCursor(this.getCursorForHandle(hoveredHandle));
      } else if (await this.isAnyShapeHoveredAsync(mouse)) {
        this.setCursor('move');
      } else {
        this.setCursor('default');
      }
    }

  }

  private isDrawingToolSelected(): boolean {
    return Draftly.DRAWING_TOOLS.includes(this.currentTool);
  }

  private handlePanning(e: EventOffset): void {
    const { panOffset } = this.interaction;
    this.viewport.x = panOffset.x + e.offsetX;
    this.viewport.y = panOffset.y + e.offsetY;
  }
    
  handlePointerUp(): void {
    if (this.interaction.type === 'panning') {
      this.interaction.patch({
        type: 'idle',
        panOffset: { x: 0, y: 0 },
      });
      this.setCursor('default');
    } else if (this.interaction.type === 'drawing') {
      this.interaction.patch({
        shape: null,
        type: 'idle',
      });
    } else {
      this.interaction.patch({
        handle: null,
        type: 'idle',
        dragOffset: { x: 0, y: 0 },
      });
    }

    this.requestDraw();

    this.autoSave();
  }
    
  private autoSave(): void {
    try {
      localStorage.setItem('shapes', JSON.stringify(this.shapes));
    } catch (e) {
      console.warn('Error saving shapes:', e);
    }
  }

  getShapes(): IShape[] {
    return this.shapes;
  }

  setShapes(shapes: IShape[]): void {
    this.shapes = shapes;
    this.requestDraw();
  }

  getInteraction(): Interaction {
    return this.interaction;
  }
    
  private getCursorForHandle(handle: Handle | null): string {
    if (!handle) return 'default';

    return Draftly.HANDLE_CURSOR_MAP.get(handle) ?? 'default';
  }

  /**
   * Асинхронно ищет индекс фигуры, в которую попадает точка (mouse), используя Web Worker
   */
  private async hitTestShapes(mouse: Point): Promise<number> {
    const shapesData: ShapeData[] = this.shapes.map(shape => {
      if (isRectangle(shape)) {
        return {
          type: 'rectangle',
          x: shape.x,
          y: shape.y,
          width: shape.width,
          height: shape.height,
          rotation: shape.rotation ?? 0,
        };
      } else if (isCircle(shape)) {
        return {
          type: 'circle',
          x: shape.x,
          y: shape.y,
          radius: shape.radius,
        };
      } else if (isLine(shape)) {
        return {
          type: 'line',
          x1: shape.x1,
          y1: shape.y1,
          x2: shape.x2,
          y2: shape.y2,
        };
      } else if (isPencil(shape)) {
        return {
          type: 'pencil',
          points: shape.points,
        };
      } else {
        throw new Error('Unknown shape type');
      }
    });
    return new Promise<number>(resolve => {
      this.hitTestWorker.onmessage = (e: MessageEvent<{ hitIndex: number }>) => {
        resolve(e.data.hitIndex);
      };
      this.hitTestWorker.postMessage({ point: mouse, shapes: shapesData });
    });
  }

  // Заменяю isAnyShapeHovered на асинхронную версию
  async isAnyShapeHoveredAsync(mouse: Point): Promise<boolean> {
    const hitIndex = await this.hitTestShapes(mouse);
    return hitIndex !== -1;
  }

  resizeCanvasToWrapper() {
    const wrapper = this.canvas.parentElement;

    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio ?? 1;
      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.canvas.style.width = rect.width + 'px';
      this.canvas.style.height = rect.height + 'px';
      this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset any existing transforms
      this.ctx.scale(dpr, dpr);
      this.requestDraw();
    }
  }
} 
