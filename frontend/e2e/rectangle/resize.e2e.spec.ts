import { test, expect } from '@playwright/test';

import { CANVAS_SELECTOR, SNAPSHOT_TOLERANCE, start, end, handles, mockWebSocket } from './rectangle.helpers';

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

test('should resize rectangle using all 8 handles', async ({ page }) => {
  // Mock WebSocket to prevent real connections during tests
  await mockWebSocket(page);

  // Open the main page
  await page.goto('/');
  const canvas = page.locator(CANVAS_SELECTOR);
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(100);

  // Clear the canvas
  await page.getByRole('button', { name: 'Clear Canvas' }).click();
  await page.waitForTimeout(100);

  // Select the Rectangle tool and draw a rectangle
  await page.getByRole('button', { name: 'Rectangle' }).click();
  await page.waitForTimeout(50);
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  // Switch to Select tool
  await page.getByTestId('toolbar-select').click();
  await page.waitForTimeout(100);

  // Select the rectangle by clicking its center
  const centerX = (start.x + end.x) / 2;
  const centerY = (start.y + end.y) / 2;
  await page.mouse.click(centerX, centerY);
  await page.waitForTimeout(150); // Wait for handles to appear

  // Resize using all 8 handles
  for (const [handle, { x, y }] of Object.entries(handles)) {
    const { dx, dy } = resizeOffsets[handle];
    // Move to the handle
    await page.mouse.move(x, y);
    await page.waitForTimeout(30); // Let cursor update
    await page.mouse.down();
    await page.mouse.move(x + dx, y + dy, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(100);
  }

  // Take a single screenshot and compare with the snapshot
  const afterResize = await canvas.screenshot();
  expect(afterResize).toMatchSnapshot('resize-all-handles.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });
}); 
