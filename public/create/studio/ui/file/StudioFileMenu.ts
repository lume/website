import {attribute, css, Element, element, eventAttribute, html, signal} from 'lume'
import '../DropdownMenu.js'
import './SceneSelectMenu.js'

import {CreateSceneEvent, SaveSceneAsEvent} from './SceneSelectMenu.js'
import type {UserSceneDocument} from '../../../../../imports/collections/scenes/UserScenes.js'
import {Meteor} from '../../../../meteor-packages.js'

@element
export class StudioFileMenu extends Element {
	static readonly elementName = 'studio-file-menu'

	hasShadow = false

	@attribute isOwnScene = false

	/**
	 * User wants to save the current scene in the place of an already existing scene, overwriting
	 * it.
	 * @param _ev
	 */
	@eventAttribute onsaveSceneAs = (_ev: SaveSceneAsEvent) => {}

	/**
	 * User wants to create a new scene, containing the current scene with the name specified in
	 * `params`.
	 * @param _ev
	 */
	@eventAttribute oncreateScene = (_ev: CreateSceneEvent) => {}

	/**
	 * User wants to save the current scene over its existing document.
	 */
	@eventAttribute onsaveScene = () => {}

	@signal dropdownOpen = false
	@signal showSaveMenu = false

	@signal isLoadingScenes = false
	@signal userScenes: UserSceneDocument[] = []

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.showSaveMenu) return

			this.isLoadingScenes = true

			Meteor.call('getUserScenes', (err: any, data: any) => {
				if (err) {
					console.log(JSON.stringify(err, undefined, 4))
					return
				}

				this.userScenes = data

				setTimeout(() => {
					this.isLoadingScenes = false
				}, 500)
			})
		})
	}

	template = () =>
		html`<div style="display: flex;">
			<dropdown-menu
				class="studio-file-menu studio-container"
				open=${() => this.dropdownOpen}
				onaccordion-toggle=${() => {
					// Any time "File" is clicked, make sure save menu is hidden.
					this.showSaveMenu = false
				}}
				marker=${() => html`<div></div>`}
				button=${() => html`<div>File</div>`}
				panel=${() => {
					return html`<div class="studio-container">
						<div
							class="studio-dropdown-item"
							onclick=${() => {
								if (this.isOwnScene) {
									this.dropdownOpen = false

									this.dispatchEvent(new Event('save-scene'))
								} else {
									this.showSaveMenu = true
								}
							}}
						>
							Save
						</div>
						<div
							class="studio-dropdown-item"
							onclick=${() => {
								this.showSaveMenu = true
							}}
						>
							Save as
						</div>
					</div>`
				}}
			></dropdown-menu>
			<show-when
				condition=${() => this.showSaveMenu}
				content=${() => () => {
					return html`<scene-select-menu
						loading=${() => this.isLoadingScenes}
						scenes=${() => this.userScenes}
						onsave-scene-as=${(ev: SaveSceneAsEvent) => {
							this.dispatchEvent(new SaveSceneAsEvent(ev.scene))

							this.showSaveMenu = false

							this.dropdownOpen = false
						}}
						oncreate-scene=${(ev: CreateSceneEvent) => {
							this.dispatchEvent(new CreateSceneEvent(ev.params))

							this.showSaveMenu = false

							this.dropdownOpen = false
						}}
						oncancel=${() => {
							this.showSaveMenu = false

							this.dropdownOpen = false
						}}
					></scene-select-menu>`
				}}
			></show-when>
		</div>`

	css = css/*css*/ `
		.studio-file-menu {
			margin-bottom: 0.25rem;
		}

		.studio-file-menu .studio-accordion-button {
			padding: 5px 8px;
		}

		.studio-save-menu {
			padding: 5px 10px;
		}

		.studio-dropdown-item {
			padding: 5px;
		}
	`
}
