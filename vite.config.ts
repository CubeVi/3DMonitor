import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { viteElectronDev } from './plugins/vite.elctron.dev'
import { viteElectronBuild } from './plugins/vite.elctron.build'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        viteElectronDev(),
        viteElectronBuild(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
        createSvgIconsPlugin({
            // Specify the icon folder to be cached
            iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
            // Specify symbolId format
            symbolId: '[name]',
        }),
    ],
    base: './',
    //这里进行配置别名
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '#': resolve(__dirname, 'public'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: '@import "@/assets/styles/index.scss";',
            },
        },
    },
})
