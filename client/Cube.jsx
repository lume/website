import {mountPoint, element, Box} from 'lume'

// TODO fix bug where setting Z rotation back to zero doesn't work (while X and Y are zero).

/**
 * This class couldextend only Node, but it extends Cube so that if we turn on
 * webgl rendering we'll see a WebGL cube for debugging purposes (to ensure DOM
 * aligns with WebGL).
 */
@element('landing-cube')
export class LandingCube extends Box {
	root = this

	/** @param {any[]} args */
	constructor(...args) {
		super(...args)

		this.mountPoint = mountPoint([0.5, 0.5, 0.5])
	}

	set size(v) {
		console.log('SET SIZE!!!!!!', v)
		// keep it a cube.
		if (typeof v === 'number')
			// @ts-ignore
			v = [v, v, v]
		else if (Array.isArray(v)) v[1] = v[2] = v[0]
		else if (typeof v === 'object') v.y = v.z = v.x
		else throw new Error('Invalid size value')

		super.size = v
		console.log('RESULT!!!!!!', this.size)
	}
	get size() {
		return super.size
	}

	// prettier-ignore
	template = () => (
		<>
			<lume-node id="cube-face1" class="cubeSide front"  position={[0, 0, this.size.x/2]}  rotation="0 0 0"   size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face2" class="cubeSide back"   position={[0, 0, -this.size.x/2]} rotation="0 180 0" size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face3" class="cubeSide left"   position={[-this.size.x/2, 0, 0]} rotation="0 -90 0" size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face4" class="cubeSide right"  position={[this.size.x/2, 0, 0]}  rotation="0 90 0"  size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face5" class="cubeSide top"    position={[0, -this.size.x/2, 0]} rotation="-90 0 0" size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align="0.5 0.5 0.5"></lume-node>
			<lume-node id="cube-face6" class="cubeSide bottom" position={[0, this.size.x/2, 0]}  rotation="90 0 0"  size={[this.size.x, this.size.x, 0]} mount-point="0.5 0.5" align="0.5 0.5 0.5"></lume-node>
		</>
	)

	css = /* css */ `
        /* .cubeSide {background: deeppink;} */
        .front {background: url("/images/cube/front.svg");}
        .back {background: url("/images/cube/back.svg");}
        .left {background: url("/images/cube/left.svg");}
        .right {background: url("/images/cube/right.svg");}
        .top {background: url("/images/cube/top.svg");}
        .bottom {background: url("/images/cube/bottom.svg");}
    `
}
