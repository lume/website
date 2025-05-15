import {booleanAttribute, css, Element as LumeElement, element, type ElementAttributes} from '@lume/element'
import {onCleanup} from 'solid-js'
import html from 'solid-js/html'
import {fadePageOnNav, hasDescendant, querySelectorDeep} from '../utils.js'

const isDev = location.host === 'localhost:8765'
const docsHost = isDev ? 'localhost:54321' : 'docs.lume.io'

@element('menu-links')
export class MenuLinks extends LumeElement {
	@booleanAttribute isMobile = false
	@booleanAttribute disabled = false

	handleLoginUI = (el: HTMLElement) => {
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
					const close = this.shadowRoot?.querySelector('.login-close-text') as HTMLElement | null
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

		const links = Array.from(this.shadowRoot!.querySelectorAll('.menuLink:not(#login)')) as HTMLAnchorElement[]
		fadePageOnNav(links)

		this.createEffect(() => {
			const onclick = (event: MouseEvent) => {
				const closeButton = this.shadowRoot!.querySelector('.login-close-text') as HTMLElement
				if (!closeButton) return
				const loginUI = this.shadowRoot?.querySelector('#loginButtons')!
				const composedTarget = event.composedPath()[0] as Element
				if (loginUI && composedTarget && !hasDescendant(loginUI, composedTarget)) closeButton.click()
			}

			const opts = {capture: true}

			document.addEventListener('click', onclick, opts)
			onCleanup(() => document.removeEventListener('click', onclick, opts))
		})
	}

	template = () => html`
		<nav aria-label="Main" class="${() => `menuLinks${this.isMobile ? ' menuLinksMobile' : ''}`}">
			<div class=${this.isMobile ? 'spacer' : ''}></div>

			<a class="menuLink" href=${'//' + docsHost}> <span>Documentation</span> </a>
			<a class="menuLink" href=${`//${docsHost}/examples/hello-world/`}> <span>Examples</span> </a>
			<a class="menuLink" href="//lume.community"> <span>Forum</span> </a>
			<a class="menuLink" href="//discord.gg/PgeyevP"> <span>Chat</span> </a>
			<a class="menuLink" href="//github.com/lume/lume"> <span>Source Code</span> </a>

			<span class="menuLink" id="login">
				<blaze-component
					disabled=${() => this.disabled}
					id="loginButtons"
					tmpl="loginButtons"
					data=${() => ({align: this.isMobile ? 'left' : 'right'})}
					ref=${this.handleLoginUI}
				></blaze-component>
			</span>

			<div class=${this.isMobile ? 'spacer' : ''}></div>
		</nav>
	`

	css = css/*css*/ `
		:host {
			display: contents;
		}

		.menuLinks {
			font-size: calc(4vw * var(--isMobile) + 14px * var(--notIsMobile));
			font-weight: bold;
			height: 100%;
			display: flex;
			align-items: center;
		}

		.menuLinksMobile {
			width: 100%;
			flex-direction: column;
			align-items: start;
			justify-content: space-around;
		}

		.menuLink,
		.spacer {
			text-decoration: none;
			text-transform: uppercase;
			letter-spacing: 0.105em;
			color: white;
			padding-left: calc(10% * var(--isMobile) + 20px * var(--notIsMobile));
			padding-right: calc(0px * var(--isMobile) + 20px * var(--notIsMobile));
			height: calc(100% * var(--isMobile) + var(--desktopMenuItemHeight) * var(--notIsMobile));
			width: 100%;
			white-space: nowrap;
			display: flex;
			align-items: center;

			&:nth-last-child(1 of &) {
				padding-right: 0;
			}
		}

		.menuLinksMobile .menuLink:hover {
			background: rgb(255 255 255 / 0.1);
		}
		:not(.menuLinksMobile) .menuLink:hover {
			color: color-mix(in srgb, deeppink 80%, white 20%);
		}

		#loginButtons {
			user-select: none;

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

		.menuLinksMobile {
			#loginButtons {
				.accounts-dialog {
					transform: translate(0px, calc(-100% - 0px));
				}
			}
		}
	`
}

type MenuLinksAttributes = 'isMobile' | 'disabled'

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'menu-links': ElementAttributes<MenuLinks, MenuLinksAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'menu-links': MenuLinks
	}
}
