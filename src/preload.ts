import log from '@/utils/logger'
import { contextBridge, ipcRenderer } from 'electron'
// Custom APIs for renderer
const electronApi = {
    openNewWindow: ( data: any) => {
        ipcRenderer.send('open-device-window',data)
    },

    getThemeData: (id: string) => {
        return ipcRenderer.invoke('get-theme-data', id)
    },
    receiveSystemInfoUpdated: (callback: (data: any) => void) =>
        ipcRenderer.on('systemInfo', (_event, value) => {
            callback(value)
        }),
    startDownload: (id: string, type: string, hash: string) => {
        return ipcRenderer.invoke('start-download', id, type, hash)
    },
    updateDownloadProgress: (callback: (data: any) => void) =>
        ipcRenderer.on('update-download-progress', (_event, value) => {
            callback(value)
        }),
    readDownloadedThemes: () => {
        ipcRenderer.send('read-downloaded-themes')
    },
    callbackDownloadedThemes: (callback: (data: any) => void) =>{
        ipcRenderer.on('callback-downloaded-themes', (_event, value) => {
            log('preload.callback-downloaded-themes', value);
            callback(value)
        })
    },
    getThemeId: () => {
        log('preload.getThemeId');
        ipcRenderer.send('get-theme-id')
    },
    observeGetThemeId: (callback: any) => {
        log('preload.observeGetThemeId');
        ipcRenderer.on('get-theme-id2', (_event) => {
            callback()
        })
    },
    observeSetThemeId: (callback: any) => {
        log('preload.observeSetThemeId');
        ipcRenderer.on('set-theme-id2', (_event, value: any) => {
            log('preload.set-theme-id2', value);
            callback(value)
        })
    },
    setThemeId: (data: any) => {
        log('preload.setThemeId', data);
        ipcRenderer.send('set-theme-id', data)
    },
    observeReport: (callback: any) => {
        log('preload.observeReport');
        ipcRenderer.on('callback-report-info', (_event, value) => {
            log('preload.callback-report-info', value);
            callback(value)
        })
    },
    screenOutUpdate: (open: boolean) => {
        ipcRenderer.send('screen-out-update', open)
    },
    getParams: (callback: any) => {
        log('preload.getParams');
        ipcRenderer.on('get-device-params-back', (_event, value) => {
            log('preload.get-device-params-back', value);
            callback(value)
        })
    },

    // Get device parameters
    getDeviceConfig: () => {
        ipcRenderer.send('get-deviceConfig')
    },
    // Get token
    getToken: () => {
        ipcRenderer.send('get-token')
    },
    // Set token callback
    setToken: (callback: any) =>
        ipcRenderer.on('set-token', (_event, value: any) => callback(value)),

    refresh: (callback: any) => ipcRenderer.on('refresh', () => callback()),
    // Minimize
    miniSize: (value: string) => {
        ipcRenderer.send('mini-size', value)
    },
    // Close
    close: (value: string) => {
        ipcRenderer.send('close', value)
    },
    openUrl: (url: string) => {
        return ipcRenderer.send('open-url', url)
    },
    // Read cached data
    readData: () => {
        return ipcRenderer.invoke('read-data')
    },
    // Save data
    saveData: (value: any) => {
        return ipcRenderer.send('save-data', value)
    },
    // Get initial configuration
    getConfig: () => {
        ipcRenderer.send('get-config')
    },
    updateConfig: (data: any) => {
        ipcRenderer.send('update-config', data)
    },
    // Callback the cached config content to the page
    callbackConfig: (callback: any) => {
        ipcRenderer.on('callback-config', (_event, value) => callback(value))
    },

    // Save config data
    saveConfig: (value: any, type: string) => {
        return ipcRenderer.send('save-config', value, type)
    },
    // Get initial configuration
    getWin: () => {
        return ipcRenderer.invoke('get-win')
    },
    updateProgress: (callback: (data: any) => void) =>
        ipcRenderer.on('update-downloadProgress', (_event, value) => {
            callback(value)
        }),
    update: (data: any) => {
        ipcRenderer.send('update', data)
    },
    setTitle:(title:string)=>{
        ipcRenderer.send('set-title', title)
    },
    changeLanguage: (data: any) => {
        ipcRenderer.send('language-changed', data)
    },
    // Logout / re-login
    relogin: () => {
        ipcRenderer.send('relogin')
    },

    callbackLog: (callback: (data: any) => void) =>
        ipcRenderer.on('log-out', (_event, value) => {
            callback(value)
        }),

    getHardwareInfo: () => {
        ipcRenderer.send('get-hardware-info')
    },
    callbackHardwareInfo: (callback: (data: any) => void) =>
        ipcRenderer.on('callback-hardware-info', (_event, value) => {
            callback(value)
        }),
}
// Use `contextBridge` APIs to expose Electron APIs to renderer only if context isolation is enabled, otherwises just add to the DOM global.
try {
    contextBridge.exposeInMainWorld('electronApi', electronApi)
} catch (error) {
    console.error(error)
}
