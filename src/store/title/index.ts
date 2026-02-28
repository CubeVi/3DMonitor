import { defineStore } from 'pinia'
import log from '../../utils/logger'
type titleStoreState = {
    drag: boolean
    userId: number
    token: string
    photo: string
    nickName: string,
    themes: [],
    hasNewVersion:boolean,
    checkNewVersion:boolean
}

const useTitleStore = defineStore('titleStore', {
    state: (): titleStoreState => ({
        drag: true,
        userId: -1,
        token: '',
        photo: '',
        nickName: '',
        themes: [],
        hasNewVersion:false,
        checkNewVersion:false
    }),
    actions: {
        setDrag(drag: boolean): void {
            this.drag = drag
        },
        setToken(token: string, userId: number, photo: string, nickName: string): void {
            this.token = token
            this.userId = userId
            this.photo = photo
            this.nickName = nickName
        },
        setThemes(themes: []): void {
            this.themes = themes
            log('store.themes.length:', themes.length)
        },
        setVersion(v:boolean):void{
            this.hasNewVersion = v
        },
        callCheckNewVersion():void{
            this.checkNewVersion = true
            setTimeout(()=>{
                this.checkNewVersion = false
            },350)
        }
    },
})

export default useTitleStore
