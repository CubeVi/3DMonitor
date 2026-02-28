<template>
    <div ref="refProgress" class="circle-progress">
      <div 
        v-for="index in tickCount" 
        :key="index" 
        class="tick"
        :style="getTickStyle(index)"
      ></div>
    </div>
  </template>
  
<script setup lang="ts">
import { computed, defineProps, onMounted, ref, toRaw } from 'vue';
import useSystemInfoStore from '@/store/sysinfo'
import { calcColor } from '@/utils/colorExt';
const sysInfoStore = useSystemInfoStore()
const refProgress = ref()
const progress = ref(0)
const tickCount = ref(30)
const props = defineProps({
  css:{
      type:Object,
      required:true,
  },
  category: {
      type: String,
      required: true,
  },
});

const activeTicks = computed(() => {
  return Math.round((progress.value / 100) * tickCount.value);
});

const getTickStyle = (index:number) => {
  const angle = (index - 1) * (360 / tickCount.value);
  if(index<activeTicks.value){
    const activeColor = props.css.activeColor
    if(activeColor.length>=2){
      const progress = angle/360;
      const color = calcColor(activeColor[0], activeColor[1], progress*100);
      return {
        transform: `rotate(${angle}deg)`,
        backgroundColor: color,
      };
    }else{
      return {
        transform: `rotate(${angle}deg)`,
        backgroundColor: activeColor[0],
      };
    }
  }else{
    return {
      transform: `rotate(${angle}deg)`,
      backgroundColor: props.css.inactiveColor,
    };
  }
  

};
const applyStyleItem = (property:string, value:string) => {
  if(property && value){
    refProgress.value.style.setProperty(property, value)
  }
}
const setCustomStyles = () => {
  if(props.css){
    applyStyleItem('--size',props.css.size)
    applyStyleItem('--inactive-color',props.css.inactiveColor)
    applyStyleItem('--tick-radius',props.css.tickRadius)
    applyStyleItem('--tick-width',props.css.tickWidth)
    applyStyleItem('--tick-height',props.css.tickHeight)
  } 
}
onMounted(()=>{
    console.log('[ css ] >', toRaw(props.css))
    if(props.css){
        tickCount.value = props.css.tickCount?props.css.tickCount:30
    }
    setCustomStyles()
    sysInfoStore.$subscribe((_, state) => {
        switch (props.category) {
            case 'cpu-clock-tick-usage':
                progress.value = state.cpuUsage
                break
            case 'cpu-clock-tick-clock':
                progress.value = 100
                break
            case 'cpu-clock-tick-temp':
                progress.value = state.cpuTemperature > 100 ? 100 : state.cpuTemperature
                break
            case 'gpu-clock-tick-temp':
                progress.value = state.gpuTemperature > 100? 100 : state.gpuTemperature
                break
            case 'gpu-clock-tick-clock':
                progress.value = Math.round((state.gpuClock * 100) / state.gpuMaxClock)
                break
            case 'gpu-clock-tick-usage':
                progress.value = state.gpuUsage
                break
            case 'gpu-clock-tick-mem-usage':
                progress.value = Math.round((state.gpuMemUsed * 100) / state.gpuMemTotal)
                break
            case 'gpu-clock-tick-mem-clock':
                progress.value = 100
                break
            case 'ram-clock-tick-free':
                progress.value = Math.round((state.ramFree * 100) / state.ramTotal)
                break
            case 'ram-clock-tick-used':
                progress.value = Math.round((state.ramUsed * 100) / state.ramTotal)
                break
            case 'disk-clock-tick-free':
                progress.value = Math.round(((state.diskCTotal - state.diskCUsed) * 100) / state.diskCTotal)
                break
            case 'disk-clock-tick-used':
                progress.value = Math.round((state.diskCUsed * 100) / state.diskCTotal)
                break
            default:
                break
        }
    })
})
</script>
  
  <style lang="scss" scoped>
  .circle-progress {
      --size:200px;
      --tick-width: 6px;
      --tick-height: 20px;
      --tick-radius: 3px;
      --inactive-color: black;
    position: relative;
    width: var(--size);
    height: var(--size);
    background-color: rgba($color: #000000, $alpha: 0.5);
    border-radius: 50%;
    .tick {
      position: absolute;
      width: var(--tick-width);
      height: var(--tick-height);
      background-color: var(--inactive-color);
      left: 50%;
      top: 0;
      transform-origin: 50% calc(var(--size)/2);
      margin-left: calc(var(--tick-width) / -2);
      border-radius: var(--tick-radius);
    }
  }
  </style>