import { defineConfig } from 'vite';
import { gyralVitePreset } from '@gyral/core/vite';

export default defineConfig({
  ...gyralVitePreset({ clientOnly: true, optimize: ['@gyral/core'] }),
  // The lazy Three.js renderer has a 150 KiB gzip budget, checked by verify:browser.
  build: { manifest: true, chunkSizeWarningLimit: 600,
    rolldownOptions: { output: { manualChunks: id => id.includes('/node_modules/three/') ? 'three' : undefined } } },
});
