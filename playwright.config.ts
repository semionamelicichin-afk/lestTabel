import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const storageStatePath = process.env.STORAGE_STATE_PATH || 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests',
  timeout: 120000,
  expect: {
    timeout: 15000
  },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 }
  },
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'daily-check-in',
      testMatch: /daily-check-in\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: process.env.USE_STORAGE_STATE === 'true' ? storageStatePath : undefined
      }
    }
  ]
});