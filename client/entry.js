import * as React from 'react'
import * as ReactDOM from 'react-dom'
import '../imports/routes'
import {Motor, useDefaultNames} from 'infamous'

// tell infamous to define the default set of custom elements (all of them)
useDefaultNames()

Tracker.autorun(function() {
	document.title = Session.get('appTitle')
})

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

// copied from https://codepen.io/trusktr/live/JMMXPB
class MorphingColorSpiral extends React.Component {
	constructor() {
		super()

		this.state = {
			rotation: 0,
		}

		const nodes = Array(400).fill(0)

		this.staticInnerScene = (
			<i-scene id="spiral-inner-scene">
				{nodes.map((n, i) => (
					<i-node key={i} size="0 0 0" align="0.5 0.5" rotation={[0, 0, i * 10]}>
						<i-node
							size={[50 - (i % 50), 50 - (i % 50), 0]}
							mount-point="0.5 0.5"
							position={[0, i * 2, 0]}
							style={{
								background: `hsl( ${(i * 2) % 360}, 90%, 78%)`,
								borderRadius: `${i % 50}px`,
							}}
						></i-node>
					</i-node>
				))}
			</i-scene>
		)
	}

	render() {
		return (
			<i-scene id="spiral-outer-scene" style={{background: '#333'}}>
				<i-node size="1630 1630" align="0.5 0.5" mount-point="0.5 0.5" rotation={[0, 0, this.state.rotation]}>
					{this.staticInnerScene}
				</i-node>
			</i-scene>
		)
	}

	componentDidMount() {
		Motor.addRenderTask(() => {
			this.setState({
				rotation: this.state.rotation - 9.8,
			})
		})
	}
}

main()
function main() {
	const footerHeight = 44.5

	class App extends React.Component {
		render() {
			return (
				<i-scene ref="scene">
					<i-node size-mode="proportional literal" size="1 1" ref="titleArea">
						<i-node size-mode="proportional proportional" size="1 1">
							<MorphingColorSpiral />
						</i-node>

						<i-node
							class="gradient-background"
							size-mode="proportional proportional"
							size="1 1"
							opacity="0.85"
						></i-node>

						<i-node
							id="titleNode"
							class="centerText"
							size-mode="proportional literal"
							size="1 50"
							align="0 0.5"
							mount-point="0 0.5"
						>
							<h1>INFAMOUS</h1>
						</i-node>
					</i-node>

					<i-node
						id="footerNode"
						class="centerText"
						size-mode="proportional literal"
						size={`1 ${footerHeight}`}
						align="0 1"
						mount-point="0 1"
					>
						<i-node
							class="centerText"
							size-mode="proportional literal"
							size="0.333333 20"
							align="0 0.5"
							mount-point="0 0.5"
						>
							<a href="http://forums.infamous.io">Discussion</a>
						</i-node>

						<i-node
							class="centerText"
							size-mode="proportional literal"
							size="0.333333 20"
							align="0.333333 0.5"
							mount-point="0 0.5"
						>
							<a href="/docs/index.html">Docs</a>
						</i-node>

						<i-node
							class="centerText"
							size-mode="proportional literal"
							size="0.333333 20"
							align="0.666666 0.5"
							mount-point="0 0.5"
						>
							<a href="http://github.com/trusktr/infamous">GitHub</a>
						</i-node>
					</i-node>
				</i-scene>
			)
		}

		updateSize() {
			const {titleArea, scene} = this.refs
			const sceneHeight = scene.calculatedSize.y
			let newHeight = sceneHeight - footerHeight

			// TODO make a helpful warning about negative sizes in lume
			if (newHeight < 0) {
				console.warn('Size can not be negative. Setting it to zero.')
				newHeight = 0
			}

			titleArea.size.y = newHeight
		}

		componentDidMount() {
			this.updateSize()
			this.refs.scene.on('sizechange', () => this.updateSize())
		}
	}

	const root = document.createElement('div')
	root.id = 'root' // needed for styling
	document.body.append(root)

	ReactDOM.render(<App />, root)
}
