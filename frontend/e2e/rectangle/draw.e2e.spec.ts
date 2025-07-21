import { test, expect } from '@playwright/test';

import { CANVAS_SELECTOR, SNAPSHOT_TOLERANCE, start, end } from './rectangle.helpers';

test('should draw a new rectangle', async ({ page }) => {
  // Open the main page
  await page.goto('/');
  const canvas = page.locator(CANVAS_SELECTOR);
  await expect(canvas).toBeVisible();
  await page.waitForTimeout(100);

  // Clear the canvas
  await page.getByRole('button', { name: 'Clear Canvas' }).click();
  await page.waitForTimeout(100);

  // Select the Rectangle tool
  await page.getByRole('button', { name: 'Rectangle' }).click();
  await page.waitForTimeout(50);

  // Draw a rectangle
  await page.mouse.move(start.x, start.y);
  await page.mouse.down();
  await page.mouse.move(end.x, end.y, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  // Take a screenshot and compare with the snapshot
  const afterDraw = await canvas.screenshot();
  expect(afterDraw).toMatchSnapshot('after-draw.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });
}); 