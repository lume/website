import './routes.js'
import {Session} from 'meteor/session'
import {Tracker} from 'meteor/tracker'
import {App} from './App.js'
import {Visits} from './imports/collections/Visits.js'

declare module 'meteor/session' {
	namespace Session {
		function setPersistent(key: string, value: string): void
	}
}

await new Promise(resolve => Meteor.startup(resolve))

Tracker.autorun(() => {
	document.title = Session.get('appTitle')
})

Tracker.autorun(() => {
	if (!Visits.find({}).count()) return
	const route = location.pathname
	console.log('number of visits docs:', Visits.find({}).count())
	const visits = Visits.findOne({route})
	console.log('visits', visits?.visits)
})

// If the user hasn't visited the current page before, increment the page visits.
// For now we have only a root page.
Tracker.autorun(() => {
	if (Session.get('visited')) return

	Session.setPersistent('visited', 'true')
	Meteor.call('visits.increment', location.pathname)
})

const root = document.createElement('div')
root.id = 'root' // needed for styling
document.body.append(root)

root.append(new App())
