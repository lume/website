import * as React from 'react'
import * as ReactDOM from 'react-dom'
import '../imports/routes'
import {useDefaultNames} from 'lume'
import {App} from './App'

// tell LUME to define the default set of custom elements (all of them)
useDefaultNames()

Tracker.autorun(() => {
	document.title = Session.get('appTitle')
})

// TODO move some demos to LUME examples.
const demos = _.shuffle([
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

main()
function main() {
	const root = document.createElement('div')
	root.id = 'root' // needed for styling
	document.body.append(root)

	ReactDOM.render(<App />, root)
}
