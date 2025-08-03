import {html} from 'lume'
import {createMemo} from 'solid-js'
import {Visits} from '../imports/collections/Visits.js'
import {StudioSignups} from '../imports/collections/StudioSignups.js'
import {toSolidSignal} from '../utils.js'
import '../routes.js' // track page visits
import '../elements/login-ui.js'
import {Meteor} from 'meteor/meteor'

Meteor.subscribe('usersCount')

const meteorUser = toSolidSignal(() => Meteor.user())
const isAdmin = createMemo(() => meteorUser()?.profile?.isAdmin)
const visits = toSolidSignal(() => Visits.find({}).fetch())
const studioSignups = toSolidSignal(() => StudioSignups.find({}).fetch())
const usersCount = toSolidSignal(() => Counts.get('users'))

document.body.append(
	html`
		<div id="statsUI" class=${() => (isAdmin() ? '' : 'hidden')}>
			<h2>Page visits (total: ${() => visits().reduce((n, v) => n + v.visits, 0)}):</h2>
			${() =>
				visits()
					.sort((a, b) => b.visits - a.visits)
					.map(v => html` <div><b>${v.host ?? ''}${v.route}:</b> &#32; ${v.visits}</div> `)}

			<h2>Users: ${usersCount}</h2>

			<h2>Studio signups: (${() => studioSignups().length - 2})</h2>
			${() => studioSignups().map(s => html` <div>${s.email}</div> `)}
		</div>
	` as Node,
)

// Hide the loading cover
const loadingCover = document.getElementById('loadingCover')
loadingCover?.classList.add('invisible')
loadingCover?.addEventListener('transitionend', () => loadingCover.remove())
