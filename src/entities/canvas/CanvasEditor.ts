import rough from 'roughjs';

import type {
  ToolType,
  RectangleShape,
  CircleShape,
  LineShape,
  PencilShape,
  Shape,
  InteractionState,
  Point,
} from 'shared/types/canvas';

import { hashStringToSeed } from './canvasUtils';

export class CanvasEditor {
  private canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private shapes: Shape[];
  private currentTool: ToolType;
  private interaction: InteractionState;
  private animationFrameId: number | null = null;
  private INITIAL_SHAPES_COUNT = 100;
  private roughCanvas: any | null = null;
  private shapeIdCounter = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.roughCanvas = rough.canvas(this.canvas);

    this.interaction = {
      isDragging: false,
      isResizing: false,
      selectedShape: null,
      dragOffset: { x: 0, y: 0 },
      resizeHandle: null,
    };

    this.currentTool = 'select'; // New tool: select, pencil, ...
    this.requestDraw();
    // ВАЖНО: выставить размеры canvas по wrapper'у
    this.resizeCanvasToWrapper();
    // Теперь canvas.width и height актуальны!
    const margin = 40; // inner margin for shapes
    const zoneRows = 6;
    const zoneCols = 6;
    const zoneWidth = (this.canvas.width - 2 * margin) / zoneCols;
    const zoneHeight = (this.canvas.height - 2 * margin) / zoneRows;
    const zones = [];

    for (let row = 0; row < zoneRows; row++) {
      for (let col = 0; col < zoneCols; col++) {
        zones.push({
          xMin: margin + col * zoneWidth,
          xMax: margin + (col + 1) * zoneWidth,
          yMin: margin + row * zoneHeight,
          yMax: margin + (row + 1) * zoneHeight,
        });
      }
    }

    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
    // Create INITIAL_SHAPES_COUNT shapes distributed across 6 zones
    this.shapes = [];

    for (let i = 0; i < this.INITIAL_SHAPES_COUNT; i++) {
      const zone = zones[i % zones.length];
      const typeRand = Math.random();
      let newShape: Shape;

      if (typeRand < 0.25) {
        // Rectangle
        newShape = this.createRectangle({
          x: this.getRandom(zone.xMin, zone.xMax - 120),
          y: this.getRandom(zone.yMin, zone.yMax - 100),
          width: this.getRandom(100, Math.min(180, zone.xMax - zone.xMin)),
          height: this.getRandom(80, Math.min(140, zone.yMax - zone.yMin)),
          color: colors[Math.floor(this.getRandom(0, colors.length))],
          strokeWidth: this.getRandom(3, 6),
          type: 'rectangle' as const,
          rotation: 0,
        });
      } else if (typeRand < 0.5) {
        // Circle
        newShape = this.createCircle({
          x: this.getRandom(zone.xMin + 60, zone.xMax - 60),
          y: this.getRandom(zone.yMin + 60, zone.yMax - 60),
          radius: this.getRandom(
            40,
            Math.min(80, (zone.xMax - zone.xMin) / 2, (zone.yMax - zone.yMin) / 2),
          ),
          color: colors[Math.floor(this.getRandom(0, colors.length))],
          strokeWidth: this.getRandom(3, 6),
          type: 'circle' as const,
        });
      } else if (typeRand < 0.75) {
        // Line
        const cx = (zone.xMin + zone.xMax) / 2;
        const cy = (zone.yMin + zone.yMax) / 2;

        const length = this.getRandom(
          80,
          Math.min(zone.xMax - zone.xMin, zone.yMax - zone.yMin) - 20,
        );

        const angle = this.getRandom(0, Math.PI * 2);
        const x1 = cx - Math.cos(angle) * length / 2;
        const y1 = cy - Math.sin(angle) * length / 2;
        const x2 = cx + Math.cos(angle) * length / 2;
        const y2 = cy + Math.sin(angle) * length / 2;

        newShape = this.createLine({
          x1, y1, x2, y2,
          color: colors[Math.floor(this.getRandom(0, colors.length))],
          strokeWidth: this.getRandom(3, 6),
          type: 'line' as const,
        });
      } else {
        // Pencil
        const numPoints = Math.floor(this.getRandom(5, 20));
        const points = [];
        let px = this.getRandom(zone.xMin + 10, zone.xMax - 10);
        let py = this.getRandom(zone.yMin + 10, zone.yMax - 10);
        points.push({ x: px, y: py });

        for (let p = 1; p < numPoints; p++) {
          px += this.getRandom(-20, 20);
          py += this.getRandom(-20, 20);
          px = Math.max(zone.xMin + 5, Math.min(zone.xMax - 5, px));
          py = Math.max(zone.yMin + 5, Math.min(zone.yMax - 5, py));
          points.push({ x: px, y: py });
        }

        newShape = {
          type: 'pencil',
          color: colors[Math.floor(this.getRandom(0, colors.length))],
          strokeWidth: this.getRandom(3, 6),
          points,
        };
      }

      this.shapes.push(newShape);
    }

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

