<template>
   <div>
        <div class="progress-circle" ref="refProgress">
            <svg>
                <defs>
                    <linearGradient id="circleGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" :stop-color="startColor" />
                        <stop offset="100%" :stop-color="endColor" />
                    </linearGradient>
                </defs>
                <circle
                    stroke="var(--inactive-color)"
                    :style="{'stroke-dasharray': `calc(3.1415 * var(--r) * var(--active-degree) / 180), calc(3.1415 * var(--r) * var(--gap-degree) / 180)`}"
                    />
                <circle
                    :stroke="strokeColor"
                    class="progress-value"
                    :style="{'stroke-dasharray': `calc(3.1415 * var(--r) * var(--percent) * var(--active-degree) / 180 / 100), 10000`}"
                />
            </svg>
        </div>
   </div>
  </template>
  
<script setup lang="ts">
import { onMounted, ref,defineProps, watch } from 'vue';
import useSystemInfoStore from '@/store/sysinfo'
const sysInfoStore = useSystemInfoStore()
const refProgress = ref();
const strokeColor = ref('var(--active-color)');
const startColor = ref('#ff0000');
const endColor = ref('#0000ff');
const progress = ref(0)
const props = defineProps({
    category:{
        type:String,
        required:true
    },
    css:{
        type:Object,
        required:true
    }
})

const applyStyleItem = (property:string, value:string) => {
    console.log('[ property ] >', property, value)
    if(property && value){
        refProgress.value.style.setProperty(property, value)
    }
}
const setCustomStyles = () => {
    if(props.css){
        applyStyleItem('--size',props.css.size)
        applyStyleItem('--border-width',props.css.borderWidth)
        applyStyleItem('--inactive-color',props.css.inactiveColor)
        applyStyleItem('--gap-degree',props.css.gapDegree)
        applyStyleItem('--stroke-style',props.css.strokeStyle)
        const activeColor = props.css.activeColor
        // console.log('[ activeColor ] >', typeof activeColor,  activeColor)
        if(activeColor.length==1){
            applyStyleItem('--active-color',activeColor[0])
            strokeColor.value = 'var(--active-color)'
        }else if(activeColor.length>=2){
            startColor.value = activeColor[0]
            endColor.value = activeColor[1]
            strokeColor.value = 'url(#circleGradient)'
        }
    } 
}
watch(progress,(newValue:number)=>{
    applyStyleItem('--percent', newValue+'')
})
onMounted(()=>{
    console.log('[ ArcProgress----props.css ] >', props.css)
    setCustomStyles()
    sysInfoStore.$subscribe((_: any, state:any) => {
        switch (props.category) {
            case 'cpu-arc-usage':
                progress.value = state.cpuUsage
                break
            case 'cpu-arc-clock':
                progress.value = 100
                break
            case 'cpu-arc-temp':
                progress.value = state.cpuTemperature > 100 ? 100 : state.cpuTemperature
                break
            case 'gpu-arc-temp':
                progress.value = state.gpuTemperature > 100? 100 : state.gpuTemperature
                break
            case 'gpu-arc-clock':
                progress.value = Math.round((state.gpuClock * 100) / state.gpuMaxClock)
                break
            case 'gpu-arc-usage':
                progress.value = state.gpuUsage
                break
            case 'gpu-arc-mem-usage':
                progress.value = Math.round((state.gpuMemUsed * 100) / state.gpuMemTotal)
                break
            case 'gpu-arc-mem-clock':
                progress.value = 100
                break
            case 'ram-arc-free':
                progress.value = Math.round((state.ramFree * 100) / state.ramTotal)
                break
            case 'ram-arc-used':
                progress.value = Math.round((state.ramUsed * 100) / state.ramTotal)
                break
            case 'disk-arc-free':
                progress.value = Math.round(((state.diskCTotal - state.diskCUsed) * 100) / state.diskCTotal)
                break
            case 'disk-arc-used':
                progress.value = Math.round((state.diskCUsed * 100) / state.diskCTotal)
                break
            default:
                break
        }
    })
})

</script>
  
<style scoped>
  .progress-circle {
    --percent: 0;
    --size: 400px;
    --border-width: 50px;
    --gap-degree: 180;
    --active-color: yellow;
    --inactive-color: rgba(0,0,0,0.5);
    --stroke-style: round;
    position: relative;
    width: var(--size);
    height: var(--size);
    border-radius: 50%;
  }
  /* SVG container */
  .progress-circle > svg {
    width: 100%;
    height: 100%;
    /* transform: rotate(calc((var(--gap-degree) + (180 - var(--gap-degree)) / 2) * 1deg)); */
  }
  
  /* Progress ring */
  .progress-circle circle {
    --r: calc((var(--size) - var(--border-width)) / 2);
    --active-degree: calc(360 - var(--gap-degree));
    cx: calc(var(--size) / 2);
    cy: calc(var(--size) / 2);
    r: var(--r);
    fill: none;
    stroke-width: var(--border-width);
    stroke-linecap: var(--stroke-style);
  }
  
  .progress-value {
    opacity: var(--percent);
    transition: stroke-dasharray 0.4s linear, stroke 0.3s;
  }
</style>