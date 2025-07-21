import { test, expect } from '@playwright/test';

import { CANVAS_SELECTOR, SNAPSHOT_TOLERANCE, start, end, moveFrom } from './rectangle.helpers';

test('should move rectangle: up 10px, right 20px, down 30px, left 40px', async ({ page }) => {
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

  // Select the rectangle
  await page.mouse.click(moveFrom.x, moveFrom.y);
  await page.waitForTimeout(100);

  // Move up 10px
  await page.mouse.move(moveFrom.x, moveFrom.y);
  await page.mouse.down();
  await page.mouse.move(moveFrom.x, moveFrom.y - 10, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(100);

  // Move right 20px
  await page.mouse.move(moveFrom.x, moveFrom.y - 10);
  await page.mouse.down();
  await page.mouse.move(moveFrom.x + 20, moveFrom.y - 10, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(100);

  // Move down 30px
  await page.mouse.move(moveFrom.x + 20, moveFrom.y - 10);
  await page.mouse.down();
  await page.mouse.move(moveFrom.x + 20, moveFrom.y - 10 + 30, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(100);

  // Move left 40px
  await page.mouse.move(moveFrom.x + 20, moveFrom.y - 10 + 30);
  await page.mouse.down();
  await page.mouse.move(moveFrom.x + 20 - 40, moveFrom.y - 10 + 30, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(200);

  // Take a single screenshot and compare with the snapshot
  const afterAllMoves = await canvas.screenshot();
  expect(afterAllMoves).toMatchSnapshot('move-all.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });
}); 