import {Node, mountPoint, element} from 'lume'

// TODO fix bug where setting Z rotation back to zero doesn't work (while X and Y are zero).

@element('x-cube')
export class Cube extends Node {
	root = this

	/** @param {any[]} args */
	constructor(...args) {
		super(...args)

		this.mountPoint = mountPoint([0.5, 0.5, 0.5])
	}

	set size(v) {
		console.log('SET SIZE!!!!!!', v)
		// keep it a cube.
		if (Array.isArray(v)) v[1] = v[2] = v[0]
		else v.y = v.z = v.x

		super.size = v
		console.log('RESULT!!!!!!', this.size)
	}
	get size() {
		return super.size
	}

	template = () => {
		// const props = {...this.props}
		// const size = props.size
		// delete props.size
		const size = this.size.x

		// prettier-ignore
		return (
            <>
            {/* <lume-node id="cube-node" ref="cubeContainer" {...props}> */}
                <lume-node id="cube-face1" class="cubeSide front"  position={[0, 0, size/2]}  rotation="0 0 0"   size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></lume-node>
                <lume-node id="cube-face2" class="cubeSide back"   position={[0, 0, -size/2]} rotation="0 180 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></lume-node>
                <lume-node id="cube-face3" class="cubeSide left"   position={[-size/2, 0, 0]} rotation="0 -90 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></lume-node>
                <lume-node id="cube-face4" class="cubeSide right"  position={[size/2, 0, 0]}  rotation="0 90 0"  size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></lume-node>
                <lume-node id="cube-face5" class="cubeSide top"    position={[0, -size/2, 0]} rotation="-90 0 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></lume-node>
                <lume-node id="cube-face6" class="cubeSide bottom" position={[0, size/2, 0]}  rotation="90 0 0"  size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></lume-node>
            {/* </lume-node> */}
            </>
        )
	}

	// componentDidMount() {
	// 	this.props.containerRef && this.props.containerRef(this.refs.cubeContainer)
	// }

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
