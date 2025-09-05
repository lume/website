import {attribute, css, Element, element, eventAttribute, html, signal} from 'lume'
import type {UserSceneDocument} from '../../../../../imports/collections/scenes/UserScenes'

import '../../../../elements/for-each.js'
import '../../../../elements/show-when.js'

import '../StudioButton.js'

export interface CreateSceneParams {
	name: string
}

export class CreateSceneEvent extends Event {
	params: CreateSceneParams

	constructor(params: CreateSceneParams) {
		super('create-scene')

		this.params = params
	}
}

export class SaveSceneAsEvent extends Event {
	/**
	 * The scene that will be overwritten.
	 */
	scene: UserSceneDocument

	constructor(scene: UserSceneDocument) {
		super('save-scene-as')

		this.scene = scene
	}
}

@element
export class SceneSelectMenu extends Element {
	static readonly elementName = 'scene-select-menu'

	@attribute scenes: UserSceneDocument[] = []

	/**
	 * Set to `true` while loading the scenes to show a loading icon within the view.
	 */
	@attribute loading = false

	@eventAttribute oncancel = () => {}

	@eventAttribute onsaveScene = (_ev: SaveSceneAsEvent) => {}

	@eventAttribute oncreateScene = (_ev: CreateSceneEvent) => {}

	hasShadow = false

	@signal dialogRef?: HTMLDialogElement

	@signal selectedSceneIndex = -1

	@signal sceneName = ''

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.dialogRef) return

			this.dialogRef.showModal()
		})
	}

	#selectScene(index: number) {
		this.selectedSceneIndex = index

		this.sceneName = this.scenes[index].name ?? ''
	}

	#saveScene() {
		if (this.selectedSceneIndex != -1) {
			this.dispatchEvent(new SaveSceneAsEvent(this.scenes[this.selectedSceneIndex]))
		} else {
			this.dispatchEvent(new CreateSceneEvent({name: this.sceneName}))
		}
	}

	#cancel() {
		this.dispatchEvent(new Event('cancel'))
	}

	template = () => {
		return html`<dialog
			ref=${(el: HTMLDialogElement) => {
				this.dialogRef = el
			}}
			closedby="any"
			onclose=${() => {
				this.dispatchEvent(new Event('cancel'))
			}}
			class="scene-select-modal studio-container"
		>
			<div class="scene-select-header">Save scene</div>

			<show-when
				condition=${() => !this.loading}
				content=${() => () =>
					html` <show-when
							condition=${() => this.scenes.length}
							content=${() => () =>
								html`<div style="display: flex; justify-content: space-between;">
										<div>Name</div>
										<div>Date modified</div>
									</div>
									<div class="scene-select-list">
										<for-each
											items=${() => this.scenes}
											content=${() => {
												let sceneIndex = 0

												return () => {
													const index = sceneIndex++
													const scene = this.scenes[index]

													return html`<div
														class=${() => {
															return 'scene-select-row' + (this.selectedSceneIndex == index ? ' selected' : '')
														}}
														onclick=${() => {
															this.#selectScene(index)
														}}
													>
														<div class="scene-name">${() => scene.name ?? 'Untitled Scene'}</div>
														<div class="scene-date">
															${() => (scene.dateModified ? new Date(scene.dateModified).toLocaleString() : '')}
														</div>
													</div>`
												}
											}}
										></for-each>
									</div>`}
							fallback=${() => () => html`<div class="scene-select-empty">No scenes yet.</div>`}
						></show-when>
						<div class="scene-select-actions">
							<div>
								<input
									class="scene-select-name-input"
									type="text"
									minlength="1"
									maxlength="20"
									size="25"
									placeholder="Scene"
									value=${() => this.sceneName}
									oninput=${(ev: any) => {
										// Deselect
										this.selectedSceneIndex = -1

										this.sceneName = ev.currentTarget.value
									}}
								/>
							</div>
							<div class="scene-select-action-buttons">
								<studio-button
									content="Save as"
									variant="secondary"
									onclick=${() => {
										this.#saveScene()
									}}
								></studio-button>
								<studio-button
									content="Cancel"
									onclick=${() => {
										this.#cancel()
									}}
								></studio-button>
							</div>
						</div>`}
				fallback=${() => () =>
					html`<div class="scene-select-loading">
						<div style="display: flex; width: 50px;">
							<loading-icon style="--loading-icon-color: 200, 200, 200;"></loading-icon>
						</div>
					</div>`}
			></show-when>
		</dialog>`
	}

	css = css/*css*/ `
	    .scene-select-modal {
		    min-width: 400px;
		    max-width: 90vw;
		    box-shadow: 0 4px 32px rgba(0, 0, 0, 0.18);
		    padding: 1.5em 1.5em 1em 1.5em;
		       
		    flex-direction: column;
		    border-radius: 8px;
		    border: none;
	    }
		.scene-select-header {
			user-select: none;
			font-size: 1.2em;
			font-weight: bold;
			margin-bottom: 1em;
		}
		.scene-select-list {
			margin-bottom: 1em;
			background: white;
		}
		.scene-select-row {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0.25em 0.5em;
			cursor: pointer;
			background: white;
			transition: background 0.15s;
		}
		.scene-select-row:hover {
			background: #e0e7ff;
		}
		.scene-select-row.selected {
			outline: 1px solid var(--lumeSecondary);
			background: rgba(var(--lumeSecondaryRgb), 0.6);
		}
		.scene-select-row.selected:hover {
			background: rgba(var(--lumeSecondaryRgb), 0.8);
		}
		.scene-name {
			font-weight: 500;
			color: #222;
			text-align: left;
			flex: 1 1 auto;
		}
		.scene-date {
			padding-left: 5px;
			font-size: 0.95em;
			color: #666;
			text-align: right;
			min-width: 120px;
		}
		.scene-select-actions {
			display: flex;
			justify-content: space-between;
            align-items; center;
			gap: 0.7em;
		}
        .scene-select-action-buttons {
            display: flex; 
            align-items: center; 
            gap: 2px;
        }
		.scene-select-name-input {
			padding: 5px 8px;
		}
		.scene-select-cancel,
		.scene-select-save {
			padding: 0.5em 1.2em;
			border-radius: 4px;
			border: none;
			font-size: 1em;
			cursor: pointer;
		}
		.scene-select-cancel {
			background: #eee;
		}
		.scene-select-save {
			background: #6366f1;
			color: #fff;
		}
		.scene-select-save:disabled {
			background: #bbb;
			cursor: not-allowed;
		}
		.scene-select-empty {
			color: white;
			margin-bottom: 1em;
		}

		.scene-select-loading {
			display: flex; 
			justify-content: center; 
			margin-bottom: 1em;
		}
	`
}
