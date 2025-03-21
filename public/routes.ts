import {Session} from 'meteor/session'
import {ReactiveVar} from 'meteor/reactive-var'
import {Meteor} from 'meteor/meteor'
import {effect} from './meteor-signals.js'

// We'll keep the title up to date once we add routing. For now it is just "Lume".
let appName = 'Lume'
const _appTitle = new ReactiveVar(appName)
export const appTitle = () => _appTitle.get()

// Track the url of the current page on route change. This is used to track
// visits to the page.

const _url = new ReactiveVar(new URL(location.href))
export const url = () => _url.get()

window.addEventListener('popstate', () => _url.set(new URL(location.href)))

const pushState = history.pushState
history.pushState = History.prototype.pushState = function (...args) {
	const ret = pushState.apply(this, args)
	_url.set(new URL(location.href))
	return ret
}

const replaceState = history.replaceState
history.replaceState = History.prototype.replaceState = function (...args) {
	const ret = replaceState.apply(this, args)
	_url.set(new URL(location.href))
	return ret
}

// Track which routes the user has already visited in local storage, that way we
// can count unique visits.

interface Visited {
	[host: string]: {
		[pathname: string]: boolean
	}
}

export const visited = () => Session.get('visited') as Visited
const setVisited = (visited: Visited) => Session.setPersistent('visited', visited)

if (!visited()) setVisited({})

// If the user hasn't visited the current page before, increment the page visits.
// For now we have only a root page.
effect(() => {
	url() // re-run on route change

	if (visited()[location.host]?.[location.pathname]) return

	setVisited({
		...visited(),
		[location.host]: {
			...(visited()[location.host] ?? {}),
			[location.pathname]: true,
		},
	})

	Meteor.call('visits.increment', location.href)
})
