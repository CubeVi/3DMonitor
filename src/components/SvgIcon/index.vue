<template>
    <svg :class="svgClass" aria-hidden="true">
        <use class="svg-use" :href="symbolId" />
    </svg>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
    name: 'SvgIcon',
    props: {
        prefix: {
            type: String,
            default: 'icon',
        },
        name: {
            type: String,
            required: true,
        },
        className: {
            type: String,
            default: '',
        },
    },
    setup(props) {
        const symbolId = computed(() => `#${props.name}`)
        const svgClass = computed(() => {
            if (props.className) {
                return `svg-icon ${props.className}`
            }
            return 'svg-icon'
        })
        return { symbolId, svgClass }
    },
})
</script>
<style scope lang="scss">
.svg-icon {
    width: 20px;
    height: 20px;
    position: relative;
    fill: currentColor;
    vertical-align: -2px;
    background-color: transparent;
}
</style>
