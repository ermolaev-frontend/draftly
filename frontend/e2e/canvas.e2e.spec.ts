import { test, expect } from '@playwright/test';

const TOOL_TITLES = ['Rectangle', 'Circle', 'Line', 'Pencil'];
const SHAPES_PER_TYPE = 10;
const CANVAS_SELECTOR = '[data-testid="canvas"]';

const SHAPES_COUNT = SHAPES_PER_TYPE * TOOL_TITLES.length;

// Helper to get random int in [min, max]
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to get random point within canvas
async function getRandomPoint(page, margin = 60) {
  const box = await page.locator(CANVAS_SELECTOR).boundingBox();
  if (!box) throw new Error('Canvas not found');
  const x = randInt(box.x + margin, box.x + box.width - margin);
  const y = randInt(box.y + margin, box.y + box.height - margin);

  return { x, y };
}

test.describe('Canvas E2E', () => {
  test(`should create, manipulate, and interact with ${SHAPES_COUNT} shapes`, async ({ page }) => {
    await page.goto('/');
    // Clear the canvas before starting
    await page.getByRole('button', { name: 'Clear Canvas' }).click();
    const canvas = page.locator(CANVAS_SELECTOR);
    await expect(canvas).toBeVisible();

    for (const toolTitle of TOOL_TITLES) {
      // Select tool in toolbar
      await page.getByRole('button', { name: toolTitle }).click();

      for (let i = 0; i < SHAPES_PER_TYPE; i++) {
        // Draw shape at random position
        const start = await getRandomPoint(page);
        let end = await getRandomPoint(page);

        // Ensure end is not too close to start
        while (Math.abs(end.x - start.x) < 40 || Math.abs(end.y - start.y) < 40) {
          end = await getRandomPoint(page);
        }

        if (toolTitle === 'Pencil') {
          // Simulate a squiggle for pencil
          await page.mouse.move(start.x, start.y);
          await page.mouse.down();

          for (let j = 0; j < 8; j++) {
            const px = start.x + randInt(-30, 30) + j * 8;
            const py = start.y + randInt(-30, 30) + j * 8;
            await page.mouse.move(px, py, { steps: 2 });
          }

          await page.mouse.up();
        } else {
          // For rectangle, circle, line: drag from start to end
          await page.mouse.move(start.x, start.y);
          await page.mouse.down();
          await page.mouse.move(end.x, end.y, { steps: 10 });
          await page.mouse.up();
        }
      }
    }

    // Sample manipulation: move, resize, rotate, pointer move
    // Move: drag from one random point to another
    for (let i = 0; i < 5; i++) {
      const from = await getRandomPoint(page);
      const to = await getRandomPoint(page);
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(to.x, to.y, { steps: 10 });
      await page.mouse.up();
    }

    // Pointer move: just move mouse around
    for (let i = 0; i < 10; i++) {
      const pt = await getRandomPoint(page);
      await page.mouse.move(pt.x, pt.y);
      await page.waitForTimeout(20);
    }
    // Resize/rotate: if your UI supports, simulate drags at edges/corners (not implemented here, placeholder)
    // You can add more logic here if you have resize/rotate handles

    // Final visual check: canvas is still visible
    await expect(canvas).toBeVisible();
  });
}); 
