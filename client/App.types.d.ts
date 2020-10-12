// TODO re-export this from `lume`.
import type {} from '@lume/element/dist/jsx' // Only needed if you didn't import somewhere else already.

import type {App, MenuLinks, MenuButton} from './App'
import type {Node, Scene, ShadowMapTypeString} from 'lume'

declare global {
	const _: any
}

// TODO Run npm bootstrap from lume root to make sure package-lock.json is updated.

//////////////////////////////////////////////////////////////////////////
export interface AppAttributes<El = App> extends JSX.HTMLAttributes<El> {}

declare global {
	interface HTMLElementTagNameMap {
		'cool-element': App
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'cool-element': AppAttributes
		}
	}
}

//////////////////////////////////////////////////////////////////////////
export interface MenuLinksAttributes<El = MenuLinks> extends NodeAttributes<El> {
	'is-mobile'?: boolean
}

declare global {
	interface HTMLElementTagNameMap {
		'menu-links': MenuLinks
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'menu-links': MenuLinksAttributes
		}
	}
}

//////////////////////////////////////////////////////////////////////////
export interface MenuButtonAttributes<El = MenuButton> extends NodeAttributes<El> {
	'line-thickness': number
	'line-length': number
}

declare global {
	interface HTMLElementTagNameMap {
		'menu-button': MenuButton
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'menu-button': MenuButtonAttributes
		}
	}
}

//////////////////////////////////////////////////////////////////////////
export interface NodeAttributes<El = Node> extends JSX.HTMLAttributes<El> {
	visible?: boolean
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-node': Node
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'lume-node': NodeAttributes
		}
	}
}

//////////////////////////////////////////////////////////////////////////
export interface SceneAttributes<El = Scene> extends JSX.HTMLAttributes<El> {
	/** CSS color value (f.e. `red` or `#ff6600` or `rgb(100, 110, 120)`) */
	'background-color'?: string
	'background-opacity'?: number
	'shadowmap-type'?: ShadowMapTypeString
	vr?: boolean
	'experimental-webgl'?: boolean
	'disable-css'?: boolean
	perspective?: number
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-scene': Scene
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'lume-scene': SceneAttributes
		}
	}
}
