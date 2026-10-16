import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// NestJS relies on `emitDecoratorMetadata`; esbuild (Vitest's default) does not
// emit it, so we transform with SWC, which does (config read from tsconfig.json).
export default defineConfig({
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
    setupFiles: ['test/setup.ts'],
    restoreMocks: true,
    env: { NODE_ENV: 'test' },
  },
});
