import {
  defineConfig
} from 'vite';
import {
  VitePWA
} from 'vite-plugin-pwa';
import {
  resolve
} from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      strategies: 'injectManifest',
      srcDir: 'src/scripts', 
      filename: 'sw.js', 
      manifest: false,
      devOptions: {
        enabled: false, 
      }
    }),
  ],
});