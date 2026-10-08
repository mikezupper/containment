import { expect, it } from 'vitest';
// Run the same exact-state graphics recovery and touch lifecycle assertions on
// installed, headed Chrome. The ordinary check continues to use software WebGL.
import '../browser/controls.test.ts';

it('uses a physical desktop GPU rather than a software renderer', () => {
  const canvas = document.createElement('canvas'), gl = canvas.getContext('webgl2');
  expect(gl, 'WebGL 2 must initialize on the hardware test machine').not.toBeNull();
  const info = gl!.getExtension('WEBGL_debug_renderer_info');
  expect(info, 'An identifiable renderer is required before claiming hardware evidence').not.toBeNull();
  const renderer = String(gl!.getParameter(info!.UNMASKED_RENDERER_WEBGL));
  console.info(JSON.stringify({ userAgent: navigator.userAgent, renderer }));
  expect(renderer).not.toMatch(/swiftshader|llvmpipe|softpipe|software|microsoft basic|warp/i);
  gl!.getExtension('WEBGL_lose_context')?.loseContext();
});
