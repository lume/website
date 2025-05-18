import {attribute, Element, element} from '@lume/element'
import {For} from 'solid-js'
import html from 'solid-js/html'

/**
 * This is a small wrapper around Solid.js <For> to make it a custom element so
 * that we don't have to use <${For}> syntax any time we need it, and prettier
 * formatting will also work.
 */
@element('for-each')
export class ForEach extends Element {
	@attribute items = []
	@attribute content = () => []

	hasShadow = false

	template = () => html`
		<${For} each=${() => this.items}>
			${() => this.content}
		</>
	`

	css = `:host {display: contents}`
}
