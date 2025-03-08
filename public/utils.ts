import type {Mesh} from 'lume'
import * as THREE from 'three'

export async function svgTexture(
	plane: Mesh,
	img: HTMLImageElement,
	canvas: HTMLCanvasElement,
	width: number,
	height: number,
) {
	const ctx = canvas.getContext('2d')

	await Promise.all([imgLoaded(img)])

	canvas.width = width
	canvas.height = height
	ctx.drawImage(img, 0, 0, width, height)

	const tex = new THREE.CanvasTexture(canvas)
	tex.colorSpace = THREE.SRGBColorSpace
	plane.three.material.map = tex
	plane.three.material.needsUpdate = true
	plane.needsUpdate()
	setTimeout(() => {
		plane.three.material.needsUpdate = true
		plane.needsUpdate()
	}, 2000)

	// If we remove the canvas before the above creation of CanvasTexture, the texture will not render. hmmmm.
	canvas.remove()

	img.remove()
}

export function imgLoaded(img) {
	const p = new Promise<void>(res => {
		if (img.complete) res()
		else img.addEventListener('load', res)
	})
	return p
}
