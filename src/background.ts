// Electron main process entry point
import { app, BrowserWindow, ipcMain, shell, dialog, screen, globalShortcut, Tray, Menu, Size } from 'electron'
import fs from 'node:fs'
import { BUILD_LANG, LOG_OUTPUT, ver } from './api/config'
import {APP_ID, APP_KEY, APP_SECRET, APP_NAME, LANG_EN} from './utils/constants'
import {isOverseeBuild,getAppName} from './api/config/index'
import axios from 'axios'
const path = require('path')
import net from 'node:net'
import Registry from 'winreg'
import readSystemInfo, { checkSystemInfo } from '@/utils/hardware'
import { downloadFile, readDownloadedThemes } from '@/utils/downloader'
import log from '@/utils/logger'
import { readJsonFile } from '@/utils/io'
import { spawn } from 'node:child_process'
import { initConfig, updateConfig, getConfig } from '@/utils/configExt.ts'

let taskId: any = null
let tray: Tray | null = null;
let screenOut = true
// Reference screen width from design spec (unit: px)
const UI_DESIGN_WIDTH = 1152
// Current screen width (unit: px), not the physical resolution but the scaled resolution
let currWindowWidth = 0
interface MainWindow extends BrowserWindow {
    windowIndex: number
}

// Suppress security warnings
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
// Communication pipe name
const pipeName = isOverseeBuild()?'Cubestage_server_pipe':'OpenstageAI_server_pipe'
// Communication pipe path
const pipePath = process.platform === 'win32' ? path.join('\\\\?\\pipe', pipeName) : `/tmp/${pipeName}`
log('background.pipePath:', pipePath);
let reloginFlag = false
initConfig()


const userDataPath: string = app.getPath('userData') 
const appDataPath: string = app.getPath('appData')

const themeInfo: any = {id:'',outScreen:false,index:-1}

let labelList:any[] = []

let installPath: string = ''
// Get the installation path of the current application
let exePath: string = ''
// Screen parameters
let deviceConfig = { deviceId: '' }
//process.argv[2]=http://localhost:5173
log('userData:', userDataPath, ',--->process.execPath', process.execPath)
if (process.argv[2]) {
    installPath = userDataPath
} else {
    if (process.platform === 'win32') {
        // On Windows: D:\VueProjects\Performance\node_modules\electron\dist\electron.exe
        exePath = process.execPath
    } else if (process.platform === 'darwin') {
        // On macOS
        exePath = path.dirname(process.execPath)
    } else if (process.platform === 'linux') {
        // On Linux
        exePath = path.dirname(process.execPath)
    }
    //
    installPath = exePath.split(`${getAppName()}.exe`)[0]
}
// Resource download directory
let downloadDir = installPath
if (downloadDir.includes('C:\\Program Files')) {
    downloadDir = userDataPath
}
log('downloadPath:', downloadDir, 'installPath:', installPath)
let loginedUser = {}
// JSON file path for storing the installation path
const installFilePath = path.join(userDataPath, 'install.json')
log('installFilePath:', installFilePath)
// Write installation path to JSON file
fs.writeFileSync(installFilePath, JSON.stringify({ appAPath: installPath }), 'utf8')

