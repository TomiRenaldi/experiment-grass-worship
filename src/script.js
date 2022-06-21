import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

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
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 5
camera.position.z = 10
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Lights
const light = {}
light.directional = new THREE.DirectionalLight('#ffffff')
light.directional.position.set(5, 5, 5)
scene.add(light.directional)

/**
 * Grass
 */
const grass = {}

grass.count = 10000
grass.dummy = new THREE.Object3D()

grass.geometry = new THREE.PlaneGeometry(0.01, 1, 5, 5)
grass.geometry.translate(0, 1, 0)

grass.material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 }
    },
    side: THREE.DoubleSide,
    vertexShader: vertexGrassShader,
    fragmentShader: fragmentGrassShader
})

grass.mesh = new THREE.InstancedMesh(grass.geometry, grass.material, grass.count)
grass.mesh.receiveShadow = true
scene.add(grass.mesh)

for (let i = 0; i < grass.count; i++) {
    grass.dummy.position.set(
        (Math.random() - 0.5) * 20, 0,
        (Math.random() - 0.5) * 20
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
    statue.castShadow = true
    statue.position.y = 2.5
    statue.rotateY(Math.PI * 0.8)
    statue.scale.set(0.3, 0.3, 0.3)
    scene.add(statue)
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})

renderer.shadowMap.enabled = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ReinhardToneMapping
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

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
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
