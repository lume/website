import {
	css,
	Element as LumeElement,
	element,
	type ElementAttributes,
	booleanAttribute,
	stringAttribute,
	jsonAttribute,
} from '@lume/element'
import {onCleanup} from 'solid-js'
import html from 'solid-js/html'
import {hasDescendant, querySelectorDeep} from '../utils.js'
import './BlazeComponent.js'

// Props that the Blaze loginButtons template accepts.
type LoginButtonProps = {align: 'left' | 'right'}

type LoginUIAttributes = 'disabled' | 'data' | 'customStyle'

/**
 * This element wraps a the "loginButtons" Blaze template (loaded with the
 * <blaze-component> element) for two reasons:
 *
 * 1. Makes it work with ShadowDOM using some temporary JavaScript DOM patches
 * that happen in on click of any buttons in the loginButtons UI.
 * 2. Encapsulates custom style for the login UI.
 *
 * Ideally we wouldn't need the extra JS hacks, but Meteor's loginButtons first
 * needs an update so it will rely on its nearest root
 * (`getRootNode().querySelector()`) instead of the Document
 * (`document.querySelector()`), and then we will be able to delete the patch
 * code.
 */
@element('login-ui')
export class LoginUI extends LumeElement {
	/**
	 * If true, then the loginButtons Blaze component within this element will not be created
	 * (or will be removed and cleaned up if it was already created).
	 */
	@booleanAttribute disabled = false

	/**
	 * A JSON string to be converted to a data object, or a data object
	 * reference, that is passed to the loginButtons Blaze component.
	 */
	@jsonAttribute data: string | LoginButtonProps = {align: 'right'}

	/** CSS code for custom styling of the loginButtons Blaze template's DOM. */
	@stringAttribute customStyle = ''

	#handleLoginUI = (el: HTMLElement) => {
		let original = document.getElementById

		el.addEventListener(
			'click',
			event => {
				const target = event.target as HTMLElement | null

				if (target?.classList.contains('login-button')) {
					original = document.getElementById

					// Temporarily patch document.getElementById to search in
					// all ShadowRoots (unpatched in the next non-capture click
					// handler) so that Meteor's call to document.getElementById
					// will work while the login UI is inside of a ShadowRoot.
					document.getElementById = function (this: Document, id: string) {
						let result = original.call(this, id)
						if (result) return result
						return querySelectorDeep(document, '#' + id)
					} as (typeof document)['getElementById']
					// ^ cast because the TS type for document.querySelector is incorrect (https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/2020).

					return
				}

				if (target?.classList.contains('login-link-text')) {
					// This makes it so that clicking the dropdown link will close the popup if
					// it is already open.
					const root = (this.shadowRoot ?? this.getRootNode()) as Document | ShadowRoot
					const close = root.querySelector('.login-close-text') as HTMLElement | null
					if (close) setTimeout(() => close.click())
				}
			},
			{capture: true},
		)

		// On the way back up, undo the patch. There's a small
		// chance we break someone else doing the same sort of
		// patch, but super unlikely.
		el.addEventListener('click', () => (document.getElementById = original), {capture: false})
	}

	connectedCallback() {
		super.connectedCallback()

		// When clicking anywhere not inside of the login-ui popup, close the popup.
		this.createEffect(() => {
			const onclick = (event: MouseEvent) => {
				const root = (this.shadowRoot ?? this.getRootNode()) as Document | ShadowRoot
				const closeButton = root.querySelector('.login-close-text') as HTMLElement
				if (!closeButton) return

				const loginUI = root.querySelector('#loginButtons')!
				const composedTarget = event.composedPath()[0] as Element

				if (loginUI && composedTarget && !hasDescendant(loginUI, composedTarget)) closeButton.click()
			}

			const opts = {capture: true}

			document.addEventListener('click', onclick, opts)
			onCleanup(() => document.removeEventListener('click', onclick, opts))
		})
	}

	template = () => html`
		<blaze-component
			tmpl="loginButtons"
			id="loginButtons"
			disabled=${() => this.disabled}
			data=${() => this.data}
			ref=${this.#handleLoginUI}
		></blaze-component>

		<style prop:textContent=${() => this.customStyle}></style>
	`

	css = css/*css*/ `
		:host {
			display: contents;
		}

		#loginButtons {
			user-select: none;
			display: block;

			.login-link-text {
				color: black;
				text-decoration: none;
			}

			.accounts-dialog {
				pointer-events: auto;
				text-transform: none;
				font-family: var(--base-font-family);
				text-align: left;
				letter-spacing: normal;
				text-decoration: none;

				transform: translate(0px, 30px);

				* {
					font-family: inherit;

					.login-link-text {
						text-decoration: none;
					}
				}

				a {
					/* force black for now, until we handle light/dark theme for login UI. */
					color: black !important;
				}

				.login-close-text {
					display: none;
				}

				.login-button {
					margin-bottom: 6px;
				}

				.login-button-form-submit {
					margin-top: 12px;
				}

				[id*='label-and-input'] {
					display: flex;
					gap: 10px;
					margin-bottom: 10px;
				}
			}

			#login-buttons.login-buttons-dropdown-align-right #login-dropdown-list {
				top: 0;
				right: 0;
				bottom: unset;
				left: unset;
				margin: unset;
			}
		}

		:host-context([data-theme='dark']) {
			#loginButtons {
				.login-link-text {
					color: white;
				}
			}
		}
	`
}

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'login-ui': ElementAttributes<LoginUI, LoginUIAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'login-ui': LoginUI
	}
}
