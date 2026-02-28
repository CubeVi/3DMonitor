<template>
    <div id="canvas-container" class="container">
        <canvas id="renderCanvas" class="canvas"></canvas>
        <canvas id="canvasForHtml2canvas" width="1440" height="2560" style="position:absolute;right:10000px"></canvas>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { EffectShader } from './shader'
import * as BABYLON from '@babylonjs/core'
import { DeviceParams } from './type'
import { getSwizzlerFixedLayersFragShader, buildPlane, Location5 } from './multilayer'
import html2canvas from 'html2canvas'
import log from '@/utils/logger'

// {
//   deviceId: '164',
//   lineNumber: 19.625,
//   obliquity: 0.1057,
//   deviation: 8.89,
//   remark: ''
// }
let scene: any
let engine: any
let sceneForUI: any
let engineForUI: any

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
let planes: any
let planesForUI: any
const y_offset =0.// 10.8

const output_size_X = 1440;
const output_size_Y = 2560;
// const output_size_X = 144;
// const output_size_Y = 256;
let z_offset = 0
const focalPlane = 100
const cam_pos = focalPlane + z_offset //;16
const theta = (40 / 180) * Math.PI //ViewAngle
const vetical_alpha = 0.25 //1.2 // vfov of a camera


const imgs_count_x = 8
const imgs_count_y = 5
const subimg_width = 288;//200
const subimg_height = 512//400
const tan_alpha_2 = (subimg_width / subimg_height) * Math.tan(vetical_alpha / 2)
const fl = 1 / 2 / tan_alpha_2
const z_multiplier = 1 //5.0

const x = focalPlane * Math.tan(theta / 2) * z_multiplier


const m_width = subimg_width * imgs_count_x
const m_height = subimg_height * imgs_count_y
const viewNum = imgs_count_x * imgs_count_y //40

let postProcess: BABYLON.PostProcess
let postProcessForUI: BABYLON.PostProcess
let videoTexture: BABYLON.VideoTexture
let renderTargetTexture: BABYLON.RenderTargetTexture
let planeMat: BABYLON.StandardMaterial
let myDynamicTexture: BABYLON.DynamicTexture
const taretFPS = 5
let lastTime = 0
// Set device parameters
const setDeviceParams = (param: DeviceParams) => {
    slope = param.obliquity
    interval = param.lineNumber
    x0 = param.deviation
    // log('[ setDeviceParams ] >', 'slope:', slope, 'interval:', interval, 'x0:', x0)
}

const props = defineProps({
    src: String
})

