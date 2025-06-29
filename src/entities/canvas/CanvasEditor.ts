export type ToolType = 'select' | 'pencil' | 'rectangle' | 'circle' | 'line';

export interface BaseShape {
  type: ToolType;
  color: string;
  strokeWidth: number;
  selected: boolean;
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

interface InteractionState {
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

export class CanvasEditor {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    shapes: Shape[];
    currentTool: ToolType;
    interaction: InteractionState;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.interaction = {
            isDragging: false,
            isResizing: false,
            selectedShape: null,
            dragOffset: { x: 0, y: 0 },
            resizeHandle: null
        };
        this.currentTool = 'select'; // New tool: select, pencil, ...
        this.resizeCanvasToWrapper();
        // Now canvas.width and height are actual!
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const margin = 40; // inner margin for shapes
        // 6 zones for 6 shapes (2 rows of 3 columns)
        const zones = [
            { xMin: margin, xMax: canvasWidth / 3 - margin, yMin: margin, yMax: canvasHeight / 2 - margin },
            { xMin: canvasWidth / 3 + margin, xMax: 2 * canvasWidth / 3 - margin, yMin: margin, yMax: canvasHeight / 2 - margin },
            { xMin: 2 * canvasWidth / 3 + margin, xMax: canvasWidth - margin, yMin: margin, yMax: canvasHeight / 2 - margin },
            { xMin: margin, xMax: canvasWidth / 3 - margin, yMin: canvasHeight / 2 + margin, yMax: canvasHeight - margin },
            { xMin: canvasWidth / 3 + margin, xMax: 2 * canvasWidth / 3 - margin, yMin: canvasHeight / 2 + margin, yMax: canvasHeight - margin },
            { xMin: 2 * canvasWidth / 3 + margin, xMax: canvasWidth - margin, yMin: canvasHeight / 2 + margin, yMax: canvasHeight - margin }
        ];
        const getRandom = (min: number, max: number): number => Math.random() * (max - min) + min;
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];
        this.shapes = [
            this.createRectangle({
                x: getRandom(zones[0].xMin, zones[0].xMax - 120),
                y: getRandom(zones[0].yMin, zones[0].yMax - 100),
                width: getRandom(100, Math.min(180, zones[0].xMax - zones[0].xMin)),
                height: getRandom(80, Math.min(140, zones[0].yMax - zones[0].yMin)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                type: 'rectangle' as const,
                selected: false,
                rotation: 0
            }),
            this.createRectangle({
                x: getRandom(zones[1].xMin, zones[1].xMax - 120),
                y: getRandom(zones[1].yMin, zones[1].yMax - 100),
                width: getRandom(100, Math.min(180, zones[1].xMax - zones[1].xMin)),
                height: getRandom(80, Math.min(140, zones[1].yMax - zones[1].yMin)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                type: 'rectangle' as const,
                selected: false,
                rotation: 0
            }),
            this.createCircle({
                x: getRandom(zones[2].xMin + 60, zones[2].xMax - 60),
                y: getRandom(zones[2].yMin + 60, zones[2].yMax - 60),
                radius: getRandom(40, Math.min(80, (zones[2].xMax - zones[2].xMin) / 2, (zones[2].yMax - zones[2].yMin) / 2)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                type: 'circle' as const,
                selected: false
            }),
            this.createCircle({
                x: getRandom(zones[3].xMin + 60, zones[3].xMax - 60),
                y: getRandom(zones[3].yMin + 60, zones[3].yMax - 60),
                radius: getRandom(40, Math.min(80, (zones[3].xMax - zones[3].xMin) / 2, (zones[3].yMax - zones[3].yMin) / 2)),
                color: colors[Math.floor(getRandom(0, colors.length))],
                strokeWidth: getRandom(2, 5),
                type: 'circle' as const,
                selected: false
            }),
            (() => {
                // Line with random angle in zone 4
                const zone = zones[4];
                const cx = (zone.xMin + zone.xMax) / 2;
                const cy = (zone.yMin + zone.yMax) / 2;
                const length = getRandom(80, Math.min(zone.xMax - zone.xMin, zone.yMax - zone.yMin) - 20);
                const angle = getRandom(0, Math.PI * 2);
                const x1 = cx - Math.cos(angle) * length / 2;
                const y1 = cy - Math.sin(angle) * length / 2;
                const x2 = cx + Math.cos(angle) * length / 2;
                const y2 = cy + Math.sin(angle) * length / 2;
                return this.createLine({ x1, y1, x2, y2, color: colors[Math.floor(getRandom(0, colors.length))], strokeWidth: getRandom(2, 5), type: 'line' as const, selected: false });
            })(),
            (() => {
                // Line with random angle in zone 5
                const zone = zones[5];
                const cx = (zone.xMin + zone.xMax) / 2;
                const cy = (zone.yMin + zone.yMax) / 2;
                const length = getRandom(80, Math.min(zone.xMax - zone.xMin, zone.yMax - zone.yMin) - 20);
                const angle = getRandom(0, Math.PI * 2);
                const x1 = cx - Math.cos(angle) * length / 2;
                const y1 = cy - Math.sin(angle) * length / 2;
                const x2 = cx + Math.cos(angle) * length / 2;
                const y2 = cy + Math.sin(angle) * length / 2;
                return this.createLine({ x1, y1, x2, y2, color: colors[Math.floor(getRandom(0, colors.length))], strokeWidth: getRandom(2, 5), type: 'line' as const, selected: false });
            })()
        ];
        window.addEventListener('resize', () => this.resizeCanvasToWrapper());
        this.attachEvents();
        this.drawShapes();
    }

    
    addRectangle(): void {
        this.shapes.push(this.createRectangle());
        this.drawShapes();
    }

    
    addCircle(): void {
        this.shapes.push(this.createCircle());
        this.drawShapes();
    }

    
    addLine(): void {
        this.shapes.push(this.createLine());
        this.drawShapes();
    }

    
    clearCanvas(): void {
        this.shapes = [];
        this.drawShapes();
    }

    
    addRandomShape(): void {
        const types: Array<'rectangle' | 'circle' | 'line'> = ['rectangle', 'circle', 'line'];
        const type = types[Math.floor(Math.random() * types.length)];
        let newShape: Shape;
        if (type === 'rectangle') {
            newShape = this.createRectangle();
        } else if (type === 'circle') {
            newShape = this.createCircle();
        } else {
            newShape = this.createLine();
        }
        this.shapes.push(newShape);
        this.drawShapes();
    }

    
    setTool(toolName: ToolType): void {
        this.currentTool = toolName;
    }

    // === Private methods ===
    
    private drawShape(shape: Shape): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = shape.color;
        ctx.lineWidth = (shape.type === 'pencil') ? shape.strokeWidth * 2 : shape.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        switch (shape.type) {
            case 'rectangle': {
                const center = this.getRectangleCenter(shape);
                ctx.translate(center.x, center.y);
                ctx.rotate(this.getRectangleRotation(shape));
                ctx.strokeRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height);
                break;
            }
            case 'circle': {
                const center = this.getCircleCenter(shape);
                ctx.arc(center.x, center.y, shape.radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
            }
            case 'line': {
                ctx.moveTo(shape.x1, shape.y1);
                ctx.lineTo(shape.x2, shape.y2);
                ctx.stroke();
                break;
            }
            case 'pencil': {
                if (shape.points && shape.points.length > 1) {
                    const simplified = this.simplifyDouglasPeucker(shape.points, 1.5);
                    const beziers = this.catmullRom2bezier(simplified);
                    if (beziers.length > 0) {
                        ctx.moveTo(beziers[0].start.x, beziers[0].start.y);
                        for (const seg of beziers) {
                            ctx.bezierCurveTo(seg.cp1.x, seg.cp1.y, seg.cp2.x, seg.cp2.y, seg.end.x, seg.end.y);
                        }
                        ctx.stroke();
                    }
                }
                break;
            }
            default:
                break;
        }
        ctx.restore();
    }

    
    private drawSelection(shape: Shape): void {
        if (!shape.selected) return;

        const ctx = this.ctx;
        const bounds = this.getShapeBounds(shape);
        if (!bounds) return;
        const offset = 5;
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
            const {x: cx, y: cy} = this.getRectangleCenter(shape);
            ctx.translate(cx, cy);
            ctx.rotate(this.getRectangleRotation(shape));
            // Fill
            ctx.fillRect(-shape.width/2 - offset, -shape.height/2 - offset, shape.width + offset*2, shape.height + offset*2);
            // Frame
            ctx.strokeRect(-shape.width/2 - offset, -shape.height/2 - offset, shape.width + offset*2, shape.height + offset*2);
            // Handles
            ctx.fillStyle = borderColor;
            this.getRectangleHandles(shape, offset).forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
            // Rotation handle (circle)
            const rotateHandle = {x: 0, y: -shape.height/2 - offset - 30, type: 'rotate'};
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
            ctx.arc(shape.x, shape.y, shape.radius + offset, 0, Math.PI * 2);
            ctx.fill();
            // Frame
            ctx.beginPath();
            ctx.arc(shape.x, shape.y, shape.radius + offset, 0, Math.PI * 2);
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
            this.getPencilHandles(bounds).forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
        } else {
            // For other shapes (if they appear)
            ctx.fillRect(
                bounds.x - offset,
                bounds.y - offset,
                bounds.width + offset * 2,
                bounds.height + offset * 2
            );
            ctx.strokeRect(
                bounds.x - offset,
                bounds.y - offset,
                bounds.width + offset * 2,
                bounds.height + offset * 2
            );
            ctx.fillStyle = borderColor;
            // 8 handles: 4 corner and 4 side
            const handles = [
                {x: bounds.x - offset, y: bounds.y - offset, type: 'nw'},
                {x: bounds.x + bounds.width + offset, y: bounds.y - offset, type: 'ne'},
                {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height + offset, type: 'se'},
                {x: bounds.x - offset, y: bounds.y + bounds.height + offset, type: 'sw'},
                {x: bounds.x + bounds.width/2, y: bounds.y - offset, type: 'n'},
                {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height/2, type: 'e'},
                {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height + offset, type: 's'},
                {x: bounds.x - offset, y: bounds.y + bounds.height/2, type: 'w'}
            ];

            handles.forEach((h) => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
        }

        ctx.restore();
    }

    
    private drawShapes(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!Array.isArray(this.shapes)) return;
        this.shapes.forEach(shape => {
            this.drawShape(shape);
            this.drawSelection(shape);
        });
    }

    
    redraw(): void {
        this.drawShapes();
    }

    
    private getMousePos(e: MouseEvent): { x: number; y: number } {
        return { x: e.offsetX, y: e.offsetY };
    }

    
    private getShapeBounds(shape: Shape): { x: number; y: number; width: number; height: number } | null {
        switch(shape.type) {
            case 'rectangle': return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
            case 'circle': return { x: shape.x - shape.radius, y: shape.y - shape.radius, width: shape.radius * 2, height: shape.radius * 2 };
            case 'line': {
                const offset = 5;
                const minX = Math.min(shape.x1, shape.x2) - offset;
                const minY = Math.min(shape.y1, shape.y2) - offset;
                const maxX = Math.max(shape.x1, shape.x2) + offset;
                const maxY = Math.max(shape.y1, shape.y2) + offset;
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
                const offset = 5;
                return { x: minX - offset, y: minY - offset, width: (maxX - minX) + offset * 2, height: (maxY - minY) + offset * 2 };
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
        if (!shape.selected) return null;
        switch (shape.type) {
            case 'line': {
                if (Math.abs(x - shape.x1) <= 8 && Math.abs(y - shape.y1) <= 8) return {type: 'start'};
                if (Math.abs(x - shape.x2) <= 8 && Math.abs(y - shape.y2) <= 8) return {type: 'end'};
                return null;
            }
            case 'rectangle': {
                const cx = shape.x + shape.width/2;
                const cy = shape.y + shape.height/2;
                const offset = 5;
                const angle = -(shape.rotation ?? 0);
                const dx = x - cx, dy = y - cy;
                const lx = Math.cos(angle)*dx - Math.sin(angle)*dy;
                const ly = Math.sin(angle)*dx + Math.cos(angle)*dy;
                for (const h of this.getRectangleHandles(shape, offset)) {
                    if (h.type === 'rotate') {
                        if ((lx-h.x)**2 + (ly-h.y)**2 <= 10*10) return {type: 'rotate'};
                    } else {
                        if (Math.abs(lx - h.x) <= 8 && Math.abs(ly - h.y) <= 8) return {type: h.type};
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
                for (const h of this.getPencilHandles(bounds)) {
                    if (Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) return {type: h.type};
                }
                return null;
            }
            default: {
                const bounds = this.getShapeBounds(shape);
                if (!bounds) return null;
                const offset = 5;
                const handles = [
                    {x: bounds.x - offset, y: bounds.y - offset, type: 'nw'},
                    {x: bounds.x + bounds.width + offset, y: bounds.y - offset, type: 'ne'},
                    {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height + offset, type: 'se'},
                    {x: bounds.x - offset, y: bounds.y + bounds.height + offset, type: 'sw'},
                    {x: bounds.x + bounds.width/2, y: bounds.y - offset, type: 'n'},
                    {x: bounds.x + bounds.width + offset, y: bounds.y + bounds.height/2, type: 'e'},
                    {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height + offset, type: 's'},
                    {x: bounds.x - offset, y: bounds.y + bounds.height/2, type: 'w'}
                ];
                return handles.find(h => Math.abs(x - h.x) <= 8 && Math.abs(y - h.y) <= 8) ?? null;
            }
        }
    }

    
    private resizeShape(mouse: { x: number; y: number }): void {
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
                    this.drawShapes();
                    return;
                }
                if (handle.type) {
                    const offset = 5;
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
                    const newCx = cx + (Math.cos(shape.rotation??0)*(left+right)/2 - Math.sin(shape.rotation ?? 0)*(top+bottom)/2);
                    const newCy = cy + (Math.sin(shape.rotation??0)*(left+right)/2 + Math.cos(shape.rotation ?? 0)*(top+bottom)/2);
                    shape.width = newWidth;
                    shape.height = newHeight;
                    shape.x = newCx - newWidth/2;
                    shape.y = newCy - newHeight/2;
                    this.drawShapes();
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
                    this.drawShapes();
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
                this.drawShapes();
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
                    shape.points = initialPoints.map((pt: { x: number; y: number }) => {
                        const relX = (pt.x - initialBounds.x) / initialBounds.width;
                        const relY = (pt.y - initialBounds.y) / initialBounds.height;
                        return {
                            x: newX + relX * newW,
                            y: newY + relY * newH
                        };
                    });
                    this.drawShapes();
                    return;
                }
                break;
            }
            default:
                break;
        }
        this.drawShapes();
    }

    
    private attachEvents(): void {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        // For pencil, support mouseleave (line completion when mouse leaves)
        this.canvas.addEventListener('mouseleave', this.onMouseUp.bind(this));
    }

    
    private onMouseDown(e: MouseEvent): void {
        const mouse = this.getMousePos(e);
        if (this.currentTool === 'pencil') {
            // Start a new line
            const newShape: PencilShape = {
                type: 'pencil',
                color: this.getRandomColor(),
                strokeWidth: this.getRandomStrokeWidth(),
                selected: false,
                points: [mouse]
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
                drawingShape: newShape
            };
            this.drawShapes();
            return;
        }
        // --- New code for rectangle ---
        if (this.currentTool === 'rectangle') {
            const newShape = this.createRectangle({
                x: mouse.x,
                y: mouse.y,
                width: 1,
                height: 1
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
                startPoint: { ...mouse }
            };
            this.drawShapes();
            return;
        }
        // --- New code for circle ---
        if (this.currentTool === 'circle') {
            const newShape = this.createCircle({
                x: mouse.x,
                y: mouse.y,
                radius: 1
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
                startPoint: { ...mouse }
            };
            this.drawShapes();
            return;
        }
        // --- New code for line ---
        if (this.currentTool === 'line') {
            const newShape = this.createLine({
                x1: mouse.x,
                y1: mouse.y,
                x2: mouse.x,
                y2: mouse.y
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
                startPoint: { ...mouse }
            };
            this.drawShapes();
            return;
        }

        for (const shape of this.shapes) {
            if (shape.selected) {
                const handle = this.getHandleAt(mouse.x, mouse.y, shape);
                if (handle) {
                    let initialRadius = null;
                    let initialDistance = null;
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
                                    height: bounds.height ?? 0
                                }
                            };
                        }
                    }
                    if (shape.type === 'circle') {
                        initialRadius = shape.radius;
                        const dx = mouse.x - shape.x, dy = mouse.y - shape.y;
                        initialDistance = Math.sqrt(dx * dx + dy * dy);
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
                        initialRadius,
                        initialDistance,
                        initialAngle,
                        startRotation,
                        pencilResize
                    };
                    return;
                }
            }
        }

        this.shapes.forEach(s => s.selected = false);

        for (let i = this.shapes.length - 1; i >= 0; i--) {
            if (this.isPointInShape(mouse.x, mouse.y, this.shapes[i])) {
                this.shapes[i].selected = true;
                const shape = this.shapes[i];

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
                            y: mouse.y - centerY
                        },
                        lineCenter: { x: centerX, y: centerY }
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
                        initialPoints: shape.points.map(pt => ({ ...pt }))
                    };
                } else {
                    this.interaction = {
                        ...this.interaction,
                        isDragging: true,
                        isResizing: false,
                        resizeHandle: null,
                        selectedShape: shape,
                        dragOffset: {
                            x: (shape as RectangleShape | CircleShape).x !== undefined ? mouse.x - (shape as RectangleShape | CircleShape).x : 0,
                            y: (shape as RectangleShape | CircleShape).y !== undefined ? mouse.y - (shape as RectangleShape | CircleShape).y : 0
                        }
                    };
                }

