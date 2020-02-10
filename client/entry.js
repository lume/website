import * as React from 'react'
import * as ReactDOM from 'react-dom'
import '../imports/routes'
import {Motor, useDefaultNames} from 'infamous'
import TWEEN from '@tweenjs/tween.js'

// tell infamous to define the default set of custom elements (all of them)
useDefaultNames()

Tracker.autorun(() => {
	document.title = Session.get('appTitle')
})

// TODO find a place for these demos
const demos = _.shuffle([
	//'//dl.dropboxusercontent.com/u/2790629/famin/demo2/index.html?50', // FIXME in Safari 9, or remake
	//'http://devmagnet.net/boxer/demo/examples/rotate-180-nodes/', // no HTTPS, or remake
	//'//dl.dropboxusercontent.com/u/2790629/famin/demo1/index.html?50', // FIXME in Safari 9, or remake
	//'//trusktr.io/clobe', // JSS broken, FIXME
	//'//jsfiddle.net/trusktr/ymonmo70/15/embedded/result,js,html,css', // DOM car, FIXME in firefox
	//'//trusktr.io/pyramids', // WIP

	'//trusktr.io/rippleFlip',
	'//trusktr.io/geometricRotation',
	'//trusktr.io/worms',
	'//trusktr.io/webglFundamentals',
	'//trusktr.io/polydance',
	'//trusktr.io/flipDiagonal',
	'//trusktr.io/randomBits',
	'//trusktr.io/rainbowTriangles',
])

// TODO fix bug where setting Z rotation back to zero doesn't work (while X and Y are zero).

class Cube extends React.Component {
	render = () => {
		const props = {...this.props}
		const size = props.size
		delete props.size

		// prettier-ignore
		return (
            <i-node ref="cubeContainer" {...props}>
                <i-node style={{...s.cubeSide, ...s.front}}  position={[0, 0, size/2]}  rotation="0 0 0"   size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node style={{...s.cubeSide, ...s.back}}   position={[0, 0, -size/2]} rotation="0 180 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node style={{...s.cubeSide, ...s.left}}   position={[-size/2, 0, 0]} rotation="0 -90 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node style={{...s.cubeSide, ...s.right}}  position={[size/2, 0, 0]}  rotation="0 90 0"  size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node style={{...s.cubeSide, ...s.top}}    position={[0, -size/2, 0]} rotation="-90 0 0" size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
                <i-node style={{...s.cubeSide, ...s.bottom}} position={[0, size/2, 0]}  rotation="90 0 0"  size={[size, size, 0]} mount-point="0.5 0.5" align="0.5 0.5"></i-node>
            </i-node>
        )
	}

	componentDidMount() {
		this.props.containerRef && this.props.containerRef(this.refs.cubeContainer)
	}
}

class App extends React.Component {
	state = {
		cubeRotation: 0,
	}

	componentDidMount() {
		Motor.addRenderTask(() => {
			const logo = this.refs.logo
			if (logo) logo.rotation.y++
		})
	}

	containerRef = cubeNode => {
		const tween = new TWEEN.Tween({r: 0})

		Motor.addRenderTask(t => {
			cubeNode.rotation.y++
		})
	}

	componentDidMount() {}

	render = () => (
		<i-scene ref="scene">
			<i-node size-mode="proportional proportional" size="1 1 0">
				<i-node headerBar size-mode="proportional literal" size="1 148 0">
					<div
						style={{
							display: 'flex',
							height: '100%',
							alignItems: 'center',
							paddingLeft: 112,
							paddingRight: 132,
						}}
					>
						<img
							src="/images/logo.svg"
							style={{
								width: 40,
								height: 40,
								objectFit: 'fill',

								// push everything else to the right side of the header
								marginRight: 'auto',
							}}
						/>

						<a style={s.menuLink} href="https://infamous.io/docs/index.html">
							Documentation
						</a>
						<a style={s.menuLink} href="https://infamous.io/docs/examples.html">
							Examples
						</a>
						<a style={s.menuLink} href="https://github.com/infamous/infamous">
							GitHub
						</a>
					</div>
				</i-node>

				<i-node
					wordmark
					size-mode="proportional proportional"
					size="0.50 0 0"
					mount-point="0.5 0.5"
					align="0.5 0.5"
				>
					<img
						src="/images/logo-wordmark.svg"
						style={{
							transform: 'translateY(-50%)',
							width: '100%',
							height: 'auto',
							objectFit: 'fill',
						}}
					/>
				</i-node>

				<Cube
					containerRef={this.containerRef}
					size="200"
					align="0.5 0.5"
					position="0 0 -200"
					rotation="45 45 45"
				/>
			</i-node>
		</i-scene>
	)
}

/** @type {{[k: string]: React.CSSProperties}} */
const styles = {
	menuLink: {
		textTransform: 'uppercase',
		marginLeft: 91,
		letterSpacing: '0.165em',
		color: 'white',
		transform: 'translateY(15px)',
	},

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

main()
function main() {
	const root = document.createElement('div')
	root.id = 'root' // needed for styling
	document.body.append(root)

	ReactDOM.render(<App />, root)
}