// Create main window
let mainWindow: MainWindow | null
function createMainWindow(): void {
    const scaleFactor = screen.getPrimaryDisplay().scaleFactor
    log('[ createMainWindow.scaleFactor ] >', scaleFactor)
    const all = screen.getAllDisplays()
    log('[ screens.length ] >', all.length)
    let size: Size = {} as Size
    if (all.length >= 1) {
        const displays = all.filter((item) => !labelList.includes(item.label))
        if (displays.length > 0) {
            size = displays[0].size
        } else {
            size = all[0].size
        }
    }
    if (!size) {
        return  
    }
    log('[ size ] >', size.width, size.height)
    const screenHeight = parseInt(size.height.toString())
    let finalScreenWidth = 1010
    let finalScreenHeight = 960
    if (screenHeight <= finalScreenHeight) {
        finalScreenHeight = parseInt((screenHeight * 0.8).toString())
        finalScreenWidth = parseInt((finalScreenHeight * 1010 / 960).toString())
    }
    log('screenWidth:', size.width, 'screenHeight:', screenHeight, 'finalScreenWidth:', finalScreenWidth, 'finalScreenHeight:', finalScreenHeight, 'scaleFactor:', scaleFactor);
    logViaWindow('[ createMainWindow ] >', JSON.stringify({screenWidth: size.width,screenHeight: screenHeight, finalScreenWidth: finalScreenWidth, finalScreenHeight: finalScreenHeight, scaleFactor: scaleFactor}))
    mainWindow = new BrowserWindow({
        width: finalScreenWidth,
        height: finalScreenHeight,
        frame: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            webSecurity: false,
            nodeIntegration: true,
            contextIsolation: true,
            backgroundThrottling: false,
            devTools:LOG_OUTPUT,
        },
    }) as MainWindow
    mainWindow.windowIndex = 1
    // Set whether the window can be maximized by the user.
    mainWindow.setMaximizable(false)
    // Set whether the user can resize the window
    mainWindow.setResizable(false)
    // Browser
    ipcMain.on('open-url', (_event: any, url: string) => {
        // Open the system default browser to the specified URL
        shell.openExternal(url)
    })

    // Read file
    ipcMain.handle('read-data', async () => {
        const result = await readFromJsonFile(userDataPath + '/test.json')
        return result
    })
    // Save data
    ipcMain.on('save-data', async (_event, value: any) => {
        if (process.argv[2]) {
            return
        }
        saveToJsonFile(value, userDataPath + '/test.json')
    })
    // Minimize
    ipcMain.on('mini-size', async (_event, value: string) => {
        if (value !== 'add' && value !== 'danceAdd') {
            mainWindow!.minimize()
        }
    })
    // Exit / hide window
    ipcMain.on('close', async (_event, value: string) => {
        if (!mainWindow?.isDestroyed()) {
            _event.preventDefault()
            mainWindow?.hide()
        }
    })

    ipcMain.on('update', function (_event, data:any) {
        const { value, url } = data
        if (value) {
            const downloadPath = path.join(path.dirname(app.getPath('temp')),APP_NAME.toLocaleLowerCase() + '-updater','pending')
            const outPath = path.join(downloadPath, APP_NAME + '.exe')
            if (!fs.existsSync(downloadPath)) {
                try {
                    fs.mkdirSync(downloadPath, { recursive: true }) // Create all missing directories (including intermediate ones)
                } catch (error) {}
            }
            const writer = fs.createWriteStream(outPath)
            let receivedBytes = 0
            return axios({ method: 'get', url: url, responseType: 'stream' }).then(
                (response: any) => {
                    const totalBytes = response.headers['content-length']
                    response.data.on('data', (chunk: any) => {
                        receivedBytes += chunk.length
                        const progress = Math.floor((receivedBytes / totalBytes) * 100)
                        // Send progress to the renderer process
                        mainWindow?.webContents.send('update-downloadProgress', progress)
                    })
                    response.data.pipe(writer)
                    return new Promise((resolve, reject) => {
                        writer.on('finish', async () => {
                            const params: {
                                stdio: 'pipe'
                                env: any
                                detached: boolean
                                shell: boolean
                                cwd?: string
                            } = {
                                stdio: 'pipe', // Capture stdout and stderr
                                env: undefined,
                                detached: true,
                                shell: true,
                            }
                            const args: string[] = ['--updated']
                            spawn(outPath, args, params)
                            app.quit()
                            resolve(outPath)
                        })
                        writer.on('error', reject)
                    })
                }
            )
        }
    })
    mainWindow.on('ready-to-show', async () => {
        mainWindow?.show()
        // After the main window starts, fetch hardware info once
        mainWindow?.webContents.send('set-token', loginedUser)
        readSystemInfo(dynamicWindow, true)
    })
    mainWindow.on('closed', () => {
        mainWindow = null
        app.quit()
    })
    if (process.argv[2]) {
        mainWindow.loadURL(process.argv[2])
    } else {
        mainWindow.loadFile('index.html')
    }
    // Event listeners related to the secondary screen
    ipcMain.on('open-device-window', (_event, value: any) => {
        log('open-new-window', 'value:', value)
        const {id,outScreen,index} = value
        themeInfo.id = id
        themeInfo.outScreen = outScreen
        themeInfo.index = index
        if (dynamicWindow !== null && dynamicWindow !== undefined) {
            dynamicWindow?.webContents.send('set-theme-id2', value)
            return
        }
        checkDisplay()
    })
    ipcMain.handle('get-theme-data', async (_event, id: string) => {
        log('get-theme-data----id', id);
        return readThemeData(id)
    })
    ipcMain.handle('start-download', async (_event, id: string, url: string) => {
        log('start-download.id=', id, 'url:', url)
        downloadFile(userDataPath, id, url,(error: any, progress: Number) => {
            mainWindow?.webContents.send('update-download-progress', {id,progress,error})
        })
    })
    ipcMain.on('set-title', (event, title) => {
        mainWindow?.setTitle(title);
        dynamicWindow?.setTitle(title)
    });
    ipcMain.on('read-downloaded-themes', (_event) => {
        log('read-downloaded-themes')
        const scaleFactor = screen.getPrimaryDisplay().scaleFactor
        const all = screen.getAllDisplays()
        let size
        if (all.length >= 1) {
            const displays = all.filter((item) => !labelList.includes(item.label))
            if (displays.length > 0) {
                size = displays[0].size
            } else {
                size = all[0].size
            }
        }
        logViaWindow('SCREEN', JSON.stringify({scaleFactor:scaleFactor,screenWidth:size?.width,screenHeight:size.height}))
        readDownloadedThemes(userDataPath, (_error: any, ids: any) => {
            // log('callback-downloaded-themes---->ids:', ids, '_error:', _error)
            if (_error !== null) return
            mainWindow?.webContents.send('callback-downloaded-themes', ids)
        })
    })
    ipcMain.on('get-theme-id', (_event) => {
        log('background.get-theme-id');
        mainWindow?.webContents.send('get-theme-id2')
    })
    ipcMain.on('set-theme-id', (_event, id: string) => {
        log('background.set-theme-id', id);
        dynamicWindow?.webContents.send('set-theme-id2', id)
    })
    ipcMain.on('screen-out-update', (_event, open: boolean) => {
        screenOut = open
        log('[ screen-out-update.screenOut ] >', screenOut)
    })
    screen.on('display-metrics-changed',(_event, display, changedMetrics)=>{
        log('----------------display-metrics-changed', display.label,'changedMetrics:', changedMetrics);  
        // Execute the following logic only when the C1 screen scale factor changes
        if (labelList?.includes(display.label)) {
            currWindowWidth = display.bounds.width
            dynamicWindow?.close()
            dynamicWindow = null
            setTimeout(() => {
                checkDisplay()
            }, 1000)
        } else {
            const newScaleFactor = display.scaleFactor;
            const newWidth = display.size.width
            const newHeight = parseInt(display.size.height)
            log('[ newScaleFactor ] >', newScaleFactor, newWidth, newHeight)
            try {
                if (newHeight >= 960) {
                    mainWindow?.setSize(1010, 960);
                } else {
                    const finalHeight = Math.floor(newHeight * 0.8)
                    const finalWidth = Math.floor((finalHeight * 1010) / 960)
                    log('[ finalWidth&height ] >', finalWidth, finalHeight)
                    mainWindow?.setSize(finalWidth, finalHeight);
                }
            } catch (error) {
                log('[ --->error ] >', error)
            }
        }
    })
    ipcMain.on('get-hardware-info', (_event) => {
        readJsonFile('hardwares.json',(data:string)=>{
            mainWindow?.webContents.send('callback-hardware-info', data)
        })
    })
    // Get settings configuration
    ipcMain.on('get-config', async () => {
        mainWindow?.webContents.send('callback-config', getConfig())
    })
    ipcMain.on('update-config', async (_event, data) => {
        // log('Received config update data:', data);
        updateConfig(data.key, data.value)
    })
    ipcMain.on('language-changed', (_event,lang) => {
        console.log('[ language-changed ] >', lang)
        createOrUpdateTray(lang)
    })
}

