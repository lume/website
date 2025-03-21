import {element, Element3D, html} from 'lume'
import type {Element3DAttributes, Plane} from 'lume'
import type {ElementAttributes} from '@lume/element'
import {svgTexture} from '../utils.js'

const frontUrl = new URL('../images/cube/front.svg', import.meta.url).href
const backUrl = new URL('../images/cube/back.svg', import.meta.url).href
const leftUrl = new URL('../images/cube/left.svg', import.meta.url).href
const rightUrl = new URL('../images/cube/right.svg', import.meta.url).href
const topUrl = new URL('../images/cube/top.svg', import.meta.url).href
const bottomUrl = new URL('../images/cube/bottom.svg', import.meta.url).href

/**
 * This class could extend only Node, but it extends Cube so that if we turn on
 * webgl rendering we'll see a WebGL cube for debugging purposes (to ensure DOM
 * aligns with WebGL).
 */
@element('landing-cube')
export class LandingCube extends Element3D {
	hasShadow = true

	constructor() {
		super()
		this.mountPoint.set(0.5, 0.5, 0.5)
	}

	connectedCallback() {
		super.connectedCallback()

		const planes = Array.from(this.shadowRoot!.querySelectorAll('.cubeFace')) as Plane[]

		if (this.visible) {
			for (const plane of planes) {
				const canvas = plane.querySelector('canvas')
				const img = plane.querySelector('img')
				if (!canvas || !img) throw new Error('Canvas or image missing')
				svgTexture(plane, img, canvas, 1000, 1000)
			}
		}
	}

	// prettier-ignore
	// TODO texture="" is commented out because SVG textures need an update to work well cross-platform. https://discourse.threejs.org/t/any-ideas-why-svg-texture-does-not-show-in-firefox/33361
	template = () => html`
		<lume-plane class="cubeFace front"  xtexture=${frontUrl}  sidedness="double" position="${() => [0, 0, this.size.x/2]}"  rotation="0 0 0"   size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img crossorigin src=${frontUrl}  /></lume-plane>
		<lume-plane class="cubeFace back"   xtexture=${backUrl}   sidedness="double" position="${() => [0, 0, -this.size.x/2]}" rotation="0 180 0" size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img crossorigin src=${backUrl}   /></lume-plane>
		<lume-plane class="cubeFace left"   xtexture=${leftUrl}   sidedness="double" position="${() => [-this.size.x/2, 0, 0]}" rotation="0 -90 0" size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img crossorigin src=${leftUrl}   /></lume-plane>
		<lume-plane class="cubeFace right"  xtexture=${rightUrl}  sidedness="double" position="${() => [this.size.x/2, 0, 0]}"  rotation="0 90 0"  size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img crossorigin src=${rightUrl}  /></lume-plane>
		<lume-plane class="cubeFace top"    xtexture=${topUrl}    sidedness="double" position="${() => [0, -this.size.x/2, 0]}" rotation="-90 0 0" size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img crossorigin src=${topUrl}    /></lume-plane>
		<lume-plane class="cubeFace bottom" xtexture=${bottomUrl} sidedness="double" position="${() => [0, this.size.x/2, 0]}"  rotation="90 0 0"  size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img crossorigin src=${bottomUrl} /></lume-plane>
	`
}

type LandingCubeAttributes = Element3DAttributes

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'landing-cube': ElementAttributes<LandingCube, LandingCubeAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'landing-cube': LandingCube
	}
}
