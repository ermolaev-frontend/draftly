import { Shape } from 'entities/canvas/classes/Shape.ts';

import type { Point, Bounds } from 'shared/types/canvas';

type InteractionType = 'idle' | 'dragging' | 'resizing' | 'drawing' | 'panning';
export type Handle = 'nw' | 'n' | 'e' | 'ne' | 'se' | 's' | 'sw' | 'w' | 'rotate' | 'radius' | 'start' | 'end';

const systemCenter: Point = { x: 0, y: 0 };

export default class Interaction {
  readonly type: InteractionType = 'idle';
  readonly shape: Shape | null = null;
  readonly dragOffset: Point = systemCenter;
  readonly handle: Handle | null = null;
  readonly initialAngle: number = 0; // angle between Ox and shape handle in rad when rotation is started
  readonly startRotation: number = 0; // shape.rotation when rotation is started in rad
  readonly initialPoints: Point[] = [];
  readonly initialBounds: Bounds = { x: 0, y: 0, width: 0, height: 0 };
  readonly panOffset: Point = systemCenter;
  readonly startPoint?: Point;

  patch(inter: Partial<Interaction>) {
    Object.assign(this, inter);
  }
}
