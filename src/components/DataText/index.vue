<template>
    <span ref="refSpan" class="wrap-text">{{ data }}</span>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import useSystemInfoStore from '@/store/sysinfo'

const { t } = useI18n()
const sysInfoStore = useSystemInfoStore()
const refSpan = ref()
const data = ref('')
const pureText = ref(false)
const props = defineProps({
    css:{
        type: Object,
        required:false
    },
    category: {
        type: String,
        required: true,
    }
})
const style = ref()

onMounted(() => {
    if(props.css && 'pure' in props.css){
        pureText.value = props.css.pure   
    }
    console.log('[ pureText.value ] >', pureText.value,'category:',props.category)
})

/*
const applyFont=(fontPath:string)=> {
    const result = fontPath.replaceAll('\\','\\\\\\\\')
    const font = new FontFace('CustomFont', `url(${result})`);
    font.load().then((loadedFont) => {
        document.fonts.add(loadedFont);
        refSpan.value.style.fontFamily = 'CustomFont, dinBold';
    }).catch((error) => {
        console.error('Font application failed:', error);
    });
}
    */

function checkGpuExist(state: any, category: string) {
    const exist = state.gpuModel !== '' && state.gpuModel !== undefined && state.gpuModel !== null
    refSpan.value.style.color = exist
        ? refSpan.value.style.color
        : category === 'gpu-data-model'
          ? refSpan.value.style.color
          : '#C1C1C1'
}
sysInfoStore.$subscribe((_, state) => {
    switch (props.category) {
        // CPU
        case 'cpu-data-model':
            data.value = state.cpuModel
            break
        case 'cpu-data-temp':
            data.value = state.cpuTemperature ? state.cpuTemperature + (pureText.value?'':'℃') : '/'
            break
        case 'cpu-data-clock':
            data.value = state.cpuClock ? state.cpuClock + (pureText.value?'':'MHZ') : '/'
            break
        case 'cpu-data-usage':
            data.value = state.cpuUsage ? state.cpuUsage + (pureText.value?'':'%') : '/'
            break
        // GPU
        case 'gpu-data-model':
            data.value = state.gpuModel || t('meiyou_gpu')
            checkGpuExist(state, props.category)
            break
        case 'gpu-data-temp':
            data.value = state.gpuTemperature ? state.gpuTemperature + (pureText.value?'':'℃') : '/'
            checkGpuExist(state, props.category)
            break
        case 'gpu-data-clock':
            data.value = state.gpuClock ? state.gpuClock + (pureText.value?'':'MHZ') : '/'
            checkGpuExist(state, props.category)
            break
        case 'gpu-data-usage':
            data.value = state.gpuUsage ? state.gpuUsage + (pureText.value?'':'%') : '/'
            checkGpuExist(state, props.category)
            break
        case 'gpu-data-mem-used':
            data.value = state.gpuMemUsed ? (state.gpuMemUsed / 1024).toFixed(1) + 'G/' + (state.gpuMemTotal / 1024).toFixed(1) + 'G' : '/'
            checkGpuExist(state, props.category)
            break
        case 'gpu-data-mem-clock':
            data.value = state.gpuMemClock ? state.gpuMemClock + (pureText.value?'':'MHZ') : '/'
            checkGpuExist(state, props.category)
            break
        case 'gpu-data-used': // TODO: GPU base clock is unknown for now
            data.value = state.gpuUsage ? state.gpuUsage + (pureText.value?'':'%') : '/'
            checkGpuExist(state, props.category)
            break
        // RAM
        case 'ram-data-free':
            data.value = state.ramFree ? (state.ramFree / 1024 / 1024).toFixed(1) + (pureText.value?'':'G') : '/'
            break
        case 'ram-data-used':
            data.value = state.ramFree && state.ramTotal ? ((state.ramTotal-state.ramFree) / 1024 / 1024).toFixed(1) + (pureText.value?'':'G') : '/'
            break
        case 'ram-data-free-percent':
            data.value = state.ramFree && state.ramTotal ? (state.ramFree*100/state.ramTotal).toFixed(0) + (pureText.value?'':'%') : '/'
            break
        case 'ram-data-used-percent':
            data.value = state.ramFree && state.ramTotal ? ((state.ramTotal-state.ramFree)*100/state.ramTotal).toFixed(0) + (pureText.value?'':'%') : '/'
            break
        // DISK
        case 'disk-data-free':
            data.value = state.diskCUsed ? Math.round(((state.diskCTotal - state.diskCUsed) * 100) / state.diskCTotal) + (pureText.value?'':'%') : '/'
            break
        case 'disk-data-used':
            data.value = state.diskCUsed ? Math.round((state.diskCUsed * 100) / state.diskCTotal) + (pureText.value?'':'%') : '/'
            break
        case 'disk-data-free-gb':
            data.value = state.diskCUsed ? ((state.diskCTotal-state.diskCUsed)/1024/1024/1024).toFixed(0) + (pureText.value?'':'G') : '/'
            break
        case 'disk-data-used-gb':
            data.value = state.diskCUsed ? (state.diskCUsed/1024/1024/1024).toFixed(0) + (pureText.value?'':'G') : '/'
            break
        // NETWORK
        case 'upstream-data':
            data.value = t('shangchuan') + ':' + state.upstream + (pureText.value?'':'KB/s')
            break
        case 'downstream-data':
            data.value = t('xiazai_sudu') + ':' + state.downstream + (pureText.value?'':'KB/s')
            break
        default:
            data.value = '/'
            break
    }
})
</script>
<style scoped>
.wrap-text{
    word-break: break-all;
}
</style>
