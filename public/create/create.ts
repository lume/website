import {css, Element, element, type ElementAttributes} from '@lume/element'
import html from 'solid-js/html'
import {createMutable} from 'solid-js/store'
import {Meteor} from 'meteor/meteor'
import '../routes.js' // track page visits
import '../elements/login-ui.js'
import '../elements/for-each.js'
import '../elements/show-when.js'
import {toSolidSignal} from '../utils.js'

const username = toSolidSignal(() => Meteor.user()?.username ?? Meteor.user()?.emails?.[0].address ?? '')
const state = ((window as any).state = createMutable({route: 'dash' as 'dash' | 'element'}))

export type LumeCreateAttributes = '_' // no attributes yet

@element
export class LumeCreate extends Element {
	static readonly elementName = 'lume-create'

	_?: undefined // no attributes yet

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
			<show-when
				condition=${() => (console.log('username:', !!username()), !!username())}
				content=${() => () => html`
					<show-when
						condition=${() => state.route === 'dash'}
						content=${() => html`
							<for-each
								items=${() => ['box', 'sphere', 'gallery']}
								content=${() => (n: number) => html`
									<div class="card" onclick=${() => (state.route = 'element')}>
										<img src="/images/LUME5.png" />
										<p>${n}</p>
									</div>
								`}
							></for-each>
						`}
					></show-when>

					<show-when
						condition=${() => state.route === 'element'}
						content=${() => () => html`
							<div>
								<h1>
									scene
									<a onclick=${() => (state.route = 'dash')}>⮜ Back</a>
								</h1>
							</div>
						`}
					></show-when>
				`}
				fallback=${() => () => html` <p>Login <span style="rotate: 70deg; display: inline-block;">👆</span></p> `}
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
			[LumeCreate.elementName]: ElementAttributes<LumeCreate, LumeCreateAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[LumeCreate.elementName]: LumeCreate
	}
}
