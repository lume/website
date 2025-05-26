import '../promise.withResolvers.js'
import {Blaze} from 'meteor/blaze'
import {Template} from 'meteor/templating'
import {
	Element,
	element,
	booleanAttribute,
	stringAttribute,
	jsonAttribute,
	css,
	type ElementAttributes,
} from '@lume/element'
import {html} from 'lume'
import {createEffect, createMemo, onCleanup} from 'solid-js'
import {ReactiveVar} from 'meteor/reactive-var'
import {cloneCSSStyleSheet} from '../utils.js'

let globalSheetPromise: Promise<CSSStyleSheet> | null = null

type BlazeComponentAttributes = 'tmpl' | 'data' | 'disabled'

@element
export class BlazeComponent extends Element {
	static readonly elementName = 'blaze-component'

	/** The name of the Blaze template, or a Blaze template reference, to render. */
	@stringAttribute tmpl: string | Blaze.Template = ''

	/**
	 * A JSON string to be converted to a data object, or a data object reference, to be passed to
	 * the Blaze component.
	 */
	@jsonAttribute data: string | object = {}

	/**
	 * If true, then the Blaze component within this element will not be created
	 * (or will be removed and cleaned up if it was already created).
	 */
	@booleanAttribute disabled = false

	hasShadow = false

	#container!: HTMLDivElement

	#tmpl = () => (typeof this.tmpl === 'string' ? (Template[this.tmpl] as Blaze.Template | undefined) : this.tmpl)

	#memoized = false

	// TODO @memo decorator in classy-solid to replace this #memoize() method.
	#memoize() {
		if (this.#memoized) return
		this.#memoized = true
		this.#tmpl = createMemo(this.#tmpl)
	}

	#appliedGlobalStyle = false

	// TODO move this global style selection into feature of @lume/element
	#handleGlobalStyle() {
		if (this.#appliedGlobalStyle) return
		this.#appliedGlobalStyle = true

		if (!globalSheetPromise) {
			const {promise, resolve} = Promise.withResolvers<CSSStyleSheet>()
			globalSheetPromise = promise

			const link = document.querySelector('link[href*="accounts-ui"]') as HTMLLinkElement
			const onStyleLoad = () => resolve(cloneCSSStyleSheet(link.sheet!))
			const styleLoaded = link.sheet?.cssRules.length

			if (!styleLoaded) link.addEventListener('load', onStyleLoad)
			else onStyleLoad()
		}

		this.createEffect(() => {
			let cleaned = false

			globalSheetPromise!.then(globalSheet => {
				if (cleaned) return

				const root =
					this.shadowRoot ?? ((this.getRootNode() === document ? null : this.getRootNode()) as ShadowRoot | null)

				root?.adoptedStyleSheets.push(globalSheet)
				// TODO ref counting, remove style from root node when the last element instance is removed.
			})

			onCleanup(() => (cleaned = true))
		})
	}

	connectedCallback() {
		this.#memoize()
		super.connectedCallback()

		this.#handleGlobalStyle()

		this.createEffect(() => {
			if (this.disabled) return
			const tmpl = this.#tmpl()
			if (!tmpl) return
			const reactive = new ReactiveVar(this.data)

			// Map the element's data to the reactive var so that changes will be picked up by Blaze.
			createEffect(() => reactive.set(this.data))

			const view = Blaze.renderWithData(tmpl, () => reactive.get(), this.#container)

			// ensure all reactive updates are processed (is this needed?)
			// Tracker.flush()

			onCleanup(() => Blaze.remove(view))
		})
	}

	template = () => html`
		<div id="container" part="container" ref=${(e: HTMLDivElement) => (this.#container = e)}></div>
	`

	css = css/*css*/ `
		:host {
			display: contents;
		}

		#container {
			display: contents;
		}
	`
}

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			[BlazeComponent.elementName]: ElementAttributes<BlazeComponent, BlazeComponentAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		[BlazeComponent.elementName]: BlazeComponent
	}
}
