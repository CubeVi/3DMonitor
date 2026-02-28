import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN'
import enUS from './en-US'

const i18n = createI18n({
    legacy: false,
    locale: localStorage.getItem('langType') || 'zh-CN', // Set language
    fallbackLocale: localStorage.getItem('langType') || 'en-US', // Set fallback language
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS
    }
})
// Add global method
export const setupI18n = (app: any) => {
    app.use(i18n)
}
export default i18n