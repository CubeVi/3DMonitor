import { LOG_OUTPUT } from '../api/config'
const log = (message?: any, ...optionalParams: any[]) => {
    if (LOG_OUTPUT) {
        console.log('[ logger ]>', message, ...optionalParams)
    }
}
export default log