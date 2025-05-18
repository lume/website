import {html, css, Element, element} from 'lume'
import {Meteor} from 'meteor/meteor'
import '../routes.js' // track page visits
import '../elements/login-ui.js'
import {toSolidSignal} from '../utils.js'

const username = toSolidSignal(() => Meteor.user()?.username ?? Meteor.user()?.emails?.[0].address ?? '')

@element('lume-create')
export class LumeCreate extends Element {
	template = () => html`
		<link rel="stylesheet" href="../entry.css" />

		<header>
		<h1>Lume Create</h1>

			<div class="spacer"></div>

			<!-- ------------------------------------------------------------------------------->
			<!-- ---- dark/light/auto theme switch --------------------------------------------->
			<!-- ------------------------------------------------------------------------------->
			<style>
				theme-switch {
					width: 20px;
					pointer-events: auto;
				}
			</style>

			<theme-switch></theme-switch>

			<!-- ------------------------------------------------------------------------------->
			<!-- ---- Login UI ----------------------------------------------------------------->
			<!-- ------------------------------------------------------------------------------->

			<login-ui></login-ui>
		</header>

		<main>
		<p>Hello${() => (username() ? ' ' + username() : '')}!</p>
		</main>
	`

	css = css`
		:host {
			width: 400px;
			height: 300px;

			pointer-events: auto;

			display: flex;
			flex-direction: column;
			padding: 10px;

			background: rgba(255, 255, 255, 0.3);
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}

		:host,
		* {
			box-sizing: border-box;
		}

		.spacer {
			flex-grow: 1;
		}

		header {
			/*outline: 1px solid red;*/
			display: flex;
			align-items: center;
			gap: 10px;

			h1 {
				display: inline-block;
				padding: 0;
				margin: 0;
			}
		}

		main {
			/*outline: 1px solid blue;*/
			flex-grow: 1;

			overflow: auto;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	`
}
