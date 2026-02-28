const si = require('systeminformation')
const osUtils = require('os-utils') // Application communication module
import detectNvidiaGPU from '@/utils/nvidia'
import readGpuNameByShell from '@/utils/gpu_cmd'
import { app, BrowserWindow } from 'electron'
const wmi = require('node-wmi')
const path = require('path')
import fs from 'node:fs'
import log from './logger'
import { isFileExists, isFileModifiedToday, readFileLastModifiedTime, readFileLength, readFromFile, write2File } from './io'
const userDataPath: string = app.getPath('userData') 

interface CpuInfo {
    brand: string
    utilization: number
    temperature: number
    speed: number
}
interface GpuInfo {
    name: string
    utilizationGpu: number
    utilizationMemory: number
    temperature: number
    clock: number
    clockCore: number
    clockMemory: number
    memoryTotal: number
    memoryUsed: number
}

interface MemInfo {
    used: number
    free: number
    total: number
}
interface DiskInfo {
    used: number
    size: number
}
interface NetworkInfo {
    available: boolean
    upstream: number
    downstream: number
}
interface SystemInfo {
    cpuInfo: CpuInfo
    gpuInfo: GpuInfo
    memInfo: MemInfo
    diskInfo: DiskInfo
    networkInfo: NetworkInfo
}

const cpuInfo: CpuInfo = {
    brand: '',
    utilization: 0,
    temperature: 0,
    speed: 0,
}
const gpuInfo: GpuInfo = {
    name: '',
    utilizationGpu: 0,
    utilizationMemory: 0,
    temperature: 0,
    clock: 0, //max clock
    clockCore: 0, //current clock
    clockMemory: 0,
    memoryTotal: 0,
    memoryUsed: 0,
}
const memInfo: MemInfo = {
    used: 0,
    free: 0,
    total: 0,
}
const diskInfo: DiskInfo = {
    used: 0,
    size: 0,
}

let cacheWritten = false
const networkInfo: NetworkInfo = {
    available: true,
    upstream: 0,
    downstream: 0,
}
const systemInfo: SystemInfo = {
    cpuInfo,
    gpuInfo,
    memInfo,
    diskInfo,
    networkInfo,
}
// Get CPU information
const refreshCpu = (dynamicWindow: BrowserWindow) => {
    osUtils.cpuUsage((usage: any) => {
        systemInfo.cpuInfo.utilization = Math.round(usage * 100)
        // log('CPU usage: ' + (usage * 100).toFixed(2) + '%')
    })
    getCpuTemperature((data: number, error: any) => {
        if (error) {
            log('getCpuTemperature error:::', error)
            return
        }
        systemInfo.cpuInfo.temperature = data
    })
    if (!systemInfo.cpuInfo.brand || systemInfo.cpuInfo.brand.length == 0) {
        log('OBTAINING CPU INFO...')
        si.cpu().then((cpu) => {
            systemInfo.cpuInfo.brand = cpu.brand
            systemInfo.cpuInfo.speed = Math.round(cpu.speed * 1000)
            writeCacheData()
        })
    }
}

const writeCacheData = () => {
    setTimeout(() => {
        if (cacheWritten) {
            return
        }
        const cachedSystemInfoPath = path.join(userDataPath, 'cachedSystemInfo.txt')
        fs.writeFile(cachedSystemInfoPath, JSON.stringify(systemInfo), (error) => {
            log('writeCacheData-----error:', error)
            if (!error) {
                cacheWritten = true
            }
        })
    }, 5000)
}
const getCpuTemperature = (callback) => {
    wmi.Query(
        {
            class: 'Win32_PerfFormattedData_Counters_ThermalZoneInformation',
            properties: ['Temperature'],
        },
        (err: any, data: any) => {
            if (err) {
                log('get cpu temperature error: ', err)
                callback(-1, err)
                return
            }

            if (data && data.length > 0) {
                const temperatureInKelvin = data[0].Temperature
                const temperatureInCelsius = temperatureInKelvin - 273.15
                callback(Math.round(temperatureInCelsius), err)
            } else {
                log('can not get cpu temperature')
                callback(-1, 'can not get cpu temperature')
            }
        },
    )
}

