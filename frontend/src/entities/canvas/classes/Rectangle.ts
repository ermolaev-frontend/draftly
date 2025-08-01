import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

import type { Bounds, Point } from 'shared/types/canvas';

import { hashStringToSeed } from '../utils/canvas';
import { getRotatedPointLocal, getRotatedPoint } from '../utils/geometry';
import { Shape } from './Shape';

export class Rectangle extends Shape {
  readonly type = 'rectangle';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;

  constructor(shape: Partial<Rectangle>) {
    super(shape);
    this.x = shape.x ?? 0;
    this.y = shape.y ?? 0;
    this.width = shape.width ?? 1;
    this.height = shape.height ?? 1;
    this.rotation = shape.rotation ?? 0;
  }

  startDragging(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      type: 'dragging',
      handle: null,
      shape: this,
      dragOffset: { x: mouse.x - this.x, y: mouse.y - this.y },
    });
  }

  startDrawing(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      handle: null,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      type: 'drawing',
      startPoint: mouse,
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
    return !this.isPointOutsideBounds(point);
  }

  resize(mouse: Point, interaction: Interaction): void {
    const { handle } = interaction;

    if (handle === 'rotate') {
      this.rotate(mouse, interaction);

      return;
    }

    const center = this.getCenter();
    const angle = -(this.rotation ?? 0);
    const { x: lx, y: ly } = getRotatedPointLocal(mouse, center, angle);
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

    const newCenter = getRotatedPoint(
      { x: (left + right) / 2, y: (top + bottom) / 2 },
      { x: 0, y: 0 },
      this.rotation ?? 0,
    );
      
    this.patch({
      width: newWidth,
      height: newHeight,
      x: center.x + newCenter.x - newWidth/2,
      y: center.y + newCenter.y - newHeight/2,
    } as Partial<this>);
  }

  getBounds(): Bounds {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
    };
  }

  drawNewShape(mouse: Point, start: Point): void {
    const width = mouse.x - start.x;
    const height = mouse.y - start.y;

    this.patch({
      width: Math.abs(width),
      height: Math.abs(height),
      x: width >= 0 ? start.x : mouse.x,
      y: height >= 0 ? start.y : mouse.y,
    } as Partial<this>);
  }

  rotate(mouse: Point, { startRotation, initialAngle }: Interaction): void {    
    const cx = this.x + this.width/2;
    const cy = this.y + this.height/2;
    const angle = Math.atan2(mouse.y - cy, mouse.x - cx);
    
    this.patch({
      rotation: startRotation + angle - initialAngle,
    } as Partial<this>);
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    this.patch({
      x: mouse.x - dragOffset.x,
      y: mouse.y - dragOffset.y,
    } as Partial<this>);
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
    const { x: lx, y: ly } = getRotatedPointLocal({ x, y }, center, angle);

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
