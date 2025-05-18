import {attribute, Element, element, type ElementAttributes} from '@lume/element'
import {For} from 'solid-js'
import html from 'solid-js/html'

export type ForEachAttributes = 'items' | 'content'

/**
 * This is a small wrapper around Solid.js <For> to make it a custom element so
 * that we don't have to use <${For}> syntax any time we need it, and prettier
 * formatting will also work.
 */
@element
export class ForEach extends Element {
	static readonly elementName = 'for-each'

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

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			[ForEach.elementName]: ElementAttributes<ForEach, ForEachAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[ForEach.elementName]: ForEach
	}
}
