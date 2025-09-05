import {attribute, css, Element, element, eventAttribute, html} from 'lume'
import '../elements/for-each.js'
import type {UserSceneDocument} from '../../imports/collections/scenes/UserScenes.js'

export class SceneListSelectEvent extends Event {
	scene: UserSceneDocument

	constructor(scene: UserSceneDocument) {
		super('scene-list-select-event')

		this.scene = scene
	}
}

@element
export class SceneList extends Element {
	static readonly elementName = 'scene-list'

	hasShadow = false

	@attribute scenes: UserSceneDocument[] = []

	@eventAttribute onsceneSelect = (_ev: SceneListSelectEvent) => {}

	#sceneIndex = 0

	connectedCallback() {
		super.connectedCallback()
	}

	template = () =>
		html`<div class="scene-list">
			<for-each
				items=${() => this.scenes}
				content=${() => {
					this.#sceneIndex = 0
					return () => {
						const scene = this.scenes[this.#sceneIndex++]

						return html`
							<div>
								<a
									href=${() => {
										return '/create/' + scene._id
									}}
									><div
										class="card"
										onclick=${() => {
											this.dispatchEvent(new SceneListSelectEvent(scene))
										}}
									>
										<img src="/images/LUME5.png" />
										<p>${() => scene.name}</p>
									</div></a
								>
							</div>
						`
					}
				}}
			></for-each>
		</div>`

	css = css/*css*/ `
		.scene-list {
			display: flex;
			flex-wrap: wrap;
			gap: 20px;
			margin-bottom: 1em;

			.card {
				width: 200px;
				height: 200px;
				position: relative;
				cursor: pointer;

				flex-shrink: 0;

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
		}
	`
}
