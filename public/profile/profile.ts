import {css, element, Element, type ElementAttributes} from '@lume/element'
import {createEffect, html, signal} from 'lume'
import {Meteor} from 'meteor/meteor'
import '../elements/login-ui.js'
import '../elements/show-when.js'
import {toSolidSignal} from '../utils.js'

export type LumeUserProfileAttributes = '_' // no attributes yet

const elName = 'lume-user-profile'

const currentUser = toSolidSignal(() => Meteor.user())

@element
export class LumeUserProfile extends Element {
	static readonly elementName = elName

	_?: undefined // no attributes yet

	@signal editing = false

	@signal username = ''

	connectedCallback() {
		super.connectedCallback()

		createEffect(() => {
			const user = currentUser()
			if (!user) return

			this.username = user.username ?? ''
		})
	}

	#saveChanges() {
		Meteor.call('updateUsername', this.username)

		this.editing = false
	}

	#cancel() {
		this.username = ''

		this.editing = false
	}

	template = () => html`
		<link rel="stylesheet" href="../entry.css" />

		<header>
			<h1>Profile</h1>

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
			<show-when
				condition=${() => this.editing}
				content=${() => () => html`
					<div><input type="text" value=${currentUser()?.username ?? ''} onchange="${(ev: any) => {
						// TODO Verify username?
						this.username = ev.target.value
					}}"></input></div>
					<div><button onclick="${() => this.#saveChanges()}">Save</button><button onclick="${() => this.#cancel()}">Cancel</button></div>
					`}
				fallback=${() =>
					html`<div style="display: flex; justify-content: space-between;">
						<div>${() => currentUser()?.username ?? ''}</div>
						<div>
							<button onclick="${() => (this.editing = true)}">Edit profile</button>
						</div>
					</div>`}
			></show-when>
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

		header {
			/*outline: 1px solid red;*/
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;

			h1 {
				display: inline-block;
				padding: 0;
				margin: 0;
			}
		}

		main {
			/*outline: 1px solid blue;*/
			overflow: auto;
			gap: 20px;

			.card {
				width: 200px;
				height: 200px;
				position: relative;
				cursor: pointer;

				img {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				p {
					position: absolute;
					--pad: 5px;
					bottom: var(--pad);
					left: var(--pad);
				}
			}

			h1 a {
				cursor: pointer;
			}
		}
	`
}

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			[elName]: ElementAttributes<LumeUserProfile, LumeUserProfileAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[elName]: LumeUserProfile
	}
}
