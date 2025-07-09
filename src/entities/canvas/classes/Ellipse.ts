import rough from 'roughjs';
import Interaction, { type Handle } from 'entities/canvas/classes/Interaction.ts';

import type { Bounds, Point, IShape } from 'shared/types/canvas';

import { generateId, hashStringToSeed } from '../canvasUtils';

export class Ellipse implements IShape {
  readonly type = 'ellipse';
  readonly color: string;
  readonly strokeWidth: number;
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly radiusX: number;
  readonly radiusY: number;
  readonly rotation: number;

  constructor(shape: Partial<Ellipse>) {
    this.id = generateId();
    this.color = shape.color ?? 'red';
    this.strokeWidth = shape.strokeWidth ?? 1;
    this.x = shape.x ?? 0;
    this.y = shape.y ?? 0;
    this.radiusX = shape.radiusX ?? 1;
    this.radiusY = shape.radiusY ?? 1;
    this.rotation = shape.rotation ?? 0;
  }

  patch(shape: Partial<Ellipse>): void {
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

  startDrawing(interaction: Interaction, mouse: Point): void {
    interaction.patch({
      handle: null,
      shape: this,
      dragOffset: { x: 0, y: 0 },
      type: 'drawing',
      startPoint: { ...mouse },
    });
  }

  startResizing(interaction: Interaction, handle: Handle, mouse: Point) {
    let initialAngle = 0;
    let startRotation = 0;

    if (handle === 'rotate') {
      initialAngle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
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

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation ?? 0);

    roughCanvas?.ellipse(
      0,
      0,
      this.radiusX * 2,
      this.radiusY * 2,
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

    // Rotate bounding box and handles together with ellipse
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation ?? 0);

    // Fill
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Frame
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
    ctx.strokeStyle = borderColor;
    ctx.stroke();

    // Handles
    ctx.fillStyle = borderColor;
    this.getHandles().forEach(h => ctx.fillRect(h.x - 4, h.y - 4, 8, 8));
    
    // Rotation handle (circle)
    const rotateHandle = { x: 0, y: -this.radiusY - 30, type: 'rotate' };
    ctx.beginPath();
    ctx.arc(rotateHandle.x, rotateHandle.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  isPointInShape(point: Point): boolean {
    const { x, y } = point;
    const angle = -(this.rotation ?? 0);
    const dx = x - this.x;
    const dy = y - this.y;
    const lx = Math.cos(angle) * dx - Math.sin(angle) * dy;
    const ly = Math.sin(angle) * dx + Math.cos(angle) * dy;

    // Check if point is inside ellipse using ellipse equation
    return (lx * lx) / (this.radiusX * this.radiusX) + (ly * ly) / (this.radiusY * this.radiusY) <= 1;
  }

  resize(mouse: Point, interaction: Interaction): void {
    const { handle } = interaction;

    if (handle === 'rotate') {
      this.rotate(mouse, interaction);
      return;
    }

    const angle = -(this.rotation ?? 0);
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const lx = Math.cos(angle) * dx - Math.sin(angle) * dy;
    const ly = Math.sin(angle) * dx + Math.cos(angle) * dy;
    
    let newRadiusX = this.radiusX;
    let newRadiusY = this.radiusY;

    switch (handle) {
      case 'nw':
        newRadiusX = Math.max(10, Math.abs(lx));
        newRadiusY = Math.max(10, Math.abs(ly));
        break;
      case 'ne':
        newRadiusX = Math.max(10, Math.abs(lx));
        newRadiusY = Math.max(10, Math.abs(ly));
        break;
      case 'se':
        newRadiusX = Math.max(10, Math.abs(lx));
        newRadiusY = Math.max(10, Math.abs(ly));
        break;
      case 'sw':
        newRadiusX = Math.max(10, Math.abs(lx));
        newRadiusY = Math.max(10, Math.abs(ly));
        break;
      case 'n':
      case 's':
        newRadiusY = Math.max(10, Math.abs(ly));
        break;
      case 'e':
      case 'w':
        newRadiusX = Math.max(10, Math.abs(lx));
        break;
    }

    this.patch({
      radiusX: newRadiusX,
      radiusY: newRadiusY,
    });
  }

  getBounds(): Bounds {
    return {
      x: this.x - this.radiusX,
      y: this.y - this.radiusY,
      width: this.radiusX * 2,
      height: this.radiusY * 2,
    };
  }

  drawNewShape(mouse: Point, { startPoint }: Interaction): void {
    const radiusX = Math.abs(mouse.x - startPoint.x);
    const radiusY = Math.abs(mouse.y - startPoint.y);
    
    this.patch({
      x: (startPoint.x + mouse.x) / 2,
      y: (startPoint.y + mouse.y) / 2,
      radiusX: Math.max(10, radiusX / 2),
      radiusY: Math.max(10, radiusY / 2),
    });
  }

  rotate(mouse: Point, { startRotation, initialAngle }: Interaction): void {
    const angle = Math.atan2(mouse.y - this.y, mouse.x - this.x);
    
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
    const rx = this.radiusX;
    const ry = this.radiusY;

    return [
      { x: -rx, y: -ry, type: 'nw' },
      { x: +rx, y: -ry, type: 'ne' },
      { x: +rx, y: +ry, type: 'se' },
      { x: -rx, y: +ry, type: 'sw' },
      { x: 0, y: -ry, type: 'n' },
      { x: +rx, y: 0, type: 'e' },
      { x: 0, y: +ry, type: 's' },
      { x: -rx, y: 0, type: 'w' },
      { x: 0, y: -ry - 30, type: 'rotate' },
    ];
  }

  getHandleAt({ x, y }: Point): Handle | null {
    const angle = -(this.rotation ?? 0);
    const dx = x - this.x;
    const dy = y - this.y;
    const lx = Math.cos(angle) * dx - Math.sin(angle) * dy;
    const ly = Math.sin(angle) * dx + Math.cos(angle) * dy;

    for (const h of this.getHandles()) {
      if (h.type === 'rotate') {
        if ((lx - h.x) ** 2 + (ly - h.y) ** 2 <= 10 * 10) return 'rotate';
      } else {
        if (Math.abs(lx - h.x) <= 8 && Math.abs(ly - h.y) <= 8) return h.type;
      }
    }

    return null;
  }
}