import {attribute, css, dashCaseToCamelCase, Element, element, html, Scene, signal} from 'lume'
import '../../../elements/for-each.js'
import './SceneViewListItem.js'
import type {TrackedSceneElementNode} from '../SceneManager.js'
import type {SceneViewItemData} from './SceneViewListItem.js'

/**
 * Converts the tag name to what is hopefully the name of the class used to create the element.
 * @param tagName
 */
function convertTagName(tagName: string) {
	return dashCaseToCamelCase(tagName.toLowerCase()).replace('lume', '')
}

@element
export class SceneView extends Element {
	static readonly elementName = 'scene-view'

	@attribute sceneNodes: TrackedSceneElementNode[] = []

	@attribute scene?: Scene

	@signal nodes: SceneViewItemData[] = []

	#getUINodes() {
		if (!this.sceneNodes) return

		const nodes: SceneViewItemData[] = []

		const addChildren = (parent: TrackedSceneElementNode, nestLevel: number) => {
			nodes.push({id: parent.id ?? '', name: convertTagName(parent.tagName), nestLevel})

			if (parent.children) {
				for (let i = 0; i < parent.children.length; i++) {
					addChildren(parent.children[i], nestLevel + 1)
				}
			}
		}

		for (let i = 0; i < this.sceneNodes.length; i++) {
			addChildren(this.sceneNodes[i], 0)
		}

		// Trigger reactivity
		this.nodes = [...nodes]
	}

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.sceneNodes) return

			this.#getUINodes()
		})
	}

	// Keep track of the index in `for-each`
	#itemIndex = 0

	template = () =>
		html`<div class="sceneView">
			<div style="text-decoration: underline; padding: 5px 5px;">Scene</div>
			<for-each
				items=${() => this.nodes}
				content=${() => {
					this.#itemIndex = 0

					return () => {
						return html`<scene-view-list-item
							data="${() => this.nodes[this.#itemIndex++]}"
							scene=${() => this.scene}
						></scene-view-list-item>`
					}
				}}
			></for-each>
		</div>`

	css = css`
		:host {
		}

		/* TODO :host-context support for non-shadow scoped styles? */
		:host-context([data-theme='dark']) {
			background: rgba(0, 0, 0, 0.5);
		}

		.sceneView {
			width: 100%;
			height: 100%;
			background: rgba(125, 125, 125, 0.5);
			border-radius: 5px;
			border: 1px black solid;
			padding: 5px 5px;
		}
	`
}
