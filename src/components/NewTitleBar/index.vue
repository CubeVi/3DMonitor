<template>
    <div>
        <div class="title-content">
            <div class="title" :class="drag ? 'drag' : ''">
                <div class="img-content" >
                    <img src="@/assets/images/icon.png" alt="" class="icon-img" />
                    <img :src="logoSrc" alt="" class="icon-title" ref="refLogo"/>
                </div>
                <div class="close-content">
                    <img alt="" class="img-in-title" @click="toggleLang" v-if="showLangSwitch"/>
                    <svg-
                        v-if="false"
                        name="help"
                        class="svg-icon"
                        style="width: 24px; height: 24px"
                        @click="goHelp"/>
                    <div v-if="false" class="close-line"></div>
                    <svg-icon name="min" class="svg-icon min" @click="min" />
                    <svg-icon name="close" class="svg-icon close" @click="close" />
                </div>
            </div>
        </div>
        <div class="line"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import useTitleStore from '@/store/title/index'
import { storeToRefs } from 'pinia'
import { getHelpConfig } from '@/api/index'
import log from '@/utils/logger'
import i18n from '@/i18n'
import useLangStore from '@/store/lang/index'
import { KEY_LANG_TYPE } from '@/utils/constants.ts'
import { showToast } from '@/utils/toaster'
import { useI18n } from 'vue-i18n'
import cnLogo from '@/assets/images/ic-logo-cn.png'
import enLogo from '@/assets/images/ic-logo-en.png'
import {LANGUAGE_SWITCH_ENABLED} from '@/api/config/index'

const showLangSwitch = ref(true)
const titleStore = useTitleStore()
const { drag } = storeToRefs(titleStore)
const currentRoute = useRoute()
const router = useRouter()
log('currentRoute.name', currentRoute.name);
const langStore = useLangStore()
const { lang } = storeToRefs(langStore)
const currLang = ref(lang.value)
const { t } = useI18n()
const logoSrc = ref('')
const refLogo = ref()
const toggleLang = () => {
    if (currLang.value === 'zh-CN') {
        currLang.value = 'en-US'
    } else {
        currLang.value = 'zh-CN'
    }
    console.log('[ toggleLang---currLang ] >', currLang.value, i18n.global.locale.value)
    i18n.global.locale.value = currLang.value
    langStore.changeLanguage(currLang.value) 
    window.electronApi.updateConfig({ key: KEY_LANG_TYPE, value: currLang.value })
    showToast('success', currLang.value === 'zh-CN' ? t('yqhwzw') : t('yqhwyw'))
    window.electronApi.changeLanguage(currLang.value)
}
watch(lang,(newValue)=>{
    console.log('[ lang----newValue ] >', newValue,currLang.value)
    if (currLang.value === 'zh-CN') {
        logoSrc.value = cnLogo
        refLogo.value.style.width = '110px'
    } else {
        logoSrc.value = enLogo
        refLogo.value.style.width = '113px'
    }
})

const helpConfig = ref({
    show: false,
    url: '',
})
const min = () => {
    window.electronApi.miniSize(currentRoute.name as string)
}
const close = () => {
    window.electronApi.close(currentRoute.name as string)
}
const goHelp = () => {
    window.electronApi.openUrl('https://www.openstageai.com/problem')
}

const goTest = () => {
    log('goTest')
    router.push('/debug')
}

onMounted(async () => {
    const result = await getHelpConfig()
    helpConfig.value = result.result
    if (currLang.value === 'zh-CN') {
        logoSrc.value = cnLogo
        refLogo.value.style.width = '110px'
    } else {
        logoSrc.value = enLogo
        refLogo.value.style.width = '113px'
    }
    showLangSwitch.value = LANGUAGE_SWITCH_ENABLED
    console.log('[ onMounted ] >', lang.value)
    window.electronApi.changeLanguage(currLang.value)

})
</script>

<style scoped lang="scss">
.title-content {
    display: flex;
    height: 75px;
    width: 100%;
}

.title {
    padding-left: 21px;
    flex: 1;
    display: flex;
    align-items: center;
    gap: 37px;

    &.drag {
        /* Avoid selecting window title */
        user-select: none;
        /* Set this property to indicate a draggable area for moving the window */
        -webkit-app-region: drag;
    }

    .img-content {
        display: flex;
        align-items: center;
        height: 100%;
        gap: 7px;

        .title-img {
            width: 65px;
            height: 24px;
        }

        .icon-img {
            width: 42px;
            height: 42px;
        }
        .icon-title {
           height: 27px;
        }
    }

    .normal {
        font-size: 14px;
        line-height: 16px;
    }

    .add {
        width: 20px;
        height: 20px;
        color: #719cb9;
        margin-left: 20px;
        cursor: pointer;

        &:hover {
            color: #2fc6df !important;
        }
    }
}
.svg-icon {
    width: 30px;
    height: 30px;
    margin-right: 9px;
    margin-top: 5px;
    color: #97969b;

    &:hover {
        color: #ffffff;

        &.min {
            background-color: #2fc6df;

        }

        &.close {
            background-color: #ea3f49;
        }
    }
}

.line {
    background: #0a3350;
    width: 100%;
    height: 1px;
}

.close-content {
    height: auto;
    position: absolute;
    top: 0;
    right: 0;
    -webkit-app-region: no-drag;
    display: flex;
    align-items: center;
    .img-in-title {
        width: 27px;
        height: 27px;
        margin-right: 17px;
        margin-top: 4px;
        cursor: pointer;
        content: url("@/assets/images/ic-language.png");
        &:hover {
            content: url("@/assets/images/ic-language-hover.png");
        }
    }

    .close-line {
        width: 1px;
        height: 19px;
        background: #38607b;
        margin: 0 15px;
    }
}
</style>
