import * as React from 'react'

// TODO fix bug where setting Z rotation back to zero doesn't work (while X and Y are zero).

export class Cube extends React.Component {
	render = () => {
		const props = {...this.props}
		const size = props.size
		delete props.size

		// prettier-ignore
		return (
            <i-node id="cube-node" ref="cubeContainer" {...props}>
                <i-node id="cube-face1" style={{...s.cubeSide, ...s.front}}  position={[0, 0, size/2]}  rotation="0 0 0"   size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node id="cube-face2" style={{...s.cubeSide, ...s.back}}   position={[0, 0, -size/2]} rotation="0 180 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node id="cube-face3" style={{...s.cubeSide, ...s.left}}   position={[-size/2, 0, 0]} rotation="0 -90 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node id="cube-face4" style={{...s.cubeSide, ...s.right}}  position={[size/2, 0, 0]}  rotation="0 90 0"  size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node id="cube-face5" style={{...s.cubeSide, ...s.top}}    position={[0, -size/2, 0]} rotation="-90 0 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node id="cube-face6" style={{...s.cubeSide, ...s.bottom}} position={[0, size/2, 0]}  rotation="90 0 0"  size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
            </i-node>
        )
	}

	componentDidMount() {
		this.props.containerRef && this.props.containerRef(this.refs.cubeContainer)
	}
}

/** @type {{[k: string]: React.CSSProperties}} */
const styles = {
	cubeSide: {
		// background: 'deeppink',
	},

	// prettier-ignore
	...{
        front: { background: 'url(/images/cube/front.svg)' },
        back: { background: 'url(/images/cube/back.svg)' },
        left: { background: 'url(/images/cube/left.svg)' },
        right: { background: 'url(/images/cube/right.svg)' },
        top: { background: 'url(/images/cube/top.svg)' },
        bottom: { background: 'url(/images/cube/bottom.svg)' },
    }
}

// alias for styles
const s = styles
