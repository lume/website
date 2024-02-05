import './routes.js'
import {Session} from 'meteor/session'
import {Tracker} from 'meteor/tracker'
import {App} from './App.js'

Tracker.autorun(() => {
	document.title = Session.get('appTitle')
})

main()
function main() {
	const root = document.createElement('div')
	root.id = 'root' // needed for styling
	document.body.append(root)

	root.append(new App())
}
