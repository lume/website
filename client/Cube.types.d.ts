import type {LandingCube} from './Cube'
import type {NodeAttributes} from './App.types'

//////////////////////////////////////////////////////////////////////////
// @ts-ignore
export interface CubeAttributes<El = Node> extends NodeAttributes<El> {
	/** @override */
	size?: number[] | {x?: number; y?: number; z?: number} | string | number
}

declare global {
	interface HTMLElementTagNameMap {
		'landing-cube': LandingCube
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'landing-cube': CubeAttributes
		}
	}
}
