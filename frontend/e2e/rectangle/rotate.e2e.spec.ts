import { test, expect } from '@playwright/test';

import {
  CANVAS_SELECTOR,
  SNAPSHOT_TOLERANCE,
  start,
  end,
  moveFrom,
  rotateHandle,
  mockWebSocket,
  showCursor,
  DELAY,
} from './rectangle.helpers';

const rotateTo = { x: rotateHandle.x + 40, y: rotateHandle.y };

test('should rotate rectangle using rotate handle', async ({ page }) => {
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
  await page.mouse.click(moveFrom.x, moveFrom.y);
  await page.waitForTimeout(DELAY); // Wait for handles to appear

  // Rotate using the rotate handle
  await page.mouse.move(rotateHandle.x, rotateHandle.y);
  await page.waitForTimeout(DELAY);
  await page.mouse.down();
  await page.mouse.move(rotateTo.x, rotateTo.y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(DELAY);

  // Take a screenshot and compare with the snapshot
  const afterRotate = await canvas.screenshot();
  expect(afterRotate).toMatchSnapshot('after-rotate-rectangle.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });
}); 