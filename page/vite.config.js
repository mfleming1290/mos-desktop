import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@originjs/vite-plugin-federation';
import { writeFileSync } from 'node:fs';
import config from './plugin.config.js';

export default defineConfig({
  base: './',
  optimizeDeps: {include:['@xterm/xterm']},
  plugins: [vue(), federation({
    name: config.name, filename: 'remoteEntry.js',
    exposes: {'./Plugin': './src/Plugin.vue'},
    shared: {vue: {import: false, generate: false, requiredVersion: '^3.5.0'}}
  }), {
    name: 'mos-manifest',
    closeBundle() {
      writeFileSync(new URL('./dist/desktop/manifest.json', import.meta.url), JSON.stringify(config, null, 2));
    }
  }],
  build: {target: 'esnext', minify: false, assetsInlineLimit: 0,
    outDir: 'dist/desktop', assetsDir: '', rollupOptions: {input: {}}}
});
