import {Motor, Element, element, Element3D, numberAttribute, booleanAttribute, html, css} from 'lume'
import {Tween, Easing} from '@tweenjs/tween.js'
import {createEffect, createMemo, onCleanup} from 'solid-js'
import {signal} from 'classy-solid'
import './Cube.js'
import type {ElementAttributes} from '@lume/element'
import type {Element3DAttributes, Plane, RenderTask, Scene} from 'lume'
import {type LandingCube} from './Cube.js'
import {svgTexture} from './utils.js'

const MENU_WIDTH = 0.8 // percent of viewport
const HEADER_HEIGHT = 100

@element('app-root')
export class App extends Element {
	hasShadow = false

	// Used in AppAttributes to denote no attributes. See TODO there.
	_____?: undefined

	@signal cube?: LandingCube
	@signal cube2?: LandingCube
	@signal menu?: Element3D
	@signal scene?: Scene
	@signal rotator?: Element3D
	@signal rotator2?: Element3D
	@signal wordmarkContainer?: Element3D
	@signal circle?: Element3D
	@signal light?: Element3D
	@signal light2?: Element3D
	@signal menuButtonWrapper?: Element3D

	@signal wordMarkHorizontal?: Plane
	@signal horizontalImg?: HTMLImageElement
	@signal horizontalCanvas?: HTMLCanvasElement
	@signal wordMarkVertical?: Plane
	@signal verticalImg?: HTMLImageElement
	@signal verticalCanvas?: HTMLCanvasElement

	// TODO make option for Tween to remember last value instead of starting
	// from the beginning. It would simplify the Tween code a lot. See
	// https://github.com/tweenjs/tween.js/issues/522

