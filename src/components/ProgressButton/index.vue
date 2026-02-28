<template>
    <div class="container" :style="backCSS">
        <div ref="progressBar" class="progress" :style="progressCSS"></div>
        <span ref="progressText" class="text" :style="textCSS">下载</span>
    </div>
</template>
<script setup lang="ts">
import { ref, defineProps, watch } from 'vue'
const progressBar = ref()
const progressText = ref()
const props = defineProps({
    downloadedState: {
        type: Number,
        default: 0,
    },
    progress: {
        type: Number,
        default: 0,
    },
    backCSS: {
        type: Object,
        default: {}
    },
    progressCSS: {
        type: Object,
        default: {}
    },
    textCSS: {
        type: Object,
        default: {}
    },
})
watch(() => props.downloadedState, (value: Number) => {
        switch (value) {
            case 0:
                progressText.value.innerHTML = '下载'
                break
            case 1:
                break
            case 2:
                progressText.value.innerHTML = '应用'
                break
            case 3:
                progressText.value.innerHTML = '重试'
                break
            default:
                break
        }
    },
)
watch(() => props.progress, (value: Number) => {
        progressBar.value.style.width = value + '%'
        progressText.value.innerHTML = value + '%'
    },
)
</script>

<style scoped>
.container {
    width: 200px;
    height: 50px;
    display: flex;
    justify-content: left;
    background-color: #121114;
    position: relative;
    align-items: center;
    border-radius: 6px;
    overflow: hidden;
}

.progress {
    width: 0px;
    height: 100%;
    display: flex;
    justify-content: center;
    background-color: #fffe59;
}

.text {
    width: 100%;
    height: 50px;
    color: #0a3350;
    font-size: large;
    font-weight: 700;
    line-height: 50px;
    position: absolute;
    text-align: center;
    text-shadow: #121114 2px 2px 2px;
}
</style>
