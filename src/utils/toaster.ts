import { ElMessage } from 'element-plus'
import log from '@/utils/logger.ts'

let toast: any = null
export const showToast = (type: string, message: string) => {
    log('toast', 'type:', type, 'message:', message)
    if (toast) {
        toast.close()
        toast = null
    }
    const body = document.body
    const elements = body.querySelectorAll('.el-message')
    elements.forEach((element) => {
        element.remove()
    })

    switch (type) {
        case 'success':
            toast = ElMessage.success(message)
            break
        case 'info':
            toast = ElMessage.info(message)
            break
        case 'warning':
            toast = ElMessage.warning(message)
            break
        case 'error':
            toast = ElMessage.error(message)
            break
    }
    console.log('[ toast ] >', toast)
}
