import rough from 'roughjs';

import type { Bounds, Point, ShapeType } from 'shared/types/canvas';

import Interaction, { type Handle } from './Interaction';
import { BaseShape } from './BaseShape';
import { GeometryUtils } from './GeometryUtils';
import { ShapeConstants } from './ShapeConstants';

export class Rectangle extends BaseShape {
  readonly type: ShapeType = 'rectangle';
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;

  constructor(params: Partial<Rectangle> & { color?: string; strokeWidth?: number }) {
    super(params.color ?? ShapeConstants.DEFAULT_COLOR, params.strokeWidth ?? ShapeConstants.DEFAULT_STROKE_WIDTH);
    this.x = params.x ?? 0;
    this.y = params.y ?? 0;
    this.width = params.width ?? ShapeConstants.DEFAULT_SIZE;
    this.height = params.height ?? ShapeConstants.DEFAULT_SIZE;
    this.rotation = params.rotation ?? 0;
  }

  getCenter(): Point {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
  }

  startResizing(interaction: Interaction, handle: Handle, mouse: Point): void {
    let initialAngle = 0;
    let startRotation = 0;

    if (handle === 'rotate') {
      const center = this.getCenter();
      initialAngle = GeometryUtils.angle(center, mouse);
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
    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);

    roughCanvas.rectangle(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      this.getRoughOptions(),
    );

    ctx.restore();
  }

  drawSelection(ctx: CanvasRenderingContext2D): void {
    this.drawSelectionFrame(ctx);

    const center = this.getCenter();
    ctx.translate(center.x, center.y);
    ctx.rotate(this.rotation);

    // Fill rectangle
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Stroke rectangle
    ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Draw resize handles
    this.getHandles().forEach(handle => {
      this.drawHandle(ctx, handle.x, handle.y, handle.type === 'rotate');
    });

    ctx.restore();
  }

  isPointInShape(point: Point): boolean {
    const center = this.getCenter();

    return GeometryUtils.isPointInRotatedRect(point, center, this.width, this.height, this.rotation);
  }

  resize(mouse: Point, interaction: Interaction): void {
    const { handle } = interaction;

    if (handle === 'rotate') {
      this.rotate(mouse, interaction);

      return;
    }

    const center = this.getCenter();
    const local = GeometryUtils.inverseRotatePoint(mouse, center, this.rotation);
    const relativeX = local.x - center.x;
    const relativeY = local.y - center.y;
    
    let newWidth = this.width;
    let newHeight = this.height;
    let newX = this.x;
    let newY = this.y;

    switch (handle) {
      case 'nw':
        newWidth = Math.max(ShapeConstants.MIN_SIZE, this.width - 2 * relativeX);
        newHeight = Math.max(ShapeConstants.MIN_SIZE, this.height - 2 * relativeY);
        break;
      case 'ne':
        newWidth = Math.max(ShapeConstants.MIN_SIZE, this.width + 2 * relativeX);
        newHeight = Math.max(ShapeConstants.MIN_SIZE, this.height - 2 * relativeY);
        break;
      case 'se':
        newWidth = Math.max(ShapeConstants.MIN_SIZE, this.width + 2 * relativeX);
        newHeight = Math.max(ShapeConstants.MIN_SIZE, this.height + 2 * relativeY);
        break;
      case 'sw':
        newWidth = Math.max(ShapeConstants.MIN_SIZE, this.width - 2 * relativeX);
        newHeight = Math.max(ShapeConstants.MIN_SIZE, this.height + 2 * relativeY);
        break;
      case 'n':
      case 's':
        newHeight = Math.max(ShapeConstants.MIN_SIZE, Math.abs(2 * relativeY));
        break;
      case 'e':
      case 'w':
        newWidth = Math.max(ShapeConstants.MIN_SIZE, Math.abs(2 * relativeX));
        break;
    }

    // Calculate new position to keep center fixed during resize
    const newCenter = this.getCenter();
    newX = newCenter.x - newWidth / 2;
    newY = newCenter.y - newHeight / 2;

    this.patch({
      width: newWidth,
      height: newHeight,
      x: newX,
      y: newY,
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

  drawNewShape(mouse: Point, { startPoint }: Interaction): void {
    this.patch({
      width: Math.abs(mouse.x - startPoint.x),
      height: Math.abs(mouse.y - startPoint.y),
      x: Math.min(startPoint.x, mouse.x),
      y: Math.min(startPoint.y, mouse.y),
    });
  }

  rotate(mouse: Point, { startRotation, initialAngle }: Interaction): void {
    const center = this.getCenter();
    const currentAngle = GeometryUtils.angle(center, mouse);

    this.patch({
      rotation: startRotation + currentAngle - initialAngle,
    });
  }

  move(mouse: Point, { dragOffset }: Interaction): void {
    this.patch({
      x: mouse.x - dragOffset.x,
      y: mouse.y - dragOffset.y,
    });
  }

  getHandles(): (Point & { type: Handle })[] {
    const w = this.width;
    const h = this.height;

    return [
      { x: -w / 2, y: -h / 2, type: 'nw' },
      { x: +w / 2, y: -h / 2, type: 'ne' },
      { x: +w / 2, y: +h / 2, type: 'se' },
      { x: -w / 2, y: +h / 2, type: 'sw' },
      { x: 0, y: -h / 2, type: 'n' },
      { x: +w / 2, y: 0, type: 'e' },
      { x: 0, y: +h / 2, type: 's' },
      { x: -w / 2, y: 0, type: 'w' },
      { x: 0, y: -h / 2 - ShapeConstants.ROTATION_HANDLE_OFFSET, type: 'rotate' },
    ];
  }

  getHandleAt(point: Point): Handle | null {
    const center = this.getCenter();

    for (const handle of this.getHandles()) {
      const worldHandle = GeometryUtils.rotatePoint(
        { x: center.x + handle.x, y: center.y + handle.y },
        center,
        this.rotation,
      );

      if (this.isPointNearHandle(point, worldHandle)) {
        return handle.type;
      }
    }

    return null;
  }
}
