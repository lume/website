/* import {InstancedMesh, Scene} from 'lume'
import {CustomOutlinePass} from './CustomOutlinePass'
import FindSurfaces from './FindSurfaces.js'
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js'
import * as THREE from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass'

export function addOutlineEffect(scene: Scene, mesh: InstancedMesh) {
	const depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight)
	const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
		depthTexture: depthTexture,
		depthBuffer: true,
	})

	// Initial render pass.
	const composer = new EffectComposer(scene.glRenderer!, renderTarget)
	// composer.outputBuffer = renderTarget

	const pass = new RenderPass(scene.three, scene.threeCamera)
	composer.addPass(pass)

	// Outline pass.
	const customOutline = new CustomOutlinePass(
		new THREE.Vector2(window.innerWidth, window.innerHeight),
		scene.three,
		scene.threeCamera,
	)
	composer.addPass(customOutline)

	// Antialias pass.
	const shaderMaterial = new THREE.ShaderMaterial(FXAAShader)
	shaderMaterial.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)
	const effectFXAA = new ShaderPass(shaderMaterial)
	composer.addPass(effectFXAA)

	const surfaceFinder = new FindSurfaces()

	const colorsTypedArray = surfaceFinder.getSurfaceIdAttribute(mesh.three)
	mesh.three.geometry.setAttribute('color', new THREE.BufferAttribute(colorsTypedArray, 4))

	customOutline.updateMaxSurfaceId(surfaceFinder.surfaceId + 1)

	scene.drawScene = () => {
		composer.render()
	}
}

export class BetterOutlinePass {
	constructor(scene: Scene, mesh: InstancedMesh) {
		const depthTexture = new THREE.DepthTexture(window.innerWidth, window.innerHeight)
		const renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, {
			depthTexture: depthTexture,
			depthBuffer: true,
		})

		// Initial render pass.
		const composer = new EffectComposer(scene.glRenderer!, renderTarget)
		const pass = new RenderPass(scene.three, scene.threeCamera)
		composer.addPass(pass)

		// Outline pass.
		const customOutline = new CustomOutlinePass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			scene.three,
			scene.threeCamera,
		)
		composer.addPass(customOutline)

		// Antialias pass.
		const shaderMaterial = new THREE.ShaderMaterial(FXAAShader)
		shaderMaterial.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)
		const effectFXAA = new ShaderPass(shaderMaterial)
		composer.addPass(effectFXAA)

		const surfaceFinder = new FindSurfaces()

		const colorsTypedArray = surfaceFinder.getSurfaceIdAttribute(mesh.three)
		mesh.three.geometry.setAttribute('color', new THREE.BufferAttribute(colorsTypedArray, 4))

		customOutline.updateMaxSurfaceId(surfaceFinder.surfaceId + 1)
	}
}
 */