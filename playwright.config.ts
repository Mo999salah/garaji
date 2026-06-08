import './e2e/helpers/env';

import { defineConfig, devices } from '@playwright/test';

const port = process.env.EXPO_PORT ?? '8081';
const baseURL = process.env.EXPO_DEV_SERVER_URL ?? `http://localhost:${port}`;

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run web',
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
