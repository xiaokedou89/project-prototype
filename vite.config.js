import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [
//     vue(),
//     vueDevTools(),
//   ],
//   resolve: {
//     alias: {
//       '@': fileURLToPath(new URL('./src', import.meta.url))
//     }
//   }
// })
export default defineConfig(({mode, command}) => {
  const env = loadEnv(mode, process.cwd());
  console.log(env);
  const { VITE_APP_ENV } = env;
  return {
    base: VITE_APP_ENV === 'production' ? '/' : '/',
    plugins: [
      vue({
        script: {
          defineModel: true
        }
      }),
      vueDevTools()
      // AutoImport({
      //   resolvers: [ElementPlusResolver()],
      // }),
      // Components({
      //   resolvers: [ElementPlusResolver()],
      // })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue', '.css', '.scss']
    },
    css: {
      preprocessorOptions: {
        scss: {
          javascriptEnabled: true,
          // 全局引入主题色scss文件
          additionalData: "@import '@/assets/styles/theme.scss';"
        }
      }
    }  
  }
})