	makeOpenTween() {
		this.openTween = new Tween({menuPosition: this.menu?.alignPoint.x || 1})
			.onComplete(() => this.openTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.alignPoint.x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	makeCloseTween() {
		this.closeTween = new Tween({
			menuPosition: this.menu?.alignPoint.x || 1 - MENU_WIDTH,
		})
			.onComplete(() => this.closeTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.alignPoint.x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	openTween: Tween<{menuPosition: number}> | null = null
	closeTween: Tween<{menuPosition: number}> | null = null

	@signal menuOpen = false

	openMenu() {
		if (this.menuOpen) return
		this.menuOpen = true

		if (this.closeTween?.isPlaying()) this.closeTween.stop()

		this.makeOpenTween()
		// TODO Tween.start() time arg should be optional.
		// XXX this.openTween exists here! Optional chaining operator is needed to satisfy type system
		this.openTween?.to({menuPosition: 1 - MENU_WIDTH}, 800).start(performance.now())
		this.possiblyStartTweenLoop()
	}

	closeMenu() {
		if (!this.menuOpen) return
		this.menuOpen = false

		if (this.openTween?.isPlaying()) this.openTween.stop()

		this.makeCloseTween()
		// XXX this.closeTween exists here! Optional chaining operator is needed to satisfy type system
		this.closeTween?.to({menuPosition: 1}, 800).start(performance.now())
		this.possiblyStartTweenLoop()
	}

	toggleMenu = () => (this.menuOpen ? this.closeMenu() : this.openMenu())

	tweenTask: RenderTask | false = false

	possiblyStartTweenLoop() {
		if (this.tweenTask) return

		this.tweenTask = Motor.addRenderTask(t => {
			if (this.openTween?.isPlaying()) this.openTween.update(t)
			else if (this.closeTween?.isPlaying()) this.closeTween.update(t)
			else return (this.tweenTask = false)
			return
		})
	}

	@signal viewWidth = 0
	@signal viewHeight = 0

	// TODO @memo decorator to avoid unnecessary re-calculation downstream
	isMobile = () => this.viewWidth <= 1200
	cubeSize = () => (this.viewIsTall() ? 0.65 * this.viewWidth : 0.5 * this.viewHeight)
	viewIsTall = () => this.viewHeight >= this.viewWidth
	wordmarkAspectRatio = () => (this.viewIsTall() ? 118 / 686 : 960 / 146)

	#memoize() {
		memoize(this, 'isMobile', 'cubeSize', 'viewIsTall', 'wordmarkAspectRatio')
	}

	connectedCallback() {
		this.#memoize()
		super.connectedCallback()

		const {scene, rotator, cube: cubeNode, menuButtonWrapper} = this

		if (!scene || !rotator || !cubeNode || !menuButtonWrapper) throw new Error('Missing!')

		this.createEffect(() => {
			const task = Motor.addRenderTask((_t, dt) => (cubeNode.rotation.y += dt / 50))
			onCleanup(() => Motor.removeRenderTask(task))

			createEffect(() => {
				this.viewWidth = scene.calculatedSize.x
				this.viewHeight = scene.calculatedSize.y
			})

			///// ROTATION ON POINTER MOVE ///////////////////////////////////////////////
			{
				const rotationRange = 10
				const targetRotation = {
					x: 0,
					y: 0,
				}

				const setTargetRotation = (event: PointerEvent) => {
					const size = scene.calculatedSize

					// TODO use offsetX/Y so we get events relative to `currentTarget`,
					// and make an abstraction so that the offsets can be calculated
					// from event.target instead of event.currentTarget, otherwise the
					// behavior is strange when trying to use mouse values relative to
					// an element instead of relative to the viewport. ...
					// targetRotation.y = (event.offsetX / size.x) * (rotationRange * 2) - rotationRange
					// targetRotation.x = -((event.offsetY / size.y) * (rotationRange * 2) - rotationRange)

					// ... For now just use clientX/Y. ...
					targetRotation.y = (event.clientX / size.x) * (rotationRange * 2) - rotationRange
					targetRotation.x = -((event.clientY / size.y) * (rotationRange * 2) - rotationRange)

					// ... See https://discourse.wicg.io/t/4236 for discussion

					const circle = this.circle
					if (!circle) return
					circle.position.x = event.clientX
					circle.position.y = event.clientY
				}

				// Rotate the image a little bit based on pointer position.
				scene.addEventListener('pointermove', setTargetRotation)
				scene.addEventListener('pointerdown', setTargetRotation)

				// Rotate the container towards the targetRotation over time to make it smooth.
				const task2 = Motor.addRenderTask(() => {
					rotator.rotation.x += (targetRotation.x - rotator.rotation.x) * 0.02
					rotator.rotation.y += (targetRotation.y - rotator.rotation.y) * 0.02

					rotator.position.x = rotator.rotation.y * -3
					rotator.position.y = rotator.rotation.x * 2
				})
				onCleanup(() => Motor.removeRenderTask(task2))

				scene.addEventListener('pointermove', event => {
					const circle = this.circle
					if (!circle) return
					circle.position.x = event.clientX
					circle.position.y = event.clientY
				})
			}

			// FIXME Small hack to make the light update its position. For some
			// reason the initial position/align-point is not working.
			this.light.position = (x, y, z) => [x, y, z]
			this.light2.position = (x, y, z) => [x, y, z]
			onCleanup(() => {
				this.light.position = null
				this.light2.position = null
			})

			createEffect(() => (this.rotator2.rotation = this.rotator.rotation))
			createEffect(() => (this.rotator2.position = this.rotator.position))
			createEffect(() => (this.cube2.rotation = this.cube.rotation))
		})

		svgTexture(this.wordMarkHorizontal, this.horizontalImg, this.horizontalCanvas, 960, 146)
		svgTexture(this.wordMarkVertical, this.verticalImg, this.verticalCanvas, 118, 686)
	}

	CubeScene = () => html`
		<lume-scene
			id="cubeScene"
			fog-mode="linear"
			fog-far="1250"
			fog-near="800"
			fog-color="#0729d7"
			camera-near="100"
			camera-far="2000"
			perspective="800"
			id="innerScene"
			webgl="true"
			enable-css="true"
		>
			<lume-ambient-light color="white" intensity="2"></lume-ambient-light>
			<lume-point-light
				ref=${e => (this.light2 = e)}
				color="white"
				intensity="1500"
				shadow-bias="-0.1"
				position="0 0 300"
				align-point="0.5 0.5"
			>
				<lume-sphere
					visible="false"
					size="10 10 10"
					has="basic-material"
					mount-point="0.5 0.5 0.5"
					cast-shadow="false"
					receive-shadow="false"
				></lume-sphere>
			</lume-point-light>

			<!-- Cube ################################ -->
			<lume-element3d size-mode="proportional proportional" size="1 1 0">
				<lume-element3d
					ref="${e => (this.rotator2 = e)}"
					class="rotator"
					role="img"
					xaria-label="A 3D cube with each face showing different pink/yellow/blue/cyan gradient colors, floating behind the 'LUME' wordmark."
					aria-labelledby="cubeLabel"
					align-point="0.5 0.5"
					mount-point="0.5 0.5"
					size-mode="proportional proportional"
					size="1 1"
				>
					<div id="cubeLabel" class="label">
						A 3D cube with each face showing different pink/yellow/blue/cyan gradient colors, floating behind the 'LUME'
						wordmark.
					</div>
					<${this.Cube} ref=${e => (this.cube2 = e)} />
				</lume-element3d>
			</lume-element3d>
		</lume-scene>
	`

	Cube = props => html`
		<landing-cube
			ref="${props.ref}"
			size="${() => [this.cubeSize()]}"
			visible=${() => props.visible ?? true}
			align-point="0.5 0.5 0.5"
			mount-point="0.5 0.5 0.5"
			position="${() => [0, 0, -this.cubeSize()]}"
			rotation="45 45 45"
		></landing-cube>
	`

	WordmarkScene = () => html`
		<lume-scene
			id="wordmarkScene"
			fog-mode="linear"
			fog-far="825"
			fog-near="760"
			fog-color="deeppink"
			camera-near="100"
			camera-far="2000"
			perspective="800"
			id="innerScene"
			webgl="true"
			enable-css="true"
		>
			<lume-ambient-light color="white" intensity="2"></lume-ambient-light>
			<lume-point-light
				ref=${e => (this.light = e)}
				color="pink"
				intensity="10000"
				shadow-bias="-0.1"
				position="0 0 300"
				align-point="0.5 0.5"
			>
				<lume-sphere
					visible="false"
					size="10 10 10"
					has="basic-material"
					mount-point="0.5 0.5 0.5"
					cast-shadow="false"
					receive-shadow="false"
				></lume-sphere>
			</lume-point-light>

			<lume-element3d size-mode="proportional proportional" size="1 1 0">
				<lume-element3d
					class="headerBar"
					comment="setting a string override Lume style (including transforms, etc)."
					xstyle="${() => 'pointer-events: ' + (this.isMobile() ? 'none' : 'auto')}"
					style="${() => ({pointerEvents: this.isMobile() ? 'none' : 'auto'})}"
					size-mode="proportional literal"
					size="${[1, HEADER_HEIGHT, 0]}"
				>
					<div class="headerBarInner">
						<img
							src="/images/logo.svg"
							class="logo"
							alt="The Lume logo, positioned statically at the top left of the site on top of a 3D scene."
						/>

						<div style=${() => ({display: this.isMobile() ? 'none' : 'contents'})}>
							<div class="header-space"></div>
							<menu-links></menu-links>
						</div>
					</div>
				</lume-element3d>

				<lume-element3d
					ref="${e => (this.rotator = e)}"
					class="rotator"
					align-point="0.5 0.5"
					mount-point="0.5 0.5"
					size-mode="proportional proportional"
					size="1 1"
				>
					<lume-element3d
						ref="${e => (this.wordmarkContainer = e)}"
						size-mode="proportional proportional"
						size="${() => (this.viewIsTall() ? '0 0.7 0' : '0.5 0 0')}"
						mount-point="0.5 0.5"
						align-point="0.5 0.5"
					>
						<!-- <lume-element3d -->
						<lume-plane
							ref=${e => (this.wordMarkHorizontal = e)}
							class="wordmark"
							role="img"
							xaria-label="The 'LUME' wordmark with letters flowing horizontally, positioned to be floating in front of a 3D cube in the background, visible to people who have a screen that is wider than tall (f.e. desktop or tablets in landscape orientation)."
							aria-labelledby="wordmarkHorizontalLabel"
							visible="${() => !this.viewIsTall()}"
							TODO="relative size based on parent size, but not necessarily the same axis (f.e. map child Y size to proportion of parent X size)"
							size="${() => [
								this.wordmarkContainer?.calculatedSize?.x ?? 1,
								(this.wordmarkContainer?.calculatedSize?.x ?? 1) / this.wordmarkAspectRatio(),
							]}"
							mount-point="0 0.5"
							opacity="0.99"
							Xtexture="/images/logo-wordmark.svg"
							color="cyan"
						>
							<div id="wordmarkHorizontalLabel" class="label">
								The 'LUME' wordmark with letters flowing horizontally, positioned to be floating in front of a 3D cube
								in the background, visible to people who have a screen that is wider than tall (f.e. desktop or tablets
								in landscape orientation).
							</div>
							<div style="width: 100%; height: 100%">
								<canvas ref=${e => (this.horizontalCanvas = e)}></canvas>
								<img
									ref=${e => (this.horizontalImg = e)}
									src="/images/logo-wordmark.svg"
									width="960"
									height="146"
									style="width: 100%; height: 100%;"
								/>
							</div>
						</lume-plane>
						<!-- </lume-element3d> -->

						<!-- <lume-element3d -->
						<lume-plane
							ref=${e => (this.wordMarkVertical = e)}
							class="wordmark"
							role="img"
							xaria-label="The 'LUME' wordmark with letters flowing vertically, positioned to be floating in front of a 3D cube in the background, visible to people who have a screen that is taller than wide (f.e. phones in portrait orientation)."
							aria-labelledby="wordmarkVerticalLabel"
							visible="${() => this.viewIsTall()}"
							size="${() => [
								(this.wordmarkContainer?.calculatedSize?.y ?? 1) * this.wordmarkAspectRatio(),
								this.wordmarkContainer?.calculatedSize?.y ?? 1,
							]}"
							mount-point="0.5 0"
							opacity="0.99"
							Xtexture="/images/logo-wordmark-vertical.svg"
							color="cyan"
						>
							<div id="wordmarkVerticalLabel" class="label">
								The 'LUME' wordmark with letters flowing vertically, positioned to be floating in front of a 3D cube in
								the background, visible to people who have a screen that is taller than wide (f.e. phones in portrait
								orientation).
							</div>
							<div style="width: 100%; height: 100%">
								<canvas ref=${e => (this.verticalCanvas = e)}></canvas>
								<img
									ref=${e => (this.verticalImg = e)}
									src="/images/logo-wordmark-vertical.svg"
									width="118"
									height="686"
									style="width: 100%; height: 100%"
								/>
							</div>
						</lume-plane>
						<!-- </lume-element3d> -->
					</lume-element3d>

					<${this.Cube} ref=${e => (this.cube = e)} visible="false" />
				</lume-element3d>
			</lume-element3d>
		</lume-scene>
	`

	template = () => html`
		<lume-scene
			ref="${e => (this.scene = e)}"
			id="outerScene"
			role="figure"
			xaria-label="A 3D scene with a 3D cube and the 'LUME' wordmark, with the cube rotating and the wordmark floating in front of it. The scene is interactive, with the cube and wordmark slightly rotating and shifting around based on pointer movement."
			aria-labelledby="sceneLabel"
		>
			<div id="sceneLabel" class="label">
				A 3D scene with a 3D cube and the 'LUME' wordmark, with the cube rotating and the wordmark floating in front of
				it. The scene is interactive, with the cube and wordmark slightly rotating and shifting around based on pointer
				movement.
			</div>
			<lume-element3d size-mode="proportional proportional" size="1 1 0">
				<!-- Cube Scene ################################ -->
				<${this.CubeScene} />

				<!-- Wordmark Scene ################################ -->
				<${this.WordmarkScene} />

				<lume-element3d
					class="mobileNav"
					size-mode="proportional proportional"
					size="1 1 0"
					visible=${() => this.isMobile()}
				>
					<lume-element3d
						ref="${e => (this.menu = e)}"
						class="mobileMenu"
						size-mode="proportional proportional"
						size="${[MENU_WIDTH, 1]}"
						align-point="1 0"
						comment="start closed position"
						opacity="1"
					>
						<menu-links is-mobile="${true}"></menu-links>
					</lume-element3d>

					<lume-element3d
						class="menuButtonWrapper"
						ref="${e => (this.menuButtonWrapper = e)}"
						size="140 100"
						align-point="1 0"
						position="0 0"
						mount-point="1 0"
						onclick="${() => this.toggleMenu()}"
					>
						<hamburger-button
							size="40 19"
							align-point="0.5 0.5"
							mount-point="0.5 0.5"
							position="0 0"
							line-thickness="2.5"
							line-length="0.7"
							activated="${() => this.menuOpen}"
						></hamburger-button>
					</lume-element3d>
				</lume-element3d>

				<lume-element3d
					ref="${e => (this.circle = e)}"
					visible=${() => !this.isMobile() && false}
					class="circle"
					mount-point="0.5 0.5"
					size="200 200"
				></lume-element3d>
			</lume-element3d>
		</lume-scene>
	`

	css = css/*css*/ `
		:host {
			display: block;
			width: 100%;
			height: 100%;
		}

		.label {
			display: none;
		}

		#outerScene {
			touch-action: none;
		}

		#cubeScene,
		#wordmarkScene {
			position: absolute;
		}

		.headerBar {
			pointer-events: none;
		}

		.headerBarInner {
			display: flex;
			height: 100%;
			align-items: center;
			padding-left: 60px;
			padding-right: 60px;
		}

		.mobileNav {
			pointer-events: none;
		}

		menu-links {
			pointer-events: auto;
		}

		.logo {
			width: 50px;
			height: 50px;
			object-fit: fill;

			/* push everything else to the right side of the header */
			/*margin-right: auto;*/
		}

		.header-space {
			flex-grow: 1;
		}

		.rotator {
			pointer-events: none;
		}

		.wordmark,
		.cubeFace {
			pointer-events: auto;
		}

		.circle {
			background: rgba(0, 25, 93, 0.3);
			backdrop-filter: blur(14px) brightness(130%);
			border-radius: 100%;
		}

		.mobileMenu {
			background: rgba(0, 25, 93, 0.85);
			/* background: rgb(0 33 121 / 85%);
			background: rgb(0 49 180 / 60%); */
			backdrop-filter: blur(24px) brightness(130%); /* not working as desired, https://issues.chromium.org/issues/323735424 */
			pointer-events: auto;
		}

		.menuButtonWrapper {
			pointer-events: auto;
		}

		canvas {
			display: none;
		}
	`
}

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

@element('menu-links')
export class MenuLinks extends Element {
	@booleanAttribute isMobile = false
	@signal menuLinks?: HTMLDivElement

	template = () => html`
		<nav
			aria-label="Main"
			class="${() => `menuLinks${this.isMobile ? ' menuLinksMobile' : ''}`}"
			ref="${e => (this.menuLinks = e)}"
		>
			<div class=${this.isMobile ? 'spacer' : ''}></div>
			<a class="menuLink" href="//docs.lume.io"> <span>Documentation</span> </a>
			<a class="menuLink" href="//docs.lume.io/examples/hello-world/"> <span>Examples</span> </a>
			<a class="menuLink" href="//lume.community"> <span>Forum</span> </a>
			<a class="menuLink" href="//discord.gg/PgeyevP"> <span>Chat</span> </a>
			<a class="menuLink" href="//github.com/lume/lume"> <span>Source</span> </a>
			<div class=${this.isMobile ? 'spacer' : ''}></div>
		</nav>
	`

	css = css/*css*/ `
		:host {
			display: contents;
		}

		.menuLinks {
			font-size: calc(4vw * var(--isMobile) + 14px * (1 - var(--isMobile)));
			height: 100%;
			display: flex;
			align-items: center;
		}

		.menuLinksMobile {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: 100%;
			justify-content: space-around;
			align-items: start;
		}

		.menuLink,
		.spacer {
			text-decoration: none;
			text-transform: uppercase;
			margin-left: calc(0px * var(--isMobile) + 40px * (1 - var(--isMobile)));
			letter-spacing: 0.105em;
			color: white;
			padding-left: calc(10% * var(--isMobile) + 0px * (1 - var(--isMobile)));
			padding-top: calc(4% * var(--isMobile) + 0px * (1 - var(--isMobile)));
			padding-bottom: calc(4% * var(--isMobile) + 0px * (1 - var(--isMobile)));
			height: 100%;
			display: flex;
			align-items: center;
		}
	`

	connectedCallback() {
		super.connectedCallback()

		createEffect(() => {
			this.menuLinks?.style.setProperty('--isMobile', '' + (this.isMobile ? 1 : 0))
		})
	}
}

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

@element('hamburger-button')
export class HamburgerButton extends Element3D {
	@numberAttribute lineThickness = 2
	@numberAttribute lineLength = 0.8
	@booleanAttribute activated = false

	get root() {
		return this
	}
	set root(_v) {}

	template = () => html`
		<lume-element3d
			class="menuButtonLine"
			size-mode="proportional literal"
			size="${() => [this.lineLength, this.lineThickness]}"
			align-point="${() => (this.activated ? '0.5 0.5' : '1 0')}"
			mount-point="${() => (this.activated ? '0.5 0.5' : '1 0')}"
			rotation="${() => [0, 0, this.activated ? -45 : 0]}"
		></lume-element3d>
		<lume-element3d
			TODO="no classList"
			class="${() => ({menuButtonLine: true, hide: this.activated})}"
			size-mode="proportional literal"
			size="${() => [this.lineLength, this.lineThickness]}"
			align-point="0 0.5"
			mount-point="0 0.5"
		></lume-element3d>
		<lume-element3d
			class="menuButtonLine"
			size-mode="proportional literal"
			size="${() => [this.lineLength, this.lineThickness]}"
			align-point="${() => (this.activated ? '0.5 0.5' : '1 1')}"
			mount-point="${() => (this.activated ? '0.5 0.5' : '1 1')}"
			rotation="${() => [0, 0, this.activated ? 45 : 0]}"
		></lume-element3d>
	`

	css = css/*css*/ `
		.menuButtonLine {
			background: white;
		}

		.hide {
			display: none !important;
		}
	`
}

type HamburgerButtonAttributes = Element3DAttributes | 'lineThickness' | 'lineLength' | 'activated'

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

//////////////////////////////////////////////////////////////////////////

function memoize<T extends object, K extends keyof T>(obj: T, ...keys: K[]) {
	// @ts-expect-error valid indexed access
	for (const key of keys) obj[key] = createMemo(obj[key])
}
