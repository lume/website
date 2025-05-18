import {attribute, booleanAttribute, Element, element, type ElementAttributes} from '@lume/element'
import {Show} from 'solid-js'
import html from 'solid-js/html'

export type ShowWhenAttributes = 'condition' | 'content' | 'fallback'

/**
 * This is a small wrapper around Solid.js <For> to make it a custom element so
 * that we don't have to use <${For}> syntax any time we need it, and prettier
 * formatting will also work.
 */
@element
export class ShowWhen extends Element {
	static readonly elementName = 'show-when'

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

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			[ShowWhen.elementName]: ElementAttributes<ShowWhen, ShowWhenAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[ShowWhen.elementName]: ShowWhen
	}
}
