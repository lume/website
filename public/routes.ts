import {Session} from 'meteor/session'
import {effect} from './meteor-signals.js'
import {ReactiveVar} from 'meteor/reactive-var'

let appName = 'LUME'
const _appTitle = new ReactiveVar(appName)
export const appTitle = () => _appTitle.get()

const _url = new ReactiveVar(new URL(location.href))
export const url = () => _url.get()

const _href = new ReactiveVar(_url.get().href)
export const href = () => _href.get()

// TODO make it a memo
effect(() => _href.set(_url.get().href))

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

declare module 'meteor/session' {
	namespace Session {
		function setPersistent(key: string, value: string | object): void
	}
}

export const visited = () => Session.get('visited')
const setVisited = visited => Session.setPersistent('visited', visited)

if (!visited()) setVisited({})

// If the user hasn't visited the current page before, increment the page visits.
// For now we have only a root page.
effect(() => {
	href() // re-run on route change

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
