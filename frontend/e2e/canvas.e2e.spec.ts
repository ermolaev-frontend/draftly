import { test, expect } from '@playwright/test';

const CANVAS_SELECTOR = '[data-testid="canvas"]';
const SNAPSHOT_TOLERANCE = 0.02;

// Фиксированные координаты для стабильных снапшотов
const start = { x: 200, y: 200 };
const end = { x: 400, y: 350 };
const moveFrom = { x: 300, y: 275 }; // центр прямоугольника

// Для rotate handle
const centerX = (start.x + end.x) / 2;
const topY = Math.min(start.y, end.y);
const rotateHandle = { x: centerX, y: topY - 30 };
const rotateTo = { x: centerX + 40, y: topY - 30 };

test.describe('Canvas E2E', () => {
  test('should draw and rotate a Rectangle (single shape)', async ({ page }) => {
    await page.goto('/');
    // Очистить canvas
    const canvas = page.locator(CANVAS_SELECTOR);
    await expect(canvas).toBeVisible();
    await page.waitForTimeout(100);
    await page.getByRole('button', { name: 'Clear Canvas' }).click();
    await page.waitForTimeout(100);

    // 1. Нарисовать Rectangle
    await page.getByRole('button', { name: 'Rectangle' }).click();
    await page.waitForTimeout(50);
    await page.mouse.move(start.x, start.y);
    await page.waitForTimeout(50);
    await page.mouse.down();
    await page.waitForTimeout(50);
    await page.mouse.move(end.x, end.y, { steps: 10 });
    await page.waitForTimeout(50);
    await page.mouse.up();
    await page.waitForTimeout(200); // гарантируем, что canvas успел отрисовать
    const afterDraw = await canvas.screenshot();
    expect(afterDraw).toMatchSnapshot('after-draw.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });

    // 2. Повернуть (выбрать Select, выделить, drag по rotate handle)
    await page.getByTestId('toolbar-select').click();
    await page.waitForTimeout(100);
    await page.mouse.click(moveFrom.x, moveFrom.y);
    await page.waitForTimeout(100);
    await page.mouse.move(rotateHandle.x, rotateHandle.y);
    await page.mouse.down();
    await page.mouse.move(rotateTo.x, rotateTo.y, { steps: 10 });
    await page.mouse.up();
    const afterRotate = await canvas.screenshot();
    expect(afterRotate).toMatchSnapshot('after-rotate.png', { maxDiffPixelRatio: SNAPSHOT_TOLERANCE });
  });
}); 