  /**
     * Deletes the currently selected shape (if any) from the shapes array and redraws the canvas.
     */
  public deleteSelectedShape(): void {
    const selected = this.interaction.selectedShape;

    if (selected) {
      this.shapes = this.shapes.filter(s => s !== selected);
      this.interaction.selectedShape = null;
      this.requestDraw();
      this.autoSave?.();
    }
  }

  /**
     * Deselects the currently selected shape (if any) and redraws the canvas.
     */
  public deselectShape(): void {
    this.interaction = {
      ...this.interaction,
      selectedShape: null,
      isDragging: false,
      isResizing: false,
      resizeHandle: null,
    };

    this.canvas.style.cursor = 'default';
  }

  // === Private methods ===
    
  private drawShape(shape: Shape): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = shape.color;

    ctx.lineWidth = (shape.type === 'pencil')
      ? shape.strokeWidth * 2
      : shape.strokeWidth;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    switch (shape.type) {
      case 'rectangle': {
        const center = this.getRectangleCenter(shape);
        const rotation = this.getRectangleRotation(shape);
        ctx.translate(center.x, center.y);
        ctx.rotate(rotation);

        this.roughCanvas.rectangle(
          -shape.width / 2,
          -shape.height / 2,
          shape.width,
          shape.height,
          {
            stroke: shape.color,
            strokeWidth: shape.strokeWidth,
            fill: undefined,
            roughness: 1.5,
            bowing: 2,
            seed: shape.id ? hashStringToSeed(shape.id) : undefined,
          },
        );

        ctx.restore();

        return;
      }

      case 'circle': {
        // Use roughjs for circles
        const center = this.getCircleCenter(shape);

        this.roughCanvas.ellipse(
          center.x,
          center.y,
          shape.radius * 2,
          shape.radius * 2,
          {
            stroke: shape.color,
            strokeWidth: shape.strokeWidth,
            fill: undefined,
            roughness: 1.5,
            bowing: 2,
            seed: shape.id ? hashStringToSeed(shape.id) : undefined,
          },
        );

        ctx.restore();

        return;
      }

      case 'line': {
        // Use roughjs for lines
        this.roughCanvas.line(
          shape.x1,
          shape.y1,
          shape.x2,
          shape.y2,
          {
            stroke: shape.color,
            strokeWidth: shape.strokeWidth,
            roughness: 1.5,
            bowing: 2,
            seed: shape.id ? hashStringToSeed(shape.id) : undefined,
          },
        );

        ctx.restore();

        return;
      }

      case 'pencil': {
        if (shape.points && shape.points.length > 1) {
          //const foo = false;
          const isLiveDrawing = this.interaction.isDrawingPencil && this.interaction.drawingShape === shape;

          if (isLiveDrawing) {
            // Draw a simple polyline for live preview (no rough effect)
            ctx.beginPath();

            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }

            ctx.strokeStyle = shape.color;
            ctx.lineWidth = shape.strokeWidth * 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.stroke();
          } else {
            // Cache the roughjs drawable for stability after drawing is finished
            const pointsChanged =
              !shape._roughDrawablePoints ||
              shape._roughDrawablePoints.length !== shape.points.length ||
              !shape._roughDrawablePoints.every((pt, i) => pt.x === shape.points[i].x && pt.y === shape.points[i].y);

            if (!shape._roughDrawable || pointsChanged) {
              shape._roughDrawable = this.roughCanvas.generator.linearPath(
                shape.points.map(pt => [pt.x, pt.y]),
                {
                  stroke: shape.color,
                  strokeWidth: shape.strokeWidth * 2,
                  roughness: 0.5,
                  bowing: 2,
                  seed: shape.id ? hashStringToSeed(shape.id) : undefined,
                },
              );

              // Store a shallow copy of the points
              shape._roughDrawablePoints = shape.points.map(pt => ({ ...pt }));
            }

            this.roughCanvas.draw(shape._roughDrawable);
          }
        }

        ctx.restore();

        return;
      }

