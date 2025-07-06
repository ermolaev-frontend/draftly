import type { Shape, Point, Bounds } from 'shared/types/canvas';

type InteractionType = 'idle' | 'dragging' | 'resizing' | 'drawing';
export type Handle = 'nw' | 'n' | 'e' | 'ne' | 'se' | 's' | 'sw' | 'w' | 'rotate' | 'radius' | 'start' | 'end';

export default class Interaction {
  readonly type: InteractionType;
  readonly shape: Shape | null;
  readonly dragOffset: Point;
  readonly handle: Handle | null;
  readonly startPoint: Point | null; // for drawing
  readonly initialAngle: number | null; // angle when rotation is started
  readonly startRotation: number | null; // shape.rotation when rotation is started
  readonly initialPoints: Point[] | null; // for pencil?
  readonly initialBounds: Bounds | null; // for pencil?

  constructor(inter: Partial<Interaction>) {
    this.type = inter.type ?? 'idle';
    this.shape = inter.shape ?? null;
    this.dragOffset = inter.dragOffset ?? { x: 0, y: 0 };
    this.handle = inter.handle ?? null;
    this.startPoint = inter.startPoint ?? null;
    this.initialAngle = inter.initialAngle ?? null;
    this.startRotation = inter.startRotation ?? null;
    this.initialPoints = inter.initialPoints ?? null;
    this.initialBounds = inter.initialBounds ?? null;
  }

  patch(inter: Partial<Interaction>) {
    Object.assign(this, inter);
  }
}
