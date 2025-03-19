import type {Element3D, Mesh} from 'lume'
import * as THREE from 'three'
import {batch, createEffect, createMemo, createSignal, onCleanup, untrack, type Signal} from 'solid-js'
import {Easing} from '@tweenjs/tween.js'

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

interface AnimateValueOptions {
	/** Duration of the animation in milliseconds. Defaults to 1000. */
	duration?: number

	/**
	 * The easing curve to use. The function
	 * accepts a value between 0 and 1 indicating start to finish time,
	 * and returns a value between 0 and 1 indicating start to finish
	 * position. You can pass any Tween.js Easing curve here, for
	 * example. Defaults to Tween.js Easing.Cubic.InOut
	 */
	curve?: (amount: number) => number

	/**
	 * A boolean signal that if provided, prevents the animation from
	 * starting until it is true. Toggling it back to false also stops the
	 * animation, setting back to true starts it again.
	 */
	start?: () => boolean
}

/**
 * Animates a signal from its current value to a target value.
 *
 * @param signal - The signal to animate.
 * @param targetValue - The target value to animate to.
 * @param options - An object containing optional parameters for the animation.
 * @param options.duration - The duration of the animation in milliseconds. Defaults to 1000.
 * @param options.curve - The easing curve to use for the animation. Defaults to Easing.Cubic.InOut.
 * @param options.start - A signal that controls when the animation starts. If provided, the animation will only start when this signal is true.
 */
export function animateSignalTo(
	signal: Signal<number>,
	targetValue: number,
	{duration = 1000, curve = Easing.Cubic.InOut, start}: AnimateValueOptions = {},
) {
	const [getValue, setValue] = signal
	const [done, setDone] = createSignal(false)
	const startValue = untrack(getValue)

	createEffect(() => {
		if (untrack(getValue) === targetValue) return setDone(true)

		if (start && !start()) return

		let frame = 0
		const startTime = performance.now()

		frame = requestAnimationFrame(function loop(time) {
			let val = getValue()

			const elapsed = time - startTime
			const elapsedPortion = elapsed / duration
			const amount = curve(elapsedPortion > 1 ? 1 : elapsedPortion)
			const valuePortion = amount * (targetValue - startValue)

			val = startValue + valuePortion
			setValue(val)

			if (val === targetValue) return setDone(true)

			frame = requestAnimationFrame(loop)
		})

		onCleanup(() => {
			cancelAnimationFrame(frame)
			setDone(false)
		})
	})

	return done
}

/** Return two signals for the width and height of an element. */
export function elementSize(el: Element | (() => Element | undefined | null)) {
	const [clientWidth, setClientWidth] = createSignal(0)
	const [clientHeight, setClientHeight] = createSignal(0)

	const element = createMemo(() => (typeof el === 'function' ? el() : el))

	createEffect(() => {
		const el = element()

		if (!el) {
			setClientWidth(0)
			setClientHeight(0)
			return
		}

		const observer = new ResizeObserver(() => {
			batch(() => {
				setClientWidth(el.clientWidth)
				setClientHeight(el.clientHeight)
			})
		})

		observer.observe(el)

		onCleanup(() => observer.disconnect())
	})

	return {clientWidth, clientHeight}
}

/** Make an Element3D be the size of the given element. */
export function fitContent(el3d: Element3D, el: Element, width = true, height = true) {
	const {clientWidth, clientHeight} = elementSize(el)
	createEffect(() => {
		if (width) el3d.size.x = clientWidth()
		if (height) el3d.size.y = clientHeight()
	})
}

export function fadePageOnNav(links: HTMLAnchorElement[]) {
	const aborter = new AbortController()
	const signal = aborter.signal
	for (const link of links) {
		link.addEventListener('click', event => {
			event.preventDefault()
			if (signal.aborted) return
			aborter.abort()
			document.body.classList.add('fadePageOut')
			document.body.addEventListener('transitionend', () => (location.href = link.href))
		})
	}
}

export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))

/** Memoize the given keys of an object (the values should be functions). */
export function memoize<T extends object, K extends keyof T>(obj: T, ...keys: K[]) {
	// @ts-expect-error valid indexed access
	for (const key of keys) obj[key] = createMemo(obj[key])
}
