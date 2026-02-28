<script setup lang="ts">
import { defineProps, onMounted, reactive } from 'vue'
import useSystemInfoStore from '@/store/sysinfo';
const sysInfoStore = useSystemInfoStore()
const props = defineProps({
    category: {
        type: String,
        required: true,
    },
    css: {
        type: Object,
        required: true,
    }
})
const horiProgressBack = reactive({
    'background-color': props.css.bgColor || '#121114'
})
const horiProgressFront = reactive({
    width: '0%',
    backgroundColor: props.css.color || '#fffe59',
    borderRadius: props.css['border-radius'] || 0,
})

onMounted(() => {
    horiProgressFront.backgroundColor = props.css.color
})

sysInfoStore.$subscribe((_, state) => {
    horiProgressFront.backgroundColor = props.css.color || '#fffe59'
    horiProgressFront.borderRadius = props.css['border-radius'] || 0
    switch (props.category) {
        case 'cpu-rect-usage':
            horiProgressFront.width = state.cpuUsage + '%'
            break
        case 'cpu-rect-clock':
            horiProgressFront.width = 100 + '%'
            break
        case 'cpu-rect-temp':
            horiProgressFront.width = state.cpuTemperature + '%'
            break
        case 'gpu-rect-temp':
            horiProgressFront.width = state.gpuTemperature + '%'
            break
        case 'gpu-rect-clock':
            horiProgressFront.width = Math.round((state.gpuClock * 100) / state.gpuMaxClock) + '%'
            break
        case 'gpu-rect-usage':
            horiProgressFront.width = state.gpuUsage + '%'
            break
        case 'gpu-rect-mem-usage':
            horiProgressFront.width = Math.round((state.gpuMemUsed * 100) / state.gpuMemTotal) + '%'
            break
        case 'gpu-rect-mem-clock':
            horiProgressFront.width = 100 + '%'
            break
        case 'ram-rect-free':
            horiProgressFront.width = Math.round((state.ramFree * 100) / state.ramTotal) + '%'
            break
        case 'ram-rect-used':
            horiProgressFront.width = Math.round((state.ramUsed * 100) / state.ramTotal) + '%'
            break
        case 'disk-rect-free':
            horiProgressFront.width =
                Math.round(((state.diskCTotal - state.diskCUsed) * 100) / state.diskCTotal) + '%'
            break
        case 'disk-rect-used':
            horiProgressFront.width = Math.round((state.diskCUsed * 100) / state.diskCTotal) + '%'
            break
        default:
            break
    }
})
</script>
<template>
    <div class="hori-progress-back" :style="horiProgressBack">
        <div ref="progress" class="hori-progress-front" :style="horiProgressFront"/>
    </div>
</template>
<style scoped>
.hori-progress-back {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: left;
}
.hori-progress-front {
    width: 0%;
    height: 100%;
    transition:
        linear,
        width 0.3s;
}

</style>
