import {element, Element3D, html} from 'lume'
import type {ElementAttributes} from '@lume/element'
import type {Element3DAttributes, Plane} from 'lume'
import {svgTexture} from './utils.js'

/**
 * This class could extend only Node, but it extends Cube so that if we turn on
 * webgl rendering we'll see a WebGL cube for debugging purposes (to ensure DOM
 * aligns with WebGL).
 */
@element('landing-cube')
export class LandingCube extends Element3D {
	get root() {
		return this
	}
	set root(_v) {}

	constructor() {
		super()

		this.mountPoint.set(0.5, 0.5, 0.5)
	}

	connectedCallback() {
		super.connectedCallback()

		const planes = Array.from(this.querySelectorAll('.cubeFace')) as Plane[]

		if (this.visible) {
			for (const plane of planes) {
				const canvas = plane.querySelector('canvas')
				const img = plane.querySelector('img')
				svgTexture(plane, img, canvas, 1000, 1000)
			}
		}
	}

	// prettier-ignore
	template = () => html`
		<lume-plane class="cubeFace front"  xtexture="/images/cube/front.svg"  sidedness="double" position="${() => [0, 0, this.size.x/2]}"  rotation="0 0 0"   size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img src="/images/cube/front.svg"  /></lume-plane>
		<lume-plane class="cubeFace back"   xtexture="/images/cube/back.svg"   sidedness="double" position="${() => [0, 0, -this.size.x/2]}" rotation="0 180 0" size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img src="/images/cube/back.svg"   /></lume-plane>
		<lume-plane class="cubeFace left"   xtexture="/images/cube/left.svg"   sidedness="double" position="${() => [-this.size.x/2, 0, 0]}" rotation="0 -90 0" size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img src="/images/cube/left.svg"   /></lume-plane>
		<lume-plane class="cubeFace right"  xtexture="/images/cube/right.svg"  sidedness="double" position="${() => [this.size.x/2, 0, 0]}"  rotation="0 90 0"  size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img src="/images/cube/right.svg"  /></lume-plane>
		<lume-plane class="cubeFace top"    xtexture="/images/cube/top.svg"    sidedness="double" position="${() => [0, -this.size.x/2, 0]}" rotation="-90 0 0" size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img src="/images/cube/top.svg"    /></lume-plane>
		<lume-plane class="cubeFace bottom" xtexture="/images/cube/bottom.svg" sidedness="double" position="${() => [0, this.size.x/2, 0]}"  rotation="90 0 0"  size="${() => [this.size.x, this.size.x, 0]}" mount-point="0.5 0.5" align-point="0.5 0.5 0.5"><canvas></canvas><img src="/images/cube/bottom.svg" /></lume-plane>
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
