<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import useSystemInfoStore from '@/store/sysinfo'
const sysInfoStore = useSystemInfoStore()
import viewer2 from '@/view/viewer/index.vue'
import viewer from '@/view/viewer/index_babylon.vue'
import NewLineTickProgress from '@/components/NewLineTickProgress/index.vue'
import NewCircleTickProgress from '@/components/NewCircleTickProgress/index.vue'
import log from '@/utils/logger'
let currThemeStrLen = 0
const screenOut = ref(true)
const currTheme = reactive({
    id: '',
    name: '',
    description: '',
    cover: '',
    list: []
})

const viewRef = ref()
const viewRef2 = ref()
onMounted(() => {
    window.electronApi.callbackLog((value: any) => {
        const {tag, data} = JSON.parse(value)
        log(`BACKGROUND:[${tag}] --->`, data)
    })
    window.electronApi.getThemeId()
    window.electronApi.observeSetThemeId((info: any) => {
        const {id,outScreen} = info
        log('observeSetThemeId----themeId', id,'outScreen:',outScreen, 'currTheme.id', currTheme.id);
        window.electronApi.getThemeData(id).then((data: any) => {
                console.log('[ theme.data.length ] >', data.length,currThemeStrLen)
                if(data.length === currThemeStrLen){
                    return
                }
                currThemeStrLen = data.length
                const newData = JSON.parse(data)
                currTheme.id = id
                currTheme.name = newData.name
                currTheme.description = newData.description
                currTheme.cover = newData.cover
                if(currTheme.list.length >0){
                    currTheme.list = []
                }
                setTimeout(() => {
                    currTheme.list = newData.list
                    const video = newData.list.find((element: { type: string }) => element.type === 'video')
                    log('[ screenOut ] >', newData.screenOut)
                    log('[ video ] >', video)
                    if (video) {
                        screenOut.value = newData.screenOut
                        if(screenOut.value){
                            if (viewRef.value) {
                                viewRef.value[0].changeVideo(video.src)
                            }
                        }else{
                            if (viewRef2.value) {
                                viewRef2.value[0].changeVideo(video.src)
                            }
                        }
                    }
                },100)
            },
            (error: any) => {
                log('initData.error', error)
            },
        )
    })
    window.electronApi.receiveSystemInfoUpdated((systemInfo: any) => {
        const { cpuInfo, gpuInfo, memInfo, diskInfo, networkInfo } = systemInfo
        log('[ cpuInfo ] >', cpuInfo)
        sysInfoStore.$patch({
            cpuClock: cpuInfo.speed,
            cpuModel: cpuInfo.brand,
            cpuUsage: cpuInfo.utilization,
            cpuTemperature: cpuInfo.temperature,
            gpuModel: gpuInfo.name|| 'NO GPU',
            gpuUsage: gpuInfo.utilizationGpu === undefined ? sysInfoStore.gpuUsage : gpuInfo.utilizationGpu,
            gpuMemUsage: gpuInfo.utilizationMemory === undefined ? sysInfoStore.gpuMemUsage : gpuInfo.utilizationMemory ,
            gpuTemperature: gpuInfo.temperature,
            gpuClock: gpuInfo.clockCore,
            gpuMaxClock: gpuInfo.clock,
            gpuMemClock: gpuInfo.clockMemory,
            gpuMemTotal: gpuInfo.memoryTotal,
            gpuMemUsed: gpuInfo.memoryUsed,
            ramUsed: memInfo.used,
            ramFree: memInfo.free,
            ramTotal: memInfo.total,
            diskCUsed: diskInfo.used,
            diskCTotal: diskInfo.size,
            upstream: networkInfo.upstream,
            downstream: networkInfo.downstream,
            connected: networkInfo.connected
        })
    })
})

</script>

<template>
    <div v-if="screenOut" class="main-container">
        <div id="template-container" class="main-container" style="position:absolute;left:00px;z-index:-1000;">
            <template v-for="(item, index) in currTheme.list" :key="index">
                <normal-text  v-if="item.type == 'text'" 
                    :content="item.content"
                    :style="item.style"/>
                <data-text v-else-if="item.type == 'data'"
                    :style="item.style"
                    :css="item.innerStyle"
                    :category="item.category"/>
                <div v-else-if="item.type == 'mask'" :style="item.style"/>
                <clock-progress v-else-if="item.type == 'circle'"
                    :category="item.category"
                    :style="item.style" 
                    :css="item.innerStyle"/>
                <horizontal-progress-bar v-else-if="item.type == 'rect'"
                    :category="item.category"
                    :style="item.style" 
                    :css="item.innerStyle"/>
                <vertical-progress-bar v-else-if="item.type == 'vertical'"
                    :category="item.category"
                    :style="item.style" 
                    :css="item.innerStyle"/>
                <arc-progress v-else-if="item.type == 'arc'"
                    :category="item.category"
                    :style="item.style" 
                    :css="item.innerStyle"/>
                <NewLineTickProgress v-else-if="item.type == 'lineTick'"
                    :category="item.category"
                    :style="item.style" 
                    :css="item.innerStyle"/>
                <NewCircleTickProgress v-else-if="item.type == 'circleTick'"
                    :category="item.category"
                    :style="item.style" 
                    :css="item.innerStyle"/>
                <img v-else-if="item.type == 'image'" :src="item.src" alt="" :style="item.style"/>
            </template>
        </div>
        <template v-for="(item, index) in currTheme.list" :key="index">
            <viewer v-if="item.type == 'video'" ref="viewRef" :src="item.src" :style="item.style" />
        </template>
    </div>
    <div v-else class="main-container">
        <template v-for="(item, index) in currTheme.list" :key="index">
            <normal-text v-if="item.type == 'text'" :content="item.content" :style="item.style" />
            <data-text v-else-if="item.type == 'data'"
                :style="item.style"
                :category="item.category"/>
            <div v-else-if="item.type == 'mask'" :style="item.style"/>
            <clock-progress v-else-if="item.type == 'circle'"
                :category="item.category"
                :style="item.style" 
                :css="item.innerStyle"/>
            <horizontal-progress-bar v-else-if="item.type == 'rect'"
                :category="item.category"
                :style="item.style" 
                :css="item.innerStyle"/>
            <vertical-progress-bar v-else-if="item.type == 'vertical'"
                :category="item.category"
                :style="item.style" 
                :css="item.innerStyle"/>
            <viewer2 v-else-if="item.type == 'video'"
                ref="viewRef2"
                :src="item.src"
                :style="item.style"/>
            <arc-progress v-else-if="item.type == 'arc'"
                :category="item.category"
                :style="item.style" 
                :css="item.innerStyle"/>
            <NewLineTickProgress v-else-if="item.type == 'lineTick'"
                :category="item.category"
                :style="item.style" 
                :css="item.innerStyle"/>
            <NewCircleTickProgress v-else-if="item.type == 'circleTick'"
                :category="item.category"
                :style="item.style" 
                :css="item.innerStyle"/>
            <img v-else :src="item.src" alt="" :style="item.style"/>
        </template>
    </div>
</template>

<style lang="css" scoped>
.main-container {
    position: relative;
    width: 100%;
    height: 100%;
}
</style>
