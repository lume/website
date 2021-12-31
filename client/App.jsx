import {Motor, Element, reactive, element, Show, Node, numberAttribute, booleanAttribute, autorun, THREE} from 'lume'
import {Tween, Easing} from '@tweenjs/tween.js'

const MENU_WIDTH = 0.8 // percent of viewport
const HEADER_HEIGHT = 100

@element('app-root')
export class App extends Element {
	get root() {
		return this
	}
	set root(_v) {}

	// Used in App.types.d.ts to denote no attributes. See TODO there.
	/** @type {undefined=} */
	_____

	/** @type {import('./Cube').LandingCube=} */
	cubeNode

	/** @type {Node=} */
	menu

	/** @type {import('lume').Scene=} */
	scene

	/** @type {Node=} */
	rotator

	/** @type {Node=} */
	wordmarkContainer

	/** @type {Node=} */
	circle

	/** @type {Node=} */
	// @reactive menuButtonWrapper
	menuButtonWrapper

	// TODO make option for Tween to remember last value instead of starting
	// from the beginning. It would simplify the Tween code a lot. See
	// https://github.com/tweenjs/tween.js/issues/522

	makeOpenTween() {
		this.openTween = new Tween({menuPosition: this.menu?.getAlignPoint().x || 1})
			.onComplete(() => this.openTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.getAlignPoint().x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	makeCloseTween() {
		this.closeTween = new Tween({
			menuPosition: this.menu?.getAlignPoint().x || 1 - MENU_WIDTH,
		})
			.onComplete(() => this.closeTween?.stop())
			.onUpdate(obj => this.menu && (this.menu.getAlignPoint().x = obj.menuPosition))
			.easing(Easing.Exponential.Out)
	}

	/** @type {Tween<{menuPosition: number}> | null} */
	openTween = null

	/** @type {Tween<{menuPosition: number}> | null} */
	closeTween = null

	@reactive menuOpen = false

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

	/** @type {import('lume').RenderTask | false} */
	tweenTask = false

	possiblyStartTweenLoop() {
		if (this.tweenTask) return

		this.tweenTask = Motor.addRenderTask(t => {
			if (this.openTween?.isPlaying()) this.openTween.update(t)
			else if (this.closeTween?.isPlaying()) this.closeTween.update(t)
			else return (this.tweenTask = false)
			return
		})
	}

	@reactive viewWidth = 0
	@reactive viewHeight = 0

	get isMobile() {
		return this.viewWidth <= 1200
	}
	get cubeSize() {
		return this.viewIsTall ? 0.65 * this.viewWidth : 0.5 * this.viewHeight
	}
	get viewIsTall() {
		return this.viewHeight >= this.viewWidth
	}

	connectedCallback() {
		super.connectedCallback()

		const {scene, rotator, cubeNode} = this

		// TODO assigning to onclick works here, but it doesn't work in the
		// onclick JSX prop in the template. Does it work with new Solid.js?
		if (this.menuButtonWrapper) {
			this.menuButtonWrapper.onclick = () => {
				console.log('CLICK 2!')
				this.toggleMenu()
			}
		}

		if (!scene || !rotator || !cubeNode) throw 'They must exist.'

		Motor.addRenderTask((_t, dt) => (cubeNode.rotation.y += dt / 50))

		window.addEventListener('resize', this.resize)
		this.resize()

		///// ROTATION ON POINTER MOVE ///////////////////////////////////////////////

		const rotationRange = 10
		const targetRotation = {
			x: 0,
			y: 0,
		}

		const setTargetRotation = event => {
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
			circle.getPosition().x = event.clientX
			circle.getPosition().y = event.clientY
		}

		// Rotate the image a little bit based on pointer position.
		scene.addEventListener('pointermove', setTargetRotation)
		scene.addEventListener('pointerdown', setTargetRotation)

		// Rotate the container towards the targetRotation over time to make it smooth.
		Motor.addRenderTask(() => {
			rotator.rotation.x += (targetRotation.x - rotator.rotation.x) * 0.02
			rotator.rotation.y += (targetRotation.y - rotator.rotation.y) * 0.02

			rotator.position.x = rotator.rotation.y * -3
			rotator.position.y = rotator.rotation.x * 2
		})

		scene.addEventListener('pointermove', event => {
			const circle = this.circle
			if (!circle) return
			circle.getPosition().x = event.clientX
			circle.getPosition().y = event.clientY
		})

		svgTexture(otherPlane, otherImg, otherCanvas, 960, 146)
		svgTexture(numbersPlane, numbersImg, numbersCanvas, 118, 686)
	}

	resize = (/** @type {UIEvent} */ _e) => {
		this.viewWidth = window.innerWidth
		this.viewHeight = window.innerHeight
	}

	get wordmarkAspectRatio() {
		return this.viewIsTall ? 118 / 686 : 960 / 146
	}

	template = () => (
		<lume-scene ref={this.scene} class="scene" touch-action="none">
			<lume-node size-mode="proportional proportional" size="1 1 0">
				<lume-scene
					fog-mode="linear"
					fog-near="800"
					fog-far="1400"
					fog-color="#224dd9"
					perspective="800"
					id="innerScene"
					webgl="true"
					enable-css="true"
				>
					<lume-ambient-light color="white" intensity="0.5"></lume-ambient-light>
					<lume-point-light
						color="white"
						intensity="1.5"
						position="500 0 500"
						shadow-bias="-0.1"
					></lume-point-light>
					<lume-node size-mode="proportional proportional" size="1 1 0">
						<lume-node
							class="headerBar"
							//

							// TODO
							// This causes the header to lose LUME styling (it
							// clashes somehow with LUME's manual setting of the
							// style attribute):
							//
							//style={'pointerEvents: ' + this.isMobile ? 'none' : 'auto'}
							//
							// But this allows the header's LUME styling to work properly:
							//
							style={{pointerEvents: this.isMobile ? 'none' : 'auto'}}
							//
							// In either case, the pointer-events style is still not applied.
							//
							// Do we still have the same issue with latest Solid.js?

							//
							size-mode="proportional literal"
							size={[1, HEADER_HEIGHT, 0]}
						>
							<div class="headerBarInner">
								<img src="/images/logo.svg" class="logo" />
								<Show when={!this.isMobile}>
									<div class="header-space"></div>
									<menu-links />
								</Show>
							</div>
						</lume-node>

						<lume-node
							ref={this.rotator}
							class="rotator"
							align-point="0.5 0.5"
							mount-point="0.5 0.5"
							size-mode="proportional proportional"
							size="1 1"
						>
							<lume-node
								ref={this.wordmarkContainer}
								size-mode="proportional proportional"
								size={this.viewIsTall ? '0 0.7 0' : '0.5 0 0'}
								mount-point="0.5 0.5"
								align-point="0.5 0.5"
							>
								<lume-plane
									id="otherPlane"
									visible={!this.viewIsTall}
									// TODO relative size based on parent size, but not necessarily the same axis (f.e. map child Y size to proportion of parent X size)
									size={[
										this.wordmarkContainer?.calculatedSize?.x ?? 1,
										(this.wordmarkContainer?.calculatedSize?.x ?? 1) / this.wordmarkAspectRatio,
									]}
									mount-point="0 0.5"
									opacity="0.99"
									Xtexture="/images/logo-wordmark.svg"
									color="white"
								>
									<div>
										<canvas id="otherCanvas"></canvas>
										<img id="otherImg" src="/images/logo-wordmark.svg" width="960" height="146" />
									</div>
								</lume-plane>

								<lume-plane
									id="numbersPlane"
									visible={this.viewIsTall}
									size={[
										(this.wordmarkContainer?.calculatedSize?.y ?? 1) * this.wordmarkAspectRatio,
										this.wordmarkContainer?.calculatedSize?.y ?? 1,
									]}
									mount-point="0.5 0"
									opacity="0.99"
									Xtexture="/images/logo-wordmark-vertical.svg"
									color="white"
								>
									<div>
										<canvas id="numbersCanvas"></canvas>
										<img
											id="numbersImg"
											src="/images/logo-wordmark-vertical.svg"
											width="118"
											height="686"
										/>
									</div>
								</lume-plane>
							</lume-node>

							<landing-cube
								ref={this.cubeNode}
								// size={this.cubeSize} // TODO how to make a single-number value type check
								size={[this.cubeSize]}
								align-point="0.5 0.5 0.5"
								mount-point="0.5 0.5 0.5"
								position={[0, 0, -this.cubeSize]}
								rotation="45 45 45"
							/>
						</lume-node>
					</lume-node>
				</lume-scene>

				{/* <Show when={!this.isMobile}>
					<lume-node ref={this.circle} class="circle" mount-point="0.5 0.5" size="200 200" />
				</Show> */}

				<Show when={this.isMobile}>
					<lume-node class="mobileNav" size-mode="proportional proportional" size="1 1 0">
						<lume-node
							ref={this.menu}
							class="mobileMenu"
							size-mode="proportional proportional"
							size={[MENU_WIDTH, 1]}
							align-point="1 0" // start closed position
							opacity="0.97"
						>
							<menu-links is-mobile={true} />
						</lume-node>

						<lume-node
							class="menuButtonWrapper"
							ref={this.menuButtonWrapper}
							size="140 100"
							align-point="1 0"
							position="0 0"
							mount-point="1 0"
							onClick={() => {
								console.log('CLICK 1!')
								this.toggleMenu()
							}}
						>
							<hamburger-button
								size="40 19"
								align-point="0.5 0.5"
								mount-point="0.5 0.5"
								position="0 0"
								line-thickness={2.5}
								line-length={0.7}
								activated={this.menuOpen}
							/>
						</lume-node>
					</lume-node>
				</Show>
			</lume-node>
		</lume-scene>
	)

	css = /*css*/ `
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }

        .scene {
            touch-action: none;
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
            pointer-events: none
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

        .circle {
            background: rgba(0, 25, 93, 0.3);
            backdrop-filter: blur(14px) brightness(130%);
            border-radius: 100%;
        }

        .mobileMenu {
            background: rgba(0, 25, 93, 0.3);
            backdrop-filter: blur(14px) brightness(130%);
            pointer-events: auto;
        }

		.menuButtonWrapper {
			pointer-events: auto;
		}
    `
}

@element('menu-links')
export class MenuLinks extends Element {
	@booleanAttribute(false) isMobile = false

	/** @type {HTMLDivElement =} */
	menuLinks

	template = () => (
		<div class={`menuLinks${this.isMobile ? ' menuLinksMobile' : ''}`} ref={this.menuLinks}>
			<div data-comment="empty space"></div>
			<div data-comment="empty space"></div>
			<a class="menuLink" href="/docs">
				Documentation
			</a>
			<a class="menuLink" href="/docs/#/examples/hello-world/">
				Examples
			</a>
			<a class="menuLink" href="//lume.community">
				Forum
			</a>
			<a class="menuLink" href="//discord.gg/PgeyevP">
				Chat
			</a>
			<a class="menuLink" href="//github.com/lume/lume">
				Source
			</a>
			<div data-comment="empty space"></div>
			<div data-comment="empty space"></div>
		</div>
	)

	css = /*css*/ `
        :host {
            display: contents;
        }

        .menuLinks {
            font-size: calc(
                4vw * var(--isMobile) +
                14px * (1 - var(--isMobile))
            );
        }

        .menuLinksMobile {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            justify-content: space-around;
        }

        .menuLink {
            text-decoration: none;
            text-transform: uppercase;
            margin-left: calc(
                0px * var(--isMobile) +
                40px * (1 - var(--isMobile))
            );
            margin-top: calc(
                0px * var(--isMobile) +
                80px * (1 - var(--isMobile))
            );
            letter-spacing: 0.105em;
            color: white;
            padding-left: calc(
                10% * var(--isMobile) +
                0px * (1 - var(--isMobile))
            );
            padding-top: calc(
                4% * var(--isMobile) +
                0px * (1 - var(--isMobile))
            );
            padding-bottom: calc(
                4% * var(--isMobile) +
                0px * (1 - var(--isMobile))
            );
        }
    `

	connectedCallback() {
		super.connectedCallback()

		autorun(() => {
			this.menuLinks?.style.setProperty('--isMobile', '' + (this.isMobile ? 1 : 0))
		})
	}
}

@element('hamburger-button')
export class HamburgerButton extends Node {
	@numberAttribute(2) lineThickness = 2
	@numberAttribute(0.8) lineLength = 0.8
	@booleanAttribute(false) activated = false

	get root() {
		return this
	}
	set root(_v) {}

	template = () => (
		<>
			<lume-node
				class="menuButtonLine"
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align-point={this.activated ? '0.5 0.5' : '1 0'}
				mount-point={this.activated ? '0.5 0.5' : '1 0'}
				rotation={[0, 0, this.activated ? -45 : 0]}
			></lume-node>
			<lume-node
				classList={{menuButtonLine: true, hide: this.activated}}
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align-point="0 0.5"
				mount-point="0 0.5"
			></lume-node>
			<lume-node
				class="menuButtonLine"
				size-mode="proportional literal"
				size={[this.lineLength, this.lineThickness]}
				align-point={this.activated ? '0.5 0.5' : '1 1'}
				mount-point={this.activated ? '0.5 0.5' : '1 1'}
				rotation={[0, 0, this.activated ? 45 : 0]}
			></lume-node>
		</>
	)

	css = /*css*/ `
        .menuButtonLine {
            background: white;
        }

        .hide {
            display: none!important;
        }
    `
}

async function svgTexture(plane, img, canvas, width, height) {
	const ctx = canvas.getContext('2d')

	await Promise.all([imgLoaded(img), glLoaded(plane)])

	console.log('IMAGE LOADED')
	canvas.width = width
	canvas.height = height
	ctx.drawImage(img, 0, 0, width, height)

	const tex = new THREE.CanvasTexture(canvas)
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

function imgLoaded(img) {
	return new Promise(res => {
		if (img.complete) res()
		else img.onload = res
	})
}

function glLoaded(node) {
	return new Promise(res => {
		if (node._glLoaded) res()
		else node.on('GL_LOAD', res)
	})
}