let gpuModel = null
// Get GPU information
const refreshGpu = () => {
    si.graphics().then((controllers: any[]) => {
        /**
         * [
                {
                    vendor: 'Intel Corporation',
                    model: 'Intel(R) UHD Graphics',
                    bus: 'PCI',
                    vram: 128,
                    vramDynamic: true,
                    subDeviceId: '8CC0103C'
                },{
                    vendor: 'NVIDIA',
                    model: 'NVIDIA GeForce RTX 4060 Laptop GPU',
                    bus: 'PCI',
                    vram: 8188,
                    vramDynamic: false,
                    subDeviceId: '0x8CC0103C',
                    driverVersion: '546.92',
                    name: 'NVIDIA GeForce RTX 4060 Laptop GPU',
                    pciBus: '00000000:01:00.0',
                    memoryTotal: 8188,
                    memoryUsed: 779,
                    memoryFree: 7192,
                    utilizationGpu: 12,
                    utilizationMemory: 2,
                    temperatureGpu: 46,
                    powerDraw: 19.94,
                    clockCore: 2250,
                    clockMemory: 8000
                }
            ]
         */
        log('controllers:', JSON.stringify(controllers.controllers))
        if(!controllers || !controllers.controllers){
            return
        }
        let displays:any[] = controllers.controllers
        if (displays.length === 0) {
            return
        }
        // Filter graphics cards with video memory
        displays = displays.filter((e) => {
            return e.vram > 0
        })
        if (displays.length === 0) {
            return
        }
        displays.sort((a, b) => b.vram-a.vram)
        let graphicCard = displays[0]
        systemInfo.gpuInfo.name = graphicCard.model
        gpuModel = graphicCard.model
        systemInfo.gpuInfo.utilizationGpu = graphicCard.utilizationGpu
        systemInfo.gpuInfo.utilizationMemory = graphicCard.utilizationMemory
        systemInfo.gpuInfo.temperature = graphicCard.temperatureGpu
        systemInfo.gpuInfo.clock = graphicCard.clock
        systemInfo.gpuInfo.clockCore = graphicCard.clockCore
        systemInfo.gpuInfo.clockMemory = graphicCard.clockMemory
        systemInfo.gpuInfo.memoryTotal = graphicCard.memoryTotal
        systemInfo.gpuInfo.memoryUsed = graphicCard.memoryUsed
    })
}
// Get memory information
const refreshMem = () => {
    const mem = process.getSystemMemoryInfo()
    systemInfo.memInfo.used = mem.total - mem.free
    systemInfo.memInfo.free = mem.free
    systemInfo.memInfo.total = mem.total

}
// Get disk (C drive) information
const refreshDiskC = async () => {
    si.fsSize().then((fsSize: { used: number; size: number }[]) => {
        systemInfo.diskInfo.used = fsSize[0].used
        systemInfo.diskInfo.size = fsSize[0].size
    })
}

