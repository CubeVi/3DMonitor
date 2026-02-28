<template>
    <div ref="refElement" class="progress-circle" :style="background">
        <svg>
            <circle v-if="inactiveShow" stroke="var(--inactive-color)"/>
            <circle
                stroke="var(--color)"
                class="progress-value"
                style="stroke-dasharray: calc(2 * 3.1415926 * var(--r) * (var(--percent) / 100)), 2000"
                :style="lineCap"
            />
        </svg>
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps, onMounted, reactive, computed, toRaw } from 'vue'
import useSystemInfoStore from '@/store/sysinfo'
const sysInfoStore = useSystemInfoStore()
const props = defineProps({
    css: {
        type: Object,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
})


const lineCap = reactive({
    'stroke-linecap': props.css['stroke-linecap'] || 'butt',
})
const background = reactive({
    'background-color': props.css['background-color'] || '#1E1E1E',
    'font-size': props.css.fontSize,
})
const inactiveShow = computed(() => {
    if (props.css['hide-inactive']) {
        return parseInt(props.css['hide-inactive']) <= 0
    }
    return true
})

onMounted(() => {
    updateNewData()
    background['font-size'] = props.css.fontSize
    background['background-color'] = props.css['background-color'] || '#1E1E1E'
    changeDemo(props.css['stroke-color']?props.css['stroke-color']:'#707070', '--inactive-color')
    console.log('======>css:',toRaw(props.css), 'category:', props.category,props.category)
})
function updateNewData() {
    changeDemo(props.css.size, '--size')
    changeDemo(props.css.stokeWidth, '--border-width')
    changeDemo(props.css.color, '--color')
    changeDemo(props.css.textColor, '--text-color')
    changeDemo(props.css.textOffsetY, '--text-offset-y')
}

const refElement = ref()
function changeDemo(value, property) {
    if (property === '--percent' && (value === null || value === undefined || isNaN(value))) {
        value = 0
    }
    if(value){
        refElement.value.style.setProperty(property, value)
    }
    
}

sysInfoStore.$subscribe((_, state) => {
    switch (props.category) {
        case 'cpu-circle-usage':
            changeDemo(state.cpuUsage, '--percent')
            break
        case 'cpu-circle-clock':
            changeDemo(100, '--percent')
            break
        case 'cpu-circle-temp':
            changeDemo(state.cpuTemperature > 100 ? 100 : state.cpuTemperature, '--percent')
            break
        case 'gpu-circle-temp':
            changeDemo(state.gpuTemperature > 100 ? 100 : state.gpuTemperature, '--percent')
            break
        case 'gpu-circle-clock':
            changeDemo(Math.round((state.gpuClock * 100) / state.gpuMaxClock), '--percent')
            break
        case 'gpu-circle-usage':
            changeDemo(state.gpuUsage, '--percent')
            break
        case 'gpu-circle-mem-usage':
            changeDemo(Math.round((state.gpuMemUsed * 100) / state.gpuMemTotal), '--percent')
            break
        case 'gpu-circle-mem-clock':
            changeDemo(100, '--percent')
            break
        case 'ram-circle-free':
            changeDemo(Math.round((state.ramFree * 100) / state.ramTotal), '--percent')
            break
        case 'ram-circle-used':
            changeDemo(Math.round((state.ramUsed * 100) / state.ramTotal), '--percent')
            break
        case 'disk-circle-free':
            changeDemo(Math.round(((state.diskCTotal - state.diskCUsed) * 100) / state.diskCTotal),'--percent',)
            break
        case 'disk-circle-used':
            changeDemo(Math.round((state.diskCUsed * 100) / state.diskCTotal), '--percent')
            break
        default:
            break
    }

})
</script>


<style lang="css" scoped>
.progress-circle {
    /* Percentage */
    --percent: 0;
    /* Size */
    --size: 180px;
    /* Ring width (thickness) */
    --border-width: 15px;
    /* Primary color */
    --color: #fffe59;
    /* Secondary color */
    --inactive-color: #707070;
    --text-color: white;
    --text-offset-y: 60%;

    position: relative;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
    border-width: 1px;
    border-color: green;
    background-color: #1e1e1e;
}

/* Percentage text */
.progress-circle::before {
    position: absolute;
    top: var(--text-offset-y);
    left: 50%;
    transform: translate(-50%, -50%);
    counter-reset: progress var(--percent);
    content: counter(progress);
    white-space: nowrap;
    font-weight: bold;
    color: var(--text-color);
    font-family: dinMedium;
}

/* SVG container */
.progress-circle > svg {
    width: 100%;
    height: 100%;
    rotate:-90deg;
}

/* Progress ring */
.progress-circle circle {
    --r: calc((var(--size) - var(--border-width)) / 2);
    cx: calc(var(--size) / 2);
    cy: calc(var(--size) / 2);
    r: var(--r);
    fill: none;
    stroke-width: var(--border-width);
    stroke-dasharray: 10, 10;
    transition: stroke-dasharray 0.4s linear, stroke 0.3s;
}

/* Optimization: hide progress bar when value is 0 */
.progress-value {
    opacity: var(--percent);
    stroke-linecap: butt;
}
</style>