function checkDisplay() {
    const all = screen.getAllDisplays()
    // log('-----------checkDisplay.all.size:', all);
    if (all.length > 1) {
        let displays = all.filter((item) => labelList?.includes(item.label))
        if (displays.length == 0) {
            displays = all.filter((item) => item.label == 'TPV-2288-IN')
        }
        // log('---------------checkDisplay.displays:', displays);
        let dis
        if (displays.length > 0) {
            dis = displays[0].workArea
        } else {
            dis = all[1].workArea
        }
        createDynamicWindow( dis.x, dis.y, dis.width, dis.height)
    } else {
        dialog.showMessageBox({
            type: 'warning',
            title: BUILD_LANG == LANG_EN?'Tips':'提示',
            message: BUILD_LANG == LANG_EN?'C1 is not connected':'C1未连接',
            buttons: ['OK'],
            noLink: true // Disable system link style
        })
    }
}

// Create performance monitoring window
let dynamicWindow: MainWindow | null
function createDynamicWindow(x?: number, y?: number, width?: number, height?: number,): void {
    log('width:',width,'height:',height)
    currWindowWidth = width || 0
    if (dynamicWindow) {
        return
    }
    dynamicWindow = new BrowserWindow({
        x: x || 0,
        y: y || 0,
        width: width || 540,
        height: height || 960,
        minimizable: false,
        fullscreen: true,
        fullscreenable: true,
        resizable: true,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, './preload.js'),
            webSecurity: false,
            devTools:LOG_OUTPUT,
            backgroundThrottling: false,
        },
    }) as MainWindow
    dynamicWindow.windowIndex = 2
    dynamicWindow.setSize(width || 540, height || 960)
    dynamicWindow.setFullScreen(true)
    dynamicWindow.setFullScreenable(true)
    dynamicWindow.setAutoHideMenuBar(true)
    dynamicWindow.maximize()
    dynamicWindow.on('ready-to-show', () => {
        if (dynamicWindow) {
            dynamicWindow.show()
            readSystemInfo(dynamicWindow, true)
            refreshInterval()
        }else{
            log('dynamicWindow IS NULL OR UNDEFINED');
        }
    })
    dynamicWindow.on('closed', () => {
        dynamicWindow = null
        clearInterval(taskId)
    })
    // In release build, passing params via '?id=' + id doesn't work, TODO:
    // const newPage = 'widgets'
    const newPage = 'dynamic'
    if (process.argv[2]) {
        const url = process.argv[2] + '/#/' + newPage
        log('createDynamicWindow---1---open-new-window.url', url)
        dynamicWindow.loadURL(url)
    } else {
        dynamicWindow.loadFile('index.html', { hash: '/' + newPage })
        log('createDynamicWindow---2---open-new-window.url', '/' + newPage)
    }
}

