import {booleanAttribute, css, Element as LumeElement, element, type ElementAttributes} from '@lume/element'
import html from 'solid-js/html'
import {fadePageOnNav} from '../utils.js'
import './login-ui.js'

const isDev = location.host === 'localhost:8765'
const docsHost = isDev ? 'localhost:54321' : 'docs.lume.io'

type MenuLinksAttributes = 'isMobile' | 'disabled'

@element('menu-links')
export class MenuLinks extends LumeElement {
	@booleanAttribute isMobile = false
	@booleanAttribute disabled = false

	connectedCallback() {
		super.connectedCallback()

		const links = Array.from(this.shadowRoot!.querySelectorAll('.menuLink:not(#login)')) as HTMLAnchorElement[]
		fadePageOnNav(links)
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
				<login-ui
					disabled=${() => this.disabled}
					data=${() => ({align: this.isMobile ? 'left' : 'right'})}
					custom-style=${() => css`
						#loginButtons {
							a.login-link-text {
								color: white;
								&:hover {
									color: var(--link-hover-color);
								}
							}
						}

						${this.isMobile ? this.#mobileLoginUICSS : ''}
					`}
				></login-ui>
			</span>

			<div class=${this.isMobile ? 'spacer' : ''}></div>
		</nav>
	`

	css = css/*css*/ `
		:host {
			display: contents;

			--link-hover-color: color-mix(in srgb, deeppink 80%, white 20%);
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
			color: var(--link-hover-color);
		}
	`

	#mobileLoginUICSS = css`
		/*
		 * Make the Meteor loginButtons UI popup above the dropdown button
		 * instead of below on mobile.  The :nth-child(n) trick increases
		 * specificity without changing the selector target to ensure we
		 * override the style in login-ui.
		 */
		#loginButtons:nth-child(n) {
			.accounts-dialog {
				transform: translate(0px, calc(-100% - 0px));
			}
		}
	`
}

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
