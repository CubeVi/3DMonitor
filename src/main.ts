import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
const app = createApp(App)

// Register router
import router from './router/index'
app.use(router)

// Register Pinia
import { createPinia } from 'pinia';

// 2. Get Pinia instance
const pinia = createPinia();

// 3. Add Pinia instance to the app
app.use(pinia)

// Import i18n support
import { setupI18n } from './i18n'
setupI18n(app)

// svg
import 'virtual:svg-icons-register'
import SvgIcon from '@/components/SvgIcon/index.vue'
app.component('svg-icon', SvgIcon)

// Import styles
import 'element-plus/dist/index.css'
// Import custom fonts
import './assets/fonts/font.css'
app.mount('#app')
app.use(ElementPlus, {
    locale: zhCn
})