// Read cached data on each startup

const readThemeData = async (id: string) => {
    const themePath = path.join(userDataPath, 'themes', id)
    log('id', id, 'themePath', themePath)
    return new Promise((resolve, reject) => {
        fs.readFile(themePath + '\\data.json', 'utf8', (error, data) => {
            if (error) {
                console.error(error)
                reject(error)
            } else {
                let newData = {}
                console.log('[ readThemeData.themeInfo ] >', themeInfo)
                if (data) {
                    newData = JSON.parse(data)
                    const firstVw = data.indexOf('vw')
                    const lastVw = data.lastIndexOf('vw')
                    sortElements(newData.list)
                    if (firstVw < 0 && lastVw < 0) {
                        scaleScreen(UI_DESIGN_WIDTH, currWindowWidth, newData.list)
                    }
                    newData.list.forEach((element: {
                            type: string
                            name: any
                            src: string
                            fontFamily?: string
                        }) => {
                            if (element.type === 'image') {
                                const fileData = fs.readFileSync(path.join(themePath, element.name))
                                element.src = 'data:image/png;base64,' + fileData.toString('base64')
                            } else if (element.type === 'video') {
                                if('group' in element && element.group.length > 0){
                                    let index = 0
                                    if(themeInfo && themeInfo.index>=0 && element.group.length>themeInfo.index){
                                        index = themeInfo.index
                                    }
                                    element.name = element.group[index]
                                    console.log('[ group----->name ] >', element.name,index)
                                }
                                const videoPath = `file://${themePath}/${element.name}`
                                log('========videoPath========', videoPath);
                                element.src = videoPath
                            }
                    })
                }
                newData.screenOut = screenOut
                log('[ readThemeData.screenOut ] >', newData.screenOut)
                resolve(JSON.stringify(newData))
            }
        })
    })
}
const logViaWindow = (tag:string,data: string) => {
    if(app.isPackaged){
        if(mainWindow==null){
            setTimeout(() => {
                mainWindow?.webContents.send('log-out', JSON.stringify({ tag: tag, data: data }))
            },1000)
        }else{
            mainWindow.webContents.send('log-out', JSON.stringify({ tag: tag, data: data }))
        }
    }else{
        log(tag+":",data)
    }
}
function sortElements(list: any[]) {
    if (!list || list.length === 0) {
        return
    }
    const first = list[0]
    if('level' in first){
        list.sort((a, b) => {
            return a.level - b.level
        })
    } else {
        list.forEach((element, index) => {
            element.level = index
        })
    }
}
function scaleScreen(uiWidth:number,screenWidth:number,list:[]){
    const scale = screenWidth/uiWidth
    log('scaleScreen....scale',scale,'screenWidth:',screenWidth,'uiWidth:',uiWidth)
    list.forEach((element) => {
        const style = element.style
        Object.keys(style).forEach((key:string) => {
            const value = style[key]
            // console.log(`style---${key}: ${value}`);
            if(typeof value == 'string' && value.endsWith('px')){
                style[key] = Math.round(value.substring(0, value.length - 2) * scale) + 'px'
            }
        })
        if('innerStyle' in element){
            const innerStyle = element.innerStyle
            Object.keys(innerStyle).forEach((key:string) => {
                const value = innerStyle[key]
                // console.log(`innerStyle---${key}: ${value}`);
                if(typeof value == 'string' && value.endsWith('px')){
                    innerStyle[key] = Math.round(value.substring(0, value.length - 2) * scale) + 'px' 
                }
            })
        }
    })
}

