import fs from 'fs'
import { app } from 'electron'
import log from './logger'
import { CONFIG_FILE } from './constants'
import {BUILD_LANG} from '@/api/config/index.ts'
const path = require('path')
const userDataPath: string = app.getPath('userData')

let config = { langType: ''}
let configPath = ''

export const initConfig = async() => {
    configPath = path.join(userDataPath, CONFIG_FILE)
    config = { langType: BUILD_LANG }
    if (!fs.existsSync(configPath)) {
        log('配置文件  不  存在,保存打包配置的语言')
        save2FileSync(config, configPath)
    } else {
        log('配置文件   存在')
        config = await readFromFileSync(configPath)
        if(!config || !config.langType){
            config = { langType: BUILD_LANG }
            save2FileSync(config, configPath)
        }
    }
    log('initConfig', config)
}
/**
 * Get configuration object
 * @returns
 */
export const getConfig = () => config

// Update configuration items in settings
export const updateConfig = async (key: string, value: []) => {
    config[key] = value
    save2FileSync(config, configPath)
}
/**
 * Get config value by key
 * @param key config item name
 * @returns
 */
export const getValueByKey = (key: string) => config[key]
/**
 * Write data to file
 * @param data data to write
 * @param filePath file path
 */
export const save2FileSync = async (data: any, filePath: string) => {
    try {
        const content = JSON.stringify(data) // Convert to JSON
        fs.writeFileSync(filePath, content)
    } catch (error) {
        log('save2File.error:', error);
    }
}

/**
 * Read data from file
 * @param filePath file path
 * @returns data from file
 */
export const readFromFileSync = async (filePath: string) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data) // Parse as JSON
    } catch (error) {
        log('readFromFile.error:', error);
        return null
    }
}