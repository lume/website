import {element, Element3D} from 'lume'
import * as THREE from 'three'

@element
export class StudioGridHelper extends Element3D {
	static readonly elementName = 'studio-grid-helper'

	#threeGridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x444444)

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.scene) return

			this.#threeGridHelper = new THREE.GridHelper(1000, 200, 0x444444, 0x444444)
			this.scene.three.add(this.#threeGridHelper)
		})
	}
}