// Error dialog
function showErrorDialog(message: string) {
    const options: Electron.MessageBoxOptions = {
        type: 'error',
        title: 'Error Occurred',
        message,
        buttons: ['OK'],
        noLink: true, // Depends on your Electron version
    }
    const index = dialog.showMessageBoxSync(mainWindow, options)
    if (index) {
        app.quit()
    }
}

// Communicate with the OpenStageAI platform via socket
let client: net.Socket
let gotTheLock: any
// Request single instance lock
if (process.argv[2]) {
    gotTheLock = true
} else {
    gotTheLock = app.requestSingleInstanceLock()
}
log('gotTheLock:', gotTheLock)

const requestParams = {
    id: 'inbuilt',
    app_id: APP_ID,
    app_key: APP_KEY,
    app_secret: APP_SECRET,
    app_version: ver,
    request_type: 'getToken'
}
const accessStage = async (request_type: string) => {
    log('---------->accessStage.request_type', request_type)
    requestParams.request_type = request_type
    client.write(JSON.stringify(requestParams))
}
const writeRegistry = async () => {
    const appPathDir = path.resolve(process.execPath, '..')
    const regKey = new Registry({
        hive: Registry.HKCU,
        key: '\\Software\\' + getAppName(),
    })
    regKey.set('InstallPath', Registry.REG_SZ, appPathDir, (err) => {
        if (err) {
            log('Error setting registry value:', err)
        } else {
            log('Registry value set successfully')
        }
    })
    regKey.set('version', Registry.REG_SZ, ver, (err) => {
        if (err) {
            log('Error getting registry value:', err)
        }
    })
}
const getOpenStageName =()=>isOverseeBuild()?'Cubestage':'OpenstageAI'

const createOrUpdateTray = (lang:string)=>{
    if(tray){
        tray.destroy()
    }
    tray = new Tray(path.join(__dirname, 'logo.png'))
    const contextMenu = Menu.buildFromTemplate([
        { label: lang=='zh-CN'?'主题':'Theme', 
            click: () => {
                console.log('[ tray-zhuti--click ] >')
                mainWindow?.show();
            }
        },
        { label: lang=='zh-CN'?'退出':'Quit', 
            click: () => {
                console.log('[ tray-terminate--click ] >')
                client.end()
                app.quit()
            }
        }
    ]);
    tray.setToolTip(lang=='zh-CN'?'性能监控':'3DMonitor')
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        console.log('[ tray-click ] >')
        if (mainWindow && !mainWindow.isVisible()) {
            mainWindow.show();
        }
    });
}