      default:
        break;
    }

    ctx.restore();
  }
    
  private drawSelection(shape: Shape): void {
    if (shape !== this.interaction.selectedShape) return;

    const ctx = this.ctx;
    const bounds = this.getShapeBounds(shape);
    if (!bounds) return;
    ctx.save();
    // Colors in Excalidraw style
    const borderColor = '#228be6'; // saturated blue
    const fillColor = 'rgba(34, 139, 230, 0.08)'; // semi-transparent blue
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderColor;
    ctx.fillStyle = fillColor;
    ctx.setLineDash([]); // Solid line

    if (shape.type === 'rectangle') {
      // Rotate bounding box and handles together with rectangle
      const { x: cx, y: cy } = this.getRectangleCenter(shape);
      ctx.translate(cx, cy);
      ctx.rotate(this.getRectangleRotation(shape));

      // Fill
      ctx.fillRect(
        -shape.width/2,
        -shape.height/2,
        shape.width,
        shape.height,
      );

      // Frame
      ctx.strokeRect(
        -shape.width/2,
        -shape.height/2,
        shape.width,
        shape.height,
      );

      // Handles
      ctx.fillStyle = borderColor;
      this.getRectangleHandles(shape).forEach(h => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
      // Rotation handle (circle)
      const rotateHandle = { x: 0, y: -shape.height/2 - 30, type: 'rotate' };
      ctx.beginPath();
      ctx.arc(rotateHandle.x, rotateHandle.y, 8, 0, Math.PI*2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (shape.type === 'line') {
      // Don't draw bounding box, only handles
      ctx.fillStyle = borderColor;
      ctx.fillRect(shape.x1 - 4, shape.y1 - 4, 8, 8); // start
      ctx.fillRect(shape.x2 - 4, shape.y2 - 4, 8, 8); // end
    } else if (shape.type === 'circle') {
      // Fill
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.fill();
      // Frame
      ctx.beginPath();
      ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2);
      ctx.strokeStyle = borderColor;
      ctx.stroke();
      // Right handle from center (on circle)
      const handle = { x: shape.x + shape.radius, y: shape.y, type: 'radius' };
      ctx.beginPath();
      ctx.arc(handle.x, handle.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = borderColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (shape.type === 'pencil') {
      // Bounding box + 8 handles
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.fillStyle = borderColor;
      this.getBoundingBoxHandles(bounds).forEach(h => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
    } else {
      // For other shapes (if they appear)
      ctx.fillRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
      );

      ctx.strokeRect(
        bounds.x,
        bounds.y,
        bounds.width,
        bounds.height,
      );

      ctx.fillStyle = borderColor;
      // 8 handles: 4 corner and 4 side
      this.getBoundingBoxHandles(bounds).forEach(h => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
    }

    ctx.restore();
  }
    
  private drawShapes(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
    if (!Array.isArray(this.shapes)) return;

    this.shapes.forEach(shape => {
      this.drawShape(shape);
    });

    if (this.interaction?.selectedShape) {
      this.drawSelection(this.interaction.selectedShape);
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
    
  private getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } | null {
    switch (shape.type) {
      case 'rectangle': return {
        x: shape.x,
        y: shape.y,
        width: shape.width,
        height: shape.height,
      };
      case 'circle': return {
        x: shape.x - shape.radius,
        y: shape.y - shape.radius,
        width: shape.radius * 2,
        height: shape.radius * 2,
      };

      case 'line': {
        const minX = Math.min(shape.x1, shape.x2);
        const minY = Math.min(shape.y1, shape.y2);
        const maxX = Math.max(shape.x1, shape.x2);
        const maxY = Math.max(shape.y1, shape.y2);

        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      }

      case 'pencil': {
        if (!shape.points || shape.points.length === 0) return null;
        let minX = shape.points[0].x, maxX = shape.points[0].x;
        let minY = shape.points[0].y, maxY = shape.points[0].y;

        for (const pt of shape.points) {
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }

        return {
          x: minX,
          y: minY,
          width: (maxX - minX),
          height: (maxY - minY),
        };
      }

      default:
        return null;
    }
  }
    
  private isPointInShape(x: number, y: number, shape: Shape): boolean {
    const bounds = this.getShapeBounds(shape);
    if (!bounds) return false;

    switch (shape.type) {
      case 'circle': {
        const dx = x - shape.x, dy = y - shape.y;

        return dx * dx + dy * dy <= shape.radius * shape.radius;
      }

      case 'line': {
        const { x1, y1, x2, y2 } = shape;
        const dxToStart = x - x1;
        const dyToStart = y - y1;
        const lineDx = x2 - x1;
        const lineDy = y2 - y1;
        const projection = dxToStart * lineDx + dyToStart * lineDy;
        const lineLengthSq = lineDx * lineDx + lineDy * lineDy;
        let t = lineLengthSq ? projection / lineLengthSq : -1;
        t = Math.max(0, Math.min(1, t));
        const closestX = x1 + t * lineDx;
        const closestY = y1 + t * lineDy;
        const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

        return distance < 8;
      }

      case 'rectangle': {
        const cx = shape.x + shape.width/2;
        const cy = shape.y + shape.height/2;
        const angle = -(shape.rotation ?? 0);
        const dx = x - cx, dy = y - cy;
        const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
        const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;

        return lx >= -shape.width/2 && lx <= shape.width/2 && ly >= -shape.height/2 && ly <= shape.height/2;
      }

      case 'pencil': {
        if (!shape.points || shape.points.length < 2) return false;

        for (let i = 1; i < shape.points.length; i++) {
          const xStart = shape.points[i-1].x, yStart = shape.points[i-1].y;
          const xEnd = shape.points[i].x, yEnd = shape.points[i].y;
          const dxToStart = x - xStart;
          const dyToStart = y - yStart;
          const segmentDx = xEnd - xStart;
          const segmentDy = yEnd - yStart;
          const projection = dxToStart * segmentDx + dyToStart * segmentDy;
          const segmentLengthSq = segmentDx * segmentDx + segmentDy * segmentDy;
          let t = segmentLengthSq ? projection / segmentLengthSq : -1;
          t = Math.max(0, Math.min(1, t));
          const closestX = xStart + t * segmentDx;
          const closestY = yStart + t * segmentDy;
          const dist = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);
          if (dist < 8) return true;
        }

        return false;
      }

      default:
        return x >= bounds.x && x <= bounds.x + bounds.width && y >= bounds.y && y <= bounds.y + bounds.height;
    }
  }
    
  private getHandleAt(x: number, y: number, shape: Shape): { type: string } | null {
    if (shape !== this.interaction.selectedShape) return null;

    switch (shape.type) {
      case 'line': {
        if (Math.abs(x - shape.x1) <= 8 && Math.abs(y - shape.y1) <= 8) return { type: 'start' };
        if (Math.abs(x - shape.x2) <= 8 && Math.abs(y - shape.y2) <= 8) return { type: 'end' };

        return null;
      }

      case 'rectangle': {
        const cx = shape.x + shape.width/2;
        const cy = shape.y + shape.height/2;
        const angle = -(shape.rotation ?? 0);
        const dx = x - cx, dy = y - cy;
        const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
        const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;

        for (const h of this.getRectangleHandles(shape)) {
          if (h.type === 'rotate') {
            if ((lx-h.x)**2 + (ly-h.y)**2 <= 10*10) return { type: 'rotate' };
          } else {
            if (Math.abs(lx - h.x) <= 8 && Math.abs(ly - h.y) <= 8) return { type: h.type };
          }
        }

        return null;
      }

      case 'circle': {
        const handleX = shape.x + shape.radius;
        const handleY = shape.y;

        if ((x - handleX) ** 2 + (y - handleY) ** 2 <= 10 * 10) {
          return { type: 'radius' };
        }

        return null;
      }

      case 'pencil': {
        const bounds = this.getShapeBounds(shape);
        if (!bounds) return null;

        for (const h of this.getBoundingBoxHandles(bounds)) {
          if (Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) return { type: h.type };
        }

        return null;
      }

      default: {
        const bounds = this.getShapeBounds(shape);
        if (!bounds) return null;

        return this.getBoundingBoxHandles(bounds)
          .find(h => Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) ?? null;
      }
    }
  }
    
  private resizeShape(mouse: Point): void {
    const shape = this.interaction.selectedShape;
    const handle = this.interaction.resizeHandle;
    if (!shape || !handle) return;
        
    switch (shape.type) {
      case 'rectangle': {
        if (handle.type === 'rotate') {
          const cx = shape.x + shape.width/2;
          const cy = shape.y + shape.height/2;
          const angle = Math.atan2(mouse.y - cy, mouse.x - cx);

          if (this.interaction && this.interaction.initialAngle != null) {
            shape.rotation = angle - this.interaction.initialAngle + (this.interaction.startRotation ?? 0);
          } else {
            shape.rotation = angle;
          }

          this.requestDraw();

          return;
        }

        if (handle.type) {
          const cx = shape.x + shape.width/2;
          const cy = shape.y + shape.height/2;
          const angle = -(shape.rotation ?? 0);
          const dx = mouse.x - cx, dy = mouse.y - cy;
          const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
          const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
          let left = -shape.width/2, right = shape.width/2, top = -shape.height/2, bottom = shape.height/2;

          switch (handle.type) {
            case 'nw':
              left = Math.min(lx, right - 20);
              top = Math.min(ly, bottom - 20);
              break;
            case 'ne':
              right = Math.max(lx, left + 20);
              top = Math.min(ly, bottom - 20);
              break;
            case 'se':
              right = Math.max(lx, left + 20);
              bottom = Math.max(ly, top + 20);
              break;
            case 'sw':
              left = Math.min(lx, right - 20);
              bottom = Math.max(ly, top + 20);
              break;
            case 'n':
              top = Math.min(ly, bottom - 20);
              break;
            case 's':
              bottom = Math.max(ly, top + 20);
              break;
            case 'e':
              right = Math.max(lx, left + 20);
              break;
            case 'w':
              left = Math.min(lx, right - 20);
              break;
          }

          const newWidth = right - left;
          const newHeight = bottom - top;

          const newCx = cx + (
            Math.cos(shape.rotation ?? 0) * (left + right) / 2 -
            Math.sin(shape.rotation ?? 0) * (top + bottom) / 2
          );

          const newCy = cy + (
            Math.sin(shape.rotation ?? 0) * (left + right) / 2 +
            Math.cos(shape.rotation ?? 0) * (top + bottom) / 2
          );

          shape.width = newWidth;
          shape.height = newHeight;
          shape.x = newCx - newWidth/2;
          shape.y = newCy - newHeight/2;
          this.requestDraw();

          return;
        }

        break;
      }

      case 'circle': {
        if (handle.type === 'radius') {
          const dx = mouse.x - shape.x;
          const dy = mouse.y - shape.y;
          const newRadius = Math.sqrt(dx * dx + dy * dy);
          shape.radius = Math.max(20, newRadius);
          this.requestDraw();

          return;
        }

        break;
      }

      case 'line': {
        if (handle.type === 'start') {
          shape.x1 = mouse.x;
          shape.y1 = mouse.y;
        } else if (handle.type === 'end') {
          shape.x2 = mouse.x;
          shape.y2 = mouse.y;
        }

        this.requestDraw();

        return;
      }

      case 'pencil': {
        if (this.interaction.pencilResize) {
          const { initialPoints, initialBounds } = this.interaction.pencilResize;
          let newX = initialBounds.x, newY = initialBounds.y, newW = initialBounds.width, newH = initialBounds.height;

          switch (handle.type) {
            case 'nw':
              newX = mouse.x;
              newY = mouse.y;
              newW = initialBounds.x + initialBounds.width - mouse.x;
              newH = initialBounds.y + initialBounds.height - mouse.y;
              break;
            case 'ne':
              newY = mouse.y;
              newW = mouse.x - initialBounds.x;
              newH = initialBounds.y + initialBounds.height - mouse.y;
              break;
            case 'se':
              newW = mouse.x - initialBounds.x;
              newH = mouse.y - initialBounds.y;
              break;
            case 'sw':
              newX = mouse.x;
              newW = initialBounds.x + initialBounds.width - mouse.x;
              newH = mouse.y - initialBounds.y;
              break;
            case 'n':
              newY = mouse.y;
              newH = initialBounds.y + initialBounds.height - mouse.y;
              break;
            case 's':
              newH = mouse.y - initialBounds.y;
              break;
            case 'e':
              newW = mouse.x - initialBounds.x;
              break;
            case 'w':
              newX = mouse.x;
              newW = initialBounds.x + initialBounds.width - mouse.x;
              break;
          }

          newW = Math.max(10, newW);
          newH = Math.max(10, newH);

          shape.points = initialPoints.map((pt: Point) => {
            const relX = (pt.x - initialBounds.x) / initialBounds.width;
            const relY = (pt.y - initialBounds.y) / initialBounds.height;

            return {
              x: newX + relX * newW,
              y: newY + relY * newH,
            };
          });

          this.requestDraw();

          return;
        }

        break;
      }

      default:
        break;
    }

    this.requestDraw();
  }

  public onMouseDown(e: MouseEvent | { offsetX: number; offsetY: number }): void {
    const mouse = this.getMousePos(e);

    if (this.currentTool === 'pencil') {
      // Start a new line
      const newShape: PencilShape = {
        type: 'pencil',
        color: this.getRandomColor(),
        strokeWidth: this.getRandomStrokeWidth(),
        points: [mouse],
      };

      this.shapes.push(newShape);

      this.interaction = {
        ...this.interaction,
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        selectedShape: null,
        dragOffset: { x: 0, y: 0 },
        isDrawingPencil: true,
        drawingShape: newShape,
      };

      this.requestDraw();

      return;
    }

    if (this.currentTool === 'rectangle') {
      const newShape = this.createRectangle({
        x: mouse.x,
        y: mouse.y,
        width: 1,
        height: 1,
      });

      this.shapes.push(newShape);

      this.interaction = {
        ...this.interaction,
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        selectedShape: null,
        dragOffset: { x: 0, y: 0 },
        isDrawingRectangle: true,
        drawingShape: newShape,
        startPoint: { ...mouse },
      };

      this.requestDraw();

      return;
    }

    if (this.currentTool === 'circle') {
      const newShape = this.createCircle({
        x: mouse.x,
        y: mouse.y,
        radius: 1,
      });

      this.shapes.push(newShape);

      this.interaction = {
        ...this.interaction,
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        selectedShape: null,
        dragOffset: { x: 0, y: 0 },
        isDrawingCircle: true,
        drawingShape: newShape,
        startPoint: { ...mouse },
      };

      this.requestDraw();

      return;
    }

    if (this.currentTool === 'line') {
      const newShape = this.createLine({
        x1: mouse.x,
        y1: mouse.y,
        x2: mouse.x,
        y2: mouse.y,
      });

      this.shapes.push(newShape);

      this.interaction = {
        ...this.interaction,
        isDragging: false,
        isResizing: false,
        resizeHandle: null,
        selectedShape: null,
        dragOffset: { x: 0, y: 0 },
        isDrawingLine: true,
        drawingShape: newShape,
        startPoint: { ...mouse },
      };

      this.requestDraw();

      return;
    }

    for (const shape of this.shapes) {
      if (shape === this.interaction.selectedShape) {
        const handle = this.getHandleAt(mouse.x, mouse.y, shape);

        if (handle) {
          let initialAngle = null;
          let startRotation = null;
          // --- pencil ---
          let pencilResize = null;

          if (shape.type === 'pencil') {
            const bounds = this.getShapeBounds(shape);

            if (bounds) {
              pencilResize = {
                initialPoints: shape.points.map(pt => ({ ...pt })),
                initialBounds: {
                  x: bounds.x ?? 0,
                  y: bounds.y ?? 0,
                  width: bounds.width ?? 0,
                  height: bounds.height ?? 0,
                },
              };
            }
          }

          if (shape.type === 'rectangle' && handle.type === 'rotate') {
            const cx = shape.x + shape.width / 2;
            const cy = shape.y + shape.height / 2;
            initialAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
            startRotation = shape.rotation ?? 0;
          }

          this.interaction = {
            ...this.interaction,
            isDragging: false,
            isResizing: true,
            resizeHandle: handle,
            selectedShape: shape,
            dragOffset: { x: 0, y: 0 },
            initialAngle,
            startRotation,
            pencilResize,
          };

          return;
        }
      }
    }

    let shapeSelected = false;

    for (let i = this.shapes.length - 1; i >= 0; i--) {
      if (this.isPointInShape(mouse.x, mouse.y, this.shapes[i])) {
        const shape = this.shapes[i];
        this.interaction.selectedShape = shape;

        if (shape.type === 'line') {
          const centerX = (shape.x1 + shape.x2) / 2;
          const centerY = (shape.y1 + shape.y2) / 2;

          this.interaction = {
            ...this.interaction,
            isDragging: true,
            isResizing: false,
            resizeHandle: null,
            selectedShape: shape,
            dragOffset: {
              x: mouse.x - centerX,
              y: mouse.y - centerY,
            },
            lineCenter: { x: centerX, y: centerY },
          };
        } else if (shape.type === 'pencil') {
          // For pencil line, save offset for all points
          this.interaction = {
            ...this.interaction,
            isDragging: true,
            isResizing: false,
            resizeHandle: null,
            selectedShape: shape,
            dragOffset: { x: mouse.x, y: mouse.y },
            initialPoints: shape.points.map(pt => ({ ...pt })),
          };
        } else {
          this.interaction = {
            ...this.interaction,
            isDragging: true,
            isResizing: false,
            resizeHandle: null,
            selectedShape: shape,
            dragOffset: { x: mouse.x - shape.x, y: mouse.y - shape.y },
          };
        }

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
    
  public onMouseMove(e: MouseEvent | { offsetX: number; offsetY: number }): void {
    const mouse = this.getMousePos(e);
    let cursor = 'default';
    const drawingTools = ['rectangle', 'circle', 'line', 'pencil'];

    if (this.interaction.isDrawingPencil) {
      // Add point to current line
      const shape = this.interaction.drawingShape as PencilShape | undefined | null;

      if (shape && shape.points) {
        shape.points.push(mouse);
      }

      this.requestDraw();
      this.canvas.style.cursor = 'crosshair';

      return;
    }

    if (this.interaction.isDrawingRectangle) {
      const shape = this.interaction.drawingShape as RectangleShape | undefined | null;
      const start = this.interaction.startPoint;

      if (shape && start) {
        shape.x = Math.min(start.x, mouse.x);
        shape.y = Math.min(start.y, mouse.y);
        shape.width = Math.abs(mouse.x - start.x);
        shape.height = Math.abs(mouse.y - start.y);
      }

      this.requestDraw();
      this.canvas.style.cursor = 'crosshair';

      return;
    }

    if (this.interaction.isDrawingCircle) {
      const shape = this.interaction.drawingShape as CircleShape | undefined | null;
      const start = this.interaction.startPoint;

      if (shape && start) {
        shape.radius = Math.sqrt((mouse.x - start.x) ** 2 + (mouse.y - start.y) ** 2);
      }

      this.requestDraw();
      this.canvas.style.cursor = 'crosshair';

      return;
    }

    if (this.interaction.isDrawingLine) {
      const shape = this.interaction.drawingShape as LineShape | undefined | null;

      if (shape) {
        shape.x2 = mouse.x;
        shape.y2 = mouse.y;
      }

      this.requestDraw();
      this.canvas.style.cursor = 'crosshair';

      return;
    }

    if (this.interaction.isDragging) {
      const shape = this.interaction.selectedShape;

      if (shape && shape.type === 'line') {
        const prevCenterX = (shape.x1 + shape.x2) / 2;
        const prevCenterY = (shape.y1 + shape.y2) / 2;
        const newCenterX = mouse.x - this.interaction.dragOffset.x;
        const newCenterY = mouse.y - this.interaction.dragOffset.y;
        const dx = newCenterX - prevCenterX;
        const dy = newCenterY - prevCenterY;
        shape.x1 += dx;
        shape.y1 += dy;
        shape.x2 += dx;
        shape.y2 += dy;
      } else if (shape && shape.type === 'pencil') {
        const dx = mouse.x - this.interaction.dragOffset.x;
        const dy = mouse.y - this.interaction.dragOffset.y;

        if (this.interaction.initialPoints && shape.points) {
          shape.points = this.interaction.initialPoints.map(pt => ({
            x: pt.x + dx,
            y: pt.y + dy,
          }));
        }
      } else if (shape && ('x' in shape) && ('y' in shape)) {
        (shape as RectangleShape | CircleShape).x = mouse.x - this.interaction.dragOffset.x;
        (shape as RectangleShape | CircleShape).y = mouse.y - this.interaction.dragOffset.y;
      }

      this.requestDraw();
      cursor = 'move';
    } else if (this.interaction.isResizing) {
      this.resizeShape(mouse);
      cursor = this.getCursorForHandle(this.interaction.resizeHandle);
    } else {
      // Check if mouse is hovering over a handle
      let hoveredHandle = null;

      for (const shape of this.shapes) {
        if (shape === this.interaction.selectedShape) {
          hoveredHandle = this.getHandleAt(mouse.x, mouse.y, shape);
          if (hoveredHandle) break;
        }
      }

      if (hoveredHandle) {
        cursor = this.getCursorForHandle(hoveredHandle);
      } else {
        let hoveredSelected = false;
        let hovered = false;

        for (let i = this.shapes.length - 1; i >= 0; i--) {
          const shape = this.shapes[i];

          if (this.isPointInShape(mouse.x, mouse.y, shape)) {
            hovered = true;

            if (shape === this.interaction.selectedShape) {
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
    if (!this.interaction.isDragging && !this.interaction.isResizing && drawingTools.includes(this.currentTool)) {
      cursor = 'crosshair';
    }

    this.canvas.style.cursor = cursor;
  }
    
  public onMouseUp(): void {
    if (this.interaction.isDrawingPencil) {
      this.interaction = { ...this.interaction, isDrawingPencil: false, drawingShape: null };
    } else if (
      this.interaction.isDrawingRectangle || 
      this.interaction.isDrawingCircle || 
      this.interaction.isDrawingLine
    ) {
      this.interaction = {
        ...this.interaction,
        isDrawingRectangle: false,
        isDrawingCircle: false,
        isDrawingLine: false,
        drawingShape: null,
        startPoint: null,
      };
    } else {
      this.interaction = {
        ...this.interaction,
        isDragging: false,
        isResizing: false,
        dragOffset: { x: 0, y: 0 },
        resizeHandle: null,
      };
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
    
  private getCursorForHandle(handle: { type: string } | null): string {
    if (!handle) return 'default';

    return CanvasEditor.handleCursorMap.get(handle.type) ?? 'default';
  }
    
  private getRandomColor(): string {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

    return colors[Math.floor(Math.random() * colors.length)];
  }
    
  private getRandomStrokeWidth(): number {
    return this.getRandom(3, 6);
  }

  // === Static fields ===
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

  // --- Helper methods for shapes ---
    
  private getRectangleCenter(shape: RectangleShape): Point {
    return {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2,
    };
  }
    
  private getRectangleRotation(shape: RectangleShape): number {
    return shape.rotation ?? 0;
  }
    
  private getCircleCenter(shape: CircleShape): Point {
    return { x: shape.x, y: shape.y };
  }
    
  public resizeCanvasToWrapper() {
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

  private getRandom(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  // --- Helper methods for handles ---
  private getRectangleHandles(
    shape: RectangleShape,
  ): Array<{ x: number; y: number; type: string }> {
    const w = shape.width, h = shape.height;

    return [
      { x: -w/2, y: -h/2, type: 'nw' },
      { x: +w/2, y: -h/2, type: 'ne' },
      { x: +w/2, y: +h/2, type: 'se' },
      { x: -w/2, y: +h/2, type: 'sw' },
      { x: 0, y: -h/2, type: 'n' },
      { x: +w/2, y: 0, type: 'e' },
      { x: 0, y: +h/2, type: 's' },
      { x: -w/2, y: 0, type: 'w' },
      { x: 0, y: -h/2 - 30, type: 'rotate' },
    ];
  }

  private getBoundingBoxHandles(
    bounds: { x: number; y: number; width: number; height: number },
  ): Array<{ x: number; y: number; type: string }> {
    return [
      { x: bounds.x, y: bounds.y, type: 'nw' },
      { x: bounds.x + bounds.width, y: bounds.y, type: 'ne' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'se' },
      { x: bounds.x, y: bounds.y + bounds.height, type: 'sw' },
      { x: bounds.x + bounds.width/2, y: bounds.y, type: 'n' },
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height/2, type: 'e' },
      { x: bounds.x + bounds.width/2, y: bounds.y + bounds.height, type: 's' },
      { x: bounds.x, y: bounds.y + bounds.height/2, type: 'w' },
    ];
  }

  // --- Helper methods for creating shapes ---
  private createRectangle(options: Partial<RectangleShape> = {}): RectangleShape {
    return {
      type: 'rectangle' as const,
      color: this.getRandomColor(),
      strokeWidth: this.getRandomStrokeWidth(),
      x: options.x ?? this.getRandom(50, 650),
      y: options.y ?? this.getRandom(50, 450),
      width: options.width ?? this.getRandom(100, 250),
      height: options.height ?? this.getRandom(80, 180),
      rotation: options.rotation ?? 0,
      id: `shape-${this.shapeIdCounter++}`,
    };
  }

  private createCircle(options: Partial<CircleShape> = {}): CircleShape {
    return {
      type: 'circle' as const,
      color: this.getRandomColor(),
      strokeWidth: this.getRandomStrokeWidth(),
      x: options.x ?? this.getRandom(100, 700),
      y: options.y ?? this.getRandom(100, 500),
      radius: options.radius ?? this.getRandom(40, 100),
      id: `shape-${this.shapeIdCounter++}`,
    };
  }

  private createLine(options: Partial<LineShape>): LineShape {
    const x1 = options.x1 ?? this.getRandom(100, 700);
    const y1 = options.y1 ?? this.getRandom(100, 500);
    const x2 = options.x2 ?? this.getRandom(100, 700);
    const y2 = options.y2 ?? this.getRandom(100, 500);

    return {
      type: 'line' as const,
      color: options.color ?? this.getRandomColor(),
      strokeWidth: options.strokeWidth ?? this.getRandomStrokeWidth(),
      x1, y1, x2, y2,
      id: `shape-${this.shapeIdCounter++}`,
    };
  }
} 
