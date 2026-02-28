import log from "./logger"

const fs = require('fs')
const axios = require('axios')
const path = require('path')
const AdmZip = require('adm-zip')

/**
 * Download a file and track progress
 * @param {string} url - File URL
 * @param {string} savePath - Local path to save the file
 * @param {Function} callback - Callback for reporting download status and progress
 */
export function downloadFile(documentsPath: string, id: string, url: string, callback) {
    const saveDir = path.join(documentsPath, 'themes')
    let exist = false
    try {
        exist = fs.existsSync(saveDir)
    } catch (err) {
        console.error(err)
    }
    log('saveDir', saveDir, 'exist:', exist)
    if (!exist) {
        fs.mkdirSync(saveDir, { recursive: true })
    }
    // Create writable stream
    const filePath = saveDir + '\\' + id + '.zip'
    log('filePath', filePath)
    const writer = fs.createWriteStream(filePath)
    // Download file using axios
    axios({
        method: 'get',
        url: url,
        responseType: 'stream',
        onDownloadProgress: (progressEvent) => {
            // Calculate download percentage
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            log('percentCompleted:', percentCompleted)
            let error = null
            if (percentCompleted === 100) {
                const result = unzipFile(id, filePath, saveDir)
                if (typeof result === 'boolean') {
                    log('unzip result:', result, typeof result)
                } else {
                    error = result
                }
            }
            // Call callback with download percentage
            callback(error, percentCompleted)
        },
    })
        .then((response) => {
            // Write response data to file
            response.data.pipe(writer)
            return new Promise((resolve, reject) => {
                writer.on('finish', resolve)
                writer.on('error', reject)
            })
        })
        .then(() => {
            log('文件下载完成并保存至:', saveDir)
            // Optionally call callback here to report completion status
            callback(null, 100)
        })
        .catch((error) => {
            console.error('下载文件时发生错误:', error)
            // Call callback with error information
            callback(error, null)
        })
}


const readExistDirsInDir = (dir: string) => {
    const existDirs = []
    fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
        if (file.isDirectory()) {
            existDirs.push(file.name)
        }
    })
    return existDirs
}

const unzipFile = (id: string, zipFilePath: string, outputDirectory: string) => {
    try {
        const existDirs = readExistDirsInDir(outputDirectory)
        log('unzipFile.existDirs', existDirs, 'outputDirectory:', outputDirectory);
        const zip = new AdmZip(zipFilePath)
        zip.extractAllTo(outputDirectory, true)
        log('unzip ok')
        fs.unlink(zipFilePath, (res) => {
            log('delete zip file:', res)
        })
        const newExistDirs = readExistDirsInDir(outputDirectory)
        log('newExistDirs', newExistDirs);
        newExistDirs.forEach((dir) => {
            log('dir', dir);
            log('existDirs.includes(dir)', existDirs.includes(dir));
            if (!existDirs.includes(dir)) {
                const src = path.join(outputDirectory, dir)
                const target = path.join(outputDirectory, id)
                log('src', src, 'target', target);
                fs.rename(src, target, (res) =>{
                    log('rename ok', res)
                })
            }
        })
        return true
    } catch (err) {
        console.error('unzip failed:', err)
        return err
    }
}
export function readDownloadedThemes(documentsPath: string, callback) {
    const themesDir = path.join(documentsPath, 'themes')
    log('readDownloadedThemes', themesDir)
    const ids = []
    fs.readdir(themesDir, { withFileTypes: true }, (error, files) => {
        if (error) {
            callback(error, ids)
        } else {
            files
                .filter((dir) => dir.isDirectory())
                .forEach((dir) => {
                    const idPath = path.join(themesDir, dir.name, 'data.json')
                    if (fs.existsSync(idPath)) {
                        ids.push(dir.name)
                    }
                })
            callback(error, ids)
        }
    })
}
