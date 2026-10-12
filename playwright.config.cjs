const { defineConfig } = require('@playwright/test');
const { baseURL, authFile } = require('./tests/e2e/environment.cjs');
module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 1,
  retries: 0,
  reporter: 'line',
  outputDir: './output/playwright/results',
  use: {
    baseURL, headless: true, viewport: { width: 1600, height: 1100 },
    trace: 'off', screenshot: 'off', video: 'off',
  },
  projects: [
    { name: 'auth', testMatch: /auth\.setup\.cjs/ },
    { name: 'chromium', testMatch: /.*\.spec\.cjs/, dependencies: ['auth'], use: { browserName: 'chromium', storageState: authFile } },
  ],
});