onMounted(async () => {
    init()

    window.electronApi.getDeviceConfig()
    // Set parameters
    window.electronApi.getParams((params: DeviceParams) => {
        log('[ onMounted.params ] >', params)
        setDeviceParams(params)
        // slope = 0.1000
        // const taskId = setInterval(() => { 
        //     slope += 0.0001
        //     if (slope > 0.1099) {
        //         slope = 0.1000
        //     }
        // }, 100)
        // setTimeout(()=>{
        //     clearInterval(taskId)
        //     setDeviceParams(params)
        //     log('[ End ] >', taskId)
        // }, 1*60*1000)
    })
})
defineExpose({
    changeVideo,
    setDeviceParams,
}) 
// z in cm
function multilayer_z_multiply(z){
    var zk = -z / 50
    return 5.126*zk /(1+zk)
}
function init() {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
    engine = new BABYLON.Engine(canvas, false, {
        preserveDrawingBuffer: false,
        stencil: false,
        disableWebGL2Support: false,
        adaptToDeviceRatio: true,
        alpha: true})
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4( 0, 0, 0, 0);

    renderTargetTexture = new BABYLON.RenderTargetTexture("renderTarget", {width: m_width, height: m_height}, scene, false, true);

    planes=[
    
        //function buildPlane(scene, url, loc){
        // buildPlane(scene,"sample1.png",                 new Location5(0.5, 0.8, 0.1, 0.3, multilayer_z_multiply(-1.0)) ),
        buildPlane(scene,"", new Location5(0.0, 1.0, 0, 1.0, multilayer_z_multiply(-1.0)) ),
        buildPlane(scene,"", new Location5(.4,.6,.8,.9, multilayer_z_multiply( 1.3)) ),
        // buildPlane(scene,"sample2.png",                 new Location5(0.4, 0.6, 0.3, 0.6, multilayer_z_multiply( 1)) ),
        buildPlane(scene,"", new Location5(-.1,1.1,0,1, multilayer_z_multiply( -3)) )
        // buildPlane(scene,"", new Location5(-.1,1.1,0,1, multilayer_z_multiply( -3)) )
    ]  
    const camera1 = new BABYLON.ArcRotateCamera(
        'camera',
        (0 * Math.PI) / 8,
        (0 * Math.PI) / 8,
        y_offset,
        new BABYLON.Vector3(0, 0, -20),
        scene,
    )

    // Set camera to orthographic projection mode
    camera1.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
    // Set camera view frustum
    const radius = 2
    camera1.orthoTop = radius;
    camera1.orthoBottom = -radius;
    camera1.orthoLeft = -radius;
    camera1.orthoRight = radius;

    camera1.viewport = new BABYLON.Viewport(0, 0, 1, 1);
    camera1.setTarget(BABYLON.Vector3.Zero());

    // camera1.attachControl(canvas, true)
    // camera1.outputRenderTarget = renderTargetTexture;
    scene.activeCameras.push(camera1);  
    let fragShader = getSwizzlerFixedLayersFragShader(
        planes[0].location5,
        planes[1].location5,
        planes[2].location5
    )
    BABYLON.Effect.ShadersStore["custom1FragmentShader"] = fragShader;
    
    postProcess = new BABYLON.PostProcess(
        "My custom post process",
        "custom1", 
        ['slope', 'interval', 'x0'], 
        ["textureSampler", "overlay0Texture", "overlay1Texture", "overlay2Texture",], 
        1.0, 
        camera1,
        BABYLON.Texture.NEAREST_NEAREST
    );
    log('[ init.postProcess ] >', 'slope:', slope, 'interval:', interval, 'x0:', x0)
    postProcess.onApply = function (effect) { 
        effect.setTexture("textureSampler", renderTargetTexture);  
        effect.setTexture("overlay0Texture", planes[0].texture);
        // effect.setTexture("overlay1Texture", planes[1].texture);
        // effect.setTexture("overlay2Texture", planes[2].texture);// it has to have a texture..., so we give a null one
        effect.setFloat("slope", slope); 
        effect.setFloat("interval", interval); 
        effect.setFloat("x0", x0); 
        // log('[ init.effect.setFloat ] >', 'slope:', slope, 'interval:', interval, 'x0:', x0)
    };
    createVideo()
    startRenderLoop()

    const divs = document.getElementById('template-container')?.getElementsByTagName('div');
    
    if (divs && divs[0]) {
        const div: any = divs[0]
        div.style.background = 'transparent'
    }
    const canvasForHtml = document.getElementById('canvasForHtml2canvas') as HTMLCanvasElement

    // const ctx = myDynamicTexture.getContext();

    myDynamicTexture = new BABYLON.DynamicTexture("dynamic", canvasForHtml, scene);
    planes[0].texture = myDynamicTexture

    setTimeout(() => {
        setInterval(() => {
            // let time1 = performance.now()
            const div = document.getElementById('template-container')
            canvasForHtml.getContext('2d')?.clearRect(0, 0, canvasForHtml.width, canvasForHtml.height)
            div && html2canvas(div, {
                backgroundColor: null,
                width: 1440,
                height: 2560,
                canvas: canvasForHtml,
                scale: 1
            }).then(async function (canvas) {
                myDynamicTexture.update();
            });
        }, 500)
    }, 1500)

    // setTimeout(() => {
    //     // Convert canvas to PNG image
    //     const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement
    //     // const ctx = canvas.getContext('2d')
    //     const img = new Image()
    //     img.src = canvas.toDataURL()
    //     // Download the image
    //     const a = document.createElement('a')
    //     a.href = img.src
    //     a.download = '3DMonitor.png'
    //     a.click()
    // }, 5000)
}

const startRenderLoop = () => {
    engine.runRenderLoop(function () {

        if(performance.now() - lastTime > 1000/taretFPS) {
            if (scene && scene.activeCamera) {
                !stopRenderBackground && renderTargetTexture.render()
                scene.render();
            }
            // console.log(performance.now() - lastTime)
            lastTime = performance.now()
        } else {
            return
        }
    });
}
function changeVideo(url: string) {
    videoTexture.updateURL(url)
    // stopRenderBackground = false
    // setTimeout(() => {
    //     stopRenderBackground = true
    // }, 3000)
}
let stopRenderBackground = false
function createVideo() {
    // Create a plane
    const plane = BABYLON.MeshBuilder.CreatePlane("plane", { size: 4 }, scene);
    plane.position.set(0, 0, 0)
    planeMat = new BABYLON.StandardMaterial('test')
    planeMat.emissiveColor = BABYLON.Color3.White();
    plane.material = planeMat;
    renderTargetTexture?.renderList?.push(plane)
    videoTexture = new BABYLON.VideoTexture(
        "video", 
        props.src,
        scene, 
        false,
        false,
        undefined,
        {
            autoPlay: true,
            muted: true,
            loop: false,
            autoUpdateTexture: true,
        }
    );
    // setTimeout(() => {
    //     videoTexture.video.play();
    //     videoTexture.video.loop = true;
    // }, 500)
    planeMat.diffuseTexture = videoTexture
    // setTimeout(() => {
    //     stopRenderBackground = true
    // }, 3000)
}
</script>

<style scoped>
.container {
    width: 100%;
    height: 100%;
}
.canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
.canvas:focus {
    outline: none;
}
.ui-layer {
    mix-blend-mode: normal;
}
.div33{
    padding:20px;
    margin:0 auto;
    border:5px solid black;
}

h1{
    border-bottom:2px solid white;
}

h2{
    background: #efefef;
    padding:10px;
}
</style>
