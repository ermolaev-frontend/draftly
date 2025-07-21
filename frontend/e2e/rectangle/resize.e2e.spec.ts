import { test } from '@playwright/test';

import { handles } from './rectangle.helpers';

test.describe('Resize rectangle', () => {
  for (const [handle, coords] of Object.entries(handles)) {
    test(`should resize rectangle from ${handle} handle`, async ({ page }) => {
      // TODO: реализовать шаги для изменения размера через ручку ${handle}
    });
  }
}); 