// Get network information
const refreshNetwork = async () => {
    si.networkStats().then((networkStats: any) => {
        const network = networkStats[0]
        // log('network:',network);
        systemInfo.networkInfo.available = true
        systemInfo.networkInfo.upstream = Math.round(network.tx_sec / 1024)
        systemInfo.networkInfo.downstream = Math.round(network.rx_sec / 1024)
    })
}
// Read previously saved SystemInfo from cache file into systemInfo
const readCacheData = () => {
    const cachedSystemInfoPath = path.join(userDataPath,'cachedSystemInfo.txt', )
    fs.readFile(cachedSystemInfoPath, 'utf8', (error, data) => {
        // log('-------readCacheData....error:', error, 'data:', data)
        if (!error) {
            const { cpuInfo, gpuInfo, memInfo, diskInfo, networkInfo } = JSON.parse(data)
            // log('[ cpuInfo ] >', cpuInfo)
            systemInfo.cpuInfo = cpuInfo
            systemInfo.gpuInfo = gpuInfo
            systemInfo.memInfo = memInfo
            systemInfo.diskInfo = diskInfo
            systemInfo.networkInfo = networkInfo
        }
    })
}
let cacheInitialized = false
function readGpuByNvidia() {
    detectNvidiaGPU((data, error) => {
    /**
     *  {
            productName: 'NVIDIA GeForce RTX 2070 SUPER',
            memoryUsage: {
                total: '8192 MiB',
                reserved: '189 MiB',
                used: '1672 MiB',
                free: '6330 MiB'
            },
            utilization: {
                gpu_util: '3 %',
                memory_util: '1 %',
            },
            temperature: {
                gpu_temp: '58 C',
                gpu_temp_max_threshold: '95 C',
                gpu_temp_slow_threshold: '92 C',
                gpu_temp_max_gpu_threshold: '88 C',
                gpu_target_temperature: '83 C',
            },
            clocks: {
                graphics_clock: '1200 MHz', // Clock frequency of the graphics processing core (GPU core).
                sm_clock: '1200 MHz', // Clock frequency of the Streaming Multiprocessors.
                mem_clock: '7000 MHz', // Clock frequency of the video memory (VRAM).
                video_clock: '1110 MHz' // Clock frequency of the video engine.
            },
            max_clocks: {
                graphics_clock: '2625 MHz', // Maximum clock frequency of the GPU graphics processing core.
                sm_clock: '2625 MHz', // Maximum clock frequency of the Streaming Multiprocessors.
                mem_clock: '7001 MHz', // Maximum clock frequency of the video memory.
                video_clock: '1950 MHz' // Maximum clock frequency of the video engine
            }
        }
        */
        // On error, fall back to systeminformation
        if (error) {
            log('error:', error)
            refreshGpu()
        } else {
            // log('[ readGpuByNvidia ] >', JSON.stringify(data))
            try {
                const {utilization,temperature, clocks,memoryUsage,max_clocks, productName} = data
                const {gpu_util,memory_util} = utilization
                const {gpu_temp} = temperature
                const {total,used} = memoryUsage
                if(gpu_util){
                    const arr = gpu_util.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.utilizationGpu = parseInt(arr[0])
                    }
                }
                if(memory_util){
                    const arr = memory_util.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.utilizationMemory = parseInt(arr[0])
                    }
                }
                if(gpu_temp){
                    const arr = gpu_temp.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.temperature = parseInt(arr[0])
                    }
                }
                if(max_clocks.graphics_clock){
                    const arr = max_clocks.graphics_clock.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.clock = parseInt(arr[0])
                    }
                }
                if(clocks.graphics_clock){
                    const arr = clocks.graphics_clock.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.clockCore = parseInt(arr[0])
                    }
                }
                if(clocks.mem_clock){
                    const arr = clocks.mem_clock.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.clockMemory = parseInt(arr[0])
                    }
                }
                if(total){
                    const arr = total.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.memoryTotal = parseInt(arr[0])
                    }
                }
                if(used){
                    const arr = used.split(' ')
                    if(arr.length > 0){
                        systemInfo.gpuInfo.memoryUsed = parseInt(arr[0])
                    }
                }
                systemInfo.gpuInfo.name = productName
            } catch (error) {
                log('[ @@@@@@@@@@@@@detectNvidiaGPU.error ] >', error.message)
                refreshGpu()
            }
        }
    })
}
let timeTotal = 0
// Read system information
export default function readSystemInfo(dynamicWindow: BrowserWindow|null, readCache = false) {
    log('[readSystemInfo]>','readCache=', readCache, 'cacheInitialized=', cacheInitialized, 'gpuModel=', gpuModel)
    /**
     * Commenting this out for now because if a computer has both integrated and discrete GPU, the data needs separate parsing
     * if (!gpuModel) {
        readGpuNameByShell((data, error) => {
            if (!error) {
                gpuModel = data
            }
        })
        setTimeout(() => {
            readSystemInfo(dynamicWindow, readCache)
        }, 500)
        return
    } */
    if (readCache && !cacheInitialized) {
        readCacheData()
        cacheInitialized = true
    }
    dynamicWindow?.webContents.send('systemInfo', systemInfo)
    refreshCpu(dynamicWindow)
    refreshMem()
    // Network speed is read once every 30 seconds
    if (timeTotal === 0 || timeTotal % 10 === 0) {
        refreshNetwork()
    }
    // C drive is read once every 5 minutes
    if (timeTotal === 0 || timeTotal % 100 === 0) {
        refreshDiskC()
    }
    // Get GPU information
    if (!gpuModel) {
        refreshGpu()
    } else {
        const gpuUpper = gpuModel.toUpperCase()
        if (
            gpuUpper.indexOf('NVIDIA') > -1 ||
            gpuUpper.indexOf('GTX') > -1 ||
            gpuUpper.indexOf('RTX') > -1 ||
            gpuUpper.indexOf('GEFORCE') > -1) {
            readGpuByNvidia()
        } else if (gpuUpper.indexOf('AMD') > -1 || gpuUpper.indexOf('RADEON') > -1) {
            if(gpuUpper.indexOf('RX')>-1){// Discrete GPU
                refreshGpu()
            }else{
                log('AMD集成显卡:', gpuModel)
            }
        } else {
            log('Intel集成显卡:',gpuModel)
            // Treat all Intel GPUs as integrated
            if (!gpuModel) {
                refreshGpu()
            }
        }
    }
    timeTotal++
}

async function getSystemInfo(cachePath:string, callback: (data: any) => void) {
    const sys = await si.system()
    const bios = await si.bios()
    const baseboard = await si.baseboard()
    const chassis = await si.chassis()  
    const os = await si.osInfo()
    const cpu = await si.cpu()
    const graphics = await si.graphics()
    const mem = await si.mem()
    const diskLayout = await si.diskLayout()
    const data = {
        system: sys,
        bios: bios,
        baseboard: baseboard,
        chassis: chassis,
        os: os,
        cpu: cpu,
        graphics: graphics.controllers,
        displays: graphics.displays,
        mem: mem,
        diskLayout: diskLayout,
        time: new Date().getTime()
    }
    // log('---------------->data:',data)
    write2File(cachePath, JSON.stringify(data))
    callback(data)
}

export async function checkSystemInfo(callback: (data: any) => void) {
   const cachePath = path.join(userDataPath,'system_info.txt')
   log('checkSystemInfo cachePath:', cachePath) 
   try {
        if(!isFileExists(cachePath) ){// File does not exist
            getSystemInfo(cachePath, callback)
        }else{// File exists
            if(readFileLength(cachePath)<1024){// File is smaller than 1KB
                getSystemInfo(cachePath, callback)
            }else{
                const lastTime = new Date(readFileLastModifiedTime(cachePath)).getTime()
                const now = new Date().getTime()
                if(now-lastTime>24*60*60*1000){// File older than 1 day
                    getSystemInfo(cachePath,callback)
                }
            }
        }
   }catch (error) {
       log('checkSystemInfo error:', error)
   }
}