                this.canvas.style.cursor = 'move';

                break;
            }
        }

        this.drawShapes();
    }

    
    private onMouseMove(e: MouseEvent): void {
        const mouse = this.getMousePos(e);
        let cursor = 'default';
        const drawingTools = ['rectangle', 'circle', 'line', 'pencil'];
        if (this.interaction.isDrawingPencil) {
            // Add point to current line
            const shape = this.interaction.drawingShape as PencilShape | undefined | null;
            if (shape && shape.points) {
                shape.points.push(mouse);
            }
            this.drawShapes();
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
            this.drawShapes();
            this.canvas.style.cursor = 'crosshair';
            return;
        }
        if (this.interaction.isDrawingCircle) {
            const shape = this.interaction.drawingShape as CircleShape | undefined | null;
            const start = this.interaction.startPoint;
            if (shape && start) {
                shape.radius = Math.sqrt((mouse.x - start.x) ** 2 + (mouse.y - start.y) ** 2);
            }
            this.drawShapes();
            this.canvas.style.cursor = 'crosshair';
            return;
        }
        if (this.interaction.isDrawingLine) {
            const shape = this.interaction.drawingShape as LineShape | undefined | null;
            if (shape) {
                shape.x2 = mouse.x;
                shape.y2 = mouse.y;
            }
            this.drawShapes();
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
                        y: pt.y + dy
                    }));
                }
            } else if (shape && ('x' in shape) && ('y' in shape)) {
                (shape as RectangleShape | CircleShape).x = mouse.x - this.interaction.dragOffset.x;
                (shape as RectangleShape | CircleShape).y = mouse.y - this.interaction.dragOffset.y;
            }
            this.drawShapes();
            cursor = 'move';
        } else if (this.interaction.isResizing) {
            this.resizeShape(mouse);
            cursor = this.getCursorForHandle(this.interaction.resizeHandle);
        } else {
            // Check if mouse is hovering over a handle
            let hoveredHandle = null;
            for (const shape of this.shapes) {
                if (shape.selected) {
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
                        if (shape.selected) {
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

    
    private onMouseUp(): void {
        if (this.interaction.isDrawingPencil) {
            this.interaction = { ...this.interaction, isDrawingPencil: false, drawingShape: null };
        } else if (["isDrawingRectangle", "isDrawingCircle", "isDrawingLine"].some(key => this.interaction[key])) {
            this.interaction = { ...this.interaction, isDrawingRectangle: false, isDrawingCircle: false, isDrawingLine: false, drawingShape: null, startPoint: null };
        } else {
            this.interaction = { isDragging: false, isResizing: false, selectedShape: null, dragOffset: { x: 0, y: 0 }, resizeHandle: null };
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
        return Math.random() * 3 + 2;
    }

    // === Static fields ===
    static handleCursorMap = new Map([
        ['n', 'ns-resize'],
        ['s', 'ns-resize'],
        ['e', 'ew-resize'],
        ['w', 'ew-resize'],
        ['nw', 'nwse-resize'],
        ['se', 'nwse-resize'],
        ['ne', 'nesw-resize'],
        ['sw', 'nesw-resize'],
        ['start', 'pointer'],
        ['end', 'pointer'],
        ['rotate', 'grab'],
        ['radius', 'ew-resize']
    ]);

    // --- Catmull-Rom Spline to Bezier for smoothing pencil lines ---
    
    private catmullRom2bezier(points: { x: number; y: number }[]): Array<{ start: { x: number; y: number }; cp1: { x: number; y: number }; cp2: { x: number; y: number }; end: { x: number; y: number } }> {
        if (points.length < 2) return [];
        const beziers = [];
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i - 1] || points[i];
            const p1 = points[i];
            const p2 = points[i + 1] || points[i];
            const p3 = points[i + 2] || p2;
            // Catmull-Rom to Bezier conversion
            const cp1 = {
                x: p1.x + (p2.x - p0.x) / 6,
                y: p1.y + (p2.y - p0.y) / 6
            };
            const cp2 = {
                x: p2.x - (p3.x - p1.x) / 6,
                y: p2.y - (p3.y - p1.y) / 6
            };
            beziers.push({
                start: { x: p1.x, y: p1.y },
                cp1,
                cp2,
                end: { x: p2.x, y: p2.y }
            });
        }
        return beziers;
    }

    // --- Douglas-Peucker simplification for points ---
    
    private simplifyDouglasPeucker(points: { x: number; y: number }[], epsilon: number): { x: number; y: number }[] {
        if (points.length < 3) return points;
        const dmax = { dist: 0, idx: 0 };
        const sq = (a: { x: number; y: number }, b: { x: number; y: number }) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        function getPerpendicularDistance(pt: { x: number; y: number }, lineStart: { x: number; y: number }, lineEnd: { x: number; y: number }): number {
            const dx = lineEnd.x - lineStart.x;
            const dy = lineEnd.y - lineStart.y;
            if (dx === 0 && dy === 0) return Math.sqrt(sq(pt, lineStart));
            const t = ((pt.x - lineStart.x) * dx + (pt.y - lineStart.y) * dy) / (dx * dx + dy * dy);
            const proj = { x: lineStart.x + t * dx, y: lineStart.y + t * dy };
            return Math.sqrt(sq(pt, proj));
        }
        for (let i = 1; i < points.length - 1; i++) {
            const d = getPerpendicularDistance(points[i], points[0], points[points.length - 1]);
            if (d > dmax.dist) {
                dmax.dist = d;
                dmax.idx = i;
            }
        }
        if (dmax.dist > epsilon) {
            const rec1 = this.simplifyDouglasPeucker(points.slice(0, dmax.idx + 1), epsilon);
            const rec2 = this.simplifyDouglasPeucker(points.slice(dmax.idx), epsilon);
            return rec1.slice(0, -1).concat(rec2);
        } else {
            return [points[0], points[points.length - 1]];
        }
    }

    
    private createRectangle(options: Partial<RectangleShape> = {}): RectangleShape {
        return {
            type: 'rectangle' as const,
            color: this.getRandomColor(),
            strokeWidth: this.getRandomStrokeWidth(),
            selected: false,
            x: typeof options.x === 'number' ? options.x : (Math.random() * 600 + 50),
            y: typeof options.y === 'number' ? options.y : (Math.random() * 400 + 50),
            width: typeof options.width === 'number' ? options.width : (Math.random() * 150 + 100),
            height: typeof options.height === 'number' ? options.height : (Math.random() * 100 + 80),
            rotation: typeof options.rotation === 'number' ? options.rotation : 0
        };
    }

    
    private createCircle(options: Partial<CircleShape> = {}): CircleShape {
        return {
            type: 'circle' as const,
            color: this.getRandomColor(),
            strokeWidth: this.getRandomStrokeWidth(),
            selected: false,
            x: typeof options.x === 'number' ? options.x : (Math.random() * 600 + 100),
            y: typeof options.y === 'number' ? options.y : (Math.random() * 400 + 100),
            radius: typeof options.radius === 'number' ? options.radius : (Math.random() * 60 + 40)
        };
    }

    
    private createLine(options: Partial<LineShape> & { angle?: number; length?: number } = {}): LineShape {
        const x1 = typeof options.x1 === 'number' ? options.x1 : (Math.random() * 600 + 100);
        const y1 = typeof options.y1 === 'number' ? options.y1 : (Math.random() * 400 + 100);
        const angle = typeof options.angle === 'number' ? options.angle : (Math.random() * Math.PI * 2);
        const length = typeof options.length === 'number' ? options.length : (Math.random() * 120 + 60);
        const x2 = typeof options.x2 === 'number' ? options.x2 : (x1 + Math.cos(angle) * length);
        const y2 = typeof options.y2 === 'number' ? options.y2 : (y1 + Math.sin(angle) * length);
        return {
            type: 'line' as const,
            color: this.getRandomColor(),
            strokeWidth: this.getRandomStrokeWidth(),
            selected: false,
            x1, y1, x2, y2
        };
    }

    
    private getRectangleHandles(shape: RectangleShape, offset: number = 5): Array<{ x: number; y: number; type: string }> {
        const w = shape.width, h = shape.height;
        return [
            {x: -w/2 - offset, y: -h/2 - offset, type: 'nw'},
            {x: +w/2 + offset, y: -h/2 - offset, type: 'ne'},
            {x: +w/2 + offset, y: +h/2 + offset, type: 'se'},
            {x: -w/2 - offset, y: +h/2 + offset, type: 'sw'},
            {x: 0, y: -h/2 - offset, type: 'n'},
            {x: +w/2 + offset, y: 0, type: 'e'},
            {x: 0, y: +h/2 + offset, type: 's'},
            {x: -w/2 - offset, y: 0, type: 'w'},
            {x: 0, y: -h/2 - offset - 30, type: 'rotate'}
        ];
    }

    
    private getPencilHandles(bounds: { x: number; y: number; width: number; height: number }): Array<{ x: number; y: number; type: string }> {
        return [
            {x: bounds.x, y: bounds.y, type: 'nw'},
            {x: bounds.x + bounds.width, y: bounds.y, type: 'ne'},
            {x: bounds.x + bounds.width, y: bounds.y + bounds.height, type: 'se'},
            {x: bounds.x, y: bounds.y + bounds.height, type: 'sw'},
            {x: bounds.x + bounds.width/2, y: bounds.y, type: 'n'},
            {x: bounds.x + bounds.width, y: bounds.y + bounds.height/2, type: 'e'},
            {x: bounds.x + bounds.width/2, y: bounds.y + bounds.height, type: 's'},
            {x: bounds.x, y: bounds.y + bounds.height/2, type: 'w'}
        ];
    }

    // --- Helper methods for shapes ---
    
    private getRectangleCenter(shape: RectangleShape): { x: number; y: number } {
        return {
            x: shape.x + shape.width / 2,
            y: shape.y + shape.height / 2
        };
    }

    
    private getRectangleRotation(shape: RectangleShape): number {
        return shape.rotation ?? 0;
    }

    
    private getCircleCenter(shape: CircleShape): { x: number; y: number } {
        return { x: shape.x, y: shape.y };
    }
    
    
    private resizeCanvasToWrapper() {
        const wrapper = this.canvas.parentElement;
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
            this.drawShapes();
        }
    }
} 