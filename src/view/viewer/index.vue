<template>
    <div id="canvas-container" class="container"></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { EffectShader } from './shader'
import { DeviceParams } from './type'
import { ImgCountX, ImgCountY, OutPutSizeX, OutPutSizeY, SubWidth, SubHeight } from './config'
import log from '@/utils/logger'

const props = defineProps<{
    src: string
}>()
// {
//   deviceId: '164',
//   lineNumber: 19.625,
//   obliquity: 0.1057,
//   deviation: 8.89,
//   remark: ''
// }
let scene: any
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer

let slope = 0.1057
let interval = 19.625
let x0 = 8.89

let composer: any
const showPost = ref(true)
let colorPass: any

let shader_str_temp = ''
shader_str_temp = new EffectShader().getFinalShader()
let video: any

// Set device parameters
const setDeviceParams = (param: DeviceParams) => {
    slope = param.obliquity
    interval = param.lineNumber
    x0 = param.deviation
    if (colorPass) {
        colorPass.material.uniforms.slope.value = slope
        colorPass.material.uniforms.interval.value = interval
        colorPass.material.uniforms.x0.value = x0
        colorPass.material.needsUpdate = true
    }
}
onMounted(async () => {
    init()
    const param = {
        deviceId: '164',
        lineNumber: 19.625,
        obliquity: 0.1057,
        deviation: 8.89,
        remark: '',
    }
    setDeviceParams(param)

    window.electronApi.getDeviceConfig()
    // Set parameters
    window.electronApi.getParams((params: DeviceParams) => {
        log('[ onMounted.params ] >', params)
        setDeviceParams(params)
    })
})
defineExpose({
    changeVideo,
    renderPost,
    setDeviceParams,
})
function init() {
    scene = new THREE.Scene()
    const width = 2
    const height = 2
    camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 1000)

    renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.getElementById('canvas-container')?.appendChild(renderer.domElement)

    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    camera.position.z = 5
    createShaderPass()
    renderer.setAnimationLoop(animate)
    createVideo()
}
function animate() {
    renderer.render(scene, camera)
    convertTo3D()
}
function createShaderPass() {
    const colorShader = {
        uniforms: {
            // textureSampler: { value: null },
            tDiffuse: { value: null },
            interval: { value: 19.6138 },
            slope: { value: 0.09878 },
            x0: { value: -1.951725 },
        },
        vertexShader: `
            varying vec2 vUV;
            void main() {
                vUV = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
            }
        `,
        fragmentShader: shader_str_temp,
    }
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    colorPass = new ShaderPass(colorShader)
    composer.addPass(colorPass)
}
function renderPost() {
    showPost.value && composer && composer.render()
}
function createVideo() {
    // create an AudioListener and add it to the camera
    const listener = new THREE.AudioListener()
    camera.add(listener)
    // Create a video element
    video = document.createElement('video')
    video.src = props.src || 'mp4/boy.mp4'
    video.crossOrigin = 'anonymous'
    video.loop = true
    video.muted = true // Ensure video is muted to avoid repeated audio playback

    // Create an audio object
    const audio = new THREE.Audio(listener)

    // Create an audio analyser
    // const analyser = new THREE.AudioAnalyser(audio, 32)

    // Bind audio object to video element
    // audio.setMediaElementSource(video)

    // Create video texture
    const videoTexture = new THREE.VideoTexture(video)
    videoTexture.minFilter = THREE.LinearFilter
    videoTexture.magFilter = THREE.LinearFilter

    videoTexture.format = THREE.RGBFormat
    // videoTexture.format = THREE.RGBAIntegerFormat

    // videoTexture.type = THREE.UnsignedByteType
    // videoTexture.type = THREE.FloatType
    // videoTexture.type = THREE.HalfFloatType

    // Create material and apply video texture
    const material = new THREE.MeshBasicMaterial({ map: videoTexture })

    // Create a cube and apply material
    const geometry = new THREE.BoxGeometry(2, 2, 1)
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // Play video and audio
    video.play()
    video.loop = false
    // audio.play();
    video.addEventListener('ended', (event) => {
        log(
            'Video stopped either because 1) it was over, ' + 'or 2) no further data is available.',
        )
        video.pause()
        renderer.setAnimationLoop(null)
    })
}
function changeVideo(url: string) {
    video.src = url
    renderer.setAnimationLoop(animate)
    video.play()
}
function convertTo3D() {
    const width = 3600
    const height = 4000
    // Create target floating-point texture
    const dataTexture = new THREE.DataTexture(
        new Float32Array(width * height * 3),
        width,
        height,
        THREE.RGBFormat,
        THREE.FloatType,
    )
    const ctx = renderer.domElement.getContext('webgl2')
    // const imageData = ctx!.getImageData(0, 0, width, height).data
    const imageData = new Uint8Array(3600 * 4000 * 4)
    ctx.readPixels(0, 0, 3600, 4000, ctx.RGBA, ctx.UNSIGNED_BYTE, imageData)
    // Convert pixel data to floating-point format
    const floatData = dataTexture.image.data
    for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i] / 255.0
        const g = imageData[i + 1] / 255.0
        const b = imageData[i + 2] / 255.0
        floatData[i] = r
        floatData[i + 1] = g
        floatData[i + 2] = b
        // floatData[i + 3] = 1.0
    }
    // Mark texture as needing update
    dataTexture.flipY = true
    dataTexture.needsUpdate = true
    colorPass.material.uniforms.tDiffuse.value = dataTexture
    colorPass.material.uniforms.interval.value = interval
    colorPass.material.uniforms.slope.value = slope
    colorPass.material.uniforms.x0.value = x0
    colorPass.material.needsUpdate = true
    log('[ convertTo3D ] >', 'slope:', slope, 'interval:', interval, 'x0:', x0)

    composer.setSize(OutPutSizeX, OutPutSizeY)
    renderer.setSize(OutPutSizeX, OutPutSizeY)
    renderer.setViewport(0, 0, OutPutSizeX, OutPutSizeY)
    renderer.setScissor(0, 0, OutPutSizeX, OutPutSizeY)
    renderer.setScissorTest(true)

    composer.render()
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'
}
</script>

<style scoped>
.container {
    width: 100%;
    height: 100%;
}
</style>
