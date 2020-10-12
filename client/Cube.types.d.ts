import type {Cube} from './Cube'
import type {NodeAttributes} from './App.types'

//////////////////////////////////////////////////////////////////////////
export interface CubeAttributes<El = Node> extends NodeAttributes<El> {}

declare global {
	interface HTMLElementTagNameMap {
		'x-cube': Cube
	}
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			'x-cube': CubeAttributes
		}
	}
}
