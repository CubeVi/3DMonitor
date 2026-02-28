import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { BASE_URL, ver } from '../api/config'
import useTitleStore from '../store/title/index'
import useLangStore from '../store/lang/index'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import log from './logger'
const service: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 100 * 1000, // Request timeout
})
// Request interceptor
service.interceptors.request.use((config: InternalAxiosRequestConfig<any>) => {
    // Token can be set here: config!.headers!.Authorization = token
    const titleStore = useTitleStore()
    const { token } = storeToRefs(titleStore)
    const langStore = useLangStore()
    const { lang } = storeToRefs(langStore)
    if (
        config.method === 'POST' &&
        (config.url?.includes('updateModelResource') || config.url?.includes('updateCommonResource'))
    ) {
        config.headers['Content-Type'] = 'multipart/form-data'
    }
    config!.headers!['X-Access-Token'] = token.value
    config!.headers!['platform'] = 'C1'
    config!.headers!['Accept-Language'] = lang.value
    config!.headers!['ver'] = ver
    return config
})
service.interceptors.response.use(
    (response: AxiosResponse) => {
        const data = response.data
        if (data.success) {
            return data
        }
        ElMessage.error(data.message)
        if (data.code === 401) {
            window.electronApi.relogin()
        }
        return Promise.reject(data)
    },
    (err) => {
        log(err);

        ElMessage.error(err.response.data.message)
        if (err.response.data.code === 401) {
            window.electronApi.relogin()
        }
        return Promise.reject(err.response)
    },
)
const request = {
    get<T = any>(url: string, data?: any): Promise<T> {
        return request.request('GET', url, { params: data })
    },
    post<T = any>(url: string, data?: any): Promise<T> {
        return request.request('POST', url, { data })
    },
    put<T = any>(url: string, data?: any): Promise<T> {
        return request.request('PUT', url, { data })
    },
    delete<T = any>(url: string, data?: any): Promise<T> {
        return request.request('DELETE', url, { params: data })
    },
    request<T = any>(method = 'GET', url: string, data?: any): Promise<T> {
        return new Promise((resolve, reject) => {
            service({ method, url, ...data })
                .then((res) => {
                    resolve(res as unknown as Promise<T>)
                })
                .catch((e: Error | AxiosError) => {
                    reject(e)
                })
        })
    },
}

export default request
