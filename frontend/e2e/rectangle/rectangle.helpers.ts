// Rectangle test helpers
export const CANVAS_SELECTOR = '[data-testid="canvas"]';
export const SNAPSHOT_TOLERANCE = 0.02;

export const start = { x: 200, y: 200 };
export const end = { x: 400, y: 350 };
export const moveFrom = { x: 300, y: 275 }; // center of the rectangle

export const centerX = (start.x + end.x) / 2;
export const centerY = (start.y + end.y) / 2;
export const topY = Math.min(start.y, end.y);
export const bottomY = Math.max(start.y, end.y);
export const leftX = Math.min(start.x, end.x);
export const rightX = Math.max(start.x, end.x);

// Handles for resize (corners and sides)
export const handles = {
  'top-left': { x: leftX, y: topY },
  'top': { x: centerX, y: topY },
  'top-right': { x: rightX, y: topY },
  'right': { x: rightX, y: centerY },
  'bottom-right': { x: rightX, y: bottomY },
  'bottom': { x: centerX, y: bottomY },
  'bottom-left': { x: leftX, y: bottomY },
  'left': { x: leftX, y: centerY },
};

// Rotate handle
export const rotateHandle = { x: centerX, y: topY - 30 };

/**
 * Mocks the global WebSocket object to prevent real connections during e2e tests.
 * Call this before page.goto().
 */
export async function mockWebSocket(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    // @ts-ignore
    window.WebSocket = class {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;
      constructor() {}
      close() {}
      send() {}
      addEventListener() {}
      removeEventListener() {}
      readyState = 1;
    };
  });
} 