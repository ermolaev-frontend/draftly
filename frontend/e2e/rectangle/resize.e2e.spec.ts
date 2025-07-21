import { test, expect } from '@playwright/test';

import {
  CANVAS_SELECTOR,
  SNAPSHOT_TOLERANCE,
  start,
  end,
  mockWebSocket,
  showCursor,
  DELAY,
} from './rectangle.helpers';

const resizeOffsets = {
  'top-left': { dx: -20, dy: -20 },
  'top': { dx: 0, dy: -20 },
  'top-right': { dx: 20, dy: -20 },
  'right': { dx: 20, dy: 0 },
  'bottom-right': { dx: 20, dy: 20 },
  'bottom': { dx: 0, dy: 20 },
  'bottom-left': { dx: -20, dy: 20 },
  'left': { dx: -20, dy: 0 },
};

// Функция для пересчёта координат handle по текущим координатам прямоугольника
function getHandles(rect) {
  const { start, end } = rect;
  const centerX = (start.x + end.x) / 2;
  const centerY = (start.y + end.y) / 2;
  const topY = Math.min(start.y, end.y);
  const bottomY = Math.max(start.y, end.y);
  const leftX = Math.min(start.x, end.x);
  const rightX = Math.max(start.x, end.x);

  return {
    'top-left': { x: leftX, y: topY },
    'top': { x: centerX, y: topY },
    'top-right': { x: rightX, y: topY },
    'right': { x: rightX, y: centerY },
    'bottom-right': { x: rightX, y: bottomY },
    'bottom': { x: centerX, y: bottomY },
    'bottom-left': { x: leftX, y: bottomY },
    'left': { x: leftX, y: centerY },
  };
}

test('should resize rectangle using all 8 handles', async ({ page }) => {
  // Mock WebSocket to prevent real connections during tests
  await mockWebSocket(page);
  // Show a visible cursor overlay for debugging
  await showCursor(page);

  // Open the main page
  await page.goto('/');
  const canvas = page.locator(CANVAS_SELECTOR);
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(DELAY);

  // Clear the canvas
  await page.getByRole('button', { name: 'Clear Canvas' }).click();
  await page.waitForTimeout(DELAY);

  // Select the Rectangle tool and draw a rectangle
  await page.getByRole('button', { name: 'Rectangle' }).click();
  await page.waitForTimeout(DELAY);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(DELAY);

  // Switch to Select tool
  await page.getByTestId('toolbar-select').click();
  await page.waitForTimeout(DELAY);

  // Select the rectangle by clicking its center
  const rect = { start: { ...start }, end: { ...end } };
  await page.mouse.click((rect.start.x + rect.end.x) / 2, (rect.start.y + rect.end.y) / 2);
  await page.waitForTimeout(DELAY); // Wait for handles to appear

  // Resize using all 8 handles
  for (const handle of Object.keys(resizeOffsets)) {
    const handlesNow = getHandles(rect);
    const { x, y } = handlesNow[handle];
    const { dx, dy } = resizeOffsets[handle];
    // Move to the handle
    await page.mouse.move(x, y);
    await page.waitForTimeout(DELAY); // Let cursor update
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(DELAY);

    // Обновляем координаты прямоугольника в зависимости от handle
    switch (handle) {
      case 'top-left':
        rect.start.x += dx;
        rect.start.y += dy;
        break;
      case 'top':
        rect.start.y += dy;
        break;
      case 'top-right':
        rect.end.x += dx;
        rect.start.y += dy;
        break;
      case 'right':
        rect.end.x += dx;
        break;
      case 'bottom-right':
        rect.end.x += dx;
        rect.end.y += dy;
        break;
      case 'bottom':
        rect.end.y += dy;
        break;
      case 'bottom-left':
        rect.start.x += dx;
        rect.end.y += dy;
        break;
      case 'left':
        rect.start.x += dx;
        break;
    }
  }

  // Take a single screenshot and compare with the snapshot
  const afterResize = await canvas.screenshot();

  //   await page.waitForTimeout(1000 * 60);

  expect(afterResize).toMatchSnapshot('resize-all-handles.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });
}); 
