// 生产环境插件
// 打包electron项目
import type { Plugin } from 'vite'
import * as electronBuilder from 'electron-builder'
import path from 'path'
import fs from 'fs'
import { createRequire } from 'module'
import { isOverseeBuild,getAppName,getAppId } from '../src/api/config'

const require = createRequire(import.meta.url)
// 导出Vite插件函数
export const viteElectronBuild = (): Plugin => {
    return {
        name: 'vite-electron-build',

        // closeBundle是Vite的一个插件钩子函数，用于在Vite构建完成后执行一些自定义逻辑。
        closeBundle() {
            // 定义初始化Electron的函数
            const initElectron = () => {
                // 使用esbuild编译TypeScript代码为JavaScript
                require('esbuild').buildSync({
                    entryPoints: ['src/background.ts'],
                    bundle: true,
                    outfile: 'dist/background.js',
                    platform: 'node',
                    target: 'node12',
                    external: ['electron'],
                    minify: true
                })
            }
            const initElectron1 = () => {
                // 使用esbuild编译TypeScript代码为JavaScript
                require('esbuild').buildSync({
                    entryPoints: ['src/preload.ts'],
                    bundle: true,
                    outfile: 'dist/preload.js',
                    platform: 'node',
                    target: 'node12',
                    external: ['electron'],
                    minify: true
                })
            }

            // 调用初始化Electron函数
            initElectron()
            initElectron1()
            // 修改package.json文件的main字段 不然会打包失败
            const json = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
            json.main = 'background.js'
            fs.writeFileSync('dist/package.json', JSON.stringify(json, null, 2))

            // 创建一个空的node_modules目录 不然会打包失败
            fs.mkdirSync(path.resolve(process.cwd(), 'dist/node_modules'))

            // 使用electron-builder打包Electron应用程序
            electronBuilder.build({
                config: {
                    appId: getAppId(),
                    productName: getAppName(),
                    directories: {
                        output: path.resolve(process.cwd(), isOverseeBuild()?'releaseEn':'release'), // 输出目录
                        app: path.resolve(process.cwd(), 'dist'), // app目录
                    },
                    asar: true,
                    nsis: {
                        oneClick: false, // 创建一键安装程序还是辅助安装程序（默认是一键安装）
                        perMachine: false, // 是否为每个用户启动还是为所有用户启动
                        allowElevation: true, // 是否允许请求提升，如果为false，则用户必须使用提升的权限重新启动安装程序 （仅作用于辅助安装程序）
                        allowToChangeInstallationDirectory: true, // 是否允许修改安装目录 （仅作用于辅助安装程序）
                        uninstallDisplayName: '${productName}', // 控制面板中的卸载程序显示名称
                        createDesktopShortcut: true, // 是否创建桌面快捷方式
                        createStartMenuShortcut: true, // 是否创建开始菜单快捷方式
                        deleteAppDataOnUninstall: true, // 是否在卸载时删除应用程序数据（仅作用于一键安装程序）
                        runAfterFinish: true, // 完成后是否运行已安装的应用程序（对于辅助安装程序，应删除相应的复选框）
                        menuCategory: false, // 是否为开始菜单快捷方式和程序文件目录创建子菜单，如果为true，则使用公司名称
                        include: isOverseeBuild()?'public/installEn.nsh':'public/install.nsh',
                        shortcutName: isOverseeBuild()?'Cube Monitor':'性能监控', //桌面快捷方式名称
                        installerLanguages:isOverseeBuild()?'en-US':'zh-CN',
                    },
                    win: {
                        icon: 'public/logo.png',
                        target: [
                            {
                                target: 'nsis',
                                arch: ['x64'],
                            }
                        ],
                        signingHashAlgorithms: ['sha256', 'sha1'],
                    },
                    extraResources: [{
                            from: 'public/',
                            to: 'public/',
                        }
                    ],
                },
            })
        },
    }
}
