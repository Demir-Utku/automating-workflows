import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'on-first-retry' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        screenshot: {
          mode: process.env.CI ? 'on' : 'only-on-failure',
          fullPage: true,
        }
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 120 * 1000 : 60 * 1000,
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: process.env.CI ? 50 : 100,
      threshold: process.env.CI ? 0.2 : 0.3,
      animations: 'disabled',
    },
  },
}) 
