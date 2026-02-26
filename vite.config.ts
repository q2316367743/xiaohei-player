import {resolve} from "path";
import {defineConfig} from 'vite'
import UnoCSS from 'unocss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import {TDesignResolver} from '@tdesign-vue-next/auto-import-resolver';

const host = process.env.TAURI_DEV_HOST;

function _resolve(dir: string) {
  return resolve(__dirname, dir);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 忽略所有带连字符的标签（常见于 Web Components）
          isCustomElement: (tag) => tag === 'webview'
          // 或者更精确地匹配，例如只忽略 ion- 开头的：
          // isCustomElement: (tag) => tag.startsWith('ion-')
        }
      }
    }), vueJsx(),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    AutoImport({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
      imports: ['vue', '@vueuse/core', 'vue-router'],
      eslintrc: {
        enabled: true,
      }
    }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Components({
      resolvers: [TDesignResolver({
        library: 'vue-next'
      })],
    }), UnoCSS()],
  // prevent vite from obscuring rust errors
  clearScreen: false,
  resolve: {
    alias: {
      "@": _resolve("src"),
    }
  },
  server: {
    // make sure this port matches the devUrl port in tauri.conf.json file
    port: 5124,
    // Tauri expects a fixed port, fail if that port is not available
    strictPort: true,
    // if the host Tauri is expecting is set, use it
    host: host || false,
    hmr: host
      ? {
        protocol: 'ws',
        host,
        port: 1421,
      }
      : undefined,

    watch: {
      // tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**'],
    },
  },
  // Env variables starting with the item of `envPrefix` will be exposed in tauri's source code through `import.meta.env`.
  envPrefix: ['VITE_', 'TAURI_ENV_*'],
  base: './',
  build: {
    outDir: 'dist',
    // Tauri uses Chromium on Windows and WebKit on macOS and Linux
    target:
      process.env.TAURI_ENV_PLATFORM == 'windows'
        ? 'chrome105'
        : 'safari13',
    // don't minify for debug builds
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,

  },
})
