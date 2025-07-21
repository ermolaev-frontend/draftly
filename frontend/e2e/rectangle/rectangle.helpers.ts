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
    // @ts-expect-error
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

/**
 * Injects a visible cursor overlay for Playwright tests.
 * Call this before page.goto() if you want to see the cursor in the browser, screenshots, or video.
 */
export async function showCursor(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const style = document.createElement('style');

    style.innerHTML = `
      .playwright-cursor {
        pointer-events: none;
        position: fixed;
        z-index: 2147483647;
        left: 0;
        top: 0;
        width: 20px;
        height: 20px;
        background: yellow;
        border: 2px solid black;
        border-radius: 50%;
        margin-left: -10px;
        margin-top: -10px;
        box-shadow: 0 0 6px 2px rgba(0,0,0,0.5);
        transition: left 0.05s linear, top 0.05s linear;
      }
    `;

    document.head.appendChild(style);

    const cursor = document.createElement('div');
    cursor.className = 'playwright-cursor';
    document.body.appendChild(cursor);

    document.addEventListener('mousemove', event => {
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';
    }, true);
  });
} 
