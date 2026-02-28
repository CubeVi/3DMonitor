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


const vertProgressBack = reactive({
    'background-color': props.css.bgColor || '#121114'
})
const vertProgressFront = reactive({
    height: '10%',
    backgroundColor: props.css.color || '#fffe59',
    borderRadius: props.css['border-radius'] || 0,
})

onMounted(() => {
    vertProgressFront.backgroundColor = props.css.color
})

sysInfoStore.$subscribe((_, state) => {
    vertProgressFront.backgroundColor = props.css.color || '#fffe59'
    vertProgressFront.borderRadius = props.css['border-radius'] || 0
    switch (props.category) {
        case 'cpu-rect-v-usage':
            vertProgressFront.height = state.cpuUsage + '%'
            break
        case 'cpu-rect-v-clock':
            vertProgressFront.height = 100 + '%'
            break
        case 'cpu-rect-v-temp':
            vertProgressFront.height = state.cpuTemperature + '%'
            break
        case 'gpu-rect-v-temp':
            vertProgressFront.height = state.gpuTemperature + '%'
            break
        case 'gpu-rect-v-clock':
            vertProgressFront.height = state.gpuUsage + '%'
            break
        case 'gpu-rect-v-usage':
            vertProgressFront.height = state.gpuUsage + '%'
            break
        case 'gpu-rect-v-mem-usage':
            vertProgressFront.height = Math.round((state.gpuMemUsed * 100) / state.gpuMemTotal) + '%'
            break
        case 'gpu-rect-v-mem-clock':
            vertProgressFront.height = state.gpuMemUsage + '%'
            break
        case 'ram-rect-v-free':
            vertProgressFront.height = Math.round((state.ramFree * 100) / state.ramTotal) + '%'
            break
        case 'ram-rect-v-used':
            vertProgressFront.height = Math.round((state.ramUsed * 100) / state.ramTotal) + '%'
            break
        case 'disk-rect-v-free':
            vertProgressFront.height =
                Math.round(((state.diskCTotal - state.diskCUsed) * 100) / state.diskCTotal) + '%'
            break
        case 'disk-rect-v-used':
            vertProgressFront.height = Math.round((state.diskCUsed * 100) / state.diskCTotal) + '%'
            break
        default:
            break
    }
})
</script>
<template>
    <div class="vert-progress-back" :style="vertProgressBack">
        <div class="vert-progress-front" :style="vertProgressFront"/>
    </div>
</template>
<style scoped>

.vert-progress-back {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: end;
}
.vert-progress-front {
    width: 100%;
    height: 0%;
    background-color: '#fffe59';
    transition:
        linear,
        height 0.3s;
}
</style>
