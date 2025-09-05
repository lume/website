import {css, html, Element, element, signal, Scene, Element3D, eventAttribute, attribute} from 'lume'

import './ui/sceneview/SceneView.js'
import './ui/create/CreateStudioElement.js'
import './ui/StudioButton.js'
import './ui/file/StudioFileMenu.js'

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
import type {SceneElementNode, UserSceneDocument} from '../../../imports/collections/scenes/UserScenes.js'

import type {CreateSceneEvent, SaveSceneAsEvent} from './ui/file/SceneSelectMenu.js'
import {Meteor} from 'meteor/meteor'
import {toSolidSignal} from '../../utils.js'

class StudioSceneChangeEvent extends Event {
	sceneNode: SceneElementNode

	constructor(sceneNode: SceneElementNode) {
		super('studio-scene-change')

		this.sceneNode = sceneNode
	}
}

class StudioSaveSceneEvent extends Event {
	sceneNode: SceneElementNode

	constructor(sceneNode: SceneElementNode) {
		super('studio-save-scene')

		this.sceneNode = sceneNode
	}
}

function saveScene(scene: UserSceneDocument, callback?: () => void) {
	if (!scene._id) {
		console.error('Attempted to save scene with unknown id.')

		return
	}

	Meteor.call('updateUserScene', scene, (err: any, _data: any) => {
		callback?.()

		if (err) {
			console.log(JSON.stringify(err, undefined, 4))

			return
		}
	})
}

function saveSceneAs(targetSceneId: string, sourceScene: UserSceneDocument, callback?: () => void) {
	// Saving scene as another scene should keep the original `_id`, `dateCreated`, and `name`.
	// If the user wants to change the name while saving as, they should "save as" first (transfer
	// one scene's nodes to another), THEN rename the scene, and clicking "save".

	// TODO: Maybe decide whether `dateCreated` be transferred or not.

	const mergedScene = {...sourceScene, _id: targetSceneId}

	delete mergedScene.name
	delete mergedScene.dateCreated

	Meteor.call('updateUserScene', mergedScene, (err: any, _data: any) => {
		callback?.()

		if (err) {
			console.log(JSON.stringify(err, undefined, 4))

			return
		}
	})
}

function createScene(scene: UserSceneDocument, callback?: () => void) {
	Meteor.call('createUserScene', scene, (err: any, _data: any) => {
		callback?.()

		if (err) {
			console.log(JSON.stringify(err, undefined, 4))

			return
		}
	})
}

const user = toSolidSignal(() => Meteor.user())

@element
export class LumeStudio extends Element {
	static readonly elementName = 'lume-studio'

	hasShadow = false

	@attribute scene?: UserSceneDocument

	@eventAttribute onstudioSceneChange = (_ev: StudioSceneChangeEvent) => {}

	@eventAttribute onstudioSaveScene = (_ev: StudioSaveSceneEvent) => {}

	/**
	 * Currently only used for when saving the scene.
	 */
	@signal isLoading = false

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

		if (this.selectedElement) this.selectedElement.setSelected(false)

		if (!this.#outlineEffect) return

		if (ev.selected) {
			this.selectedElement = ev.element

			this.selectedElement.setSelected(true)

			if (ev.element.lumeElement) {
				if (ev.element.lumeElement.tagName !== 'LUME-SCENE') {
					this.#outlineEffect.enable(ev.element.lumeElement as Element3D)
				} else {
					this.#outlineEffect.disable()
				}
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
			if (!this.scene || !this.lumeScene) return

			this.sceneManager = new SceneManager()
			this.sceneManager.scene = this.lumeScene
			this.sceneManager.updateScene(this.scene.nodes ?? [])

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
			}, 30)
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
				<studio-file-menu
					is-own-scene=${() => {
						return this.scene?.userId && this.scene.userId === user()?._id
					}}
					onsave-scene=${() => {
						if (!this.scene) return

						// Depending on load speeds, it may flicker so for now this is disabled.
						/* this.isLoading = true */

						saveScene(this.scene, () => {
							this.isLoading = false
						})
					}}
					onsave-scene-as=${(ev: SaveSceneAsEvent) => {
						if (!ev.scene._id || !this.scene) return

						/* this.isLoading = true */

						saveSceneAs(ev.scene._id, this.scene, () => {
							this.isLoading = false
						})
					}}
					oncreate-scene=${(ev: CreateSceneEvent) => {
						if (!this.scene) return

						/* this.isLoading = true */

						createScene({name: ev.params.name, nodes: this.scene.nodes}, () => {
							this.isLoading = false
						})
					}}
				></studio-file-menu>
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
		<show-when
			condition=${() => this.isLoading}
			content=${() => () =>
				html`<div id="loadingCover">
					<loading-icon></loading-icon>
				</div>`}
		></show-when>
	`

	css = css`
		:host {
			width: 100%;
			--studio-panel-padding-x: 5px;
			--studio-panel-padding-y: 5px;
			/* --studio-button-hover-color: rgba(114, 138, 214, 1); */
			--studio-button-hover-color: color-mix(in srgb, var(--lumePrimary) 70%, white 30%);
			--studio-button-content-hover-color: rgba(114, 138, 214, 1);
		}

		.studio-container {
			background: var(--lumePrimary);
			color: var(--lumeTextColor);
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