app.on('ready', async () => {
    if(app.isPackaged){
        writeRegistry()
    }
    // Unregister all shortcuts
    if (!process.argv[2]) {
        globalShortcut.unregisterAll()
    }
    const appPath = appDataPath + `\\${getOpenStageName()}\\common\\${getAppName()}.exe`
    log('appDataPath:', appDataPath, 'appPath:', appPath)
    logViaWindow('[ appPath ] >', appPath)
    if (fs.existsSync(appPath)) {
        fs.unlink(appPath, (err) => {
            if (err) {
                console.error('删除文件时出错:', err)
                return
            }
            log('文件已成功删除')
        })
    }
    if (gotTheLock) {
        app.focus()
        client = net.connect(pipePath)
        client.on('error', async (_error) => {
            const platformPath = appDataPath + `\\${getOpenStageName()}\\install.json`
            log('===========platformPath=============:', platformPath)
            logViaWindow('[ platformPath ] >', platformPath)
            try {
                let result = await readFromJsonFile(platformPath)
                logViaWindow('[ read.platformPath ] >', result)
                if (result) {
                    shell.openPath(result.appAPath + `${getOpenStageName()}.exe`)
                    app.quit()
                } else {
                    showErrorDialog(isOverseeBuild()?'Launch Cubestage first':'Launch Cubestage first')
                    app.quit()
                }
            } catch (error) {
                log(error)
            }
        })
        client.on('data', (d: any) => {
            const respJson = d.toString()
            if (!respJson || respJson.length <= 2) {
                showErrorDialog(isOverseeBuild()?'Launch Cubestage first':'Launch Cubestage first')
                app.quit()
                return
            }
            log('---------->dataFromServer', respJson)
            let responseData
            let requestType = ''

            const response = JSON.parse(respJson)
            // Compatible with new and old versions: new version uses response.request_type, old version uses response.type
            if (response.request_type) {
                requestType = response.request_type
                responseData = response.response_data
                if(requestType == 'getDeivice'){
                    requestType = responseData.type
                    responseData = responseData.config
                }
            } else {
                requestType = response.type
                responseData = response.config
            }
            log('[ ---->requestType ] >', requestType, responseData)
            if(!responseData || !requestType){
                return
            }
            // Logout
            if (requestType === 'quitLogin') {
                app.quit()
                return
            }
            // When the platform detects the app is already running, bring it to the foreground
            if (requestType === 'launch' && mainWindow && responseData==getAppName()) {
                if (!mainWindow.isVisible()) {
                    mainWindow.show()
                }
                return
            }
            if (requestType == 'getLabelList') {
                labelList = responseData
                return
            }
            if (requestType == 'getDeivice' || requestType === 'device') {
                deviceConfig = responseData
                log('[ deviceConfig ] >', deviceConfig)
                if (dynamicWindow && deviceConfig.deviceId) {
                    dynamicWindow.webContents.send('get-device-params-back', deviceConfig)
                }
                return
            }
            if (responseData.token) {
                console.log('[ resp--user--token ] >', responseData)
                // Save logged-in user info
                loginedUser = responseData
                mainWindow?.webContents.send('set-token', loginedUser)
                if (dynamicWindow) {
                    dynamicWindow?.webContents.send('set-token', loginedUser)
                }
            }
        })
        client.on('connect', () => {
            log('---------->connect')
        })
        // Get token
        ipcMain.on('get-token', async () => {
            // log('background----get-token');
            accessStage('getToken')
            // Get screen model
            setTimeout(() => {
                accessStage('getLabelList')
            },1000)
        })
        createMainWindow()
        // Register a listener for messages from other instances
        app.on('second-instance', () => {
            // When another instance tries to start, show the main window (if hidden)
            if (mainWindow) {
                if (mainWindow.isMinimized()) {
                    mainWindow.restore()
                }
                mainWindow.focus()
            }
        })
    } else {
        app.quit()
    }
    createOrUpdateTray('zh-CN')
    checkSystemInfo((res)=>{
        mainWindow?.webContents.send('callback-report-info', JSON.stringify(res))
    })
})
app.on('activate', function () {
    if (BrowserWindow.getAllWindows() && BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
    }
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


async function saveToJsonFile(data: any, filePath: string) {
    try {
        const content = JSON.stringify(data, null, 4)
        fs.writeFileSync(filePath, content)
    } catch (error) {
        log('error:', error)
    }
}
async function readFromJsonFile(filePath: string) {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data)
    } catch (error) {
        return null
    }
}


ipcMain.handle('get-win', async (_event) => {
    return BrowserWindow.getFocusedWindow()?.windowIndex == 1
})
ipcMain.on('get-deviceConfig', async () => {
    log('get-deviceConfig','deviceId:',deviceConfig.deviceId);
    if (dynamicWindow && deviceConfig.deviceId) {
        dynamicWindow.webContents.send('get-device-params-back', deviceConfig)
    } else {
        accessStage('getDeivice')
    }
})

ipcMain.on('relogin', () => {
    if (reloginFlag) {
        return
    }
    accessStage('relogin')
    reloginFlag = true
})

logViaWindow('[ isPackaged ] >', app.isPackaged+"")
logViaWindow('process.argv:', JSON.stringify(process.argv))
logViaWindow('userDataPath:', userDataPath,)
logViaWindow('appDataPath:', appDataPath)

function refreshInterval() {
    if (!dynamicWindow) {
        return
    }
    if(taskId){
        clearInterval(taskId)
        taskId = null
    }
    taskId = setInterval(() => readSystemInfo(dynamicWindow), 3000)
}
