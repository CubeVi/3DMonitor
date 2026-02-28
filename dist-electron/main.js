'use strict'
const { app, BrowserWindow } = require('electron')
const path = require('path')
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true'
const url = process.env.VITE_DEV_SERVER_URL
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })
    if (process.env.VITE_DEV_SERVER_URL) {
        console.log('url: ', process.env.VITE_DEV_SERVER_URL)
        win.loadURL(url)
        win.webContents.openDevTools()
    } else {
        win.loadFile(join(__dirname, 'dist/index.html'))
    }
}
app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
