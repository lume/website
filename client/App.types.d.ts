import type {ElementAttributes} from '@lume/element'
import type {NodeAttributes} from 'lume'

import type {App, MenuLinks, HamburgerButton} from './App.js'

declare global {
	const _: any
}

//////////////////////////////////////////////////////////////////////////

// "_____" used to denote empty (no attributes).
// TODO allow to specify no attributes with the ElementAttributes type somehow.
type AppAttributes = '_____'

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'app-root': ElementAttributes<App, AppAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'app-root': App
	}
}

//////////////////////////////////////////////////////////////////////////

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

//////////////////////////////////////////////////////////////////////////

type HamburgerButtonAttributes = NodeAttributes | 'lineThickness' | 'lineLength' | 'activated'

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'hamburger-button': ElementAttributes<HamburgerButton, HamburgerButtonAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'hamburger-button': HamburgerButton
	}
}
