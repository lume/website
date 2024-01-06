import './routes.js'
import {Session} from 'meteor/session'
import {defineElements} from 'lume'
import {App} from './App.js'

defineElements()

Tracker.autorun(() => {
	document.title = Session.get('appTitle')
})

main()
function main() {
	const root = document.createElement('div')
	root.id = 'root' // needed for styling
	document.body.append(root)

	root.append(new App()) // continue: use custom element instead
}
