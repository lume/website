import {attribute, Element, element, html, Scene, signal, stringAttribute} from 'lume'

/**
 * Converts the tag name to what is hopefully the name of the class used to create the element.
 * @param tagName
 */
/* function convertTagName(tagName: string) {
	return dashCaseToCamelCase(tagName.toLowerCase()).replace('lume', '')
} */

export interface SceneViewItemData {
	id: string
	name: string
	nestLevel: number
}

@element
export class SceneViewListItem extends Element {
	static readonly elementName = 'scene-view-list-item'

	@stringAttribute elementId = ''

	@attribute scene?: Scene

	@attribute data?: SceneViewItemData

	@signal paddingX = 5
	@signal name = ''

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.data) return

			this.paddingX = 10 * this.data.nestLevel

			this.name = this.data.name

			/* if (!this.scene) return

			const el = this.scene.querySelector(`#${this.elementId}`)
			if (!el) return */
		})
	}

	template = () =>
		html`<div style="${() => `padding-left: ${(this.data?.nestLevel ?? 0) * 3}ch;`}">${() => this.name}</div>`
}
