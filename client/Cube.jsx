/* @jsxImportSource @lume/element */

import {element, Box} from 'lume'

// TODO fix bug where setting Z rotation back to zero doesn't work (while X and Y are zero).

/**
 * This class could extend only Node, but it extends Cube so that if we turn on
 * webgl rendering we'll see a WebGL cube for debugging purposes (to ensure DOM
 * aligns with WebGL).
 */
@element('landing-cube')
export class LandingCube extends Box {
	get root() { return this }
    set root(_v) {}

	/** @param {any[]} args */
	constructor(...args) {
		super(...args)

		this.getMountPoint().set(0.5, 0.5, 0.5)
	}

	// prettier-ignore
	template = () => (
		<>
			<lume-node id="cube-face1" class="front"  position={[0, 0, this.getSize().x/2]}  rotation="0 0 0"   size={[this.getSize().x, this.getSize().x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face2" class="back"   position={[0, 0, -this.getSize().x/2]} rotation="0 180 0" size={[this.getSize().x, this.getSize().x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face3" class="left"   position={[-this.getSize().x/2, 0, 0]} rotation="0 -90 0" size={[this.getSize().x, this.getSize().x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face4" class="right"  position={[this.getSize().x/2, 0, 0]}  rotation="0 90 0"  size={[this.getSize().x, this.getSize().x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face5" class="top"    position={[0, -this.getSize().x/2, 0]} rotation="-90 0 0" size={[this.getSize().x, this.getSize().x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face6" class="bottom" position={[0, this.getSize().x/2, 0]}  rotation="90 0 0"  size={[this.getSize().x, this.getSize().x, 0]} mount-point="0.5 0.5" align-point="0.5 0.5 0.5"></lume-node>
		</>
	)

	css = /* css */ `
        .front {background: url("/images/cube/front.svg");}
        .back {background: url("/images/cube/back.svg");}
        .left {background: url("/images/cube/left.svg");}
        .right {background: url("/images/cube/right.svg");}
        .top {background: url("/images/cube/top.svg");}
        .bottom {background: url("/images/cube/bottom.svg");}
    `
}
