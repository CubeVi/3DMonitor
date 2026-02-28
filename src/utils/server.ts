import net from 'node:net'
import log from './logger'
const express = require('express')
const appSource = express()
let server: any = null
function getAvailablePort(callback: any) {
    server = net.createServer()
    server.listen(0, '127.0.0.1', () => {
        const port = server.address()?.port || '52241'
        server.close(() => {
            callback(port)
        })
    })
}
function realStart(path: string, callback: any) {
    appSource.use(express.static(path))
    getAvailablePort((port: number) => {
        appSource.listen(port, () => {
            log(`Express server is launched,port: ${port}`)
            callback(port)
        })
    })
}

/**
 *
 * @param path
 * @param callback
 * @param autoReboot If the server is currently running, restart it
 */
export function startLocalServer(path: string, callback: any, autoReboot: boolean = false) {
    log('start local server,path:', path)
    if (autoReboot) {
        if (server === null || server === undefined) {
            realStart(path, callback)
        } else {
            server?.close(() => {
                server = null
                log('server is terminated')
                realStart(path, callback)
            })
        }
    } else {
        realStart(path, callback)
    }
}
export function closeServer() {
    log('close local server')

    server?.close(() => {
        log('server is closed')
        server = null
    })
}
