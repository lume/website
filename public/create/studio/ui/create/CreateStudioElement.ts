import {attribute, Element, element, eventAttribute, html} from 'lume'
import '../DropdownMenu.js'
import './CreateStudioElementList.js'
import {StudioElement, StudioElementCreateEvent} from '../../StudioElement.js'

/**
 * Converts the tag name to what is hopefully the name of the class used to create the element.
 * @param tagName
 */
/* function convertTagName(tagName: string) {
	return dashCaseToCamelCase(tagName.toLowerCase()).replace('lume', '')
} */

@element
export class CreateStudioElement extends Element {
	static readonly elementName = 'create-studio-element'

	hasShadow = false

	/**
	 * This should be the head scene studio element of the scene hierarchy.
	 */
	@attribute sceneElement?: StudioElement

	@attribute open?: boolean

	@eventAttribute onstudioElementCreate = (_ev: StudioElementCreateEvent) => {}

	connectedCallback() {
		super.connectedCallback()
	}

	template = () => html`
		<dropdown-menu
			class="studio-container"
			open=${() => this.open}
			marker=${() => {
				return html`<svg
					style="margin-right: 0.25rem;"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					stroke="white"
					stroke-width="2"
					viewBox="0 0 16 16"
					width="16"
					height="16"
					aria-hidden="true"
					focusable="false"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M8 3v10M3 8h10" />
				</svg>`
			}}
			button=${() => {
				return html`<p style="margin-top: 0; margin-bottom: 0; padding-right: 5px;">Create element</p> `
			}}
			panel=${() => {
				return html`<create-studio-element-list
					class="studio-container"
					onstudio-element-create=${(ev: StudioElementCreateEvent) => {
						this.open = false

						this.dispatchEvent(new StudioElementCreateEvent(ev.node))
					}}
				></create-studio-element-list>`
			}}
		></dropdown-menu>
	`
}
