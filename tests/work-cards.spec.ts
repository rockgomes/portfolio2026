import { test, expect } from '@playwright/test';

// The Work card pictures are made with Shotkit at the card's own shape (thumbnails/cards.json), so the frame
// shows the whole picture: object-fit: cover has nothing to cut. A picture of another shape gets cut again.
test('every work card picture has the shape of its frame, so nothing is cut', async ({ page }) => {
  await page.goto('/');
  const thumbs = page.locator('[data-grid] .thumb');
  await expect(thumbs).toHaveCount(14);
  for (const thumb of await thumbs.all()) {
    await thumb.scrollIntoViewIfNeeded();
    const img = thumb.locator('img');
    await expect(img).toHaveJSProperty('complete', true);
    const shape = await img.evaluate((el: HTMLImageElement) => el.naturalWidth / el.naturalHeight);
    expect(shape, await img.getAttribute('src') ?? '').toBeCloseTo(485 / 394, 2);
  }
});
