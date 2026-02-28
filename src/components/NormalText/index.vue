<template>
    <span ref="refSpan" class="wrap-text" >{{ content }}</span>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted } from 'vue'
const refSpan = ref()
const props = defineProps({
    content:{
        type: String,
        required: true,
    },
    // styles:{
    //     type: Object,
    //     required: false,
    // },
})
const style = ref()

onMounted(() => {
//    const fontFamily = props.styles['font-family']
//    // Contains custom font
//    if(fontFamily && (fontFamily.toLowerCase().indexOf('otf') > -1 || fontFamily.toLowerCase().indexOf('otf') > -1)){
//        delete props.styles['font-family']
//        style.value = props.styles
//        applyFont(fontFamily)
//    }else{
//         style.value = props.styles
//    }
})

// const applyFont=(fontPath:string)=> {
//     const result = fontPath.replaceAll('\\','\\\\\\\\')
//     const font = new FontFace('CustomFont', `url(${result})`);
//     font.load().then((loadedFont) => {
//         document.fonts.add(loadedFont);
//         refSpan.value.style.fontFamily = 'CustomFont, dinBold';
//     }).catch((error) => {
//         console.error('Font application failed:', error);
//     });
// }



</script>
<style scoped>
.wrap-text{
    word-break: break-all;
}
</style>
