import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { gyral } from '@gyral/core/vite';

export default defineConfig({
  plugins: [gyral({ clientOnly: true })],
  test: {
    include: ['tests/hardware/**/*.test.ts'],
    browser: {
      enabled: true, headless: false,
      provider: playwright({ launchOptions: { channel: 'chrome' } }),
      instances: [{ browser: 'chromium' }],
    },
  },
});
