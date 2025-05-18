import {attribute, booleanAttribute, Element, element} from '@lume/element'
import {Show} from 'solid-js'
import html from 'solid-js/html'

/**
 * This is a small wrapper around Solid.js <For> to make it a custom element so
 * that we don't have to use <${For}> syntax any time we need it, and prettier
 * formatting will also work.
 */
@element('show-when')
export class ShowWhen extends Element {
	@booleanAttribute condition = false
	@attribute content = () => []
	@attribute fallback = () => []

	hasShadow = false

	template = () => html`
		<${Show} when=${() => this.condition} fallback=${() => this.fallback}>
			${() => this.content}
		</>
	`

	css = `:host {display: contents}`
}
