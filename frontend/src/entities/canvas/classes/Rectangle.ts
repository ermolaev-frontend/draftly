import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';
import { BASE_PALETTE } from 'shared/types/colors';

import type { Bounds, Point, IShape } from 'shared/types/canvas';

import { generateId, hashStringToSeed } from '../canvasUtils';
import { toLocalRotatedCoords, getRectCenter, rotatePoint } from '../geometryUtils';

export class Rectangle implements IShape {
  readonly type = 'rectangle';
  readonly color: string;
  readonly strokeWidth: number;
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;

  constructor(shape: Partial<Rectangle>) {
    this.id = shape.id ?? generateId();
    this.color = shape.color ?? BASE_PALETTE[0];
    this.strokeWidth = shape.strokeWidth ?? 1;
    this.x = shape.x ?? 0;
    this.y = shape.y ?? 0;
    this.width = shape.width ?? 1;
    this.height = shape.height ?? 1;
    this.rotation = shape.rotation ?? 0;
  }

  patch(shape: Partial<Rectangle>) {
    Object.assign(this, shape);
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: { x: mouse.x - this.x, y: mouse.y - this.y },
    });
  }

  startDrawing(interaction: Interaction): void {
    interaction.patch({
      handle: null,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      type: 'drawing',
    });
  }

  startResizing(interaction: Interaction, handle: Handle, mouse: Point) {
    let initialAngle = 0;
    let startRotation = 0;

    if (handle === 'rotate') {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      initialAngle = Math.atan2(mouse.y - cy, mouse.x - cx);
      startRotation = this.rotation ?? 0;
    }

    interaction.patch({
      type: 'resizing',
      handle,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      initialAngle,
      startRotation,
      initialPoints: undefined,
      initialBounds: undefined,
    });
  }

  private getCenter(): Point {
    return getRectCenter({ x: this.x, y: this.y, width: this.width, height: this.height });
  }

  draw(ctx: CanvasRenderingContext2D, roughCanvas: ReturnType<typeof rough.canvas>): void {
    ctx.save();

    const center = this.getCenter();
    const rotation = this.rotation ?? 0;

    ctx.translate(center.x, center.y);
    ctx.rotate(rotation);

    roughCanvas.rectangle(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      {
        stroke: this.color,
        strokeWidth: this.strokeWidth,
        fill: undefined,
        roughness: 1.5,
        bowing: 2,
        seed: this.id ? hashStringToSeed(this.id) : undefined,
      },
    );

    ctx.restore();
  }

  drawSelection(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    const borderColor = '#228be6'; // saturated blue
    const fillColor = 'rgba(34, 139, 230, 0.08)'; // semi-transparent blue
    ctx.lineWidth = 2;
    ctx.strokeStyle = borderColor;
    ctx.fillStyle = fillColor;
    ctx.setLineDash([]); // Solid line

    // Rotate bounding box and handles together with rectangle
    const { x: cx, y: cy } = this.getCenter();
    ctx.translate(cx, cy);
    ctx.rotate(this.rotation ?? 0);

    // Fill
    ctx.fillRect(
      -this.width/2,
      -this.height/2,
      this.width,
      this.height,
    );

    // Frame
    ctx.strokeRect(
      -this.width/2,
      -this.height/2,
      this.width,
      this.height,
    );

    // Handles
    ctx.fillStyle = borderColor;
    this.getHandles().forEach(h => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
    // Rotation handle (circle)
    const rotateHandle = { x: 0, y: -this.height/2 - 30, type: 'rotate' };
    ctx.beginPath();
    ctx.arc(rotateHandle.x, rotateHandle.y, 8, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  isPointInShape(point: Point): boolean {
    const center = this.getCenter();
    const angle = -(this.rotation ?? 0);
    const { x: lx, y: ly } = toLocalRotatedCoords(point, center, angle);
    return (
      lx >= -this.width/2 && lx <= this.width/2 &&
      ly >= -this.height/2 && ly <= this.height/2
    );
  }

  resize(mouse: Point, interaction: Interaction): void {
    const { handle } = interaction;

    if (handle === 'rotate') {
      this.rotate(mouse, interaction);
      return;
    }

    const center = this.getCenter();
    const angle = -(this.rotation ?? 0);
    const { x: lx, y: ly } = toLocalRotatedCoords(mouse, center, angle);
    let left = -this.width/2, right = this.width/2, top = -this.height/2, bottom = this.height/2;

    switch (handle) {
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
    const newCenter = rotatePoint(
      { x: (left + right) / 2, y: (top + bottom) / 2 },
      { x: 0, y: 0 },
      this.rotation ?? 0
    );
      
    this.patch({
      width: newWidth,
      height: newHeight,
      x: center.x + newCenter.x - newWidth/2,
      y: center.y + newCenter.y - newHeight/2,
    });
  }

  getBounds(): Bounds {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  drawNewShape(mouse: Point): void {    
    this.patch({
      width: Math.abs(mouse.x - this.x),
      height: Math.abs(mouse.y - this.y),
      x: Math.min(this.x, mouse.x),
      y: Math.min(this.y, mouse.y),
    });
  }

  rotate(mouse: Point, { startRotation, initialAngle }: Interaction): void {    
    const cx = this.x + this.width/2;
    const cy = this.y + this.height/2;
    const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
    
    this.patch({
      rotation: startRotation + angle - initialAngle,
    });
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    this.patch({
      x: mouse.x - dragOffset.x,
      y: mouse.y - dragOffset.y,
    });
  }

  getHandles(): (Point & { type: Handle })[] {
    const w = this.width, h = this.height;

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

  getHandleAt({ x, y }: Point): Handle | null {
    const center = this.getCenter();
    const angle = -(this.rotation ?? 0);
    const { x: lx, y: ly } = toLocalRotatedCoords({ x, y }, center, angle);

    for (const h of this.getHandles()) {
      if (h.type === 'rotate') {
        if ((lx-h.x)**2 + (ly-h.y)**2 <= 10*10) return 'rotate';
      } else {
        if (Math.abs(lx - h.x) <= 8 && Math.abs(ly - h.y) <= 8) return h.type;
      }
    }

    return null;
  }
}
