import {css, Element, element, type ElementAttributes} from '@lume/element'
import html from 'solid-js/html'
import {createMutable} from 'solid-js/store'
import {Meteor} from 'meteor/meteor'
import '../routes.js' // track page visits
import '../elements/login-ui.js'
import '../elements/show-when.js'
import './studio/LumeStudio.js'
import './SceneList.js'
import {toSolidSignal} from '../utils.js'
import {signal} from 'lume'
import {
	type SceneElementNode,
	type UserSceneDocument,
	exampleScenes,
} from '../../imports/collections/scenes/UserScenes.js'
import {effect} from '../meteor-signals.js'
import type {Tracker} from 'meteor/tracker'
import {url} from '../routes.js'

const username = toSolidSignal(() => Meteor.user()?.username ?? Meteor.user()?.emails?.[0].address ?? '')
const state = ((window as any).state = createMutable({route: 'dash' as 'dash' | 'element'}))

export type LumeCreateAttributes = keyof {} // no attributes yet

function getSceneIdFromUrl(pathname: string) {
	const arr = pathname.split('/')
	if (arr.length < 3) return ''

	return arr[2]
}

function getExampleScenes() {
	const exampleSceneArr: UserSceneDocument[] = []
	for (const key in exampleScenes) {
		exampleSceneArr.push(exampleScenes[key])
	}
	return exampleSceneArr
}

@element
export class LumeCreate extends Element {
	static readonly elementName = 'lume-create'

	@signal sceneNodes: SceneElementNode[] = []

	@signal url?: URL

	/**
	 * If a valid scene ID is in the URL, this will be set to its document and the studio will be
	 * rendered.
	 */
	@signal studioScene?: UserSceneDocument

	@signal userScenes: string[] = []

	#urlEffect?: Tracker.Computation

	connectedCallback() {
		super.connectedCallback()

		this.#urlEffect = effect(() => {
			const currentUrl = url()

			const sceneId = getSceneIdFromUrl(currentUrl.pathname)

			if (sceneId === '') {
				Meteor.call('getUserScenes', (err: any, data: any) => {
					if (err) {
						console.log(JSON.stringify(err, undefined, 4))
					} else {
						this.userScenes = data

						this.#stopLoading()
					}
				})
			} else {
				Meteor.call('getUserSceneById', sceneId, (err: any, data: any) => {
					if (err) {
						console.log(JSON.stringify(err, undefined, 4))
						return
					}

					if (!data) return

					state.route = 'element'

					this.studioScene = data

					this.#stopLoading()
				})
			}
		})
	}

	// Unsure if this is needed but I don't think Meteor trackers are cleaned up within Lume.
	disconnectedCallback() {
		this.#urlEffect?.stop()
	}

	#stopLoading() {
		// Hide the loading cover
		const loadingCover = document.getElementById('loadingCover')
		loadingCover?.classList.add('invisible')
		loadingCover?.addEventListener('transitionend', () => loadingCover.remove())
	}

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
						content=${() => () => html`
							<div style="display: flex; flex-direction: column;">
								<h2>Your scenes</h2>
								<show-when
									condition=${() => this.userScenes.length}
									content=${() => () => html`<scene-list scenes=${() => this.userScenes}></scene-list>`}
									fallback=${() => () =>
										html`<p>No scenes yet. Open an example scene in the editor to get started.</p>`}
								></show-when>

								<h2>Example scenes</h2>
								<scene-list scenes=${getExampleScenes()}></scene-list>
							</div>
						`}
						fallback=${() => () =>
							html`<show-when
								condition=${() => this.studioScene}
								content=${() => () =>
									html`<lume-studio
										scene=${() => this.studioScene}
										scene-nodes=${() => this.studioScene?.nodes}
									></lume-studio>`}
							></show-when>`}
					></show-when>
				`}
				fallback=${() => () => html` <p>Login <span style="rotate: 70deg; display: inline-block;">👆</span></p> `}
			></show-when>
		</main>
	`

	css = css/*css*/ `
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
			background: rgba(0, 0, 0, 0.3);
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
