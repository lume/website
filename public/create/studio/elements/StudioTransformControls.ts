import {attribute, CameraRig, element, Element3D} from 'lume'
/* import {TransformControls} from 'three/examples/jsm/controls/TransformControls.js' */
import {TransformControls} from './TransformControls.js'
import type {StudioElement} from '../StudioElement.js'

function* walkUpShadow(element: Element) {
	let current: Element | null = element

	while (current) {
		yield current

		if (current.parentElement) {
			current = current.parentElement
		} else {
			const root = current.getRootNode()
			if (root instanceof ShadowRoot) {
				current = root.host
			} else {
				current = null
			}
		}
	}
}

@element
export class StudioTransformControls extends Element3D {
	static readonly elementName = 'studio-transform-controls'

	@attribute studioElement?: StudioElement

	#threeTransformControls?: TransformControls

	connectedCallback() {
		super.connectedCallback()

		this.createEffect(() => {
			if (!this.scene || !this.scene.camera?.three) return

			if (!this.#threeTransformControls) {
				this.#threeTransformControls = new TransformControls(this.scene.camera.three, this.scene)

				this.scene!.three.add(this.#threeTransformControls.getHelper())

				const controls = this.#threeTransformControls as any

				controls.size = 0.75
				controls.space = 'world'

				controls.addEventListener('mouseDown', this.#handleMouseDown)
				controls.addEventListener('mouseUp', this.#handleMouseUp)
				controls.domElement.addEventListener('pointermove', this.#handlePointerMove)
			}

			if (this.studioElement && this.studioElement.lumeElement) {
				this.#threeTransformControls.attach((this.studioElement.lumeElement as Element3D).three)
			} else {
				this.#threeTransformControls.detach()
			}

			this.scene.needsUpdate()
		})
	}

	#handleMouseDown = () => {
		if (!this.scene) return

		this.#disableCam()

		this.scene.needsUpdate()
	}

	#handleMouseUp = () => {
		if (!this.scene) return

		this.#enableCam()

		this.scene.needsUpdate()
	}

	#handlePointerMove = () => {
		if (!(this.#threeTransformControls as any).dragging || !this.studioElement || !this.studioElement.lumeElement)
			return

		const position = (this.studioElement.lumeElement as Element3D).three.position

		this.studioElement.setAttribute('position', `${position.x} ${-position.y} ${position.z}`)

		/* this.studioElement.position.x = this.studioElement.three.position.x
		this.studioElement.position.y = -this.studioElement.three.position.y
		this.studioElement.position.z = this.studioElement.three.position.z */

		this.scene?.needsUpdate()
	}

	#disableCam() {
		const cam = this.#getActiveCameraRig()
		if (!cam) return

		cam.flingRotation.stop()

		cam.flingRotation.interactionContainer
	}

	#enableCam() {
		const cam = this.#getActiveCameraRig()
		if (!cam) return

		cam.flingRotation.start()
	}

	#getActiveCameraRig() {
		if (!this.scene?.camera) return

		// Maybe we just pass this in as an attribute, or have a better way to do this.
		for (const el of walkUpShadow(this.scene.camera)) {
			if (el.tagName === 'LUME-CAMERA-RIG') {
				return el as CameraRig
			}
		}
	}
}
