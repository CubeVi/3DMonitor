<template>
   <div class="container-root">
        <img src="@/assets/images/img-eva.jpg">
        <div class="container-inner"> 
            <arc-progress 
                :category="'cpu-arc-usage'" 
                :css="customStyle11" 
                style="width:800px;height: 800px;background-color: rgba(255,255,0,0.5);margin-top: 200px;margin-left: 200px;position: absolute;"/>
        </div>
   </div>
</template>

<script setup lang="ts">
import log from '@/utils/logger';
import { onMounted } from 'vue';
import useSystemInfoStore from '@/store/sysinfo'
const sysInfoStore = useSystemInfoStore()


const bgStyle = {
    width:'400px',
    height:'400px',
    borderRadius:'50%',
    background:'rgba(225,225,0,0.5)',
}
const bgStyle2 = {
    width:'400px',
    height:'400px',
    borderRadius:'30px',
    background:'rgba(225,0,0,0.5)',
}
const bgStyle3 = {
    width:'800px',
    height:'400px',
    borderRadius:'200px',
    background:'rgba(0,0,225,0.5)',
}
const bgStyle4 = {
    width:'400px',
    height:'200px',
    borderRadius:'0px',
    background:'rgba(0,225,0,0.5)',
    transform:'skewX(-45deg)'
}
const bgStyle5 = {
    width:'400px',
    height:'200px',
    borderRadius:'40px',
    background:'rgba(0,225,0,0.5)',
    transform:'skewX(-45deg)'
}
const bgStyle6 = {
    width:'400px',
    height:'200px',
    borderRadius:'40px',
    transform:'skewX(-45deg)',
    border:'30px solid white'
}
const arcStyle7 = {
    width: '400px',
    height: '200px',
    backgroundColor: 'rgba(225,225,0,0.5)',
    borderRadius: '200px 200px 0 0'
}
const arcStyle8 = {
    width: '400px',
    height: '200px',
    backgroundColor: 'rgba(225,0,225,0.5)',
    borderRadius: '0 0 100px 100px'
}
const circleStyle = {
    tickCount: 30,
    tickRadius:'5px',
    tickWidth:'30px',
    tickHeight:'60px',
    size: '500px',
    inactiveColor: 'gray',
    activeColor: ['#491993','#dd7ee6'],
}
const horiStyle = {
    skewX:'-5deg',
    dividerWidth:'20px',
    tickCount:20,
    tickRadius:'10px',
    activeColor:['#491993','#dd7ee6'],
    inactiveColor:'gray',
}
const customStyle11 = {
    size: '800px',
    borderWidth:'30px',
    activeColor:['yellow'],
    inactiveColor:'rgba(0,0,0,0.5)',
    gapDegree: 200,
    rotateAngle:'-30deg',
    strokeStyle:'round'
}
const customStyle12 = {
    size: '800px',
    borderWidth:'50px',
    activeColor:['yellow','red'],
    inactiveColor:'rgba(0,0,0,0.5)',
    gapDegree: 1,
    rotateAngle:'180deg',
    strokeStyle:'round'
}

onMounted(()=>{
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

<style scoped>
.container-root{
    width: 100%;
    height: 100%;
    position: relative;
}
.container-inner{
    width: 100%;
    height: 100%;
    position:absolute;
}
</style>