import '../imports/routes'
import {defineElements} from 'lume'
import {App} from './App'

// tell LUME to define the default set of custom elements (all of them)
defineElements()

Tracker.autorun(() => {
	document.title = Session.get('appTitle')
})

// TODO move some demos to LUME examples.
// NOTE, we were previously displaying these demos on the old Infamous landing page.
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

	root.append(new App())
	// ReactDOM.render(<App />, root)
}
