import {attribute, Element, element, eventAttribute, html} from 'lume'
import '../../../../elements/for-each.js'
import '../AccordionButton.js'
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

	template = () =>
		html`<div class="studio-panel">
			<accordion-button
				open=${() => this.open}
				marker=${() =>
					html`<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						stroke="white"
						stroke-width="2"
						viewBox="0 0 24 24"
						width="24"
						height="24"
						aria-hidden="true"
						focusable="false"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 7v10M7 12h10" />
					</svg>`}
				button=${() => {
					return html`<p style="margin-top: 0; margin-bottom: 0;">Create element</p>`
				}}
				panel=${() => {
					return html`<create-studio-element-list
						onstudio-element-create=${(ev: StudioElementCreateEvent) => {
							this.dispatchEvent(new StudioElementCreateEvent(ev.node))
						}}
					></create-studio-element-list>`
				}}
			></accordion-button>
		</div>`
}
