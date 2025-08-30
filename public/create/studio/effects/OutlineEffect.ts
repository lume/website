import {type Element3D, type Scene} from 'lume'
import * as THREE from 'three'
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js'
import {OutlinePass} from 'three/examples/jsm/postprocessing/OutlinePass.js'
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js'
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js'
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js'
/* import {OutlinePass} from './OutlinePass.js' */
/* import {GammaCorrectionShader} from 'three/examples/jsm/shaders/GammaCorrectionShader.js' */

/* import {Pass, FullScreenQuad} from 'three/examples/jsm/postprocessing/Pass.js'
import {CopyShader} from 'three/examples/jsm/shaders/CopyShader.js' */

/**
 * Outline effect for selected 3D elements in the studio.
 */
export class OutlineEffect {
	private scene: Scene

	private composer?: EffectComposer

	private renderPass?: RenderPass

	private outlinePass?: OutlinePass

	private fxaaPass?: ShaderPass

	constructor(scene: Scene) {
		this.scene = scene

		this.create()
	}

	enable(element: Element3D) {
		if (!this.outlinePass) return

		this.outlinePass.selectedObjects = [element.three]

		this.scene.needsUpdate()
	}

	disable() {
		if (!this.outlinePass) return

		this.outlinePass.selectedObjects = []

		this.scene.needsUpdate()
	}

	create() {
		// TODO Fix lighting issue: Without gamma correction or OutputPass, everything becomes
		// really dark in the scene. However, with those fixes it makes things too bright.

		const renderer = this.scene.glRenderer!

		this.composer = new EffectComposer(renderer)

		this.addRenderPass()

		this.addOutlinePass()

		this.addOutputPass()

		this.addFXAAPass()

		/* this.addGammaCorrection() */

		this.scene.drawScene = () => {
			this.composer?.render()
		}

		this.scene.needsUpdate()
	}

	dispose() {}

	private addRenderPass() {
		if (!this.composer) return

		this.renderPass = new RenderPass(this.scene.three, this.scene.camera!.three!)
		this.composer.addPass(this.renderPass)
	}

	private addOutlinePass() {
		if (!this.composer) return

		this.outlinePass = new OutlinePass(
			new THREE.Vector2(window.innerWidth, window.innerHeight),
			this.scene.three,
			this.scene.camera!.three!,
			[],
		)

		this.outlinePass.edgeStrength = 6.0
		this.outlinePass.edgeGlow = 0.0
		this.outlinePass.edgeThickness = 3.0
		this.outlinePass.pulsePeriod = 0
		this.outlinePass.visibleEdgeColor.set(0xffffff)
		this.outlinePass.hiddenEdgeColor.set(0xbbbbbb)

		this.composer.addPass(this.outlinePass)
	}

	private addFXAAPass() {
		if (!this.composer) return

		const renderer = this.scene.glRenderer!

		this.fxaaPass = new ShaderPass(FXAAShader)
		const pixelRatio = renderer.getPixelRatio()
		/* console.log('getPixelRatio: ' + pixelRatio) */
		this.fxaaPass.material.uniforms['resolution'].value.set(
			1 / (window.innerWidth * pixelRatio),
			1 / (window.innerHeight * pixelRatio),
		)

		this.composer.addPass(this.fxaaPass)
	}

	/* private addGammaCorrection() {
		if (!this.composer) return

		const gammaPass = new ShaderPass(GammaCorrectionShader)
		this.composer.addPass(gammaPass)
	} */

	private addOutputPass() {
		if (!this.composer) return

		const outputPass = new OutputPass()
		this.composer.addPass(outputPass)
	}
}
