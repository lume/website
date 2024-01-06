import {element, Box, html} from 'lume'
import type {ElementAttributes} from '@lume/element'
import type {BoxAttributes} from 'lume'

// TODO fix bug where setting Z rotation back to zero doesn't work (while X and Y are zero).

/**
 * This class could extend only Node, but it extends Cube so that if we turn on
 * webgl rendering we'll see a WebGL cube for debugging purposes (to ensure DOM
 * aligns with WebGL).
 */
export {LandingCube}
@element('landing-cube')
class LandingCube extends Box {
	get root() {
		return this
	}
	set root(_v) {}

	constructor() {
		super()

		this.mountPoint.set(0.5, 0.5, 0.5)
	}

	// prettier-ignore
	template = () => html`
		<>
			<lume-plane id="cube-face1" class="front"  texture="/images/cube/front.svg"  color="white" sidedness="double" position={[0, 0, this.size.x/2]}  rotation="0 0 0"   size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-plane>
			<lume-plane id="cube-face2" class="back"   texture="/images/cube/back.svg"   color="white" sidedness="double" position={[0, 0, -this.size.x/2]} rotation="0 180 0" size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-plane>
			<lume-plane id="cube-face3" class="left"   texture="/images/cube/left.svg"   color="white" sidedness="double" position={[-this.size.x/2, 0, 0]} rotation="0 -90 0" size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-plane>
			<lume-plane id="cube-face4" class="right"  texture="/images/cube/right.svg"  color="white" sidedness="double" position={[this.size.x/2, 0, 0]}  rotation="0 90 0"  size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-plane>
			<lume-plane id="cube-face5" class="top"    texture="/images/cube/top.svg"    color="white" sidedness="double" position={[0, -this.size.x/2, 0]} rotation="-90 0 0" size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-plane>
			<lume-plane id="cube-face6" class="bottom" texture="/images/cube/bottom.svg" color="white" sidedness="double" position={[0, this.size.x/2, 0]}  rotation="90 0 0"  size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-plane>
		</>
	`
}

type LandingCubeAttributes = BoxAttributes

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
