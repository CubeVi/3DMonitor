/// <reference types="vite/client" />
// Additional declarations for env.d.ts
declare module '*.vue' {
    import { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

export interface IElectronAPI {
    // Methods used in preload.ts; when adding new methods there, declare them here too
    openNewWindow: (data:any) => void
    getThemeData: (id: string) => any
    receiveSystemInfoUpdated: (callback: any) => any
    startDownload: (id: string, url: string) => void
    updateDownloadProgress: (cb) => void
    readDownloadedThemes: () => void
    callbackDownloadedThemes: (callback: any) => any
    getThemeId: () => any
    setThemeId: (data: any) => void
    observeGetThemeId: (callback: any) => any
    observeSetThemeId: (callback: any) => any
    // Legacy functions
    getParams: (cb) => void
    getDeviceConfig: () => void
    getUrl: (cb) => void
    miniSize: (value: string) => void
    close: (value: string) => void
    readData: () => any
    saveData: (data: any) => void
    refresh: (cb) => void
    getToken: () => void
    setToken: (cb) => void
    getConfig: () => void
    updateConfig: (data: any) => void
    callbackConfig: (cb) => void
    saveConfig: (data: any, type: string) => void
    refresh: (cb) => void
    getWin: () => any
    updateProgress: (cb) => void
    update: (value: any) => void
    changeLanguage: (value: string) => void
    relogin: () => void
    observeReport: (cb) => void
    openUrl: (url: string) => any
    callbackLog: (cb) => void
    screenOutUpdate: (open: boolean) => void
    getHardwareInfo: () => void
    callbackHardwareInfo: (cb) => void
    setTitle: (title: string) => void
}

declare global {
    interface Window {
        electronApi: IElectronAPI
    }
}
