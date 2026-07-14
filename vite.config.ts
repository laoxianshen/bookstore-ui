import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@bookstore/ui': resolve(__dirname, 'packages/ui/src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/picture': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
