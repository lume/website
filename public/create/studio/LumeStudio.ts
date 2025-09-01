import {css, html, Element, element, signal, Scene, jsonAttribute, Element3D} from 'lume'

import './ui/sceneview/SceneView.js'
import './ui/create/CreateStudioElement.js'
import './elements/StudioGridHelper.js'
import './elements/StudioTransformControls.js'

import {SceneManager} from './SceneManager.js'
import {
	StudioElement,
	StudioElementCreateEvent,
	StudioElementHoverEvent,
	StudioElementRemoveEvent,
	StudioElementSelectEvent,
} from './StudioElement.js'
import {OutlineEffect} from './effects/OutlineEffect.js'

@element
export class LumeStudio extends Element {
	static readonly elementName = 'lume-studio'

	hasShadow = false

	@jsonAttribute sceneNodes?: object

	@signal lumeScene?: Scene

	@signal sceneHead?: StudioElement

	@signal selectedElement?: StudioElement

	sceneManager = new SceneManager()

	#outlineEffect?: OutlineEffect

	#handleRemove = (ev: StudioElementRemoveEvent) => {
		ev.element.remove()

		if (this.sceneHead) this.#handleSelect(new StudioElementSelectEvent(this.sceneHead, true))

		this.sceneHead = this.sceneHead
	}

	#handleSelect = (ev: StudioElementSelectEvent) => {
		ev.element.setSelected(ev.selected)

		if (!this.#outlineEffect) return

		if (this.selectedElement) this.selectedElement.setSelected(false)

		if (ev.selected) {
			this.selectedElement = ev.element

			this.selectedElement.setSelected(true)

			if (ev.element.lumeElement && ev.element.lumeElement.tagName !== 'LUME-SCENE') {
				this.#outlineEffect.enable(ev.element.lumeElement as Element3D)
			}
		} else {
			this.#outlineEffect.disable()

			this.selectedElement = undefined
		}
	}

	#handleHover = (ev: StudioElementHoverEvent) => {
		ev.element.setHovered(ev.hovered)
	}

	#handleCreate = (ev: StudioElementCreateEvent) => {
		if (!this.sceneHead) return

		const el = this.sceneManager.createElement(ev.node, this.sceneHead)
		if (!el) return

		// Select newly created element.
		this.#handleSelect(new StudioElementSelectEvent(el, true))

		this.sceneHead = this.sceneHead
	}

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.sceneNodes || !this.lumeScene) return

			this.sceneManager = new SceneManager()
			this.sceneManager.scene = this.lumeScene
			this.sceneManager.updateScene((this.sceneNodes as any).nodes)

			if (this.sceneManager.elements.length > 0) {
				this.sceneHead = this.sceneManager.elements[0]
			}
		})

		this.createEffect(() => {
			if (!this.lumeScene?.three || !this.lumeScene?.camera?.three) return

			// TODO: How do we know when scene has everything ready? If we create the effect as
			// soon as the scene/camera three is available, it looks very low res.
			setTimeout(() => {
				this.#outlineEffect = new OutlineEffect(this.lumeScene!)
			}, 20)
		})
	}

	template = () => html`
		<div style="width: 100%; height: 100%;">
			<lume-scene
				ref=${(e: Scene) => {
					this.lumeScene = e

					this.sceneManager.scene = e
				}}
				webgl
				style="position: absolute; width: 100%; height: 100%; background: #696969;"
			>
				<studio-grid-helper></studio-grid-helper>
				<studio-transform-controls
					studio-element=${() => {
						if (!this.selectedElement?.lumeElement || !(this.selectedElement.lumeElement instanceof Element3D)) return

						return this.selectedElement
					}}
				></studio-transform-controls>
			</lume-scene>
			<div style="position: absolute;">
				<create-studio-element
					style="display: flex; margin-bottom: 0.15rem;"
					onstudio-element-create=${(ev: StudioElementCreateEvent) => {
						this.#handleCreate(ev)
					}}
				></create-studio-element>
				<scene-view
					style="resize: horizontal; width: 12vw; overflow: auto;"
					scene-element=${() => this.sceneHead}
					onstudio-element-remove=${(ev: StudioElementRemoveEvent) => {
						this.#handleRemove(ev)
					}}
					onstudio-element-select=${(ev: StudioElementSelectEvent) => {
						this.#handleSelect(ev)
					}}
					onstudio-element-hover=${(ev: StudioElementHoverEvent) => {
						this.#handleHover(ev)
					}}
				></scene-view>
			</div>
		</div>
	`

	css = css`
		:host {
			width: 100%;
			--lume-primary: rgba(10, 58, 221, 1);
			--lume-text-color: white;
			--lume-secondary: color-mix(in srgb, deeppink 80%, white 20%);
			--lume-danger: red;
			--studio-panel-padding-x: 5px;
			--studio-panel-padding-y: 5px;
			--studio-button-hover-color: rgba(114, 138, 214, 1);
			--studio-button-content-hover-color: rgba(114, 138, 214, 1);
		}

		.studio-panel {
			height: 100%;
			overflow: auto;
			background: var(--lume-primary);
			color: var(--lume-text-color);
			border-radius: 5px;
			border: 1px black solid;
			padding: var(--studio-panel-padding-y) var(--studio-panel-padding-x);
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
		}

		.studio-container {
			background: var(--lume-primary);
			color: var(--lume-text-color);
			border-radius: 5px;
			border: 1px black solid;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
		}

		.studio-button {
			display: flex;
			align-items: center;
			cursor: pointer;
			border-radius: 3px;
			transition: background 0.2s ease;
		}

		.studio-button:hover {
			background: var(--studio-button-hover-color);
		}
		/* Disable inner hover when outer is hovered (doesn't work in Firefox) */
		/* :has(.studio-button:hover):hover .studio-button {
			background: initial;
		} */

		.studio-element-list-item {
			display: flex;
			align-items: center;
			margin-bottom: 0.25rem;
			cursor: pointer;
		}

		.save-scene-button {
			height: 100%;
			overflow: auto;
			background: var(--lume-primary);
			color: var(--lume-text-color);
			border-radius: 5px;
			border: 1px black solid;
			padding: var(--studio-panel-padding-y) var(--studio-panel-padding-x);
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
		}

		.save-scene-button:hover {
			/* background: #f0f0f08a; */
			background: rgb(151, 160, 172);
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}

		:host,
		* {
			box-sizing: border-box;
		}
	`
}
