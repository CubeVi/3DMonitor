<template>
  <div ref="refProgress" class="horizontal-progress">
    <div v-for="index in totalTicks" 
        :key="index" 
        class="tick"
        :class="{ active: index <= activeTicks }"
        :style="getTickStyle(index)"></div>
  </div>
</template>

<script setup lang="ts">
import { calcColor } from '@/utils/colorExt';
import { computed, ref, onMounted, defineProps} from 'vue';
import useSystemInfoStore from '@/store/sysinfo'
const sysInfoStore = useSystemInfoStore()

const refProgress = ref()
const dividerWidth = ref(0)
const totalTicks = ref(0)
const skewX = ref(0)
const tickItemWidth = ref(0)
const maxWidth = ref(0)
const oppositeSide = ref(0)
const progress = ref(0)
const props = defineProps({
    category: {
      type: String,
      required: true,
    },
    css:{
        type: Object,
        required:true
    }
});

const activeTicks = computed(() => Math.round((progress.value / 100) * totalTicks.value))
const getTickStyle = (index:number) => {
    const v = (index-1)*(tickItemWidth.value+dividerWidth.value)
    const position = (v + oppositeSide.value/2)*100/maxWidth.value;
    // Calculate color gradient for active ticks
    let color = ''
    if (index <= activeTicks.value) {
        const activeColor = props.css.activeColor
        const progress = (index - 1) / (activeTicks.value - 1);
        if(activeColor.length>=2){
          color = calcColor(activeColor[0], activeColor[1], progress*100);
        }else if(activeColor.length==1){
          color = activeColor[0]
        }
    }
    const style =  {
        left: `${position}%`,
        backgroundColor: color,
        width:tickItemWidth.value+'px'
    };
    console.log('[ style ] >', index, style)
    return style;
};
const applyStyleItem = (property:string, value:string) => {
    console.log('[ property ] >', property, value)
    if(property && value){
        refProgress.value.style.setProperty(property, value)
    }
}
const setCustomStyles = () => {
    if(props.css){
        applyStyleItem('--skew-x',props.css.skewX)
        applyStyleItem('--tick-radius',props.css.tickRadius)
        applyStyleItem('--inactive-color',props.css.inactiveColor)
    } 
}
onMounted(()=>{
    if(props.css){
        console.log('[ props.css ] >',props.css.tickCount, props.css.skewX,props.css.dividerWidth, props.css)
        const tickCount = props.css.tickCount?parseInt(props.css.tickCount):10
        totalTicks.value = tickCount
        if(props.css.dividerWidth && props.css.dividerWidth.split('p')[0]){
            dividerWidth.value = parseInt(props.css.dividerWidth.split('p')[0])
        }else{
            dividerWidth.value = 10
            console.log('[ dividerWidth ] >', props.css.dividerWidth)
        }
        if(props.css.skewX && props.css.skewX.split('d')[0]){
            skewX.value = parseInt(props.css.skewX.split('d')[0])
        }else{
            skewX.value = 0
            console.log('[ skewX ] >', props.css.skewX)
        }
        maxWidth.value = refProgress.value.offsetWidth
        const maxHeight = refProgress.value.offsetHeight
        // Calculate the opposite side length
        oppositeSide.value = Math.abs(Math.tan(skewX.value * (Math.PI / 180)) * maxHeight);
        const availableWidth = maxWidth.value-oppositeSide.value
        tickItemWidth.value = (availableWidth-(tickCount-1)*dividerWidth.value)/tickCount
        console.log('[ refProgress ] >', 'maxWidth:',maxWidth.value,'maxHeight:',maxHeight,'dividerWidth:',dividerWidth.value,'skewX:',skewX.value,'tickItemWidth:', tickItemWidth.value,'oppositeSide:',oppositeSide.value) 
        setCustomStyles()
    }
    sysInfoStore.$subscribe((_: any, state:any) => {
        switch (props.category) {
            case 'cpu-line-tick-usage':
                progress.value = state.cpuUsage
                break
            case 'cpu-line-tick-clock':
                progress.value = 100
                break
            case 'cpu-line-tick-temp':
                progress.value = state.cpuTemperature > 100 ? 100 : state.cpuTemperature
                break
            case 'gpu-line-tick-temp':
                progress.value = state.gpuTemperature > 100? 100 : state.gpuTemperature
                break
            case 'gpu-line-tick-clock':
                progress.value = Math.round((state.gpuClock * 100) / state.gpuMaxClock)
                break
            case 'gpu-line-tick-usage':
                progress.value = state.gpuUsage
                break
            case 'gpu-line-tick-mem-usage':
                progress.value = Math.round((state.gpuMemUsed * 100) / state.gpuMemTotal)
                break
            case 'gpu-line-tick-mem-clock':
                progress.value = 100
                break
            case 'ram-line-tick-free':
                progress.value = Math.round((state.ramFree * 100) / state.ramTotal)
                break
            case 'ram-line-tick-used':
                progress.value = Math.round((state.ramUsed * 100) / state.ramTotal)
                break
            case 'disk-line-tick-free':
                progress.value = Math.round(((state.diskCTotal - state.diskCUsed) * 100) / state.diskCTotal)
                break
            case 'disk-line-tick-used':
                progress.value = Math.round((state.diskCUsed * 100) / state.diskCTotal)
                break
            default:
                break
        }
    })
})
</script>

<style lang="scss" scoped>
.horizontal-progress {
  --skew-x:30deg;
  --tick-radius:0px;
  --active-color:yellow;
  --inactive-color:gray;
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  transform: skewX(var(--skew-x));
  background-color: transparent;
  .tick {
      position: absolute;
      height: 100%;
      border-radius: var(--tick-radius);
      background-color: var(--inactive-color);
      transition: background-color 0.3s ease;
      &.active {
          background-color: var(--active-color); // Remove the original fixed color
      }
  }
}
</style>