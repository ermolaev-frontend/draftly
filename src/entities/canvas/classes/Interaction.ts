import type { Point, Bounds, IShape } from 'shared/types/canvas';

type InteractionType = 'idle' | 'dragging' | 'resizing' | 'drawing' | 'panning';
export type Handle = 'nw' | 'n' | 'e' | 'ne' | 'se' | 's' | 'sw' | 'w' | 'rotate' | 'radius' | 'start' | 'end';

const systemCenter: Point = { x: 0, y: 0 };

export default class Interaction {
   
  constructor(
    readonly shape: IShape | null = null,
    readonly type: InteractionType = 'idle',
    readonly dragOffset: Point = systemCenter,
    readonly handle: Handle | null = null,
    readonly startPoint: Point = systemCenter,
    readonly initialAngle: number = 0,
    readonly startRotation: number = 0,
    readonly initialPoints: Point[] = [],
    readonly initialBounds: Bounds = { x: 0, y: 0, width: 0, height: 0 },
    readonly panOffset: Point = systemCenter,
  ) {
    // Parameter properties automatically create and assign the fields
    this.shape = shape;
    this.type = type;
    this.dragOffset = dragOffset;
    this.handle = handle;
    this.startPoint = startPoint;
    this.initialAngle = initialAngle;
    this.startRotation = startRotation;
    this.initialPoints = initialPoints;
    this.initialBounds = initialBounds;
    this.panOffset = panOffset;
  }

  patch(inter: Partial<Interaction>) {
    Object.assign(this, inter);
  }

  reset() {
    this.patch({
      type: 'idle',
      shape: null,
      dragOffset: systemCenter,
      handle: null,
      startPoint: systemCenter,
      initialAngle: 0,
      startRotation: 0,
      initialPoints: [],
      initialBounds: { x: 0, y: 0, width: 0, height: 0 },
      panOffset: systemCenter,
    });
  }
}
