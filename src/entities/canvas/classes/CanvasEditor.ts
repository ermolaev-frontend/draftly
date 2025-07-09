import rough from 'roughjs';

import type {
  ToolType,
  Point,
  IShape,
} from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { getInitialShapes, getRandomColor, getRandomStrokeWidth } from '../canvasUtils';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { Line } from './Line';
import { Pencil } from './Pencil';
import { Ellipse } from './Ellipse';

export class CanvasEditor {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private shapes: IShape[];
  private currentTool: ToolType;
  private readonly interaction: Interaction;
  private animationFrameId: number | null = null;
  private INITIAL_SHAPES_COUNT = 100;
  private readonly roughCanvas: ReturnType<typeof rough.canvas>;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.roughCanvas = rough.canvas(this.canvas);
    this.interaction = new Interaction();
    this.currentTool = 'select';
    this.resizeCanvasToWrapper();

    this.shapes = getInitialShapes(canvas, this.INITIAL_SHAPES_COUNT);
    
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
    this.requestDraw();
  }
    
  setTool(toolName: ToolType): void {
    this.currentTool = toolName;
  }

  deleteSelectedShape(): void {
    if (this.interaction.shape) {
      this.shapes = this.shapes.filter(s => s !== this.interaction.shape);
      this.interaction.patch({ shape: null });
      this.requestDraw();
      this.autoSave?.();
    }
  }

  deselectShape(): void {
    this.interaction.patch({ shape: null, handle: null, type: 'idle' });
    this.canvas.style.cursor = 'default';
  }

  private drawShapes(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
    if (!Array.isArray(this.shapes)) return;

    const { shape, type } = this.interaction;

    this.shapes.forEach(shape => {
      shape.draw(this.ctx, this.roughCanvas);
    });

    if (shape && type !== 'drawing') {
      shape.drawSelection(this.ctx);
    }
  }
    
  redraw(): void {
    this.requestDraw();
  }
    
  private getMousePos(e: MouseEvent | { offsetX: number; offsetY: number }): Point {
    if ('offsetX' in e && 'offsetY' in e) {
      return { x: e.offsetX, y: e.offsetY };
    }

    return { x: (e as MouseEvent).offsetX, y: (e as MouseEvent).offsetY };
  }

  onMouseDown(e: MouseEvent | { offsetX: number; offsetY: number }): void {    
    const mouse = this.getMousePos(e);
    const drawingTools = ['rectangle', 'circle', 'ellipse', 'line', 'pencil'];

    if (drawingTools.includes(this.currentTool)) {
      let newShape: IShape | null = null;

      switch (this.currentTool) {
        case 'pencil': {
          newShape = new Pencil({
            color: getRandomColor(),
            strokeWidth: getRandomStrokeWidth(),
            points: [mouse],
          });

          break;
        }

        case 'rectangle': {
          newShape = new Rectangle({
            x: mouse.x,
            y: mouse.y,
            width: 1,
            height: 1,
          });

          break;
        }

        case 'circle': {
          newShape = new Circle({
            x: mouse.x,
            y: mouse.y,
            radius: 1,
          });

          break;
        }

        case 'ellipse': {
          newShape = new Ellipse({
            x: mouse.x,
            y: mouse.y,
            radiusX: 1,
            radiusY: 1,
          });

          break;
        }

        case 'line': {
          newShape = new Line({
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
        this.shapes.push(newShape);
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
          this.canvas.style.cursor = 'move';
          shapeSelected = true;
          break;
        }
      }
    
      if (!shapeSelected) {
        this.deselectShape();
      }
      
      this.requestDraw();
    }
  }
    
  onMouseMove(e: MouseEvent | { offsetX: number; offsetY: number }): void {
    const mouse = this.getMousePos(e);
    let cursor = 'default';
    const drawingTools = ['rectangle', 'circle', 'ellipse', 'line', 'pencil'];

    const { shape: interShape, type: interType } = this.interaction;

    if (interType === 'drawing') {
      interShape?.drawNewShape(mouse, this.interaction);
      this.requestDraw();
      cursor = 'crosshair';
    } else if (interType === 'dragging') {
      interShape?.move(mouse, this.interaction);
      this.requestDraw();
      cursor = 'move';
    } else if (interType === 'resizing') {
      interShape?.resize(mouse, this.interaction);
      this.requestDraw();
      cursor = this.getCursorForHandle(this.interaction.handle);
    } else {
      // Check if mouse is hovering over a handle
      let hoveredHandle = null;

      if (interShape) {
        hoveredHandle = interShape.getHandleAt(mouse);
      }

      if (hoveredHandle) {
        cursor = this.getCursorForHandle(hoveredHandle);
      } else {
        let hoveredSelected = false;
        let hovered = false;

        for (let i = this.shapes.length - 1; i >= 0; i--) {
          if (this.shapes[i].isPointInShape(mouse)) {
            hovered = true;

            if (this.shapes[i] === interShape) {
              hoveredSelected = true;
            }

            break;
          }
        }

        if (hoveredSelected) {
          cursor = 'move';
        } else if (hovered) {
          cursor = 'pointer';
        }
      }
    }

    // --- FINAL cursor logic for drawing tools ---
    if (drawingTools.includes(this.currentTool)) {
      cursor = 'crosshair';
    }

    this.canvas.style.cursor = cursor;
  }
    
  onMouseUp(): void {
    if (this.interaction.type === 'drawing') {
      this.interaction.patch({
        shape: null,
        type: 'idle',
        startPoint: { x: 0, y: 0 },
      });
    } else {
      this.interaction.patch({
        handle: null,
        type: 'idle',
        dragOffset: { x: 0, y: 0 },
      });
    }

    this.autoSave();
  }
    
  private autoSave(): void {
    try {
      localStorage.setItem('shapes', JSON.stringify(this.shapes));
    } catch (e) {
      console.warn('Error saving shapes:', e);
    }
  }
    
  private getCursorForHandle(handle: Handle | null): string {
    if (!handle) return 'default';

    return CanvasEditor.handleCursorMap.get(handle) ?? 'default';
  }

  static handleCursorMap = new Map([
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

  resizeCanvasToWrapper() {
    const wrapper = this.canvas.parentElement;

    if (wrapper) {
      const rect = wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
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
