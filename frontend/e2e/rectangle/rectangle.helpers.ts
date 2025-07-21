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
    // @ts-expect-error: Overriding global WebSocket for test mocking
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
  const cursorStyle = `
    .playwright-cursor {
      pointer-events: none;
      position: fixed;
      z-index: 2147483647;
      width: 24px;
      height: 24px;
      background: rgba(255, 0, 100, 0.4);
      border: 2px solid rgba(255, 0, 100, 0.9);
      border-radius: 50%;
      box-shadow: 0 0 10px rgba(255, 0, 100, 0.5), 
                  0 0 20px rgba(255, 0, 100, 0.3);
      transform: translate(-50%, -50%);
      transition: 
        transform 0.05s cubic-bezier(0.18, 0.89, 0.32, 1.28),
        width 0.2s ease,
        height 0.2s ease;
      mix-blend-mode: difference;
    }
    .playwright-cursor.click-effect {
      animation: click-pulse 0.3s ease-out;
      width: 40px;
      height: 40px;
      background: transparent;
      border: 3px solid rgba(255, 255, 0, 0.8);
    }
    @keyframes click-pulse {
      0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); }
      100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
    }
  `;

  await page.addInitScript(cursorStyle => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.innerHTML = cursorStyle;
      document.head.appendChild(style);

      const cursor = document.createElement('div');
      cursor.className = 'playwright-cursor';
      document.body.appendChild(cursor);

      document.addEventListener('mousemove', e => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      });

      document.addEventListener('click', () => {
        cursor.classList.add('click-effect');
        setTimeout(() => cursor.classList.remove('click-effect'), 300);
      });
    });
  }, cursorStyle);
} 
