import {html, css, Element, element} from 'lume'
import {Meteor} from 'meteor/meteor'
import '../routes.js' // track page visits
import '../elements/BlazeComponent.js'
import {toSolidSignal} from '../utils.js'

const username = toSolidSignal(() => Meteor.user()?.username ?? Meteor.user()?.emails?.[0].address ?? '')

@element('lume-create')
export class LumeCreate extends Element {
	hasShadow = false

	template = () => html`
		<h1>Lume Create</h1>
		<p>Hello${() => (username() ? ' ' + username() : '')}!</p>
	`

	css = css`
		:host {
			width: 400px;
			height: 300px;

			overflow: auto;
			pointer-events: auto;
			box-sizing: border-box;
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 20px;
		}
	`
}
