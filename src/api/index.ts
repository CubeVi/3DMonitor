import request from '@/utils/request'
export const login = (data?: any) => request.post('/login', data)
// General upload
export const uploadPic = (data?: any) => request.post('/jeecg-boot/cube/common/updateCommonResource', data)
// Get version update info
export const queryAppLastInfo = (data?: any) => request.post('/jeecg-boot/box/cubeAppInfo/queryAppLastInfo', data)
export const getHelpConfig = (data?: any) => request.get('https://www.openstageai.com/help.json', data)
export const getLastAppReleaseVersion = (params: any) => request.get('/jeecg-boot/openStage/applications/getLastAppReleaseVersion', params)

export const queryThemes = (data?: any) => request.get('/jeecg-boot/monitor/theme/list/', data)
export const statistics = (data?: any) => request.get('/jeecg-boot/monitor/resource/stat/', data)
export const DATA_TYPE_HARDWARE = 'data_type_hardware'

/**
 * Request body:
 * {
    "app": "",
    "data": "",
    "type": "",
    "userId": 0
    }
 */
export const hardwareReport = (data?: any) => request.post('/jeecg-boot/openStage/report/hardwareReport', data)
/**
 *  pageNo	    Page number, example: 1	     query	 true	 integer(int32)
    pageSize	Page size, example: 10	     query	 true	 integer(int32)
    app	        app name	                 query	false	string
    type        type	                     query	false	string
 */
export const hardwareList = (data?: any) => request.get('/jeecg-boot/openStage/report/hardwareList', data)


