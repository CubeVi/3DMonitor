<template>
    <div class="modal-mask" v-show="visible">
        <div class="modal">
            <div class="modal-title">{{ props.title }}</div>
            <slot></slot>
            <div class="modal-footer">
                <div class="confirm btn" @click="confirm">{{ t('queding') }}</div>
                <div class="cancel btn" @click="cancel">{{ t('quxiao') }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, ref, defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const visible = ref(false)
const props = defineProps<{
    title: string | number
    modelValue: boolean}>()
const emit = defineEmits(['confirm', 'cancel'])
const confirm = () => {
    emit('confirm')
}
const cancel = () => {
    visible.value = false
    emit('cancel')
}
// Watch for modelValue changes
watch(
    () => props.modelValue,
    (newValue) => {
        visible.value = newValue
    },{
        immediate: true,
    },
)
</script>

<style scoped lang="scss">
.modal-mask {
    background-color: rgba(0, 0, 0, 0.2);
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9999;
    .modal {
        width: 282px;
        height: auto;
        background: linear-gradient(180deg, #061d2d 0%, #030a0f 100%);
        border-radius: 6px 6px 6px 6px;
        border: 1px solid #0a3350;

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        padding-bottom: 24px;
    }
}
.modal-title {
    font-size: 14px;
    color: #ffffff;
    line-height: 16px;
    text-align: center;
    padding: 12px;
    border-bottom: 1px solid #0a3350;
}
.modal-footer {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 14px;
    justify-content: center;
    .btn {
        width: 78px;
        height: 30px;
        background: #2fc6df;
        border-radius: 6px 6px 6px 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        cursor: pointer;
        &.cancel {
            background: #719cb9;
        }
    }
}
</style>
