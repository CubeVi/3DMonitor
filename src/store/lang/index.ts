import { defineStore } from 'pinia'

type langState = {
    lang: string
}

const useLangStore = defineStore('langStore', {
    state: (): langState => ({
        lang: 'zh-CN',
    }),
    actions: {
        async changeLanguage(newLang: string): Promise<void> {
            console.log('----->changeLanguage:', newLang)
            this.lang = newLang
        },
    },
})

export default useLangStore
