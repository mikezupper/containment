import { defineConfig } from 'vite';
import { gyral } from '@gyral/core/vite';

export default defineConfig({
  plugins: [gyral({ clientOnly: true })],
  // The lazy Three.js renderer has a 150 KiB gzip budget, checked by verify:browser.
  build: { manifest: true, chunkSizeWarningLimit: 600,
    rolldownOptions: { output: { manualChunks: id => id.includes('/node_modules/three/') ? 'three' : undefined } } },
});
