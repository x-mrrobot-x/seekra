import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

const resolvePath = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig(({ mode }) => {
  const environment = mode === 'tasker' ? 'tasker' : 'web';

  return {
    base: './',
    resolve: {
      alias: {
        '@env': resolvePath(`./src/core/env/${environment}.environment.js`),
      },
    },
    plugins: [viteSingleFile()],
    build: {
      target: 'es2020',
      outDir: `dist`,
      emptyOutDir: true,
      cssCodeSplit: false,
      assetsInlineLimit: 100000000,
    },
  };
});
