<script setup lang="ts">
import { onMounted, ref,watch } from 'vue'
import { queryThemes } from '@/api/index'
import { storeToRefs } from 'pinia'
import useTitleStore from '@/store/title/index'
import { compareVersions, decryptLongMessage } from '@/utils/encryptor'
import { getLastAppReleaseVersion } from './api'
import axios from 'axios'
import { BASE_URL, getAppName, ver } from '@/api/config'
import log from './utils/logger'
import useLangStore from '@/store/lang/index'
import i18n from '@/i18n'
import { useI18n } from 'vue-i18n'
import { showToast } from '@/utils/toaster'
import { LANG_CN } from '@/utils/constants'
const { t } = useI18n()
const langStore = useLangStore()
const titleStore = useTitleStore()
const { token,checkNewVersion } = storeToRefs(titleStore)
const { lang } = storeToRefs(langStore)
const mToken = ref(token.value)
const updateFlag = ref(false)
const processFlag = ref(false)
const appInfo = ref({})
const forceUpdate = ref(false)
const downloadProgress = ref(0)
const confirm = () => {
    window.electronApi.update({ value: true, url: appInfo.value.versionInfo.packagePath })
    updateFlag.value = false
    processFlag.value = true
}
watch(lang,(newValue:string)=>{
    window.electronApi.setTitle(newValue==LANG_CN?'性能监控':'3DMonitor')
})

const isMainWindow = ref(false)
const appId = ref('')
const requestNewViersion = async(showToastWhenNoNewVersion:boolean = false) => {
    if (appId.value) {
        let result = await getLastAppReleaseVersion({ appId: appId.value })
        if (result.code == 401) {
            window.electronApi.relogin()
        } else {
            appInfo.value = result.result
            updateFlag.value = compareVersions(result.result.versionInfo.appVersion, ver) > 0
            titleStore.setVersion(updateFlag.value)
            if (result.result.versionInfo.forceUpdate == 1) {
                forceUpdate.value = true
            }
            if(showToastWhenNoNewVersion && !updateFlag.value){
                showToast('success',t('zanwu_xinbanben'))
            }
        }
    }
}
watch(checkNewVersion,(newValue:boolean)=>{
    if(newValue){
        requestNewViersion(true)
    }
})

onMounted(async () => {
    isMainWindow.value = window.innerWidth > window.innerHeight
    log('isMainWin:', isMainWindow.value, 'token:', token.value)
    window.electronApi.updateProgress((value: number) => {
        downloadProgress.value = Number(value)
    })
    log('----->app.onMounted....11111')
    // Non-main window: skip API request related logic
    if (isMainWindow.value) {
        await window.electronApi.getToken()
        await window.electronApi.setToken(async (value: any) => {
            console.log('[ ====>callback.token ] >', value)
            let newToken = ''
            if(value.token){
                newToken = decryptLongMessage(value.token)
            }
            console.log('[ ====>newToken ] >', newToken)
            if(!newToken){
                showToast('error','get token form Platform error,try again later')
                return
            }
            mToken.value = newToken
            titleStore.setToken(newToken, value.userId, value.photo, value.nickName)
            const themes = await queryThemes({ themeType: 'monitor', pageNo: '1', pageSize: '100' })
            titleStore.setThemes(themes.result.records || [])
            log('App---->themes', themes.result.records || [])
            log('app.token:', token.value,'--->',value)
            appId.value = value[getAppName()]
            axios({
                method: 'post',
                url: BASE_URL + '/jeecg-boot/cube/boxUserApp/uploadVersion',
                headers: {
                    'X-Access-Token': newToken,
                    platform: 'C1',
                    ver: ver,
                },
                data: {
                    appId: appId.value,
                    clientVersion: ver,
                },
            })
            requestNewViersion()
        })
    }
    window.electronApi.getConfig()
    window.electronApi.callbackConfig((value: any) => {
        log('callbackConfig', value)
        langStore.changeLanguage(value.langType)
        i18n.global.locale.value = value.langType 
    })
    window.electronApi.setTitle(lang.value==LANG_CN?'性能监控':'3DMonitor')
})
</script>

<template>
    <router-view v-if="mToken || !isMainWindow" v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
            <component :is="Component" />
        </Transition>
    </router-view>
    <my-modal
        v-model="updateFlag"
        :title="$t('faxianxinbanben')"
        @cancel="updateFlag = false"
        @confirm="confirm"/>
    <div v-if="processFlag" class="model-update">
        <div class="content">
            <div class="title">{{ t('gengxinzhong') }}</div>
            <el-progress
                :percentage="downloadProgress"
                :stroke-width="15"
                striped
                striped-flow
                :duration="10"
            />
        </div>
    </div>
</template>

<style lang="css" scoped>
.model-update {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.7);
    .content {
        width: 500px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        .title {
            margin-bottom: 10px;
        }
    }
}

.indexMask {
    background-color: raba(0, 0, 0, 0.7);
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    /* Avoid selecting window title */
    user-select: none;
    /* Set this property to indicate a draggable area for moving the window */
    -webkit-app-region: drag;
}
</style>
