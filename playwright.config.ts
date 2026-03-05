import { ENV, ENV_CONFIG } from '@config/env.config';
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  tsconfig: './tsconfig.json',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [process.env.CI ? 'null' : 'html', { open: 'never' }],
    [process.env.CI ? 'blob' : 'null'],
  ],
  outputDir: 'test-results',
  globalSetup: require.resolve('@setup/global.setup'),
  globalTeardown: require.resolve('@setup/global.teardown'),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: ENV_CONFIG[ENV].baseURL.front,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    headless: true,
  },
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome Pixel 7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'Mobile Chrome Galaxy S9+',
      use: { ...devices['Galaxy S9+'] },
    },
    {
      name: 'Mobile Safari iPhone 15',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'Mobile Safari iPhone 15 Pro Max',
      use: { ...devices['iPhone 15 Pro Max'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});