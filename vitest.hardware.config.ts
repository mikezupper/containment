import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { gyralVitePreset } from '@gyral/core/vite';

export default defineConfig({
  ...gyralVitePreset({ clientOnly: true, optimize: ['@gyral/core'] }),
  test: {
    include: ['tests/hardware/**/*.test.ts'],
    browser: {
      enabled: true, headless: false,
      provider: playwright({ launchOptions: { channel: 'chrome' } }),
      instances: [{ browser: 'chromium' }],
    },
  },
});
