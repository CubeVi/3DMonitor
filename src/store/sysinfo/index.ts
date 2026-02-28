import { defineStore } from 'pinia'
const useSystemInfoStore = defineStore('systemInfoStore', {
    state() {
        return {
            cpuModel: '',
            cpuUsage: 0,
            cpuTemperature: 0,
            cpuClock: 0,

            gpuModel: '',
            gpuUsage: 0,
            gpuTemperature: 0,
            gpuClock: 0,
            gpuMaxClock: 0,
            gpuMemUsage: 0,
            gpuMemTotal: 0,
            gpuMemUsed: 0,
            gpuMemFree: 0,
            gpuMemClock: 0,

            ramUsed: 0,
            ramFree: 0,
            ramTotal: 0,

            diskCUsed: 0,
            diskCTotal: 0,

            connected: true, // Whether network is connected
            upstream: 0,
            downstream: 0,
        }
    },
})
export default useSystemInfoStore