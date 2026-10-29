import type { Page } from '@playwright/test';

const LABELS: Record<string, string> = { design: 'Designer', recruiter: 'Recruiter', engineer: 'Engineer' };

// Choose a view with the header switch, in the form this screen width shows: the radio group, the "View as" dropdown
// (520px and below) or the radio group at the bottom of the Menu (380px and below).
export async function chooseView(page: Page, view: string) {
  const dd = page.locator('[data-view-dd] [data-sb-dd-btn]');
  if (await dd.isVisible()) {
    await dd.click();
    await page.locator(`[data-view-dd] [role="menuitemradio"][data-value="${LABELS[view]}"]`).click();
    return;
  }
  if (await page.locator('.switch').isHidden()) await page.locator('[data-menu-btn]').click();
  await page.locator(`[data-view-option="${view}"]`).locator('visible=true').click();
}
