import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@originjs/vite-plugin-federation';
import { writeFileSync } from 'node:fs';
import {fileURLToPath} from 'node:url';
import config from './plugin.config.js';

export default defineConfig(({mode}) => mode === 'standalone' ? {
  base:'./',plugins:[vue()],
  build:{target:'esnext',assetsInlineLimit:0,outDir:'dist/standalone',assetsDir:'',
    rollupOptions:{input:fileURLToPath(new URL('./standalone.html',import.meta.url))}}
} : {
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
