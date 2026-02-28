<template>
  <div>
    <h1>Debug Page</h1>
    <ul>
      <li v-for="(item, index) in dataList" :key="index">
        <div>
            <div>{{ index }}</div>
            <div>{{ item.system.manufacturer }}({{ getType(item.cpu) }})</div>
            <div>BASE_BOARD: {{ item.baseboard.manufacturer }} ({{item.baseboard.model}})</div>
            <div>OS: {{item.os.distro}}</div>
            <div>CPU: {{item.cpu.manufacturer }} -- {{item.cpu.brand}}</div>
            <div>GPU: {{gpu(item.graphics)}}</div>
            <div>MEM: {{parseInt(item.mem.total/1024/1024/1024)+1}}GB</div>
            <div class="divider-line"></div>
        </div>
      </li>
    </ul>
  </div>
  
</template>

<script setup lang="ts">
import log from '@/utils/logger';
import { onMounted, ref } from 'vue';
const dataList = ref([]);
/**
 * NVIDIA Quadro P4000
NVIDIA GeForce MX150
NVIDIA GeForce RTX 3090
NVIDIA GeForce RTX 3060 Ti
NVIDIA GeForce GTX 1660 Ti
NVIDIA RTX A2000 Laptop GPU
NVIDIA GeForce GTX 1660 SUPER
NVIDIA GeForce RTX 4060 Laptop GPU

Intel(R) Iris(R) Plus Graphics 655
Intel(R) Arc(TM) A770 Graphics
Intel(R) Iris(R) Xe Graphics
Intel(R) UHD Graphics 770
Intel(R) UHD Graphics 620
Intel(R) HD Graphics 4600
Intel(R) Arc(TM) Graphic
Intel(R) UHD Graphics
Intel(R) Graphics


AMD Radeon(TM) 890M Graphics
AMD Radeon(TM) Graphics
AMD Radeon RX 6600 LE
AMD Radeon RX 7900 XT





MikeTheTech
Virtual Display
OrayIddDriver Device
Meta Virtual Monitor
Bigmax Virtual Monitor
Virtual Display Device
Virtual Desktop Monitor
Microsoft Basic Display Adapter
Virtual Display with HDR
LuminonCore IDDCX Adapter
Honor Virtual Display Device
Racer-Tech USB Display Device
Parsec Virtual Display Adapter
Citrix Indirect Display Adapter
RayLink Virtual Display Adapter
Microsoft Basic Display Adapter
Microsoft Remote Display Adapter
GameViewer Virtual Display Adapter
USB Mobile Monitor Virtual Display
Easy&Light Display HUB Virtual Display
 * 
 */
const gpu = (graphics:[])=>{
    const result = graphics.filter(item=> parseInt(item.vram)>0)
    if(result.length>0){
        var str = ''
        result.forEach((item,index) => {
            if(index>0){
                if(item.vram>=1024){
                    str += '--------------'+ item.model+'('+Math.round(item.vram/1024)+'GB)'
                }else{
                    str += '--------------'+ item.model+'('+Math.round(item.vram)+'MB)'
                }
            }else{
                if(item.vram>=1024){
                    str += item.model+'('+Math.round(item.vram/1024)+'GB)'
                }else{
                    str += item.model+'('+Math.round(item.vram)+'MB)'
                }
                
            }
        })
        return str
    }else{
        return "Unknown GPU"
    }
}

const getType = (cpu:any)=>{
    const manufacturer = cpu.manufacturer
    const brand = cpu.brand
    if(manufacturer=='AMD'){
        if(brand.indexOf('0H')>=0 || brand.indexOf('0U')>=0 || brand.indexOf('HS')>=0 || brand.indexOf('HX')>=0){
            return '笔记本'
        }else{
            return '台式机'
        }
    }else if(manufacturer=='Intel'){
        if(brand.indexOf('0H')>=0 || brand.indexOf('0M')>=0  || (brand.indexOf('Ultra')>=0 && brand.endsWith('H'))) {
            return '笔记本'
        }else{
            return '台式机'
        }
    }else {
        return '未知类型'
    }
}

onMounted(() => {
    window.electronApi.getHardwareInfo();
    window.electronApi.callbackHardwareInfo((data:string)=>{
        log(data)
        const hardwareInfo = JSON.parse(data)
        const info = hardwareInfo.data
        info.forEach(item => {
            dataList.value.push(item)
        });
    })
});
</script>

<style lang="css" scoped>
ul{
    scroller-behavior: smooth;
    overflow-y: auto;
    height: 100%;
    margin-left: 10px;
}
p{
    color:white;
}
.divider-line {
    margin: 10px 0;
    border-top: 1px solid #ccc;     
}
</style>