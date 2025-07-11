import type { Point, Bounds, IShape } from 'shared/types/canvas';

type InteractionType = 'idle' | 'dragging' | 'resizing' | 'drawing' | 'panning';
export type Handle = 'nw' | 'n' | 'e' | 'ne' | 'se' | 's' | 'sw' | 'w' | 'rotate' | 'radius' | 'start' | 'end';

const systemCenter: Point = { x: 0, y: 0 };

export default class Interaction {
  readonly type: InteractionType = 'idle';
  readonly shape: IShape | null = null;
  readonly dragOffset: Point = systemCenter;
  readonly handle: Handle | null = null;
  readonly initialAngle: number = 0; // angle between Ox and shape handle in rad when rotation is started
  readonly startRotation: number = 0; // shape.rotation when rotation is started in rad
  readonly initialPoints: Point[] = [];
  readonly initialBounds: Bounds = { x: 0, y: 0, width: 0, height: 0 };
  readonly panOffset: Point = systemCenter;

  patch(inter: Partial<Interaction>) {
    Object.assign(this, inter);
  }

  reset() {
    this.patch({
      type: 'idle',
      shape: null,
      dragOffset: systemCenter,
      handle: null,
      initialAngle: 0,
      startRotation: 0,
      initialPoints: [],
      initialBounds: { x: 0, y: 0, width: 0, height: 0 },
      panOffset: systemCenter,
    });
  }
}
