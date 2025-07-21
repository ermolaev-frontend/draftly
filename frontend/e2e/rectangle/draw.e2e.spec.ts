import { test, expect } from '@playwright/test';

import { CANVAS_SELECTOR, SNAPSHOT_TOLERANCE, start, end, mockWebSocket, showCursor } from './rectangle.helpers';

const DELAY = 300;

test('should draw a new rectangle', async ({ page }) => {
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

  // Select the Rectangle tool
  await page.getByRole('button', { name: 'Rectangle' }).click();
  await page.waitForTimeout(DELAY);

  // Draw a rectangle
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(DELAY);

  // Take a screenshot and compare with the snapshot
  const afterDraw = await canvas.screenshot();
  expect(afterDraw).toMatchSnapshot('after-draw.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });
}); 