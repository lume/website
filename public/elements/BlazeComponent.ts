import {Blaze} from 'meteor/blaze'
import {Template} from 'meteor/templating'
import {Element, element, stringAttribute, css, attribute} from '@lume/element'
import {html} from 'lume'
import type {ElementAttributes} from '@lume/element'
import {createEffect, createMemo, onCleanup} from 'solid-js'
import {ReactiveVar} from 'meteor/reactive-var'
import {cloneCSSStyleSheet} from '../utils.js'

// This is how to define a new attribute decorator. In this case, for accepting JSON values.
// TODO move this jsonAttribute decorator into @lume/element
const toJS = (str: string) => JSON.parse(str)
// @ts-ignore
attribute.json = () => ({from: toJS})
export function jsonAttribute(value: unknown, context: any) {
	// @ts-ignore
	return attribute(attribute.json())(value, context)
}

let globalSheetPromise: Promise<CSSStyleSheet> | null = null

@element('blaze-component')
export class BlazeComponent extends Element {
	/** The name of the Blaze template, or a Blaze template reference, to render. */
	@stringAttribute tmpl: string | Blaze.Template = ''

	/**
	 * A JSON string to be converted to a data object, or a data object reference, to be passed to
	 * the Blaze component.
	 */
	@jsonAttribute data: string | object = {}

	hasShadow = false

	#container: HTMLDivElement | null = null

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

			const link = document.head.querySelector('link[href*="accounts-ui"]') as HTMLLinkElement
			const onStyleLoad = () => resolve(cloneCSSStyleSheet(link.sheet))
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
			const tmpl = this.#tmpl()
			if (!tmpl) return
			const reactive = new ReactiveVar(this.data)

			// Map the element's data to the reactive var so that changes will be picked up by Blaze.
			createEffect(() => reactive.set(this.data))

			const view = Blaze.renderWithData(tmpl, () => reactive.get(), this.#container)

			// ensure all reactive updates are processed (is this needed?)
			// Tracker.flush()

			onCleanup(() => Blaze.remove(view))

			// CONTINUE move this login-button-specific handling to separate element.
			// const ctrl = new AbortController()
			// const signal = ctrl.signal

			// this.addEventListener(
			// 	'click',
			// 	event => {
			// 		const a = this.#container.querySelector('#login-sign-in-link') as HTMLAnchorElement | null
			// 		if (!a) return
			// 		if (event.target === a) return
			// 		console.log('fake click on sign in link')
			// 		a.click()
			// 	},
			// 	{signal},
			// )

			// onCleanup(() => ctrl.abort())
		})
	}

	template = () => html` <div id="container" part="container" ref=${e => (this.#container = e)}></div> `

	css = css/*css*/ `
		:host {
			display: contents;
		}

		#container {
			display: contents;
		}
	`
}

type BlazeComponentAttribute = 'tmpl'

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'blaze-component': ElementAttributes<BlazeComponent, BlazeComponentAttribute>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'blaze-component': BlazeComponent
	}
}
