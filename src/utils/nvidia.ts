const smi = require('node-nvidia-smi')
export default function detectNvidiaGPU(callback) {
    smi(function (err, data) {
        if (err) {
            console.warn(err)
        }
        if (!data || !data.nvidia_smi_log || !data.nvidia_smi_log.gpu) {
            let error = err
            if (!error) {
                error = new Error('nvidia-smi error')
            }
            callback({}, error)
            return
        }
        const { product_name, fb_memory_usage, utilization, temperature, clocks, max_clocks } = data.nvidia_smi_log.gpu
        callback({
            productName: product_name,
            memoryUsage: fb_memory_usage,
            utilization: utilization,
            temperature: temperature,
            clocks: clocks,
            max_clocks: max_clocks,
        },err)
    })
}
