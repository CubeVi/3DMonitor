import log from "./logger";

const { spawn } = require('child_process')

const wmicCommand = 'wmic path win32_VideoController get name'

export default function readGpuNameByShell(callback) {
    const wmic = spawn(wmicCommand, { shell: true })

    wmic.stdout.on('data', (data) => {
        log('---------readGpuNameByShell.data:', data.toString());
        let newData = data.toString().replace(/\r\n|\r|\n/g, '')
        newData = newData.replaceAll('Name', '')
        newData = newData.replaceAll('name', '')
        newData = newData.trim()
        callback(newData, null)
    })

    wmic.stderr.on('data', (error) => {
        console.error('error:', error)
        callback(null, error)
    })

    wmic.on('close', (code) => {
        log(`wmic process exited with code ${code}`)
    })
}
