import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js'

import vertexGrassShader from './shaders/grass/vertex.glsl'
import fragmentGrassShader from './shaders/grass/fragment.glsl'

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 3
camera.position.z = 25
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(0, 0.1, 1)
scene.add(directionalLight)

/**
 * Grass
 */
const grass = {}

grass.count = 50000
grass.dummy = new THREE.Object3D()

grass.geometry = new THREE.PlaneGeometry(0.01, 3, 5, 5)

grass.material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    vertexShader: vertexGrassShader,
    fragmentShader: fragmentGrassShader
})

grass.mesh = new THREE.InstancedMesh(grass.geometry, grass.material, grass.count)
scene.add(grass.mesh)

for (let i = 0; i < grass.count; i++) {
    grass.dummy.position.set(
        (Math.random() - 0.5) * 50, 0,
        (Math.random() - 0.5) * 50
    )

    grass.dummy.scale.setScalar(0.5 + Math.random() * 0.5)

    grass.dummy.rotation.y = Math.random() * Math.PI

    grass.dummy.updateMatrix()
    grass.mesh.setMatrixAt(i, grass.dummy.matrix)
}

/**
 * Grass
 */
const worship = {}

worship.model = new GLTFLoader()
worship.model.load('scene.gltf', (gltf) => {
    const statue = gltf.scene
    statue.receiveShadow = true
    statue.castShadow = true
    statue.position.y = 3.0
    statue.rotateY(Math.PI * 0.8)
    statue.scale.set(0.5, 0.5, 0.5)
    scene.add(statue)
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.autoClear = false
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

// Effect composer
const renderTarget = new THREE.WebGLMultipleRenderTargets(800, 600, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    encoding: THREE.sRGBEncoding
})

const effectComposer = new EffectComposer(renderer)
effectComposer.setSize(sizes.width, sizes.height)
effectComposer.setPixelRatio(sizes.pixelRatio)

// Render pass
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

// Bokeh pass
const filmPass = new FilmPass(0.35, 0.5, 2048, true)
effectComposer.addPass(filmPass)

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    grass.material.uniforms.uTime.value = elapsedTime * 0.3

    // Update controls
    controls.update()

    // Render
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
