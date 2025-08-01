import rough from 'roughjs';
import { BASE_PALETTE, TOOLS } from 'shared/types/colors';
import { createDeepReactiveMap, makeReactive } from 'shared/utils/reactive';

import type {
  ToolType,
  Point,
  EventOffset,
} from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { getRandomStrokeWidth } from '../utils/canvas';
import { Rectangle } from './Rectangle';
import { Circle } from './Circle';
import { Line } from './Line';
import { Pencil } from './Pencil';
import { Shape } from './Shape';

export class Draftly {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private shapeOrder: string[] = [];
  private shapeMap: Map<string, Shape>;
  private currentTool: ToolType = TOOLS[4];
  private readonly interaction: Interaction;
  private animationFrameId: number | null = null;
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
  private viewport: Point; 
  private lastHoveredShapeId: string | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.roughCanvas = rough.canvas(this.canvas);
    
    this.shapeMap = createDeepReactiveMap<string, Shape>(
      new Map(),
      (event, data) => {
        this.requestDraw();
        console.log('ShapeMap changed:', event, data);
      },
    );

    this.interaction = makeReactive(new Interaction(), (event, data) => {
      this.requestDraw();
      console.log('Interaction changed:', event, data);
    });
    
    this.viewport = makeReactive({
      x: 0,
      y: 0,
    }, (event, data) => {
      this.requestDraw();
      console.log('Viewport changed:', event, data);
    });
    
    this.resizeCanvasToWrapper();
  }

  private requestDraw(): void {
    if (this.animationFrameId !== null) return;

    this.animationFrameId = requestAnimationFrame(() => {
      this.drawShapes();
      this.animationFrameId = null;
    });
  }
    
  clearCanvas(): void {
    this.shapeOrder = [];
    this.shapeMap.clear();
    this.deselectShape();
  }
    
  setTool(toolName: ToolType): void {
    this.currentTool = toolName;
  }

  setColor(color: string): void {
    this.currentColor = color;
  }

  deleteSelectedShape(): string | null {
    if (this.interaction.shape) {
      const idToDelete = this.interaction.shape.id;
      this.applyDeleteShape(idToDelete);
      this.interaction.patch({ shape: null });

      return idToDelete;
    }

    return null;
  }

  deselectShape(): void {
    this.interaction.patch({ shape: null, handle: null, type: 'idle' });
    this.setCursor('default');
  }

  private setCursor(cursor: CSSStyleDeclaration['cursor']): void {
    this.canvas.style.cursor = cursor;
  }

  private drawShapes(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.save();
    this.ctx.translate(this.viewport.x, this.viewport.y);
        
    const { shape, type } = this.interaction;

    this.shapeOrder.forEach(id => {
      const currentShape = this.shapeMap.get(id);
      currentShape?.draw(this.ctx, this.roughCanvas);
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
      let newShape: Shape | null = null;

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
        this.applyAddShape(newShape);
        const shape = this.shapeMap.get(newShape.id);
        shape?.startDrawing(this.interaction, mouse);
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

      for (let i = this.shapeOrder.length - 1; i >= 0; i--) {
        const shapeId = this.shapeOrder[i];
        const shape = this.shapeMap.get(shapeId);
    
        if (shape?.isPointInShape(mouse)) {
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
    }
  }
    
  handlePointerMove(e: EventOffset): void {
    const mouse = this.getMousePos(e);

    const { shape: interShape, type: interType } = this.interaction;

    if (interType === 'panning') {
      this.handlePanning(e);
      this.setCursor('grabbing');
    } else if (interType === 'drawing') {
      interShape?.drawNewShape(mouse, this.interaction.startPoint);
      this.setCursor('crosshair');
    } else if (interType === 'dragging') {
      interShape?.move(mouse, this.interaction);
      this.setCursor('move');
    } else if (interType === 'resizing') {
      interShape?.resize(mouse, this.interaction);
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
  }

  getShapes(): Shape[] {
    return this.shapeOrder.map(id => this.shapeMap.get(id)).filter(Boolean) as Shape[];
  }

  setShapes(shapes: Shape[]): void {
    this.shapeOrder = shapes.map(shape => shape.id);
    this.shapeMap.clear();

    this.shapeMap = createDeepReactiveMap<string, Shape>(
      new Map(shapes.map(shape => [shape.id, shape])),
      (event, data) => {
        this.requestDraw();
        console.log('ShapeMap changed:', event, data);
      },
    );
    
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
    // First, check the last hovered shape
    if (this.lastHoveredShapeId) {
      const shape = this.shapeMap.get(this.lastHoveredShapeId);

      if (shape?.isPointInShape(mouse)) {
        return true;
      }
    }

    // Then search among the rest and update lastHoveredShapeId if found
    if (this.shapeOrder.some(id => {
      if (id === this.lastHoveredShapeId) return false;
      const shape = this.shapeMap.get(id);

      if (shape?.isPointInShape(mouse)) {
        this.lastHoveredShapeId = id;

        return true;
      }

      return false;
    })) {
      return true;
    }

    // If nothing is found, reset lastHoveredShapeId
    this.lastHoveredShapeId = null;

    return false;
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
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.requestDraw();
    }
  }

  applyAddShape(shape: Shape): void {
    if (!this.shapeMap.has(shape.id)) {
      this.shapeOrder.push(shape.id);
      this.shapeMap.set(shape.id, shape);
    }
  }

  applyUpdateShape(shape: Shape): void {
    if (this.shapeMap.has(shape.id)) {
      const existingShape = this.shapeMap.get(shape.id);

      if (existingShape) {
        existingShape.patch(shape);
      } else {
        this.shapeMap.set(shape.id, shape);
      }
    }
  }

  applyDeleteShape(shapeId: string): void {
    if (this.shapeMap.has(shapeId)) {
      this.shapeOrder = this.shapeOrder.filter(id => id !== shapeId);
      this.shapeMap.delete(shapeId);
    }
  }
} 
