<template>
    <div class="main">
        <new-title-bar class="title-bar" />
        <div v-if="themes.length" class="container">
            <div class="gallery">
                <img src="@/assets/images/ic-arrow-new.png" class="img-theme-arrow rotate-180" @click="showPre">
                <div class="img-container">
                    <img :src="currUrl" class="cover" @load="imgLoad" @error="loadErr"/>
                    <img v-if="bgCount>1" class="prev" src="@/assets/icons/arrow_left_normal.png" @click="prevBg">
                    <img v-if="bgCount>1" class="next" src="@/assets/icons/arrow_right_normal.png" @click="nextBg">
                    <div v-if="isImgLoading" class="container-loading" @click.stop >
                        <img class="img-loading" src="@/assets/images/ic-loading.png" />
                    </div>
                </div>
                <img src="@/assets/images/ic-arrow-new.png" class="img-theme-arrow" @click="showNext">
            </div>
            <div class="content">
                <div class="content-container">
                    <div class="carousel-info">
                        <p class="theme-title">{{ currTheme.themeName }}</p>
                        <p class="p-size-date">{{ t('zhuti_daxiao') }}：{{ (currTheme.size / 1024 / 1024).toFixed(2) }}MB</p>
                        <p class="p-size-date">{{ t('gengxin_shijian') }}：{{ currTheme.updateTime ||  currTheme.stamp}}</p>
                        <p class="p-desc">{{ t('zhuti_shuoming') }}：{{ currTheme.description }}</p>
                    </div>
                    <div class="bottom-container">
                        <div class="out-screen-container">
                            <span>{{ t('xianshi_chushui') }}</span>
                            <el-switch v-model="outScreen" size="small" class="switch" />
                        </div>
                        <span class="btn-download" @click="applyOrDownload">{{ themeDownloaded ? t('yingyong') : t('xiazai') }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="container-version" @click="checkNewVersion">
            <span style="color: white;">v{{ currVersion }}</span>
            <span v-if="hasNewVersion" style="color:#2FC6DF">({{ t('faxian_xinbanben') }})</span>
        </div>
        <el-dialog v-model="downloadingDialogVisible" width="50%" center class="custom-dialog" :align-center="true"
            :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false"
            :style="{ backgroundColor: '#0a3350' }">
            <h2 class="dialog-title">{{ currTheme.name }}</h2>
            <br>
            <br>
            <el-progress v-model="downloadingDialogVisible" :percentage="progressCount" :stroke-width="15" striped />
            <template #footer>
                <div class="dialog-footer">
                    <button class="btn-cancel" @click="downloadingDialogVisible = false">{{ t('quxiao') }}</button>
                </div>
            </template>
        </el-dialog>
        <el-dialog
            v-model="incompatibleDialogVisible"
            :show-close="false"
            width="500"
            :style="{ backgroundColor: '#0a3350' }"
            destroy-on-close
            center>
            <template #header>
                <span style="color: white;">{{ t('jianrong_tishi') }}</span>
            </template>
            <div style="color: white;width: 100%; text-align: center;">{{ t('zhuti_bujianrong') }}</div>
            <template #footer>
                <div class="dialog-footer">
                    <button class="btn-cancel" @click="incompatibleDialogVisible = false">{{ t('queding') }}</button>
                </div>
            </template>
        </el-dialog>
        <el-dialog
            v-model="warnDialogShown"
            :show-close="false"
            width="500"
            :close-on-click-modal="false"
            :style="{ backgroundColor: '#0a3350' }"
            destroy-on-close
            center>
            <template #header>
                <span style="color: white;">{{ t('jinggao') }}</span>
            </template>
            <div style="color: white;width: 100%; text-align: center;">{{ t('xingneng_zhanyong') }}</div>
            <template #footer>
                <div class="dialog-footer" >
                    <button class="btn-cancel" @click="enable3D(true)">{{ t('queding') }}</button>
                    <button class="btn-cancel" @click="enable3D(false)">{{ t('quxiao') }}</button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import {  ver } from '@/api/config'
import useTitleStore from '@/store/title/index'
import { ElDialog} from 'element-plus';
import 'element-plus/dist/index.css';
import { statistics,hardwareReport, DATA_TYPE_HARDWARE } from '@/api/index'
import log from '@/utils/logger'
import { compareVersions } from '@/utils/encryptor'
const { t } = useI18n()
const titleStore = useTitleStore()
const { themes,userId,hasNewVersion } = storeToRefs(titleStore)
const themeIndex = ref(0)
const progressCount = ref(0)
const currTheme = ref()
const downloadingDialogVisible = ref(false)
const incompatibleDialogVisible = ref(false)
const warnDialogShown = ref(false)
const themeDownloaded = ref(false)
const existIds = reactive([])
const outScreen = ref(false)
const currVersion = ref(ver)
const isImgLoading = ref(true)
const currUrl = ref('')
const bgCount = ref(1)
const idIndex = new Map<string,number>()
function showPre() {
    if (themes.value.length <=1 || isImgLoading.value) {
        return
    }
    isImgLoading.value = true
    themeIndex.value = (themeIndex.value - 1 + themes.value.length) % themes.value.length
    currTheme.value = themes.value[themeIndex.value]
    log('showPre----', currTheme.value.id);
}
function showNext() {
    if (themes.value.length<=1 || isImgLoading.value) {
        return
    }
    isImgLoading.value = true
    themeIndex.value = (themeIndex.value + 1) % themes.value.length
    currTheme.value = themes.value[themeIndex.value]
    log('showNext----', currTheme.value.id);
}
const prevBg = () => {
    const {id, previewFileUrls} = currTheme.value
    idIndex.set(id,(idIndex.get(id)-1+bgCount.value)%bgCount.value)
    currUrl.value = previewFileUrls[idIndex.get(id)] 
    isImgLoading.value = true
}
const nextBg = () => {
    const {id,previewFileUrls} = currTheme.value
    idIndex.set(id,(idIndex.get(id)+1)%bgCount.value)
    currUrl.value = previewFileUrls[idIndex.get(id)]
    isImgLoading.value = true
}
function uploadStatistic(statType: string) {
    if(!currTheme.value){
        return
    }
    statistics({ contentType: 'theme', resourceId: currTheme.value.id, statType })
}
function applyOrDownload() {
    currTheme.value = themes.value[themeIndex.value]
    log('applyOrDownload.existIds:', existIds, 'currTheme.id:', currTheme.value.id)
    log('applyOrDownload.currTheme:', currTheme.value)
    if(!currTheme.value.appVersion){
        incompatibleDialogVisible.value = true
        return
    }
    const compatible = compareVersions(ver,currTheme.value.appVersion)
    console.log('[ compatible ] >', compatible,'appVersion:', currTheme.value.appVersion)
    if(compatible<0){
        incompatibleDialogVisible.value = true
        return
    }
    if (themeDownloaded.value) {
        uploadStatistic('use')
        let index = -1
        if(bgCount.value>0){
            index = idIndex.get(currTheme.value.id)??-1
        }
        window.electronApi.openNewWindow( {id:currTheme.value.id,outScreen:outScreen.value,index})
    } else {
        downloadingDialogVisible.value = true
        window.electronApi.startDownload(currTheme.value.id, currTheme.value.downloadFileUrl)
    }
    window.electronApi.screenOutUpdate(outScreen.value)
}
watch(themes,(newValue:any)=>{
    console.log('[ watch---themes ] >', newValue)
    if (newValue.length > 0) {
        currTheme.value = newValue[themeIndex.value]
    }
})
watch(currTheme,(newValue:any)=>{
    console.log('[ watch---currTheme ] >', newValue)
    if(!newValue){
        return
    }
    uploadStatistic('browse')
    const {id,previewFileUrls,previewFileUrl} = newValue
    if(previewFileUrls && previewFileUrls.length>1){
        if(idIndex.has(id)){
            currUrl.value = previewFileUrls[idIndex.get(id)] 
        }else{
            idIndex.set(id,0)
            currUrl.value = previewFileUrls[0]
        }
    }else{
        currUrl.value = previewFileUrl
    }
    bgCount.value = previewFileUrls.length>1?previewFileUrls.length:1
    themeDownloaded.value = existIds.includes(id)
})
onMounted(async () => {
    window.electronApi.callbackLog((value: any) => {
        const { tag, data } = JSON.parse(value)
        log(`BACKGROUND:[${tag}] --->`, data)
    })
    window.electronApi.updateDownloadProgress((data: any) => {
        log('updateDownloadProgress', data);
        if (data && !data.error) {
            progressCount.value = data.progress
            if (data.progress >= 100) {
                downloadingDialogVisible.value = false
                themeDownloaded.value = true
                existIds.push(currTheme.value.id)
                progressCount.value = 0
            }
        } else {
            downloadingDialogVisible.value = false
        }
    })
    window.electronApi.readDownloadedThemes()
    window.electronApi.callbackDownloadedThemes((data: any) => {
        for (let i = 0; i < data.length; i++) {
            existIds.push(data[i])
        }
        log('main.callbackDownloadedThemes.data', data)
    })
    window.electronApi.observeGetThemeId(() => {
        log('main.observeGetThemeId');
        window.electronApi.setThemeId({id:currTheme.value.id,outScreen:outScreen.value})
    })
    window.electronApi.observeReport((data: string) => {
        setTimeout(() => {
            hardwareReport({'app': '3DMointor', 'type': DATA_TYPE_HARDWARE, 'data': data,'userId': userId.value})
        },20000)
        
        // setTimeout(() => {
        //     hardwareReport({'app': '3DMointor', 'type': DATA_TYPE_HARDWARE, 'data': data,'userId': userId.value})
        // }, 20000)
    })
    log('main.onMounted', themes.value.length, currTheme.value)
    // setTimeout(() => { 
    //     hardwareList({'pageNo':1,'pageSize':30,'app':'3DMointor','type': DATA_TYPE_HARDWARE})
    // },20000)
});

const imgLoad = (res:any) => {
    console.log('[ imgLoad---res ] >', res)
    isImgLoading.value = false
}
const loadErr = (res:any) => {
    console.log('[ loadErr---res ] >', res)
    isImgLoading.value = false
}
const enable3D = (value:boolean) => {
    warnDialogShown.value = false
    outScreen.value = value
}
watch(outScreen, (newValue:boolean) => {
    if(newValue){
        warnDialogShown.value = true
    }
})
const checkNewVersion = () => {
    titleStore.callCheckNewVersion()
}
</script>
<style lang="scss" scoped>
.main {
    background-color: linear-gradient(180deg, #071523 0%, #061d2d 100%);
    font-family: dinMedium;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
}
.incompatible-dialog{
    background-color: #fffe59;
}

.dialog-footer{
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 30px;
}

.container-version{
    display: flex;
    flex-direction: row; 
    position: absolute; 
    bottom: 10px; 
    left: 10px;
    font-family: sans-serif;
    font-size: 14px;
    cursor: pointer;
}

.title-bar {
    width: 100%;
}

.container {
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    justify-content: center;
    margin-top: 1px;
}

.gallery {
    width: 55%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    .img-container {
        position: relative;
        height: 77%;
        width: 65%;
        .prev,
        .next {
            position: absolute;
            top: 47%;
            width: 50px;
            height: 50px;
            cursor: pointer;
        }
        .prev {
            left: 0px;
        }
        .next {
            right: 0px;
        }
        .prev:hover {
            content: url("@/assets/icons/arrow_left_hover.png");
        }
        .next:hover {
            content: url("@/assets/icons/arrow_right_hover.png");
        }
        .container-loading{
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            .img-loading{
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        }
    }
    .img-theme-arrow {
        width: 60px;
        height: 60px;
        cursor: pointer; 
        &:hover {
            content: url("@/assets/images/ic-arrow-new-hover.png");
        }
    }
    .rotate-180 {
        transform: rotate(180deg);
    }
}
.cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.content {
    width: 45%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: start;

    .content-container {
        height: 77%;
        width: 65%;
        margin-left: 10px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
    }
}

.carousel-info {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 80%;
}

.p-size-date {
    white-space: pre;
    color: white;
    padding-top: 14px;
    display: inline-block;
}


.bottom-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
}

.out-screen-container {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.out-screen-container span {
    color: white;
    margin-right: 6px;
    margin-bottom: 3px;
    font-size: 14px;
}

.btn-download {
    width: 83px;
    height: 30px;
    background-color: rgba(113, 156, 185, 1);
    border-radius: 15px;
    text-align: center;
    line-height: 30px;
    font-size: 14px;
    color: white;
    cursor: pointer;
}

.switch {
    --el-switch-off-color: #C6C6C6;
    --el-switch-on-color: #2FC6DF;
    --el-color-white: #071523;
    --el-color-primary: white !important;
}

.btn-download:hover {
    background-color: rgba(47, 198, 223, 1);
}

.dialog-container {
    background-color: #0a3350;
}

.dialog-title {
    text-align: center;
    color: white;
}

.btn-cancel {
    display: inline-block;
    width: 100px;
    height: 40px;
    line-height: 40px;
    border-radius: 20px;
    color: white;
    background-color: #062033;
    border: none;
}

.btn-cancel:hover {
    background-color: #fffe59;
    color: #0a3350;
}

.p-desc {
    overflow: hidden;
    overflow-y: scroll;
    color: white;
    font-size: 14px;
    margin-top: 43px;
    line-height: 26px;
    height: 300px;
}

.theme-title {
    color: white;
    font-size: 26px;
    font-weight: 500;
    display: inline-block;
}
</style>
