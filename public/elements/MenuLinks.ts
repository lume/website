import {Element, element, booleanAttribute, html, css} from 'lume'
import type {ElementAttributes} from '@lume/element'
import {signal} from 'classy-solid'
import {fadePageOnNav} from '../utils.js'

const isDev = location.host === 'localhost:8765'
const docsHost = isDev ? 'localhost:54321' : 'docs.lume.io'

@element('menu-links')
export class MenuLinks extends Element {
	@booleanAttribute isMobile = false
	@signal menuLinks?: HTMLDivElement

	connectedCallback() {
		super.connectedCallback()

		const links = Array.from(this.menuLinks!.querySelectorAll('.menuLink')) as HTMLAnchorElement[]
		fadePageOnNav(links)
	}

	template = () => html`
		<nav
			aria-label="Main"
			class="${() => `menuLinks${this.isMobile ? ' menuLinksMobile' : ''}`}"
			ref="${e => (this.menuLinks = e)}"
		>
			<div class=${this.isMobile ? 'spacer' : ''}></div>
			<a class="menuLink" href=${'//' + docsHost}> <span>Documentation</span> </a>
			<a class="menuLink" href=${`//${docsHost}/examples/hello-world/`}> <span>Examples</span> </a>
			<a class="menuLink" href="//lume.community"> <span>Forum</span> </a>
			<a class="menuLink" href="//discord.gg/PgeyevP"> <span>Chat</span> </a>
			<a class="menuLink" href="//github.com/lume/lume"> <span>Source Code</span> </a>
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
			height: calc(100% * var(--isMobile) + 50px * var(--notIsMobile));
			width: 100%;
			white-space: nowrap;
			display: flex;
			align-items: center;
		}
		.menuLinksMobile .menuLink:hover {
			background: rgb(255 255 255 / 0.1);
		}
		:not(.menuLinksMobile) .menuLink:hover {
			color: color-mix(in srgb, deeppink 80%, white 20%);
		}
	`
}

type MenuLinksAttributes = 'isMobile'

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
