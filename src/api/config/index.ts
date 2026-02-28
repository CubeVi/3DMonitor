import { LANG_EN,LANG_CN } from "../../utils/constants.ts"
import packageJson from '../../../package.json'
const ver = packageJson.version
export const VERSION = ver
// Whether to output logs; set to false when building for production
export const LOG_OUTPUT = true
// Whether to enable language switching
export const LANGUAGE_SWITCH_ENABLED = true

/**
 * 'zh-CN': Chinese build
 * 'en-US': English build
 */
const BUILD_LANG = LANG_EN
// const BUILD_LANG = LANG_CN

export const isOverseeBuild = () => BUILD_LANG === LANG_EN
export const getAppName = () => isOverseeBuild()?'3DMonitor-en':'3DMonitor'
export const getAppId = () => isOverseeBuild()?'3DMonitor.app.En':'3DMonitor.app'


export const ENV = ''
const BASE_URL =  'https://app.cubevi.com' 
export { BASE_URL, ver,BUILD_LANG }