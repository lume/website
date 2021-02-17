// TODO re-export this from `lume`.
import type {} from '@lume/element/dist/jsx' // Only needed if you didn't import somewhere else already.

import type {App, MenuLinks, HamburgerButton} from './App'
import type {Node, Scene, ShadowMapTypeString, AmbientLight} from 'lume'

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
export interface HamburgerButtonAttributes<El = HamburgerButton> extends NodeAttributes<El> {
	'line-thickness': number
	'line-length': number
	activated: boolean
}

declare global {
	interface HTMLElementTagNameMap {
		'hamburger-button': HamburgerButton
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'hamburger-button': HamburgerButtonAttributes
		}
	}
}

//////////////////////////////////////////////////////////////////////////
export interface AmbientLightAttributes<El = AmbientLight> extends NodeAttributes<El> {
	intensity?: number | string
}

declare global {
	interface HTMLElementTagNameMap {
		'lume-ambient-light': AmbientLight
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'lume-ambient-light': AmbientLightAttributes
		}
	}
}

//////////////////////////////////////////////////////////////////////////
export interface NodeAttributes<El = Node> extends JSX.HTMLAttributes<El> {
	visible?: boolean
	size?: number[] | {x?: number; y?: number; z?: number} | string
	align?: number[] | {x?: number; y?: number; z?: number} | string
	position?: number[] | {x?: number; y?: number; z?: number} | string
	rotation?: number[] | {x?: number; y?: number; z?: number} | string
	opacity?: number | string
	'mount-point'?: number[] | {x?: number; y?: number; z?: number} | string

	// TODO Remove this once solid.js is updated, this will come from solid.js
	onclick?: (e: MouseEvent) => void
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
	'background-opacity'?: number | string
	'shadowmap-type'?: ShadowMapTypeString
	vr?: boolean | string
	webgl?: boolean | string
	'enable-css'?: boolean | string
	perspective?: number | string
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
