import { test } from '@playwright/test';

import { rotateHandle, mockWebSocket, showCursor } from './rectangle.helpers';

test('should rotate rectangle 30 degrees right', async ({ page }) => {
  // Mock WebSocket to prevent real connections during tests
  await mockWebSocket(page);
  // Show a visible cursor overlay for debugging
  await showCursor(page);

  // TODO: implement steps for rotating right
});

test('should rotate rectangle 30 degrees left', async ({ page }) => {
  // Mock WebSocket to prevent real connections during tests
  await mockWebSocket(page);
  // Show a visible cursor overlay for debugging
  await showCursor(page);

  // TODO: implement steps for rotating left
}); 