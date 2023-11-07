import type {LandingCube} from './Cube.js'
import type {ElementAttributes} from '@lume/element'
import type {BoxAttributes} from 'lume'

//////////////////////////////////////////////////////////////////////////

type LandingCubeAttributes = BoxAttributes

declare module 'solid-js' {
	namespace JSX {
		interface IntrinsicElements {
			'landing-cube': ElementAttributes<LandingCube, LandingCubeAttributes>
		}
	}
}

declare global {
	interface HTMLElementTagNameMap {
		'landing-cube': LandingCube
	}
}
