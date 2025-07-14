import rough from 'roughjs';
import { BASE_PALETTE, TOOLS } from 'shared/types/colors';

import type {
  ToolType,
  Point,
  IShape,
  EventOffset,
} from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { getRandomStrokeWidth } from '../canvasUtils';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { Line } from './Line';
import { Pencil } from './Pencil';

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
    
  handlePointerMove(e: EventOffset): void {
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
      } else if (this.isAnyShapeHovered(mouse)) {
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

  private isAnyShapeHovered(mouse: Point): boolean {
    return this.shapes.some(shape => shape.isPointInShape(mouse));
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
