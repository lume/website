import {css, Element, element, type ElementAttributes} from '@lume/element'
import html from 'solid-js/html'
import {createMutable} from 'solid-js/store'
import {Meteor} from 'meteor/meteor'
import '../routes.js' // track page visits
import '../elements/login-ui.js'
import '../elements/for-each.js'
import '../elements/show-when.js'
import './studio/LumeStudio.js'
import {toSolidSignal} from '../utils.js'
import {signal} from 'lume'
import type {SceneElementNode} from './studio/SceneManager.js'

const username = toSolidSignal(() => Meteor.user()?.username ?? Meteor.user()?.emails?.[0].address ?? '')
const state = ((window as any).state = createMutable({route: 'dash' as 'dash' | 'element'}))

export type LumeCreateAttributes = keyof {} // no attributes yet

// Having `nodes` as a property is just to be able to pass as JSON
const exampleScene: {nodes: SceneElementNode[]} = {
	nodes: [
		{
			tagName: 'lume-camera-rig',
			attributes: [
				{name: 'alignPoint', val: '0.5 0.5 0.5'},
				{name: 'mountPoint', val: '0.5 0.5 0.5'},
				{name: 'distance', val: '50'},
				{name: 'minDistance', val: '5'},
				{name: 'dollySpeed', val: '5'},
				{name: 'dynamicDolly', val: true},
				{name: 'maxDistance', val: '5000'},
			],
		},
		{
			tagName: 'lume-point-light',
			attributes: [
				{name: 'intensity', val: '750'},
				{name: 'alignPoint', val: '0.5 0.5 0.5'},
				{name: 'mountPoint', val: '0.5 0.5 0.5'},
				{name: 'position', val: '100 -75 120'},
				{name: 'color', val: 'pink'},
			],
		},
		{
			tagName: 'lume-ambient-light',
			attributes: [{name: 'intensity', val: '0.4'}],
		},
		{
			tagName: 'lume-box',
			attributes: [
				{name: 'alignPoint', val: '0.5 0.5 0.5'},
				{name: 'mountPoint', val: '0.5 0.5 0.5'},
				{name: 'position', val: '0 0 0'},
				{name: 'color', val: 'blue'},
				{name: 'size', val: '5 5 5'},
				{name: 'opacity', val: '0.5'},
				{name: 'has', val: 'phong-material'},
			],
			children: [
				{
					tagName: 'lume-box',
					attributes: [
						{name: 'alignPoint', val: '0.5 0.5 0.5'},
						{name: 'mountPoint', val: '0.5 0.5 0.5'},
						{name: 'position', val: '0 0 0'},
						{name: 'color', val: 'red'},
						{name: 'size', val: '5 5 5'},
						{name: 'opacity', val: '0.5'},
						{name: 'has', val: 'phong-material'},
					],
				},
			],
		},
		{
			tagName: 'lume-box',
			attributes: [
				{name: 'alignPoint', val: '0.5 0.5 0.5'},
				{name: 'mountPoint', val: '0.5 0.5 0.5'},
				{name: 'position', val: '20 0 0'},
				{name: 'color', val: 'blue'},
				{name: 'size', val: '5 5 5'},
				{name: 'has', val: 'phong-material'},
			],
		},
		{
			tagName: 'lume-sphere',
			attributes: [
				{name: 'alignPoint', val: '0.5 0.5 0.5'},
				{name: 'mountPoint', val: '0.5 0.5 0.5'},
				{name: 'position', val: '-20 0 0'},
				{name: 'color', val: 'green'},
				{name: 'size', val: '5 5 5'},
				{name: 'has', val: 'phong-material'},
			],
		},
	],
}

@element
export class LumeCreate extends Element {
	static readonly elementName = 'lume-create'

	@signal sceneNodes = ''

	connectedCallback() {
		super.connectedCallback()
		// Get the scene's node representation from somewhere here and set `sceneNodes`.

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
						content=${() => () => html`<lume-studio scene-nodes="${exampleScene}"></lume-studio>`}
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
