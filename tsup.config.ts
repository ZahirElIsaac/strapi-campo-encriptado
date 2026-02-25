import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'admin/index.ts',
    'server/index.ts',
  ],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: true,
});
