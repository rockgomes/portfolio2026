import { defineConfig, devices } from '@playwright/test';

// Locally (Claude's machine) Chromium is pre-installed; in CI Playwright installs its own.
const executablePath = process.env.PW_CHROMIUM || undefined;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://localhost:4321', contextOptions: { reducedMotion: 'reduce' }, launchOptions: { executablePath } },
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  // First run writes missing screenshots; CI commits them back to the PR as the approved baseline.
  updateSnapshots: 'missing',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}-{projectName}{ext}',
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Desktop Chrome'], viewport: { width: 400, height: 860 } } },
  ],
  webServer: { command: 'npx astro preview --port 4321', url: 'http://localhost:4321', reuseExistingServer: !process.env.CI },
});
